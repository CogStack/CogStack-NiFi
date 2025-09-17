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

# cleanup
#
echo "Done with initializing the sample data."