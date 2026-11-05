#!/usr/bin/env bash
# Run as a one-shot client job; the SQL Server container owns the server process.
set -euo pipefail

server="${MSSQL_SERVER:-cogstack-databank-db-mssql,1433}"
db_user="${MSSQL_SA_USER:-sa}"
db_name="${DATABASE_DB_NAME:-CogStack}"
bootstrap_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
data_dir="${MSSQL_SCHEMA_DIR:-$bootstrap_dir/schemas}"
schema_prefix="${POSTGRES_DB_SCHEMA_PREFIX:-cogstack_db}"
annotations_schema="$data_dir/annotations_nlp_create_schema.sql"
retries="${MSSQL_INIT_RETRIES:-60}"
retry_delay="${MSSQL_INIT_RETRY_DELAY_SECONDS:-2}"
sqlcmd_bin="${SQLCMD_BIN:-}"

: "${MSSQL_SA_PASSWORD:?Set MSSQL_SA_PASSWORD before initializing SQL Server}"
export SQLCMDPASSWORD="$MSSQL_SA_PASSWORD"

if [[ ! "$retries" =~ ^[1-9][0-9]*$ || ! "$retry_delay" =~ ^[0-9]+$ ]]; then
    echo "MSSQL_INIT_RETRIES must be positive and MSSQL_INIT_RETRY_DELAY_SECONDS non-negative integers." >&2
    exit 1
fi
if [[ -z "$db_name" || ${#db_name} -gt 128 ]]; then
    echo "DATABASE_DB_NAME must contain between 1 and 128 characters." >&2
    exit 1
fi
if [[ ! -r "$annotations_schema" ]]; then
    echo "Missing annotation schema: $annotations_schema" >&2
    exit 1
fi

if [[ -z "$sqlcmd_bin" ]]; then
    for candidate in /opt/mssql-tools18/bin/sqlcmd /opt/mssql-tools/bin/sqlcmd; do
        if [[ -x "$candidate" ]]; then
            sqlcmd_bin="$candidate"
            break
        fi
    done
fi
if [[ ! -x "$sqlcmd_bin" ]]; then
    echo "sqlcmd was not found. Install mssql-tools or set SQLCMD_BIN to its executable path." >&2
    exit 1
fi

# The reference Compose server uses its self-signed certificate. -b propagates
# SQL errors to the job exit status; the password stays out of command arguments.
sqlcmd=("$sqlcmd_bin" -S "$server" -U "$db_user" -C -b -l 5)
for ((attempt = 1; attempt <= retries; attempt++)); do
    if "${sqlcmd[@]}" -d master -Q 'SET NOCOUNT ON; SELECT 1;' >/dev/null 2>&1; then
        break
    fi
    if ((attempt == retries)); then
        echo "SQL Server at $server was not ready after $retries attempts." >&2
        exit 1
    fi
    echo "Waiting for SQL Server at $server ($attempt/$retries)..."
    sleep "$retry_delay"
done

# Quote database names independently as a SQL string and a delimited identifier.
single_quote="'"
db_literal="${db_name//$single_quote/$single_quote$single_quote}"
db_identifier="${db_name//]/]]}"
echo "Initializing database: $db_name"
"${sqlcmd[@]}" -d master -Q "
IF DB_ID(N'$db_literal') IS NULL
BEGIN
    CREATE DATABASE [$db_identifier];
END;"

# Shell glob order is deterministic and quoted arrays preserve spaces in paths.
shopt -s nullglob
schema_files=("$data_dir"/"$schema_prefix"*.sql)
for schema_file in "${schema_files[@]}"; do
    echo "Applying schema: $schema_file"
    "${sqlcmd[@]}" -d "$db_name" -i "$schema_file"
done

echo "Applying annotation schema: $annotations_schema"
"${sqlcmd[@]}" -d "$db_name" -i "$annotations_schema"
echo "SQL Server database initialization completed."
