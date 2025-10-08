#!/bin/bash

set -e


# global variables
#
DB_USER=${POSTGRES_USER:-"test"}
DB_USER_PASSWORD=${POSTGRES_PASSWORD_SAMPLES:-"test"}
DB_NAME="db_samples"

DATA_DIR="/data"
DB_DUMP_FILE="/db_dump/samples_db_data.sql.gz"
DB_SCHEMA_FILE="/schemas/samples_db_schema.sql"

DB_DUMP_FILES_EXTRA_SQL_FILES=(
    $DATA_DIR"/db_dump/encounters_pdf_text_small.sql"
    $DATA_DIR"/db_dump/encounters_docx_small.sql"
)

DB_DUMP_FILES_EXTRA_SQL_GZ_FILES=(
    $DATA_DIR"/db_dump/encounters_jpg_small.sql.gz"
    $DATA_DIR"/db_dump/encounters_pdf_img_small.sql.gz"
)

# create the user, the database and set up the access
#
echo "Creating database: $DB_NAME and user: $DB_USER"
psql -v ON_ERROR_STOP=1 -U "$DB_USER" <<-EOSQL
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

# create schemas
#
echo "Defining DB schemas: $DB_SCHEMA_FILE"
psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -f $DATA_DIR/$DB_SCHEMA_FILE

echo "Restoring DB from dump: $DB_DUMP_FILE"
gunzip -c $DATA_DIR/$DB_DUMP_FILE | psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME

for sqlfile in "${DB_DUMP_FILES_EXTRA_SQL_FILES[@]}"; do
  echo "=== Applying $sqlfile ==="
  psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -f "$sqlfile"
done

for gzfile in "${DB_DUMP_FILES_EXTRA_SQL_GZ_FILES[@]}"; do
  echo "=== Applying $gzfile ==="
gunzip -c "$gzfile" | psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME
done

# cleanup
#
echo "Done with initializing the sample data."
