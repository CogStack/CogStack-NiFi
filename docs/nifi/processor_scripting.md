# NiFi processor scripting guide

This guide covers two ways to script custom logic in this repository:

1. Python scripts executed by `ExecuteStreamCommand` (stdin -> stdout).
2. Python extension processors (`FlowFileTransform`) that appear as processors in the NiFi UI.

## Where code should live

- `nifi/user_scripts/processors/`: Python scripts executed by `ExecuteStreamCommand`.
- `nifi/user_python_extensions/`: Python `FlowFileTransform` processors loaded by NiFi.
- `nifi/user_scripts/utils/`: shared helpers used by both approaches.

## Option 1: `ExecuteStreamCommand` stream scripts

Use this option when you want a fast way to run Python on FlowFile content without creating a full NiFi extension processor.

### Input/output contract

- NiFi sends FlowFile content to your script on `stdin`.
- Your script must write transformed content to `stdout`.
- Use `stderr` for errors/logs and exit non-zero on failure.
- The content written to `stdout` becomes the outgoing FlowFile content.

For text payloads, use `sys.stdin.read()` and `sys.stdout.write(...)`.
For binary payloads, use `sys.stdin.buffer.read()` and `sys.stdout.buffer.write(...)`.

### Minimal script template (with args)

```python
#!/usr/bin/env python3
import json
import sys
import traceback


def parse_args(argv: list[str]) -> tuple[str, bool]:
    # Common repo pattern: key=value arguments
    text_field_name = "text"
    uppercase = False
    for token in argv:
        if "=" not in token:
            continue
        key, value = token.split("=", 1)
        if key == "text_field_name":
            text_field_name = value
        elif key == "uppercase":
            uppercase = value.lower() in {"1", "true", "yes"}
    return text_field_name, uppercase


def main() -> None:
    text_field_name, uppercase = parse_args(sys.argv[1:])
    records = json.loads(sys.stdin.read())

    if isinstance(records, dict):
        records = [records]

    for record in records:
        current_value = str(record.get(text_field_name, ""))
        record[text_field_name] = current_value.upper() if uppercase else current_value

    sys.stdout.buffer.write(
        json.dumps(records, ensure_ascii=False).encode("utf-8")
    )


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
```

### How args are passed to `.py` scripts

This repository primarily uses `key=value` tokens in `Command Arguments`, for example:

- `text_field_name=text`
- `output_mode=base64`
- `binary_field_name=binarydoc`

You can see this pattern in scripts such as:
- `nifi/user_scripts/processors/clean_doc.py`
- `nifi/user_scripts/processors/record_decompress_cerner_blob.py`
- `nifi/user_scripts/processors/get_files_from_storage.py`

### Configure `ExecuteStreamCommand`

Recommended baseline properties:

- `Command Path`: `python3.11` (or your Python binary)
- `Command Arguments Strategy`: `Command Arguments Property`
- `Working Directory`: `/opt/nifi/user_scripts/processors/`
- `Ignore STDIN`: `false`
- `Output Destination Attribute`: leave empty (so output stays in FlowFile content)

Argument examples:

- If `Argument Delimiter` is `;`:
  `clean_doc.py;text_field_name=text`
- If delimiter is whitespace:
  `clean_doc.py text_field_name=text`

Concrete example using `clean_doc.py`:

```text
Processor: ExecuteStreamCommand
Command Path: python3.11
Command Arguments Strategy: Command Arguments Property
Working Directory: /opt/nifi/user_scripts/processors/
Argument Delimiter: ;
Command Arguments: clean_doc.py;text_field_name=text
Ignore STDIN: false
Output Destination Attribute: (empty)
```

## Option 2: Python extension processors (`FlowFileTransform`)

Use this option when you want a first-class processor in the NiFi UI with explicit properties and relationships.

At minimum, extension processors in this repo follow this shape:

- Class implements `org.apache.nifi.python.processor.FlowFileTransform` via nested `Java` class.
- Nested `ProcessorDetails` with version metadata.
- `transform(...)` entrypoint returns `FlowFileTransformResult`.

Reference implementations:
- `nifi/user_python_extensions/sample_processor.py`
- `nifi/user_scripts/utils/nifi/base_nifi_processor.py`

## Imports, packaging, and runtime notes

- `PYTHONPATH` is set to `/opt/nifi/nifi-current/python/framework` in deployment.
- The image build installs package dependencies and local `nifi` modules into that framework path.
- If you import shared modules from `nifi.user_scripts`, rebuild the NiFi image after code/dependency changes.

## Quick local test before wiring in NiFi

Run a processor script locally with sample input:

```bash
echo '[{"text":"hello"}]' | python3 nifi/user_scripts/processors/clean_doc.py text_field_name=text
```

For binary streams, prefer:

```python
sys.stdin.buffer.read()
sys.stdout.buffer.write(...)
```

## Troubleshooting

- Script not found: verify `Command Path`, `Working Directory`, and script filename.
- Import errors: verify `PYTHONPATH` and rebuild image if package contents changed.
- Unexpected empty output: ensure script writes to `stdout` and not only logs.
- Routing to error/nonzero relationship: ensure exceptions print to `stderr` and process exits with non-zero code.
