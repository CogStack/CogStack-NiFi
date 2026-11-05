#!/usr/bin/env bash
# Smoke checks for the samples Postgres service.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOADER="${ROOT_DIR}/deploy/export_env_vars.sh"

if [[ -f "$ENV_LOADER" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_LOADER"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for Postgres smoke checks." >&2
  exit 1
fi

CONTAINER_NAME="${POSTGRES_SMOKE_CONTAINER_NAME:-cogstack-samples-db}"
DB_USER="${POSTGRES_INGEST_USER_SAMPLES:-cogstack_samples}"
DB_PASSWORD="${POSTGRES_INGEST_PASSWORD_SAMPLES:?Set the sample ingestion password}"
DB_NAME="${POSTGRES_SAMPLES_DB_NAME:-db_samples}"
DB_HOST="${POSTGRES_SMOKE_HOST:-samples-db}"

START_SERVICES="${POSTGRES_SMOKE_START_SERVICES:-1}"
RETRIES="${POSTGRES_SMOKE_RETRIES:-30}"
DELAY_SECONDS="${POSTGRES_SMOKE_DELAY_SECONDS:-10}"

check_container_running() {
  local status

  status="$(docker inspect --format '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || true)"
  if [[ "$status" == "running" ]]; then
    echo "OK: container ${CONTAINER_NAME} is running"
    return 0
  fi

  echo "FAIL: container ${CONTAINER_NAME} is not running"
  return 1
}

check_pg_isready() {
  if docker exec \
    -e PGPASSWORD="$DB_PASSWORD" \
    "$CONTAINER_NAME" \
    pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo "OK: pg_isready for database ${DB_NAME}"
    return 0
  fi

  echo "FAIL: pg_isready failed for database ${DB_NAME}"
  return 1
}

check_tls_query() {
  local result

  if ! result="$(
    docker exec \
      -e PGPASSWORD="$DB_PASSWORD" \
      "$CONTAINER_NAME" \
      psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc \
      'SELECT 1 FROM pg_stat_ssl WHERE pid = pg_backend_pid() AND ssl'
  )"; then
    echo "FAIL: query check failed for database ${DB_NAME}"
    return 1
  fi

  result="$(echo "$result" | tr -d '[:space:]')"
  if [[ "$result" == "1" ]]; then
    echo "OK: query used a TLS connection"
    return 0
  fi

  echo "FAIL: TLS query check returned unexpected value: ${result}"
  return 1
}

run_checks() {
  check_container_running &&
    check_pg_isready &&
    check_tls_query
}

if [[ "$START_SERVICES" != "0" ]]; then
  if ! command -v make >/dev/null 2>&1; then
    echo "make is required to start Postgres services via the Makefile." >&2
    exit 1
  fi

  echo "Preparing PostgreSQL certificates using 'make -C deploy init-security-postgresql'."
  make -C "${ROOT_DIR}/deploy" init-security-postgresql
  echo "Starting samples Postgres service using 'make -C deploy start-samples'."
  make -C "${ROOT_DIR}/deploy" start-samples
fi

echo "Running samples Postgres smoke checks."
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
