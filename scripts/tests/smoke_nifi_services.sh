#!/usr/bin/env bash
# Smoke checks for NiFi and the nginx reverse proxy.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOADER="${ROOT_DIR}/deploy/export_env_vars.sh"

if [[ -f "$ENV_LOADER" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_LOADER"
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for smoke checks." >&2
  exit 1
fi

HOST="${NIFI_SMOKE_HOST:-localhost}"
NIFI_PORT="${NIFI_EXTERNAL_PORT_NGINX:-8443}"
START_SERVICES="${NIFI_SMOKE_START_SERVICES:-1}"
RETRIES="${NIFI_SMOKE_RETRIES:-30}"
DELAY_SECONDS="${NIFI_SMOKE_DELAY_SECONDS:-15}"

ALLOWED_CODES=(200 301 302 303 307 308 401 403)

check_url() {
  local name="$1"
  local url="$2"
  local code

  if ! code="$(curl --insecure --silent --show-error --output /dev/null \
    --connect-timeout 5 --max-time 15 --write-out "%{http_code}" "$url")"; then
    echo "FAIL: ${name} - unable to reach ${url}"
    return 1
  fi

  for allowed in "${ALLOWED_CODES[@]}"; do
    if [[ "$code" == "$allowed" ]]; then
      echo "OK: ${name} - ${url} (HTTP ${code})"
      return 0
    fi
  done

  echo "FAIL: ${name} - ${url} (unexpected HTTP ${code})"
  return 1
}

run_checks() {
  check_url "nifi" "https://${HOST}:${NIFI_PORT}/nifi/" &&
    check_url "nifi-nginx" "https://${HOST}:${NIFI_PORT}/"
}

if [[ "$START_SERVICES" != "0" ]]; then
  if ! command -v make >/dev/null 2>&1; then
    echo "make is required to start NiFi services via the Makefile." >&2
    exit 1
  fi

  echo "Starting NiFi services using 'make -C deploy start-nifi-dev'."
  make -C "${ROOT_DIR}/deploy" start-nifi-dev
fi

echo "Running smoke checks against NiFi and nginx."
for attempt in $(seq 1 "$RETRIES"); do
  if run_checks; then
    exit 0
  fi
  if [[ "$attempt" -lt "$RETRIES" ]]; then
    echo "Attempt ${attempt}/${RETRIES} failed. Sleeping ${DELAY_SECONDS}s..."
    sleep "$DELAY_SECONDS"
  fi
done

echo "Smoke checks failed after ${RETRIES} attempts."
exit 1
