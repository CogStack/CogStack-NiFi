from typing import Any, Protocol

from py4j.java_gateway import JavaObject

from .properties import ProcessContext

# ---------------------
# FlowFileTransform + Result
# ---------------------
class FlowFileTransform(Protocol):
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> Any: ...

class FlowFileTransformResult:
    def __init__(
        self,
        relationship: str,
        attributes: dict[str, str],
        contents: bytes | None = None,
    ) -> None: ...
