import traceback
import json
from logging import Logger

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import ProcessContext, PropertyDescriptor
from py4j.java_gateway import JVMView, JavaObject


class ParseCogStackServiceResult(FlowFileTransform):
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

        self.binary_field_name = None
        self.output_text_field_name = None

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name", description="Avro field containing binary data", default_value="not_set"),
            PropertyDescriptor(name="output_text_field_name", description="Field to store Tika output text", default_value="not_set"),
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
        output_contents = {}
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore

            input_json = json.loads(input_raw_bytes.decode("utf-8"))
            result = input_json.get("result", input_json)

            output_contents["metadata"] = result.get("metadata", {})
            output_contents["text"] = result.get("text", "")
            output_contents["success"] = result.get("success", False)
            output_contents["timestamp"] = result.get("timestamp", None)

            if "footer" in result.keys():
                for k, v in result["footer"].items():
                    output_contents[k] = v

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["binary_field"] = str(self.binary_field_name)
            attributes["output_text_field_name"] = str(self.output_text_field_name)
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success", attributes=attributes, contents=json.dumps(output_contents).encode('utf-8'))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
