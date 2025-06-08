#!/bin/bash

set -e


# global variables
#
POSTGRES_DATABANK_DB=${POSTGRES_DATABANK_DB:-"cogstack"}
POSTGRES_USER=${POSTGRES_USER:-"admin"}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"admin"}
DATA_DIR="/data"
ANNOTATIONS_NLP_DB_SCHEMA_FILE="annotations_nlp_create_schema.sql"

# database schemas that you wish to be created
POSTGRES_DB_SCHEMA_PREFIX=${POSTGRES_DB_SCHEMA_PREFIX:-"cogstack_db"}

# create the user, the database and set up the access
#
echo "Creating database: $POSTGRES_DATABANK_DB and user: $POSTGRES_USER"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
CREATE DATABASE $POSTGRES_DATABANK_DB;
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DATABANK_DB TO $POSTGRES_USER;
EOSQL

# create schemas
#
echo "Defining ANNOTATION DB schemas"
psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $POSTGRES_DATABANK_DB -f $DATA_DIR/$ANNOTATIONS_NLP_DB_SCHEMA_FILE

# custom db schema
echo "Creating custom databank DB schemas"

file_paths=$(find $DATA_DIR/ -name "$POSTGRES_DB_SCHEMA_PREFIX*")

for file_path in $file_paths; do
    psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $POSTGRES_DATABANK_DB -f $file_path;
done

# cleanup
#
echo "Done with initializing the sample data."