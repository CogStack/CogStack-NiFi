import io
import json
import traceback
from logging import Logger

from avro.datafile import DataFileReader
from avro.io import DatumReader
from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from py4j.java_gateway import JavaObject, JVMView


class SampleTestProcessor(FlowFileTransform):
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
        """ Main processor logic. This example reads Avro records from the incoming flowfile,
            and writes them back out to a new flowfile. It also adds the processor properties
            to the flowfile attributes. IT IS A SAMPLE ONLY,
            you are meant to use this as a starting point for other processors
        """
        output_contents = []
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore
            self.logger.debug("Reading flowfile content as bytes")
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)
            reader: DataFileReader = DataFileReader(input_byte_buffer, DatumReader())

            # below is an example of how to handle avro records, each records
            # schema: Schema | None = reader.datum_reader.writers_schema
            #   for record in reader:
            #   do stuff
  
            input_byte_buffer.close()
            reader.close()

            # Write them to a binary avro stream
            # output_byte_buffer = io.BytesIO()
            # writer = DataFileWriter(output_byte_buffer, DatumWriter(), schema)

            #  writer.flush()
            #  writer.close()
            # output_byte_buffer.seek(0)


            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["sample_property_one"] = str(self.sample_property_one)
            attributes["sample_property_two"] = str(self.sample_property_two)
            attributes["sample_property_three"] = str(self.sample_property_three)

            self.logger.info("Successfully transformed Avro content for OCR")

            return FlowFileTransformResult(relationship="success", 
                                           attributes=attributes,
                                           contents=json.dumps(output_contents))
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception
