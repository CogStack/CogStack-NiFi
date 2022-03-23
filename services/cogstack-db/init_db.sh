#!/bin/bash

set -e


# global variables
#
DB_NAME="databank"
DATA_DIR="/data"
ANNOTATIONS_NLP_DB_SCHEMA_FILE="annotations_nlp_create_schema.sql"

# create the user, the database and set up the access
#
echo "Creating database: $DB_NAME and user: $POSTGRES_USER"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $POSTGRES_USER;
EOSQL

# create schemas
#
echo "Defining ANNOTATION DB schemas"
psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $DB_NAME -f $DATA_DIR/$ANNOTATIONS_NLP_DB_SCHEMA_FILE

# cleanup
#
echo "Done with initializing the sample data."