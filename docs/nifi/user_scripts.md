# NiFi user scripts

This page describes how scripts under `nifi/user_scripts/` are organized and when to use each folder.
For a full scripting walkthrough (processor scripting approaches, `ExecuteStreamCommand`, and args handling),
see [processor scripting guide](processor_scripting.md).

## Layout

- `processors/`: runnable scripts invoked by NiFi (reads stdin, writes stdout). These are Python scripts, not
  native Java processors.
- `utils/`: shared helper modules for processors or other user extensions. Keep side-effect free and avoid
  stdin/stdout usage here.
- `db/`: database helper modules used by scripts and processors.
- `dto/`: simple data containers/config objects.
- `tests/`: script-level tests and fixtures.
- `legacy_scripts/`: historical scripts kept for reference; avoid new use unless needed.

## Guidelines

- If a script is executed directly by NiFi (uses stdin/stdout), place it in `processors/`.
- If a module is imported by other scripts, place it in `utils/` or a subpackage.
- Keep processor scripts small and delegate reusable logic to `utils/`.
- Put static lookup data next to the utility that uses it (for example, `utils/data/`).

## ExecuteStreamCommand example (processors)

Use `ExecuteStreamCommand` when you want to run a script that reads from stdin and writes to stdout.
The FlowFile content becomes the script input, and the script output becomes the new FlowFile content.
For full details and more patterns, see [processor scripting guide](processor_scripting.md).

Example configuration using `clean_doc.py`:

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

Notes:
- Ensure `PYTHONPATH` includes `/opt/nifi/nifi-current/python/framework` so `nifi.user_scripts` imports resolve.
- Rebuild the NiFi image to pick up changes in `nifi/user_scripts` utilities used via package imports.
- Ensure upstream processors output the expected format (most scripts here expect JSON).
- Handle errors by writing useful messages to stderr and exiting non-zero so NiFi can route failures.

## NiFi Python extensions (user_python_extensions)

The `nifi/user_python_extensions/` folder contains Python FlowFileTransform processors loaded by
NiFi's Python extension framework. In the container, this is mounted at:
`/opt/nifi/nifi-current/python_extensions` and wired via
`nifi.python.extensions.source.directory.default`.

Use this folder when you want processors to appear in the NiFi UI as native Python processors.
See `nifi/user_python_extensions/sample_processor.py` for a reference implementation and
`nifi/user_scripts/utils/nifi/base_nifi_processor.py` for shared utilities.

If a Python extension needs shared helpers from `nifi/user_scripts/`, import via the
`nifi.user_scripts` package and ensure `PYTHONPATH` includes
`/opt/nifi/nifi-current/python/framework` in the container.
