import base64
import json
import sys
import traceback
from logging import Logger

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from py4j.java_gateway import JavaObject, JVMView

""" This script decompresses Cerner LZW compressed blobs from a JSON input stream.
    It expects a JSON array of records, each containing a field with the binary data.
    All RECORDS are expected to have the same fields, and presumably belonging to the same DOCUMENT.
    All the fields of these records should have the same field values, except for the binary data field.
    The binary data field is expected to be a base64 encoded string, which will be concatenated according to 
    the blob_sequence_order_field_name field, preserving the order of the blobs and composing the whole document (supposedly).
    The final base64 enncoded string will be decoded back to binary data, then decompressed using LZW algorithm.
"""

# this script is using a custom utility for decompressing Cerner blobs
# from nifi/user-python-extensions/record_decompress_cerner_blob.py
# we need to add it to the sys imports
sys.path.insert(0, "/opt/nifi/user-scripts")

from utils.cerner_blob import DecompressLzwCernerBlob # noqa: I001,E402


class JsonRecordDecompressCernerBlob(FlowFileTransform):
    identifier = None
    logger: Logger = Logger(__qualname__)


    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        """
        Args:
            jvm (JVMView): Required, Store if you need to use Java classes later.
        """
        self.jvm = jvm

        self.operation_mode: str = "base64"
        self.binary_field_name: str = "binarydoc"
        self.output_text_field_name: str = "text"
        self.document_id_field_name: str = "id"
        self.input_charset = "utf-8"
        self.output_charset = "utf-8"
        self.output_mode = "base64"
        self.binary_field_source_encoding = "base64"
        self.blob_sequence_order_field_name = "blob_sequence_num"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name",
                               description="Avro field containing binary data",
                               default_value="binarydoc",
                               required=True,
                               validators=StandardValidators.NON_EMPTY_VALIDATOR),
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

    def getPropertyDescriptors(self):
        return self._properties

    def set_logger(self, logger: Logger):
        self.logger = logger

    def set_properties(self, properties: dict):
        """ Gets the properties from the processor's context and sets them as instance variables.

        Args:
            properties (dict): dictionary containing property names and values.
        """

        for k, v in list(properties.items()):
            self.logger.debug(f"property set '{k.name}' with value '{v}'")
            if hasattr(self, k.name):
                setattr(self, k.name, v)

    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult: # type: ignore
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
        output_contents = []
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore

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

            concatenated_blob_sequence_order = {}
            output_merged_record = {}

            for record in records:
                if self.blob_sequence_order_field_name in record.keys():
                    concatenated_blob_sequence_order[int(record[self.blob_sequence_order_field_name])] = record[self.binary_field_name]

            # take fields from the first record, doesn't matter which one,
            # as they are expected to be the same except for the binary data field
            for k, v in records[0].items():
                if k not in output_merged_record.keys() and k != self.binary_field_name:
                    output_merged_record[k] = v

            output_merged_record[self.binary_field_name] = b""
            full_compressed_blob = bytearray()

            for k, v in concatenated_blob_sequence_order.items():
                try:
                    temporary_blob = v
                    if self.binary_field_source_encoding == "base64":
                        temporary_blob: bytes = base64.b64decode(temporary_blob)
                    full_compressed_blob.extend(temporary_blob)
                except Exception as e:
                    self.logger.error(f"Error decoding b64 blob part {k}: {str(e)}")

            try:
                decompress_blob = DecompressLzwCernerBlob()
                decompress_blob.decompress(full_compressed_blob) # type: ignore
                output_merged_record[self.binary_field_name] = decompress_blob.output_stream
            except Exception as exception:
                self.logger.error(f"Error decompressing cerner blob: {str(exception)} \n")


            if self.output_mode == "base64":
                output_merged_record[self.binary_field_name] = \
                    base64.b64encode(output_merged_record[self.binary_field_name]).decode(self.output_charset)

            output_contents.append(output_merged_record)

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["document_id_field_name"] = str(self.document_id_field_name)
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["output_text_field_name"] = str(self.output_text_field_name)
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=json.dumps(output_contents))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
