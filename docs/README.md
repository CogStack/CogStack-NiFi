# CogStack NiFi documentation

The published documentation is hosted at
[cogstack-nifi.readthedocs.io](https://cogstack-nifi.readthedocs.io/en/latest/).
Run the commands below from the repository root.

## Setup

### Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

```bash
uv sync --project docs --frozen
```

## Usage

### Serve documentation locally (Development)

To preview the documentation locally with live reload:

```bash
uv run --project docs mkdocs serve
```

The documentation will be available at `http://127.0.0.1:8000`.

### Build documentation

To build the static site:

```bash
uv run --project docs mkdocs build --strict
```

The built site will be in the repository's `site/` directory.

Run the documentation-specific checks with:

```bash
python3 scripts/tests/lint_markdown.py
python3 scripts/tests/check_docs_links.py
```
