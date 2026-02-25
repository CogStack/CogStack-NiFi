# NiFi development guide

This guide is for contributors changing NiFi flows, custom processor scripts, or Python extension processors in this repository.

## Scope

Use this page for day-to-day development tasks:

- modifying NiFi templates and controller-service wiring,
- adding/updating script-based processors (`ExecuteStreamCommand`),
- adding/updating Python extension processors (`FlowFileTransform`),
- running local quality checks before opening a PR.

## Quick start

From the repository root:

```bash
cd deploy
source export_env_vars.sh
make start-nifi
```

Then open NiFi at `https://localhost:8082`.

## Repository map

- `nifi/user_templates/`: exported workflow templates.
- `nifi/user_scripts/processors/`: script-based processors run by `ExecuteStreamCommand`.
- `nifi/user_scripts/utils/`: shared helpers for scripts/extensions.
- `nifi/user_python_extensions/`: Python extension processors exposed in the NiFi UI.
- `nifi/user_scripts/tests/`: tests and local helper scripts.
- `docs/nifi/`: NiFi-facing developer and usage docs.

## Pick the right processor approach

Use script-based processors (`ExecuteStreamCommand`) when:

- you need a fast stdin->stdout transform,
- you do not need first-class processor properties/relationships in the UI.

Use Python extension processors when:

- you want the processor to appear as a native NiFi processor,
- you need explicit processor properties and stronger integration.

See also:

- [Processor scripting guide](processor_scripting.md)
- [User scripts](user_scripts.md)
- [Python extensions](user_python_extensions.md)

## Development loop

### Script-based processors

1. Edit/create a script in `nifi/user_scripts/processors/`.
2. Validate script input/output locally.
3. Configure/update `ExecuteStreamCommand` in NiFi.
4. Run flow and inspect success/failure relationships.

Local test example:

```bash
echo '[{"text":"hello"}]' | python3 nifi/user_scripts/processors/clean_doc.py text_field_name=text
```

### Python extension processors

1. Edit/create a processor in `nifi/user_python_extensions/`.
2. Restart the NiFi service (or reload processors in UI) to pick up changes.
3. Reconfigure/test the processor in the flow.

If dependencies changed:

1. Update `nifi/requirements.txt`.
2. Rebuild the NiFi image:

```bash
bash nifi/recreate_nifi_docker_image.sh
```

## Quality checks

Run the same core checks as CI:

```bash
python -m ruff check scripts nifi/user_python_extensions --select F,E9
python -m mypy --config-file pyproject.toml nifi/user_python_extensions scripts
```

Optional test run:

```bash
python -m pytest nifi/user_scripts/tests -q
```

## Debugging

- NiFi logs:

```bash
docker logs -f --tail 300 cogstack-nifi
```

- In the NiFi UI, use processor bulletins and data provenance to inspect failures.
- For script processors, write useful errors to `stderr` and exit non-zero.

## Where to document available processors

Recommended location: `docs/nifi/`.

- Keep implementation guidance in:
  - `docs/nifi/processor_scripting.md`
  - `docs/nifi/user_scripts.md`
  - `docs/nifi/user_python_extensions.md`
- Keep processor inventory on [processors catalog](processors_catalog.md).

For each processor entry, include:

- processor name and source file path,
- processor type (script-based or extension),
- expected input and output format,
- required properties/arguments,
- common failure modes and example usage.
