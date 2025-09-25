import traceback
import json
from logging import Logger

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from py4j.java_gateway import JVMView, JavaObject

from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
    ExpressionLanguageScope,
)


class ConvertElasticSearchRecordSchema(FlowFileTransform):
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

        self.json_mapper_schema_path: str = "/opt/nifi/user-schemas/cogstack_common_schema_mapping.json"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="json_mapper_schema_path",
                               description="The path to the json schema mapping file",
                               default_value="/opt/nifi/user-schemas/cogstack_common_schema_mapping.json",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR])
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

    def map_record(self, record: dict, json_mapper_schema: dict) -> dict:
        """
        Maps the fields of a record to new field names based on the provided JSON schema mapping.

        Args:
            record (dict): The input record whose fields need to be mapped.
            json_mapper_schema (dict): The schema mapping dict specifying how to rename or nest fields.

        Returns:
            dict: A new record with fields mapped according to the schema.
        """

        new_record: dict = {}

        for curr_field_name, curr_field_value in record.items():
            if curr_field_name in json_mapper_schema.keys():
                # check if the mapping is not a dict (nested field)
                if isinstance(json_mapper_schema[curr_field_name], str): 
                    new_record.update({json_mapper_schema[curr_field_name] : curr_field_value})
                elif isinstance(json_mapper_schema[curr_field_name], dict):
                    # nested field
                    new_record.update({curr_field_name: {}})
                    for nested_field_name, nested_field_value in curr_field_value.items():
                        if nested_field_name in json_mapper_schema[curr_field_name].keys():
                            new_record[curr_field_name].update({json_mapper_schema[curr_field_name][nested_field_name]: nested_field_value})

        return new_record


    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult: # type: ignore
        output_contents: list = []
        try:
            self.process_context: ProcessContext = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore
            records: dict | list[dict] = json.loads(input_raw_bytes.decode("utf-8"))

            if isinstance(records, dict):
                records = [records]

            json_mapper_schema: dict = {}
            with open(self.json_mapper_schema_path) as file:
                json_mapper_schema = json.load(file)

            for record in records:
                output_contents.append(self.map_record(record, json_mapper_schema))

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["json_mapper_schema_path"] = str(self.json_mapper_schema_path)
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success", attributes=attributes, contents=json.dumps(output_contents).encode('utf-8'))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
