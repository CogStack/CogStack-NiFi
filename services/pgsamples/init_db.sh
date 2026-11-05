#!/usr/bin/env bash
# PostgreSQL's entrypoint creates POSTGRES_DB before running this loader.
set -euo pipefail

bootstrap_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
db_user="${POSTGRES_USER:-test}"
db_name="${POSTGRES_DB:-db_samples}"
schema_file="$bootstrap_dir/schemas/samples_db_schema.sql"
dump_file="$bootstrap_dir/db_dump/samples_db_data.sql.gz"
extra_sql_files=(
    "$bootstrap_dir/db_dump/encounters_pdf_text_small.sql"
    "$bootstrap_dir/db_dump/encounters_docx_small.sql"
)
extra_gzip_files=(
    "$bootstrap_dir/db_dump/encounters_jpg_small.sql.gz"
    "$bootstrap_dir/db_dump/encounters_pdf_img_small.sql.gz"
)

# Check the bundle before making any schema or data changes.
for input_file in "$schema_file" "$dump_file" "${extra_sql_files[@]}" "${extra_gzip_files[@]}"; do
    if [[ ! -r "$input_file" ]]; then
        echo "Missing sample database input: $input_file" >&2
        exit 1
    fi
done

psql_command=(psql -v ON_ERROR_STOP=1 -U "$db_user" -d "$db_name")
echo "Defining sample database schemas in $db_name"
"${psql_command[@]}" -f "$schema_file"

echo "Restoring sample data from $dump_file"
gunzip -c "$dump_file" | "${psql_command[@]}"

for sql_file in "${extra_sql_files[@]}"; do
    echo "Applying $sql_file"
    "${psql_command[@]}" -f "$sql_file"
done

for gzip_file in "${extra_gzip_files[@]}"; do
    echo "Restoring $gzip_file"
    gunzip -c "$gzip_file" | "${psql_command[@]}"
done

"$bootstrap_dir/access/configure.sh"
echo "Sample database initialization completed."
