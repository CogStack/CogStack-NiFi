# NiFi Python extensions

This page covers Python FlowFileTransform processors loaded by NiFi's Python extension framework.

## Location and wiring

- Source folder: `nifi/user_python_extensions/`
- Container path: `/opt/nifi/nifi-current/python_extensions`
- Config property: `nifi.python.extensions.source.directory.default`
  (set in `nifi/conf/nifi.properties`)
- Compose mounts: `deploy/services.yml` and `deploy/services-dev.yml`
- Import path: `PYTHONPATH` should include `/opt/nifi/nifi-current/python/framework`
  (set via `NIFI_PYTHONPATH` in `deploy/nifi.env`)

## When to use

Use Python extensions when you want custom processors to appear in the NiFi UI with properties and
relationships, and when you need tighter integration than `ExecuteStreamCommand`.

If you only need stdin/stdout scripts, use `nifi/user_scripts/processors/` instead.

## Minimal processor example

```python
from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import ProcessContext
from py4j.java_gateway import JavaObject, JVMView
from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor


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

If a processor uses helpers from `nifi/user_scripts/`, import via `nifi.user_scripts`
and set `PYTHONPATH` to `/opt/nifi/nifi-current/python/framework` in the container.

## Dependencies

Python dependencies are installed into NiFi's Python framework from the root `pyproject.toml`
and `uv.lock` during the custom image build. Add new runtime dependencies to `pyproject.toml`,
then refresh the lock with `uv lock`.

## Development workflow

- Edit files in `nifi/user_python_extensions/`.
- Restart the container to pick up bind-mounted extension changes, and rebuild the image to refresh the
  installed `nifi.user_scripts` package.

### Verify service response restoration

`CogStackParseCogStackServiceResult` version `0.0.6` restores original requests with a
`content` envelope, and bare requests containing `footer`, even when no text key exists.
It emits every footer field plus the original text, including an empty string.
The output remains a JSON array, as with normal service responses.

After deploying the source, restart NiFi and check that the parser instance uses
version `0.0.6`. If it still uses an older version, update that instance to the new
version before testing restoration.

Check the connection entering the parser as well. The bundled OCR and MedCAT flows
send `InvokeHTTP`'s `Response` relationship to the parser, while `No Retry`, `Retry`,
and `Failure` go to a funnel. Those original failure FlowFiles cannot be restored by
this parser unless they are routed to it. Inspect the actual incoming FlowFile content
and the parser's outgoing content when diagnosing missing fields.

If the parser receives an unrecognised error body without the original request, it
routes the FlowFile to `failure` without replacing its content. A service error body
alone cannot reconstruct a footer that is only present in the original request.

## Related docs

- `docs/nifi/processor_scripting.md` for a side-by-side guide of extension processors vs `ExecuteStreamCommand`.
- `docs/nifi/user_scripts.md` for stdin/stdout processors and script layout.
