from typing import Any, Protocol

class JavaObject(Protocol):
    """Stub for Py4J JavaObject with the methods we use in NiFi"""
    def getContentsAsBytes(self) -> bytes: ...
    def getAttributes(self) -> dict[str, Any]: ...

class JVMView(Protocol):
    """Stub JVM view"""
    pass
