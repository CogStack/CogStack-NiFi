CREATE TABLE IF NOT EXISTS documents (
	id VARCHAR PRIMARY KEY,
	document_text TEXT
);

CREATE TABLE IF NOT EXISTS annotations (
	id VARCHAR PRIMARY KEY,
    document_id VARCHAR NULL REFERENCES documents(id),
	label VARCHAR,
    label_id VARCHAR(100),
    source_value VARCHAR,
    accuracy DECIMAL,
    context_similarity DECIMAL,
    star_char INTEGER,
    end_char INTEGER,
    medcat_info VARCHAR,
    tui VARCHAR(30),
    cui VARCHAR(30),
    icd10 VARCHAR,
    ontologies VARCHAR,
    snomed VARCHAR,
    "type" VARCHAR(255),
    medcat_version VARCHAR,
    model_id_used INTEGER REFERENCES nlp_models NULL
);

CREATE INDEX annotations_document_id_index ON annotations (document_id);

CREATE TABLE IF NOT EXISTS meta_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    annotation_id VARCHAR REFERENCES annotations(id) NOT NULL,
    "value" VARCHAR,
    confidence DECIMAL,
    "name" VARCHAR
);

CREATE INDEX meta_annotations_annotation_id_index ON meta_annotations (annotation_id);

CREATE TABLE IF NOT EXISTS nlp_models (
	id BIGINT PRIMARY KEY,
	"name" VARCHAR NOT NULL, 
    tag VARCHAR,
    "description" VARCHAR,
    domains VARCHAR,
    "url" VARCHAR
);

