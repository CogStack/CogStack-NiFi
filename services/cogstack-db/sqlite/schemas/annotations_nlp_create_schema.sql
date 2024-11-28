CREATE TABLE IF NOT EXISTS documents (
	id VARCHAR PRIMARY KEY,
	document_id VARCHAR NOT NULL, 
	document_text TEXT
);

CREATE TABLE IF NOT EXISTS annotations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    elasticsearch_id VARCHAR NULL,
	label VARCHAR(255),
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
    model_id_used INTEGER REFERENCES nlp_models NULL
);

CREATE INDEX annotations_elasticsearch_id_index ON annotations (elasticsearch_id);

CREATE TABLE IF NOT EXISTS meta_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    annotation_id INTEGER REFERENCES annotations NULL,
    "value" VARCHAR,
    confidence DECIMAL,
    "name" VARCHAR
);

CREATE TABLE IF NOT EXISTS nlp_models (
	id BIGINT PRIMARY KEY,
	"name" VARCHAR NOT NULL, 
    tag VARCHAR,
    "description" VARCHAR,
    domains VARCHAR,
    "url" VARCHAR
);

