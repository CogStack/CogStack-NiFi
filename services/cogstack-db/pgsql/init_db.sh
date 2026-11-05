#!/usr/bin/env bash
# PostgreSQL's entrypoint creates POSTGRES_DB before running this loader.
set -euo pipefail

bootstrap_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
schema_dir="$bootstrap_dir/schemas"
db_user="${POSTGRES_USER:-admin}"
db_name="${POSTGRES_DB:-cogstack}"
schema_prefix="${POSTGRES_DB_SCHEMA_PREFIX:-cogstack_db}"
annotations_schema="$schema_dir/annotations_nlp_create_schema.sql"

if [[ ! -r "$annotations_schema" ]]; then
    echo "Missing annotation schema: $annotations_schema" >&2
    exit 1
fi

psql_command=(psql -v ON_ERROR_STOP=1 -U "$db_user" -d "$db_name")
echo "Defining annotation schemas in $db_name"
"${psql_command[@]}" -f "$annotations_schema"

# Glob order is deterministic, and quoted arrays preserve spaces in file names.
shopt -s nullglob
schema_files=("$schema_dir"/"$schema_prefix"*.sql)
for schema_file in "${schema_files[@]}"; do
    echo "Applying schema: $schema_file"
    "${psql_command[@]}" -f "$schema_file"
done

"$bootstrap_dir/access/configure.sh"
echo "PostgreSQL databank initialization completed."
