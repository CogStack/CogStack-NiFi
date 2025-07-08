import io
import base64
import json
import traceback
import copy
from logging import Logger

from avro.datafile import DataFileReader, DataFileWriter
from avro.io import DatumReader, DatumWriter
from avro.schema import RecordSchema, Schema, PrimitiveSchema, parse

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import ProcessContext, PropertyDescriptor
from py4j.java_gateway import JVMView, JavaObject


class ConvertAvroBinaryRecordFieldToBase64(FlowFileTransform):
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
        self.record_id_field_name = None

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name", description="Avro field containing binary data", default_value="not_set"),
            PropertyDescriptor(name="operation_mode", description="Decoding mode (e.g. base64 or raw)", default_value="base64"),
            PropertyDescriptor(name="record_id_field_name", description="Field name containing document ID", default_value="not_set")
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
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)
            reader: DataFileReader = DataFileReader(input_byte_buffer, DatumReader())

            schema: Schema | None = reader.datum_reader.writers_schema

            # change the datatype of the binary field from bytes to string (avoids headaches later on when converting avro to json)
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

            self.logger.info(str(type(reader)))

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

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["record_id_field_name"] = str(self.record_id_field_name)
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["operation_mode"] = str(self.operation_mode)
            attributes["mime.type"] = "application/avro-binary"

            return FlowFileTransformResult(relationship="success", attributes=attributes, contents=output_byte_buffer.getvalue())
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception
