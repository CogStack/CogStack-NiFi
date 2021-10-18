#!/usr/bin/env bash
set -e


# global variables
#
DB_USER=$POSTGRES_USER
DB_NAME="db_samples"

DATA_DIR="/data"
DB_DUMP_FILE="db_samples.sql.gz"

ANNOTATIONS_NLP_DB_SCHEMA_FILE="annotations_nlp_create_schema.sql"


# create the user, the database and set up the access
#
echo "Creating database: $DB_NAME and user: $DB_USER"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

# create schemas
#
echo "Defining ANNOTATION DB schemas"
psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -f $DATA_DIR/$ANNOTATIONS_NLP_DB_SCHEMA_FILE

echo "Restoring DB from dump"
gunzip -c $DATA_DIR/$DB_DUMP_FILE | psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $DB_NAME
# cleanup
#
echo "Done with initializing the sample data."