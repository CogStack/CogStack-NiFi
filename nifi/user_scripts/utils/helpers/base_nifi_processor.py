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

    def build_failure_result(
        self,
        flowFile: JavaObject,
        exception: Exception,
        *,
        include_flowfile_attributes: bool = False,
    ) -> FlowFileTransformResult:
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
    
    def transform(self, context: ProcessContext, flowFile: JavaObject):
        raise NotImplementedError
