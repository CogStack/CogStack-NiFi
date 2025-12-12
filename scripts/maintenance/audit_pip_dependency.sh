#!/usr/bin/env bash
# Pip dependency hygiene for in-repo components (excludes external service submodules).
# Default: audit lightweight docs deps. Use --include-nifi to audit NiFi extras (heavier).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PY_REQS=(
  "docs/requirements.txt"
)

PY_REQS_NIFI=(
  "nifi/requirements.txt"
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

if [[ "$INCLUDE_NIFI" == true ]]; then
  PY_REQS+=("${PY_REQS_NIFI[@]}")
fi

echo "==> Python dependency audit"
for req in "${PY_REQS[@]}"; do
  file="${ROOT_DIR}/${req}"
  if [[ ! -f "$file" ]]; then
    echo "Skip missing ${req}"
    continue
  fi
  echo "Running pip-audit on ${req}"
  pip-audit -r "$file" --progress-spinner off
done

echo "Dependency audit complete."
