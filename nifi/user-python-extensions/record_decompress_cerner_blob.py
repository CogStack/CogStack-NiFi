import io
import base64
import traceback
import json
import sys
from logging import Logger

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import ProcessContext, PropertyDescriptor
from py4j.java_gateway import JVMView, JavaObject


# this script is using a custom utility for decompressing Cerner blobs
# from nifi/user-python-extensions/record_decompress_cerner_blob.py
# we need to add it to the sys imports
sys.path.insert(0, "/opt/nifi/user-scripts")

from utils.cerner_blob import DecompressLzwCernerBlob # type: ignore


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

        self.operation_mode = None
        self.binary_field_name = None
        self.output_text_field_name = None
        self.document_id_field_name = None
        self.input_charset = "windows-1252"
        self.output_charset = "windows-1252"
        self.output_mode = "base64"
        self.binary_field_source_encoding = "base64"
        self.blob_sequence_order_field_name = "blob_sequence_num"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name", description="Avro field containing binary data", default_value="not_set"),
            PropertyDescriptor(name="output_text_field_name", description="Field to store Tika output text", default_value="not_set"),
            PropertyDescriptor(name="operation_mode", description="Decoding mode (e.g. base64 or raw)", default_value="base64"),
            PropertyDescriptor(name="document_id_field_name", description="Field name containing document ID", default_value="not_set"),
            PropertyDescriptor(name="input_charset", description="", default_value="windows-1252"),
            PropertyDescriptor(name="output_charset", description="", default_value="windows-1252"),
            PropertyDescriptor(name="output_mode", description="", default_value="base64"),
            PropertyDescriptor(name="binary_field_source_encoding", description="", default_value="base64"),
            PropertyDescriptor(name="blob_sequence_order_field_name", description="", default_value="blob_sequence_num"),

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
        output_contents = []
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)

            records = json.loads(input_byte_buffer.read().decode("utf-8"))

            if not isinstance(records, list):
                records = [records]

            input_byte_buffer.close()

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

            output_merged_record[self.binary_field_name] = bytearray()
            for i in concatenated_blob_sequence_order:
                try:
                    temporary_blob = i[1]
                    if self.binary_field_source_encoding == "base64":
                        temporary_blob: bytes = base64.b64decode(temporary_blob)

                    temporary_blob = temporary_blob.decode(self.input_charset).encode(self.input_charset)

                    decompress_blob = DecompressLzwCernerBlob()
                    decompress_blob.decompress(temporary_blob) # type: ignore
                    output_merged_record[self.binary_field_name].extend(bytes(decompress_blob.output_stream))
                except Exception as exception:
                    self.logger.error(f"Error decompressing blob with sequence order {i[0]}: {str(exception)}\n")


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

            return FlowFileTransformResult(relationship="success", attributes=attributes, contents=json.dumps(output_contents))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
