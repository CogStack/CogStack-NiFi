#!/usr/bin/env bash
set -e


# global variables
#
DB_USER="test"
DB_NAME="db_samples"

DATA_DIR="/data"
DB_DUMP_FILE="db_samples.sql.gz"


# create the user, the database and set up the access
#
echo "Creating database: $DB_NAME and user: $DB_USER"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
CREATE DATABASE $DB_NAME;
CREATE ROLE $DB_USER WITH PASSWORD 'test' LOGIN;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO test;
EOSQL


echo "Restoring DB from dump"
gunzip -c $DATA_DIR/$DB_DUMP_FILE | psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -d $DB_NAME


# cleanup
#
echo "Done with initializing the sample data."

