import base64
import json
import traceback

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView

from nifi.user_scripts.utils.codecs.cerner_blob import DecompressLzwCernerBlob
from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor


class CogStackJsonRecordDecompressCernerBlob(BaseNiFiProcessor):
    """ This script decompresses Cerner LZW compressed blobs from a JSON input stream.
    It expects a JSON array of records, each containing a field with the binary data.
    All RECORDS are expected to have the same fields, and presumably belonging to the same DOCUMENT.
    All the fields of these records should have the same field values, except for the binary data field.
    The binary data field is expected to be a base64 encoded string, which will be concatenated according to 
    the blob_sequence_order_field_name field, preserving the order of the blobs and composing 
    the whole document (supposedly).
    The final base64 encoded string will be decoded back to binary data, then decompressed using LZW algorithm.

    """


    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.operation_mode: str = "base64"
        self.binary_field_name: str = "binarydoc"
        self.output_text_field_name: str = "text"
        self.document_id_field_name: str = "id"
        self.input_charset: str = "utf-8"
        self.output_charset: str = "utf-8"
        self.output_mode: str = "base64"
        self.binary_field_source_encoding: str = "base64"
        self.blob_sequence_order_field_name: str = "blob_sequence_num"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name",
                               description="Avro field containing binary data",
                               default_value="binarydoc",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="output_text_field_name",
                               description="Field to store  output text",
                               default_value="text",
                               required=True),
            PropertyDescriptor(name="operation_mode",
                               description="Decoding mode (e.g. base64 or raw)",
                               default_value="base64",
                               allowable_values=["base64", "raw"],
                               required=True),
            PropertyDescriptor(name="document_id_field_name",
                               description="Field name containing document ID",
                               default_value="id",),
            PropertyDescriptor(name="input_charset",
                               description="Input character set encoding",
                               default_value="utf-8",
                               required=True),
            PropertyDescriptor(name="output_charset",
                               description="Output character set encoding",
                               default_value="utf-8",
                               required=True),
            PropertyDescriptor(name="output_mode",
                               description="Output encoding mode (e.g. base64 or raw)",
                               default_value="base64",
                               required=True,
                               allowable_values=["base64", "raw"]),
            PropertyDescriptor(name="binary_field_source_encoding",
                               description="Binary field source encoding (e.g. base64 or raw)",
                               default_value="base64",
                               required=True,
                               allowable_values=["base64", "raw"]),
            PropertyDescriptor(name="blob_sequence_order_field_name",
                               description="Blob sequence order field name, \
                                  if the blob is split across multiple records",
                               required=False,
                               default_value="blob_sequence_num"),
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties

    @overrides
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        """
        Transforms the input FlowFile by decompressing Cerner blob data from JSON records.

        Args:
            context (ProcessContext): The process context containing processor properties.
            flowFile (JavaObject): The incoming FlowFile containing JSON records.

        Returns:
            FlowFileTransformResult: The result of the transformation, including updated attributes and contents.

        Raises:
            Exception: If any error occurs during processing or decompression.
        """

        output_contents: list = []

        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytes | bytearray = flowFile.getContentsAsBytes()

            records = []

            try:
                records = json.loads(input_raw_bytes.decode())
            except json.JSONDecodeError as e:
                self.logger.error(f"Error decoding JSON: {str(e)} \nAttempting to decode as {self.input_charset}")
                try:
                    records = json.loads(input_raw_bytes.decode(self.input_charset))
                except json.JSONDecodeError as e:
                    self.logger.error(f"Error decoding JSON: {str(e)} \nAttempting to decode as windows-1252")
                    try:
                        records = json.loads(input_raw_bytes.decode("windows-1252"))
                    except json.JSONDecodeError as e:
                        self.logger.error(f"Error decoding JSON: {str(e)} \n with windows-1252")
                        raise

            if not isinstance(records, list):
                records = [records]

            if not records:
                raise ValueError("No records found in JSON input")

            concatenated_blob_sequence_order = {}
            output_merged_record = {}

            have_any_sequence = any(self.blob_sequence_order_field_name in record for record in records)
            have_any_no_sequence = any(self.blob_sequence_order_field_name not in record for record in records)

            if have_any_sequence and have_any_no_sequence:
                raise ValueError(
                    f"Mixed records: some have '{self.blob_sequence_order_field_name}', some don't. "
                    "Cannot safely reconstruct blob stream."
                )

            for record in records:
                if self.binary_field_name not in record or record[self.binary_field_name] in (None, ""):
                    raise ValueError(f"Missing '{self.binary_field_name}' in a record")

                if have_any_sequence:
                    seq = int(record[self.blob_sequence_order_field_name])
                    if seq in concatenated_blob_sequence_order:
                        raise ValueError(f"Duplicate {self.blob_sequence_order_field_name}: {seq}")
                    concatenated_blob_sequence_order[seq] = record[self.binary_field_name]
                else:
                    # no sequence anywhere: preserve record order (0..n-1)
                    seq = len(concatenated_blob_sequence_order)
                    concatenated_blob_sequence_order[seq] = record[self.binary_field_name]
    
            # take fields from the first record, doesn't matter which one,
            # as they are expected to be the same except for the binary data field
            for k, v in records[0].items():
                if k not in output_merged_record and k != self.binary_field_name:
                    output_merged_record[k] = v

            full_compressed_blob = bytearray()

            for k in sorted(concatenated_blob_sequence_order.keys()):
                v = concatenated_blob_sequence_order[k]

                if self.binary_field_source_encoding == "base64":
                    if not isinstance(v, str):
                        raise ValueError(f"Expected base64 string in {self.binary_field_name} for part {k}, got {type(v)}")
                    try:
                        temporary_blob = base64.b64decode(v, validate=True)
                    except Exception as e:
                        raise ValueError(f"Error decoding base64 blob part {k}: {e}")
                else:
                    # raw bytes path
                    if isinstance(v, (bytes, bytearray)):
                        temporary_blob = v
                    else:
                        raise ValueError(f"Expected bytes in {self.binary_field_name} for part {k}, got {type(v)}")

                full_compressed_blob.extend(temporary_blob)

            try:
                decompress_blob = DecompressLzwCernerBlob()
                decompress_blob.decompress(full_compressed_blob)
                output_merged_record[self.binary_field_name] = decompress_blob.output_stream
            except Exception as exception:
                self.logger.error(f"Error decompressing cerner blob: {str(exception)} \n")
                raise exception

            if self.output_mode == "base64":
                output_merged_record[self.binary_field_name] = \
                    base64.b64encode(output_merged_record[self.binary_field_name]).decode(self.output_charset)

            output_contents.append(output_merged_record)

            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
            attributes["document_id_field_name"] = str(self.document_id_field_name)
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["output_text_field_name"] = str(self.output_text_field_name)
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=json.dumps(output_contents).encode("utf-8"))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
