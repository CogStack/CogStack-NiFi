#!/usr/bin/env bash
# Pip dependency hygiene for in-repo components (excludes external service submodules).
# Default: audit lightweight docs deps. Use --include-nifi to audit NiFi extras (heavier).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PY_REQS_NIFI=(
  "nifi/requirements.txt"
  "nifi/requirements-dev.txt"
)

INCLUDE_NIFI=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --include-nifi)
      INCLUDE_NIFI=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--include-nifi]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

for command in pip-audit uv; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Required command not found: ${command}" >&2
    exit 1
  fi
done

TMP_DIR="$(mktemp -d)"
trap 'rm -rf -- "$TMP_DIR"' EXIT

DOCS_REQUIREMENTS="${TMP_DIR}/docs-requirements.txt"

echo "==> Python dependency audit"
echo "Exporting locked docs dependencies"
uv export \
  --project "${ROOT_DIR}/docs" \
  --quiet \
  --frozen \
  --no-dev \
  --no-emit-project \
  --format requirements.txt \
  --output-file "$DOCS_REQUIREMENTS"

echo "Running pip-audit on docs/uv.lock"
pip-audit -r "$DOCS_REQUIREMENTS" --progress-spinner off

if [[ "$INCLUDE_NIFI" != true ]]; then
  echo "Dependency audit complete."
  exit 0
fi

for req in "${PY_REQS_NIFI[@]}"; do
  file="${ROOT_DIR}/${req}"
  if [[ ! -f "$file" ]]; then
    echo "Required dependency file not found: ${req}" >&2
    exit 1
  fi
  echo "Running pip-audit on ${req}"
  pip-audit -r "$file" --progress-spinner off
done

echo "Dependency audit complete."
