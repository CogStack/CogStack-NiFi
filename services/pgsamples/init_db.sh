#!/bin/bash

set -e


# global variables
#
DB_USER=${POSTGRES_USER:-"test"}
DB_USER_PASSWORD=${POSTGRES_PASSWORD_SAMPLES:-"test"}
DB_NAME="db_samples"

DATA_DIR="/data"
DB_DUMP_FILE="db_samples.sql.gz"

ANNOTATIONS_NLP_DB_SCHEMA_FILE="annotations_nlp_create_schema.sql"


# create the user, the database and set up the access
#
echo "Creating database: $DB_NAME and user: $DB_USER"
psql -v ON_ERROR_STOP=1 -U "$DB_USER" <<-EOSQL
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

# create schemas
#
echo "Defining ANNOTATION DB schemas"
psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -f $DATA_DIR/$ANNOTATIONS_NLP_DB_SCHEMA_FILE

echo "Restoring DB from dump"
gunzip -c $DATA_DIR/$DB_DUMP_FILE | psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME

# create view (cant be restored from sql dump for unknown reason)
psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d $DB_NAME <<-EOSQL
CREATE VIEW medical_reports_encounters_by_patient_view AS WITH res AS (
	SELECT
		mrt.docid,
		mrt.sampleid,
		mrt.typeid,
		mrt.dct,
		mrt.filename,
		mrt.document,
		e.patient
	FROM
		encounters AS e
		JOIN medical_reports_text AS mrt ON e.docid = mrt.docid
)
SELECT
	res.docid,
	res.sampleid,
	res.typeid,
	res.dct,
	res.filename,
	res.document,
	res.patient,
	p.birthdate,
	p.ethnicity,
	p.race,
	p.deathdate,
    p.gender
FROM
	res
	JOIN patients AS p ON res.patient = p.id;

ALTER TABLE public.medical_reports_encounters_by_patient_view OWNER TO "$DB_USER";
EOSQL

# cleanup
#
echo "Done with initializing the sample data."