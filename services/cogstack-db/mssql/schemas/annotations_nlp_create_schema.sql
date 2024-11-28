USE [CogStack]
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CogStack].[documents] (
	id uniqueidentifier,
	document_id VARCHAR  NOT NULL, 
	document_text TEXT,
    CONSTRAINT PK_documents PRIMARY KEY (id)	
);

CREATE TABLE [CogStack].[nlp_models] (
	id BIGINT,
	name VARCHAR NOT NULL, 
    tag VARCHAR,
    description VARCHAR,
    domains VARCHAR,
    url VARCHAR,
    CONSTRAINT PK_nlp_models PRIMARY KEY (id)	
);


CREATE TABLE [CogStack].[annotations] (
	id BIGINT,
    elasticsearch_id VARCHAR NULL,
	label VARCHAR NOT NULL,
    lael_id VARCHAR,
    source_value VARCHAR,
    accuracy DECIMAL,
    context_similarity DECIMAL,
    star_char INTEGER,
    end_char INTEGER,
    medcat_info VARCHAR,
    tui VARCHAR,
    cui VARCHAR,
    icd10 VARCHAR,
    ontologies VARCHAR,
    snomed VARCHAR,
    "type" VARCHAR,
    medcat_version VARCHAR,
    model_id_used INTEGER,
    CONSTRAINT PK_annotations PRIMARY KEY (id),
    CONSTRAINT FK_nlp_models_annotations FOREIGN KEY (model_id_used) REFERENCES [CogStack].[nlp_models] (id)
);

CREATE TABLE [CogStack].[meta_annotations] (
	id BIGINT,
	annotation_id BIGINT REFERENCES annotations, 
    "value" VARCHAR,
    confidence DECIMAL,
    meta_annotation_value VARCHAR,
    "name" VARCHAR
    CONSTRAINT PK_meta_annotations PRIMARY KEY (id),
    CONSTRAINT FK_meta_annotations_annotations FOREIGN KEY (annotation_id) REFERENCES [CogStack].[annotations] (id)
);
