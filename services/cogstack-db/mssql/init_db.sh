#!/bin/bash


# this script is a hack to work around the fact that MSSQL images don't have a predefined startup script point like PGSQL
# https://github.com/microsoft/mssql-docker/issues/2

# start up mssql-server

process_id=$(pgrep sqlservr)

if [[ -z ${process_id} ]]; then
    echo "Starting mssql-server..."
    /opt/mssql/bin/sqlservr &
    sleep 20s
else
    echo "mssql-server already started, PID:"$process_id
fi

# global variables
#
DATABANK_DB="CogStack"
DATA_DIR="/data"
ANNOTATIONS_NLP_DB_SCHEMA_FILE="annotations_nlp_create_schema.sql"

# database schemas that you wish to be created
POSTGRES_DB_SCHEMA_PREFIX="cogstack_db"

# create the user, the database and set up the access
#
echo "Creating database: $DATABANK_DB and user: $MSSQL_SA_USER"
/opt/mssql-tools/bin/sqlcmd -S "localhost,1433"  -U $MSSQL_SA_USER -P $MSSQL_SA_PASSWORD -Q "
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '$DATABANK_DB')
BEGIN
    CREATE DATABASE [$DATABANK_DB]
END
GO
    USE [$DATABANK_DB]
"

# custom db schema
echo "Creating custom databank DB schemas..."
file_paths=$(find $DATA_DIR/ -name "$POSTGRES_DB_SCHEMA_PREFIX*")

for file_path in $file_paths; do
    echo "importing : "$file_path;
    /opt/mssql-tools/bin/sqlcmd -S localhost -U $MSSQL_SA_USER -P $MSSQL_SA_PASSWORD -d $DATABANK_DB -i $file_path;
done
echo "Done."

# create schemas
#
echo "Defining ANNOTATION DB schemas..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U $MSSQL_SA_USER -P $MSSQL_SA_PASSWORD -d $DATABANK_DB -i $DATA_DIR/$ANNOTATIONS_NLP_DB_SCHEMA_FILE
echo "Done."

while :; do
    sleep 10
done
