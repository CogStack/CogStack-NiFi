CREATE TABLE documents (
	id UUID PRIMARY KEY,
	document_id VARCHAR  NOT NULL, 
	document_text TEXT
);

CREATE TABLE nlp_models (
	id BIGINT PRIMARY KEY,
	"name" VARCHAR NOT NULL, 
    tag VARCHAR,
    "description" VARCHAR,
    domains VARCHAR,
    "url" VARCHAR
);

CREATE TABLE annotations (
	id BIGINT PRIMARY KEY,
	label VARCHAR NOT NULL,
    lael_id VARCHAR,
    source_value VARCHAR,
    accuracy DECIMAL,
    star_char INTEGER,
    end_char INTEGER,
    info VARCHAR,
    tui VARCHAR,
    cui VARCHAR,
    concept_type VARCHAR,
    medcat_version VARCHAR,
    model_id_used INTEGER REFERENCES nlp_models
);

CREATE TABLE meta_annotations (
	id INTEGER PRIMARY KEY,
	annotation_id INTEGER REFERENCES annotations, 
    tag VARCHAR,
    meta_attribute_id VARCHAR,
    meta_annotation_value VARCHAR
);
