#!/usr/bin/env bash
# Also usable against an existing volume via docker compose exec.
set -euo pipefail

access_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
: "${POSTGRES_USER:?Set the PostgreSQL bootstrap user}"
: "${POSTGRES_DB:?Set the target database}"
: "${COGSTACK_INGEST_USER:?Set a separate ingestion user}"
: "${COGSTACK_INGEST_PASSWORD:?Set the ingestion password}"
export PGPASSWORD="${POSTGRES_PASSWORD:?Set the PostgreSQL bootstrap password}"

psql_command=(psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB")
for ((attempt = 1; attempt <= 60; attempt++)); do
    if "${psql_command[@]}" -c 'SELECT 1' >/dev/null 2>&1; then
        exec "${psql_command[@]}" -f "$access_dir/ingest.sql"
    fi
    if ((attempt == 60)); then
        echo "PostgreSQL database $POSTGRES_DB did not become ready." >&2
        exit 1
    fi
    sleep 2
done
