# CogStack NiFi Documentation

The central documentation for cogstack, hosted on docs.cogstack.org

## Setup

### Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

```bash
uv venv --python 3.12 --allow-existing 
source .venv/bin/activate
uv sync --dev
```

## Usage

### Serve documentation locally (Development)

To preview the documentation locally with live reload:

```bash
uv run mkdocs serve
```

The documentation will be available at `http://127.0.0.1:8000`

### Build documentation

To build the static site:

```bash
uv run mkdocs build
```

The built site will be in the `site/` directory.
