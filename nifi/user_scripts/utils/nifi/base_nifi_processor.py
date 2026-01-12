import logging
from logging import Logger
from typing import Generic, TypeVar

from nifiapi.flowfiletransform import FlowFileTransform, FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from py4j.java_gateway import JavaObject, JVMView

from ..generic import parse_value


def _make_wrapper_method(name):
    """Return a wrapper that delegates to the base class implementation."""
    def wrapper(self, *args, **kwargs):
        """Call the named base class method on the current instance."""
        # call Base class implementation
        base_impl = getattr(super(self.__class__, self), name, None)
        if base_impl is None:
            raise AttributeError(f"Base class missing {name}")
        return base_impl(*args, **kwargs)
    wrapper.__name__ = name
    return wrapper

def nifi_processor(*, processor_details: dict | None = None):
    """
    Class decorator that injects NiFi-required nested classes and method wrappers.

    Note (2025-04-11): NiFi currently does not support automatic discovery of
    processor details from Python processors. It scans for the Java nested class
    "ProcessorDetails" and stops there, so discovery is limited for now.

    Args:
        processor_details: Optional attributes to add to the ProcessorDetails
            nested class.

    Use like:
        @nifi_processor(processor_details={"version": "0.1.0"})
        class MyProc(BaseNiFiProcessor): ...
    """
    def decorator(cls):
        """Mutate the class to add NiFi metadata and wrapper methods."""
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
    

T = TypeVar("T")

class BaseNiFiProcessor(FlowFileTransform, Generic[T]):
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

        self.REL_SUCCESS = Relationship(
            name="success",
            description="All FlowFiles processed successfully.",
        )
        self.REL_FAILURE = Relationship(
            name="failure",
            description="FlowFiles that failed processing.",
        )

        self._properties: list = [
                        PropertyDescriptor(name="sample_property_one",
                               description="sample property one description",
                               default_value="true",
                               required=True, 
                               validators=StandardValidators.BOOLEAN_VALIDATOR),
        ]

        self._relationships = [self.REL_SUCCESS, self.REL_FAILURE]

        self.descriptors: list[PropertyDescriptor] = self._properties
        self.relationships: list[Relationship] = self._relationships

        self.logger.info(f"Initialized {self.__class__.__name__} processor.")

    def getRelationships(self) -> list[Relationship]:
        """
        Return the list of relationships supported by the processor.

        Returns:
            A list of Relationship objects exposed to NiFi.
        """
        return self.relationships

    def getPropertyDescriptors(self) -> list[PropertyDescriptor]:
        """
        Return the property descriptors supported by the processor.

        Returns:
            A list of PropertyDescriptor objects exposed to NiFi.
        """
        return self.descriptors

    def set_logger(self, logger: Logger):
        """
        Replace the logger instance used by this processor.

        Args:
            logger: Logger instance to use for subsequent log entries.
        """
        self.logger = logger

    def set_properties(self, properties: dict) -> None:
        """
        Populate class attributes from a NiFi property map.

        Args:
            properties: Mapping of NiFi PropertyDescriptor to value.
        """
        for k, v in properties.items():
            name = k.name if hasattr(k, "name") else str(k)
            val = parse_value(v)
            if hasattr(self, name):
                setattr(self, name, val)
            self.logger.debug(f"property set '{name}' -> {val!r} (type={type(val).__name__})")

    def build_failure_result(
        self,
        flowFile: JavaObject,
        exception: Exception,
        *,
        include_flowfile_attributes: bool = False,
    ) -> FlowFileTransformResult:
        """
        Build a failure FlowFileTransformResult with exception metadata.

        Args:
            flowFile: The FlowFile being processed.
            exception: The exception raised during processing.
            include_flowfile_attributes: If true, include all FlowFile attributes.

        Returns:
            A FlowFileTransformResult targeting the failure relationship.
        """

        exception_name = type(exception).__name__
        exception_message = str(exception)
        exception_value = (
            f"{exception_name}: {exception_message}" if exception_message else exception_name
        )

        attributes = {}
        if include_flowfile_attributes:
            attributes = {k: str(v) for k, v in flowFile.getAttributes().items()}
        attributes["exception"] = exception_value

        return FlowFileTransformResult(
            relationship="failure",
            attributes=attributes,
            contents=flowFile.getContentsAsBytes(),
        )

    def onScheduled(self, context: ProcessContext) -> None:
        """
        Called once when the processor is scheduled (enabled or started).

        Use this hook to initialize and allocate resources that should persist
        across multiple FlowFile executions, such as loading static data,
        establishing connections, or building caches used by transform().

        Resources created here live for the processor lifetime and are shared
        across concurrent executions. They should be lightweight and
        thread-safe. Clean up in @OnStopped when the processor is disabled.
        """
        pass
    
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        """
        Process a FlowFile and return a FlowFileTransformResult.

        Subclasses must override this method to implement processor logic.

        Args:
            context: The NiFi ProcessContext for this invocation.
            flowFile: The FlowFile being processed.

        Raises:
            NotImplementedError: Always, until overridden by a subclass.
        """
        raise NotImplementedError
