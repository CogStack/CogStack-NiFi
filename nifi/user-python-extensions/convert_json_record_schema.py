import json
import sys
import traceback
from collections import defaultdict
from logging import Logger
from typing import Any

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from py4j.java_gateway import JavaObject, JVMView

# we need to add it to the sys imports
sys.path.insert(0, "/opt/nifi/user-scripts")

from utils.generic import parse_value  # noqa: I001,E402


class ConvertJsonRecordSchema(FlowFileTransform):
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

        self.json_mapper_schema_path: str = "/opt/nifi/user-schemas/json/cogstack_common_schema_mapping.json"
        self.preserve_non_mapped_fields: bool = True

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="json_mapper_schema_path",
                               description="The path to the json schema mapping file, " \
                                "the schema directory is mounted as a volume in" \
                                " the nifi container in the /opt/nifi/user-schemas/ folder",
                               default_value="/opt/nifi/user-schemas/json/cogstack_common_schema_mapping.json",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="preserve_non_mapped_fields",
                               description="Whether to preserve fields that are not mapped in the schema",
                               default_value="true",
                               required=True,
                               allowable_values=["true", "false"],
                               validators=[StandardValidators.BOOLEAN_VALIDATOR])
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
    
    def getRelationships(self) -> list[Relationship]:
        return self.relationships

    def getPropertyDescriptors(self) -> list[PropertyDescriptor]:
        return self.descriptors

    def set_logger(self, logger: Logger):
        self.logger = logger

    def set_properties(self, properties: dict) -> None:
        """ Gets the properties from the processor's context and sets them as instance variables.

        Args:
            properties (dict): dictionary containing property names and values.
        """

        for k, v in properties.items():
            name = k.name if hasattr(k, "name") else str(k)
            val = parse_value(v)
            if hasattr(self, name):
                setattr(self, name, val)
            self.logger.debug(f"property set '{name}' -> {val!r} (type={type(val).__name__})")

    def map_record(self, record: dict, json_mapper_schema: dict) -> dict:
        """
        Maps the fields of a record to new field names based on the provided JSON schema mapping.
            {new_field -> old_field, ....}

        Args:
            record (dict): The input record whose fields need to be mapped.
            json_mapper_schema (dict): The schema mapping dict specifying how to rename or nest fields.

        Returns:
            dict: A new record with fields mapped according to the schema.
        """

        new_record: dict = {}
        
        # reverse the json_mapper_schema to map old_field -> new_field
        json_mapper_schema_reverse = defaultdict(list)
        for new_field, old_field in json_mapper_schema.items():
            # skip nulls & composite fields
            if isinstance(old_field, str) and old_field:
                json_mapper_schema_reverse[old_field].append(new_field)

        # Iterate through existing record fields
        for curr_field_name, curr_field_value in record.items():
            if curr_field_name in json_mapper_schema_reverse:
                # multiple new fields can receive same source value
                for new_field_name in json_mapper_schema_reverse[curr_field_name]:
                    new_record[new_field_name] = curr_field_value
            elif self.preserve_non_mapped_fields:
                # preserve original fields not defined in mapping
                new_record[curr_field_name] = curr_field_value

        # Add preset fields defined with null in schema
        for new_field, old_field in json_mapper_schema.items():
            if old_field is None:
                new_record.setdefault(new_field, None)
            elif isinstance(old_field, list):
                parts = []
                for sub_field in old_field:
                    val = record.get(sub_field)
                    if val is not None and val != "":
                        parts.append(str(val))
                new_record[new_field] = "\n".join(parts) if parts else None

        return new_record

    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult: # type: ignore
        output_contents: list[dict[Any, Any]] = []
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

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=json.dumps(output_contents).encode('utf-8'))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
