import io
import json
import logging
import sys
import traceback
from logging import Logger

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from py4j.java_gateway import JavaObject, JVMView

# this script is using a custom utility for decompressing Cerner blobs
# from nifi/user-python-extensions/record_decompress_cerner_blob.py
# we need to add it to the sys imports
sys.path.insert(0, "/opt/nifi/user-scripts")

from utils.generic import parse_value  # noqa: I001,E402


class BaseNiFiProcessor(FlowFileTransform):
    """Base class providing common NiFi Python processor utilities."""

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
        self.logger: Logger = logging.getLogger(self.__class__.__name__)
        self.process_context: ProcessContext

        self.sample_property_one: bool = True
        self.sample_property_two: str = ""
        self.sample_property_three: str = "default_value_one"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="sample_property_one",
                               description="sample property one description",
                               default_value="true",
                               required=True, 
                               validators=StandardValidators.BOOLEAN_VALIDATOR),
            PropertyDescriptor(name="sample_property_two",
                               description="sample property two description",
                               required=False,
                               default_value="some_value"),
            PropertyDescriptor(name="sample_property_three",
                               required=True,
                               description="sample property three description",
                               default_value="default_value_one",
                               allowable_values=["default_value_one", "default_value_two", "default_value_three"],
                               validators=StandardValidators.NON_EMPTY_VALIDATOR)
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
        """Populate class attributes from NiFi property map."""
        for k, v in properties.items():
            name = k.name if hasattr(k, "name") else str(k)
            val = parse_value(v)
            if hasattr(self, name):
                setattr(self, name, val)
            self.logger.debug(f"property set '{name}' -> {val!r} (type={type(val).__name__})")

    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult: # type: ignore
        """ Main processor logic. This example reads Avro records from the incoming flowfile,
            and writes them back out to a new flowfile. It also adds the processor properties
            to the flowfile attributes. IT IS A SAMPLE ONLY,
            you are meant to use this as a starting point for other processors
        """
        output_contents = []
        try:
            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            self.logger.info("Successfully transformed Avro content for OCR")

            return FlowFileTransformResult(relationship="success", 
                                           attributes=attributes,
                                           contents=json.dumps(output_contents))
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception
