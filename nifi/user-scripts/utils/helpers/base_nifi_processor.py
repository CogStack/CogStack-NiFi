import json
import logging
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
from utils.generic import parse_value


def _make_wrapper_method(name):
    """Return a function that delegates to the base's implementation on self."""
    def wrapper(self, *args, **kwargs):
        # call Base class implementation
        base_impl = getattr(super(self.__class__, self), name, None)
        if base_impl is None:
            raise AttributeError(f"Base class missing {name}")
        return base_impl(*args, **kwargs)
    wrapper.__name__ = name
    return wrapper

def nifi_processor(*, processor_details: dict | None = None):
    """
        NOTE (4-11-2025): at the moment this decorator is a bit useless as the curre 
            NiFi version does not support automatic discovery of processor details from Python processors
            it only scans for the Java nested class "ProcessorDetails" and stops there, limited
            discovery capabilities for now. Hopefully in future versions this can be used.

        Class decorator that injects:
        - class Java with implements set
        - class ProcessorDetails (optional)
        - thin wrappers for getPropertyDescriptors, getRelationships, transform
        Use like:
            @nifi_processor(processor_details={"version":"0.1.0"})
            class MyProc(BaseNiFiProcessor): ...
    """
    def decorator(cls):
        # Inject Java if missing (exact nested-class syntax NiFi looks for)
        if not hasattr(cls, "Java"):
            class Java:
                implements = ["org.apache.nifi.python.processor.FlowFileTransform"]
            cls.Java = Java

        # Inject ProcessorDetails if provided and missing
        if processor_details and not hasattr(cls, "ProcessorDetails"):
            class ProcessorDetails:
                pass
            for k, v in processor_details.items():
                setattr(ProcessorDetails, k, v)
            cls.ProcessorDetails = ProcessorDetails

        # Ensure NiFi-visible methods exist on the class itself:
        # If subclass hasn't defined them, create a thin delegating wrapper
        for method_name in ("getPropertyDescriptors", "getRelationships", "transform"):
            if not hasattr(cls, method_name):
                setattr(cls, method_name, _make_wrapper_method(method_name))

        return cls
    return decorator
    

class BaseNiFiProcessor(FlowFileTransform):
    """Base class providing common NiFi Python processor utilities.
       NOTE: This is an example implementation meant to be reimplemented by processors inheriting it .
       For the moment all inherting processors must define 
       their own Java and ProcessorDetails nested classes unfortunately, until dynamic.
    """

    identifier = None
    logger: Logger = Logger(__qualname__)

    def __init__(self, jvm: JVMView):
        """
        This is the base class for all NiFi Python processors. It provides common functionality
        such as property handling, relationship definitions, and logging.

        This is an example implementation meant to be reimplemented by processors inheriting it .

        Args:
            jvm (JVMView): Required, Store if you need to use Java classes later.
        """
        self.jvm = jvm
        self.logger: Logger = logging.getLogger(self.__class__.__name__)
        self.process_context: ProcessContext

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
                               validators=[StandardValidators.BOOLEAN_VALIDATOR]),
            PropertyDescriptor(name="sample_property_two",
                               description="sample property two description",
                               required=False,
                               default_value="some_value"),
            PropertyDescriptor(name="sample_property_three",
                               required=True,
                               description="sample property three description",
                               default_value="default_value_one",
                               allowable_values=["default_value_one", "default_value_two", "default_value_three"],
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR])
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

        self.logger.info(f"Initialized {self.__class__.__name__} processor.")

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

    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult: # type: ignore
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
        output_contents = []
        try:
            self.process_context: ProcessContext = context
            self.set_properties(context.getProperties())
            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            self.logger.info("Successfully transformed Avro content for OCR")

            return FlowFileTransformResult(relationship="success", 
                                           attributes=attributes,
                                           contents=json.dumps(output_contents))
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception
