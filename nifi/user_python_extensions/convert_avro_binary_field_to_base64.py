import sys

sys.path.insert(0, "/opt/nifi/user_scripts")

import base64
import copy
import io
import json
import traceback

from avro.datafile import DataFileReader, DataFileWriter
from avro.io import DatumReader, DatumWriter
from avro.schema import RecordSchema, Schema, parse
from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView
from utils.helpers.base_nifi_processor import BaseNiFiProcessor


class CogStackConvertAvroBinaryRecordFieldToBase64(BaseNiFiProcessor):
    """NiFi Python processor to convert a binary field in Avro records to base64-encoded string.

    Reads each FlowFile as Avro, locates the configured binary_field_name, and rewrites the Avro schema,
    so that field becomes a nullable string, preventing NiFi’s JSON 
    converters from turning raw bytes into integer arrays.

    Streams every record through a new Avro writer, base64-encoding the binary payload when operation_mode=base64
    (or leaving bytes untouched for raw), then reattaching the remaining fields
    so downstream processors still see the original record structure.

    Emits the updated Avro binary along success with attributes capturing document ID field,
    binary field, mode, and MIME type application/avro-binary; 
    
    Exception routes to failure after logging a stack trace.
    """

    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.operation_mode: str = "base64"
        self.binary_field_name: str = "binarydoc"
        self.document_id_field_name: str = "id"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name",
                               description="Avro field containing binary data",
                               default_value="binarydoc",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="operation_mode",
                               description="Decoding mode (e.g. base64 or raw)",
                               default_value="base64",
                               required=True,
                               allowable_values=["base64", "raw"]),
            PropertyDescriptor(name="document_id_field_name",
                               description="Field name containing document ID",
                               default_value="id",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
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
        """
        Transforms an Avro flow file by converting a specified binary field to a base64-encoded string.

        Args:
            context (ProcessContext): The process context containing processor properties.
            flowFile (JavaObject): The flow file to be transformed.

        Raises:
            TypeError: If the Avro record is not a dictionary.
            Exception: For any other errors during Avro processing.

        Returns:
            FlowFileTransformResult: The result containing the transformed flow file, updated attributes,
                and relationship.
        """
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytes = flowFile.getContentsAsBytes()
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)
            reader: DataFileReader = DataFileReader(input_byte_buffer, DatumReader())

            schema: Schema | None = reader.datum_reader.writers_schema

            # change the datatype of the binary field from bytes to string 
            # (avoids headaches later on when converting avro to json)
            # because if we dont change the schema the native NiFi converter will convert bytes to an array of integers.
            output_schema = None
            if schema is not None and isinstance(schema, RecordSchema):
                schema_dict = copy.deepcopy(schema.to_json())
                for field in schema_dict["fields"]: # type: ignore
                    self.logger.info(str(field))
                    if field["name"] == self.binary_field_name:
                        field["type"] = ["null", "string"]
                        break
                output_schema = parse(json.dumps(schema_dict))

            # Write them to a binary avro stream
            output_byte_buffer = io.BytesIO()
            writer = DataFileWriter(output_byte_buffer, DatumWriter(), output_schema)

            for record in reader:
                if type(record) is dict:
                    record_document_binary_data = record.get(str(self.binary_field_name), None)

                    if record_document_binary_data is not None:
                        if self.operation_mode == "base64":
                            record_document_binary_data = base64.b64encode(record_document_binary_data).decode()
                    else:
                        self.logger.info("No binary data found in record, using empty content")
                else:
                    raise TypeError("Expected Avro record to be a dictionary, but got: " + str(type(record)))

                _tmp_record = {}
                _tmp_record[str(self.binary_field_name)] = record_document_binary_data

                for k, v in record.items():
                    if k != str(self.binary_field_name):
                        _tmp_record[k] = v

                writer.append(_tmp_record)

            input_byte_buffer.close()
            reader.close()
            writer.flush()
            output_byte_buffer.seek(0)

            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
            attributes["document_id_field_name"] = str(self.document_id_field_name)
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["operation_mode"] = str(self.operation_mode)
            attributes["mime.type"] = "application/avro-binary"

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=output_byte_buffer.getvalue())
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception
