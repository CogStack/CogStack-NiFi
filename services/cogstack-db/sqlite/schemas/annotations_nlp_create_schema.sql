CREATE TABLE documents (
	id VARCHAR PRIMARY KEY,
	document_id VARCHAR  NOT NULL, 
	document_text TEXT
);

CREATE TABLE annotations (
	id BIGINT PRIMARY KEY,
    elasticsearch_id VARCHAR NULL,
	label VARCHAR(255) NOT NULL,
    label_id VARCHAR(10),
    source_value VARCHAR,
    accuracy DECIMAL,
    context_similarity DECIMAL,
    star_char INTEGER,
    end_char INTEGER,
    medcat_info VARCHAR,
    tui VARCHAR(20),
    cui VARCHAR(20),
    icd10 VARCHAR,
    ontologies VARCHAR,
    snomed VARCHAR,
    "type" VARCHAR(255),
    medcat_version VARCHAR,
    model_id_used INTEGER REFERENCES nlp_models
);

CREATE TABLE meta_annotations (
    id BIGINT PRIMARY KEY,
    annotation_id BIGINT REFERENCES annotations,
    "value" VARCHAR,
    confidence DECIMAL,
    "name" VARCHAR
);

CREATE TABLE nlp_models (
	id BIGINT PRIMARY KEY,
	"name" VARCHAR NOT NULL, 
    tag VARCHAR,
    "description" VARCHAR,
    domains VARCHAR,
    "url" VARCHAR
);
