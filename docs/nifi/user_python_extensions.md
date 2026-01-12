# NiFi Python extensions

This page covers Python FlowFileTransform processors loaded by NiFi's Python extension framework.

## Location and wiring

- Source folder: `nifi/user_python_extensions/`
- Container path: `/opt/nifi/nifi-current/python_extensions`
- Config property: `nifi.python.extensions.source.directory.default`
  (set in `nifi/conf/nifi.properties`)
- Compose mounts: `deploy/services.yml` and `deploy/services-dev.yml`

## When to use

Use Python extensions when you want custom processors to appear in the NiFi UI with properties and
relationships, and when you need tighter integration than `ExecuteStreamCommand`.

If you only need stdin/stdout scripts, use `nifi/user_scripts/processors/` instead.

## Minimal processor example

```python
import sys

sys.path.insert(0, "/opt/nifi/user_scripts")

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import ProcessContext
from py4j.java_gateway import JavaObject, JVMView
from utils.nifi.base_nifi_processor import BaseNiFiProcessor


class ExampleProcessor(BaseNiFiProcessor):
    class Java:
        implements = ["org.apache.nifi.python.processor.FlowFileTransform"]

    class ProcessorDetails:
        version = "0.1.0"

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        return FlowFileTransformResult(
            relationship="success",
            attributes=flowFile.getAttributes(),
            contents=flowFile.getContentsAsBytes(),
        )
```

See `nifi/user_python_extensions/sample_processor.py` for a fuller example.

## Imports and shared utilities

If a processor uses helpers from `nifi/user_scripts/`, add that directory to `sys.path` (as above) or
set `PYTHONPATH` in the container.

## Dependencies

Python dependencies are installed into NiFi's Python framework from `nifi/requirements.txt`
during the custom image build. Add new dependencies there if your extension needs them.

## Development workflow

- Edit files in `nifi/user_python_extensions/`.
- Rebuild the NiFi image (or restart the container if you are bind-mounting the folder).

## Related docs

- `docs/nifi/user_scripts.md` for stdin/stdout processors and script layout.
