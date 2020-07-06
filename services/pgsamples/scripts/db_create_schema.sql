/* 
	creates schema of the DB for the NiFi Pipeline tests

Uses parts of the schema specified by:
    https://github.com/synthetichealth/synthea/wiki/CSV-File-Data-Dictionary

*/

CREATE TABLE patients (
	id UUID PRIMARY KEY,
	birthdate DATE NOT NULL, 
	deathdate DATE, 
	ssn VARCHAR(64) NOT NULL, 
	drivers VARCHAR(64),
	passport VARCHAR(64),
	prefix VARCHAR(8),
	first VARCHAR(64) NOT NULL,
	last VARCHAR(64) NOT NULL,
	suffix VARCHAR(8),
	maiden VARCHAR(64),
	marital CHAR(1),
	race VARCHAR(64) NOT NULL, 
	ethnicity VARCHAR(64) NOT NULL,
	gender CHAR(1) NOT NULL,
	birthplace VARCHAR(64) NOT NULL,
	address VARCHAR(64) NOT NULL,
	city VARCHAR(64) NOT NULL,
	state VARCHAR(64) NOT NULL,
	zip VARCHAR(64)
) ;

CREATE TABLE medical_reports_raw (
	docid INTEGER PRIMARY KEY,
	sampleid INTEGER NOT NULL,
	typeid INTEGER NOT NULL,
	dct TIMESTAMP NOT NULL,
	filename VARCHAR(256) NOT NULL,
	binarydoc BYTEA NOT NULL
) ;

CREATE TABLE medical_reports_text (
	docid INTEGER PRIMARY KEY,
	sampleid INTEGER NOT NULL,
	typeid INTEGER NOT NULL,
	dct TIMESTAMP NOT NULL,
	filename VARCHAR(256) NOT NULL,
	document TEXT NOT NULL
) ;

CREATE TABLE encounters (
	cid SERIAL NOT NULL,										-- for CogStack-Pipeline compatibility
	id UUID PRIMARY KEY,
	start TIMESTAMP NOT NULL,
	stop TIMESTAMP,
	patient UUID REFERENCES patients,
	code VARCHAR(64) NOT NULL,
	description VARCHAR(256) NOT NULL,
	cost REAL NOT NULL,
	reasoncode VARCHAR(64),
	reasondescription VARCHAR(256),
	docid INTEGER REFERENCES medical_reports_raw			-- MTSamples document content
) ;

CREATE TABLE observations (
	cid SERIAL PRIMARY KEY,										-- for CogStack compatibility
	date DATE NOT NULL, 
	patient UUID REFERENCES patients,
	encounter UUID REFERENCES encounters,
	code VARCHAR(64) NOT NULL,
	description VARCHAR(256) NOT NULL,
	value VARCHAR(64) NOT NULL,
	units VARCHAR(64),
	type VARCHAR(64) NOT NULL
) ;


/*

  Processed documents and annotations

*/
CREATE TABLE medical_reports_processed (
	cid SERIAL PRIMARY KEY,
	doc_id INTEGER REFERENCES medical_reports_raw,
	doc_text TEXT,
	processing_timestamp TIMESTAMPTZ,
	metadata_x_ocr_applied BOOLEAN,
	metadata_x_parsed_by TEXT,
	metadata_content_type TEXT,
	metadata_page_count INTEGER,
	metadata_creation_date TIMESTAMPTZ,
	metadata_last_modified TIMESTAMPTZ
) ;

CREATE TABLE annotations_medcat (
	cid BIGSERIAL PRIMARY KEY,
	doc_id INTEGER REFERENCES medical_reports_processed,
	processing_timestamp TIMESTAMPTZ,
	--
	ent_id INT NOT NULL,
	cui TEXT,
	tui TEXT,
	start_idx INT,
	end_idx INT,
	source_value TEXT,
	--
	type TEXT,
	acc REAL,
	icd10 TEXT,
	umls TEXT,
	snomed TEXT,
	pretty_name TEXT
) ;
