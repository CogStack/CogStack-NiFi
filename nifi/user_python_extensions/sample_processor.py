import sys
from typing import Any

sys.path.insert(0, "/opt/nifi/user_scripts")

import io
import json
import traceback

from avro.datafile import DataFileReader, DataFileWriter
from avro.io import DatumReader, DatumWriter
from avro.schema import Schema
from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from py4j.java_gateway import JavaObject, JVMView
from utils.helpers.base_nifi_processor import BaseNiFiProcessor


class CogStackSampleTestProcessor(BaseNiFiProcessor):

    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        """
        Args:
            jvm (JVMView): Required, Store if you need to use Java classes later.
        """
        super().__init__(jvm)


        # Example properties — meant to be overridden or extended in subclasses
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

    def onScheduled(self, context: ProcessContext) -> None:
        """
            Called automatically by NiFi once when the processor is scheduled to run
            (i.e., enabled or started). This method is used for initializing and
            allocating resources that should persist across multiple FlowFile
            executions.

            Typical use cases include:
            - Loading static data from disk (e.g., CSV lookup tables, configuration files)
            - Establishing external connections (e.g., databases, APIs)
            - Building in-memory caches or models used by onTrigger/transform()

            The resources created here remain in memory for the lifetime of the
            processor and are shared by all concurrent FlowFile executions on this
            node. They should be lightweight and thread-safe. To release or clean up
            such resources, use the @OnStopped method, which NiFi calls when the
            processor is disabled or stopped.
        """
        pass

    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:

       """ 
           NOTE: This is a sample method meant to be overridden and reimplemented by subclasses.

           Main processor logic. This example reads Avro records from the incoming flowfile,
           and writes them back out to a new flowfile. It also adds the processor properties
           to the flowfile attributes. IT IS A SAMPLE ONLY,
           you are meant to use this as a starting point for other processors

           Args:
               context (ProcessContext): The process context containing processor properties.
               flowFile (JavaObject): The FlowFile object containing the input data.

           Raises:
               Exception: If any error occurs during processing.

           Returns:
               FlowFileTransformResult: The result containing the transformed contents and updated attributes.
       """

       output_contents: list[Any] = []
  
       try:
           self.process_context: ProcessContext = context
           self.set_properties(context.getProperties())
           # add properties to flowfile attributes
           attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
           self.logger.info("Successfully transformed Avro content for OCR")
           
           input_raw_bytes: bytes = flowFile.getContentsAsBytes()

            # read avro record
           self.logger.debug("Reading flowfile content as bytes")
           input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)
           reader: DataFileReader = DataFileReader(input_byte_buffer, DatumReader())
           
           # below is an example of how to handle avro records, each record
           schema: Schema | None = reader.datum_reader.writers_schema

           for record in reader:
               #do stuff
               pass
               
           # streams need to be closed
           input_byte_buffer.close()
           reader.close()

           # Write them to a binary avro stre
           output_byte_buffer = io.BytesIO()
           writer = DataFileWriter(output_byte_buffer, DatumWriter(), schema)

           writer.flush()
           writer.close()
           output_byte_buffer.seek(0)

           # add properties to flowfile attributes
           attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
           attributes["sample_property_one"] = str(self.sample_property_one)
           attributes["sample_property_two"] = str(self.sample_property_two)
           attributes["sample_property_three"] = str(self.sample_property_three)

           return FlowFileTransformResult(relationship="success", 
                                          attributes=attributes,
                                          contents=json.dumps(output_contents))
       except Exception as exception:
           self.logger.error("Exception during Avro processing: " + traceback.format_exc())
           raise exception
