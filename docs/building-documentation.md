# Building the documentation

The CogStack NiFi documentation is built with MkDocs Material. Run the commands
on this page from the repository root.

## Prerequisites

- Python 3.10 or later
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)

## Install the documentation dependencies

```bash
uv sync --project docs --frozen
```

The locked dependencies are installed into the documentation project's virtual
environment under `docs/.venv`.

## Preview the documentation locally

Start the development server with live reload:

```bash
uv run --project docs mkdocs serve
```

The default address is `http://127.0.0.1:8000`.

To use a different port, for example `8080`:

```bash
uv run --project docs mkdocs serve --dev-addr 127.0.0.1:8080
```

To allow access from another machine on the network:

```bash
uv run --project docs mkdocs serve --dev-addr 0.0.0.0:8080
```

!!! warning

    Binding to `0.0.0.0` exposes the development server to the connected
    network. Use an appropriate firewall and do not treat the MkDocs development
    server as a production web server.

## Build the static site

Build the documentation and treat warnings as errors:

```bash
uv run --project docs mkdocs build --strict
```

The generated site is written to `site/` in the repository root.

## Run documentation checks

Run the same repository checks used to catch Markdown and internal-link errors:

```bash
python3 scripts/tests/lint_markdown.py
python3 scripts/tests/check_docs_links.py
uv run --project docs mkdocs build --strict
```

All three commands should complete successfully before submitting documentation
changes.

## Important files

- `mkdocs.yml` defines navigation, theme settings, extensions, and validation.
- `docs/` contains the Markdown source files.
- `docs/pyproject.toml` declares the documentation dependencies.
- `docs/uv.lock` pins their resolved versions.
- `.github/workflows/doc_build.yml` defines the documentation CI job.
