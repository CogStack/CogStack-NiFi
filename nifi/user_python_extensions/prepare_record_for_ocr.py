import base64
import io
import json
import traceback
from typing import Any

from avro.datafile import DataFileReader
from avro.io import DatumReader
from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView

from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor
from nifi.user_scripts.utils.serialization.avro_json_encoder import AvroJSONEncoder


class CogStackPrepareRecordForOcr(BaseNiFiProcessor):

    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

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
                               description="Type of flowfile input: avro | json | ndjson",
                               default_value="json",
                               required=True,
                               allowable_values=["avro", "json", "ndjson"]),
        ]

        self._relationships = [
            Relationship(
                name="success",
                description="All FlowFiles processed successfully."
            ),
            Relationship(
                name="failure",
                description="FlowFiles that failed processing."
            )
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties
        self.relationships: list[Relationship] = self._relationships

    @overrides
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:

        output_contents: list = []

        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            self.process_flow_file_type = str(self.process_flow_file_type).lower()

            # read avro record
            input_raw_bytes: bytes = flowFile.getContentsAsBytes()
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)

            reader: DataFileReader | (list[dict[str, Any]] | list[Any])

            if self.process_flow_file_type == "avro":
                reader = DataFileReader(input_byte_buffer, DatumReader())
            elif self.process_flow_file_type == "ndjson":
                json_lines = input_byte_buffer.read().decode("utf-8").splitlines()
                reader = [json.loads(line) for line in json_lines if line.strip()]
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

            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
            attributes["document_id_field_name"] = str(self.document_id_field_name)
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["output_text_field_name"] = str(self.output_text_field_name)
            attributes["mime.type"] = "application/json"

            if self.process_flow_file_type == "avro":
                return FlowFileTransformResult(relationship="success",
                                               attributes=attributes,
                                               contents=json.dumps(output_contents, cls=AvroJSONEncoder).encode("utf-8")
                                               )
            else:
                return FlowFileTransformResult(relationship="success",
                                               attributes=attributes,
                                               contents=json.dumps(output_contents).encode("utf-8"))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
