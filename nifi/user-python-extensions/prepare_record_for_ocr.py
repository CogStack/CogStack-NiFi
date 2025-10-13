import base64
import io
import json
import sys
import traceback
from logging import Logger
from typing import Any, Dict, List, Union

from avro.datafile import DataFileReader
from avro.io import DatumReader
from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from py4j.java_gateway import JavaObject, JVMView

# we need to add it to the sys imports
sys.path.insert(0, "/opt/nifi/user-scripts")

from utils.avro_json_encoder import AvroJSONEncoder # noqa: I001,E402


class PrepareRecordForOcr(FlowFileTransform):
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
        self.document_id_field_name : str = "id"
        self.process_flow_file_type: str = "json"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name",
                               description="Avro field containing binary data",
                               default_value="binarydoc",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="output_text_field_name",
                               description="Field to store Tika output text",
                               default_value="text"),
            PropertyDescriptor(name="operation_mode",
                               description="Decoding mode (e.g. base64 or raw)",
                               default_value="base64",
                               required=True,
                               allowable_values=["base64", "raw"]),
            PropertyDescriptor(name="document_id_field_name",
                               description="id field name of the document, this will be taken from the 'footer' usually",
                               default_value="_id",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="process_flow_file_type",
                               description="Type of flowfile input: avro | json",
                               default_value="json",
                               required=True,
                               allowable_values=["avro", "json"]),
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

            self.process_flow_file_type = str(self.process_flow_file_type).lower()

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)

            reader: Union[DataFileReader, List[Dict[str, Any]] | List[Any]]

            if self.process_flow_file_type == "avro":
                reader = DataFileReader(input_byte_buffer, DatumReader())
            else:
                json_obj = json.loads(input_byte_buffer.read().decode("utf-8"))
                reader = [json_obj] if isinstance(json_obj, dict) else json_obj if isinstance(json_obj, list) else []

            for record in reader:
                if type(record) is dict:
                    record_document_binary_data = record.get(str(self.binary_field_name), None)
                    if record_document_binary_data is not None:
                        if self.operation_mode == "base64":
                            record_document_binary_data = base64.b64encode(record_document_binary_data).decode()
                    else:
                        self.logger.info("No binary data found in record, using empty content")
                else:
                    raise TypeError("Expected record to be a dictionary, but got: " + str(type(record)))

                output_contents.append({
                    "binary_data": record_document_binary_data,
                    "footer": {k: v for k, v in record.items() if k != str(self.binary_field_name)}
                })

            input_byte_buffer.close()

            if isinstance(reader, DataFileReader):
                reader.close()

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["document_id_field_name"] = str(self.document_id_field_name)
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["output_text_field_name"] = str(self.output_text_field_name)
            attributes["mime.type"] = "application/json"

            if self.process_flow_file_type == "avro":
                return FlowFileTransformResult(relationship="success",
                                               attributes=attributes,
                                               contents=json.dumps(output_contents, cls=AvroJSONEncoder))
            else:
                return FlowFileTransformResult(relationship="success",
                                               attributes=attributes,
                                               contents=json.dumps(output_contents))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
