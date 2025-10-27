import io
import json
import traceback
from logging import Logger
from typing import Any, Union

from avro.datafile import DataFileReader
from avro.io import DatumReader
from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from py4j.java_gateway import JavaObject, JVMView


class PrepareRecordForNlp(FlowFileTransform):
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

        self.document_text_field_name: str = "text"
        self.document_id_field_name : str = "id"
        self.process_flow_file_type : str = "json"


        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="document_id_field_name",
                               description="id field name of the document, this will be taken from the 'footer' usually",
                               default_value="_id",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="document_text_field_name",
                               description="text field name of the document",
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR],
                               required=True,
                               default_value="text"),
            PropertyDescriptor(name="process_flow_file_type",
                               description="Type of flowfile input: avro | json",
                               default_value="json",
                               required=True,
                               allowable_values=["avro", "json"]),

        ]

        self.descriptors: list[PropertyDescriptor] = self._properties

    def getPropertyDescriptors(self) -> list[PropertyDescriptor]:
        return self.descriptors


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
        """_summary_

        Args:
            context (ProcessContext): _description_
            flowFile (JavaObject): _description_

        Raises:
            TypeError: _description_
            exception: _description_

        Returns:
            FlowFileTransformResult: _description_
        """
        output_contents = []
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            self.process_flow_file_type = str(self.process_flow_file_type).lower()

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)

            reader: Union[DataFileReader, list[dict[str, Any]] | list[Any]]

            if self.process_flow_file_type == "avro":
                reader = DataFileReader(input_byte_buffer, DatumReader())
            else:
                json_obj = json.loads(input_byte_buffer.read().decode("utf-8"))
                reader = [json_obj] if isinstance(json_obj, dict) else json_obj if isinstance(json_obj, list) else []

            for record in reader:
                if type(record) is dict:
                    record_document_text = record.get(str(self.document_text_field_name), "")
                else:
                    raise TypeError("Expected record to be a dictionary, but got: " + str(type(record)))

                output_contents.append({
                    "text": record_document_text,
                    "footer": {k: v for k, v in record.items() if k != str(self.document_text_field_name)}
                })

            input_byte_buffer.close()

            if isinstance(reader, DataFileReader):
                reader.close()

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["document_id_field_name"] = str(self.document_id_field_name)
            attributes["mime.type"] = "application/json"

            output_contents = output_contents[0] if len(output_contents) == 1 else output_contents
            return FlowFileTransformResult(relationship="success", 
                                           attributes=attributes,
                                           contents=json.dumps({"content": output_contents}).encode("utf-8"))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
