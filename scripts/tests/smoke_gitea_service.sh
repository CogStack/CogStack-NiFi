#!/usr/bin/env bash
# Smoke checks for the Gitea service.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOADER="${ROOT_DIR}/deploy/export_env_vars.sh"
SMOKE_HELPERS="${ROOT_DIR}/scripts/tests/smoke_http_checks.sh"

if [[ -f "$ENV_LOADER" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_LOADER"
fi

if [[ ! -f "$SMOKE_HELPERS" ]]; then
  echo "Missing smoke helper script: $SMOKE_HELPERS" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$SMOKE_HELPERS"

HOST="${GITEA_SMOKE_HOST:-localhost}"
PORT="${GITEA_SMOKE_PORT:-3000}"

START_SERVICES="${GITEA_SMOKE_START_SERVICES:-1}"
RETRIES="${GITEA_SMOKE_RETRIES:-30}"
DELAY_SECONDS="${GITEA_SMOKE_DELAY_SECONDS:-10}"

SMOKE_CHECKS=(
  "gitea-root|https://${HOST}:${PORT}/"
  "gitea-login|https://${HOST}:${PORT}/user/login"
)

if [[ "$START_SERVICES" != "0" ]]; then
  if ! command -v make >/dev/null 2>&1; then
    echo "make is required to start Gitea services via the Makefile." >&2
    exit 1
  fi

  echo "Starting Gitea service using 'make -C deploy start-git-ea'."
  make -C "${ROOT_DIR}/deploy" start-git-ea
fi

echo "Running smoke checks against Gitea."
wait_for_checks "Gitea" "$RETRIES" "$DELAY_SECONDS" "${SMOKE_CHECKS[@]}"
