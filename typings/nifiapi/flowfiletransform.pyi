from typing import Any, Protocol

from nifiapi.properties import ProcessContext
from py4j.java_gateway import JavaObject

class FlowFileTransformResult:
    def __init__(
        self,
        relationship: str,
        attributes: dict[str, str],
        contents: bytes | str | None = None
    ) -> None : ...



class FlowFileTransform(Protocol):
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> Any: ...
