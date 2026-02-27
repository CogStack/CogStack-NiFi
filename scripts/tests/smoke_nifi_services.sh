#!/usr/bin/env bash
# Smoke checks for NiFi and the nginx reverse proxy.

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

HOST="${NIFI_SMOKE_HOST:-localhost}"
NIFI_PORT="${NIFI_EXTERNAL_PORT_NGINX:-8443}"
START_SERVICES="${NIFI_SMOKE_START_SERVICES:-1}"
RETRIES="${NIFI_SMOKE_RETRIES:-30}"
DELAY_SECONDS="${NIFI_SMOKE_DELAY_SECONDS:-15}"

SMOKE_CHECKS=(
  "nifi|https://${HOST}:${NIFI_PORT}/nifi/"
  "nifi-nginx|https://${HOST}:${NIFI_PORT}/"
)

if [[ "$START_SERVICES" != "0" ]]; then
  if ! command -v make >/dev/null 2>&1; then
    echo "make is required to start NiFi services via the Makefile." >&2
    exit 1
  fi

  echo "Starting NiFi services using 'make -C deploy start-nifi-dev'."
  make -C "${ROOT_DIR}/deploy" start-nifi-dev
fi

echo "Running smoke checks against NiFi and nginx."
wait_for_checks "NiFi" "$RETRIES" "$DELAY_SECONDS" "${SMOKE_CHECKS[@]}"
