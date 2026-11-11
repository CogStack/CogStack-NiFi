-- The initializer selects DATABASE_DB_NAME. CogStack below is the SQL schema,
-- independently of the configured database name.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
GO

IF SCHEMA_ID(N'CogStack') IS NULL
    EXEC(N'CREATE SCHEMA [CogStack] AUTHORIZATION [dbo]');
GO

IF OBJECT_ID(N'CogStack.documents', N'U') IS NULL
BEGIN
    CREATE TABLE [CogStack].[documents] (
        id UNIQUEIDENTIFIER NOT NULL,
        document_id NVARCHAR(MAX) NOT NULL,
        document_text NVARCHAR(MAX) NULL,
        CONSTRAINT PK_documents PRIMARY KEY (id)
    );
END;
GO

IF OBJECT_ID(N'CogStack.nlp_models', N'U') IS NULL
BEGIN
    CREATE TABLE [CogStack].[nlp_models] (
        id BIGINT NOT NULL,
        [name] NVARCHAR(MAX) NOT NULL,
        tag NVARCHAR(MAX) NULL,
        [description] NVARCHAR(MAX) NULL,
        domains NVARCHAR(MAX) NULL,
        [url] NVARCHAR(MAX) NULL,
        CONSTRAINT PK_nlp_models PRIMARY KEY (id)
    );
END;
GO

IF OBJECT_ID(N'CogStack.annotations', N'U') IS NULL
BEGIN
    CREATE TABLE [CogStack].[annotations] (
        id BIGINT NOT NULL,
        elasticsearch_id NVARCHAR(MAX) NULL,
        label NVARCHAR(255) NOT NULL,
        label_id NVARCHAR(10) NULL,
        source_value NVARCHAR(MAX) NULL,
        accuracy DECIMAL(18, 10) NULL,
        context_similarity DECIMAL(18, 10) NULL,
        star_char INTEGER NULL,
        end_char INTEGER NULL,
        medcat_info NVARCHAR(MAX) NULL,
        tui NVARCHAR(20) NULL,
        cui NVARCHAR(20) NULL,
        icd10 NVARCHAR(MAX) NULL,
        ontologies NVARCHAR(MAX) NULL,
        snomed NVARCHAR(MAX) NULL,
        [type] NVARCHAR(255) NULL,
        medcat_version NVARCHAR(MAX) NULL,
        model_id_used BIGINT NULL,
        CONSTRAINT PK_annotations PRIMARY KEY (id),
        CONSTRAINT FK_nlp_models_annotations FOREIGN KEY (model_id_used)
            REFERENCES [CogStack].[nlp_models] (id)
    );
END;
GO

IF OBJECT_ID(N'CogStack.meta_annotations', N'U') IS NULL
BEGIN
    CREATE TABLE [CogStack].[meta_annotations] (
        id BIGINT NOT NULL,
        annotation_id BIGINT NULL,
        [value] NVARCHAR(MAX) NULL,
        confidence DECIMAL(18, 10) NULL,
        meta_annotation_value NVARCHAR(MAX) NULL,
        [name] NVARCHAR(MAX) NULL,
        CONSTRAINT PK_meta_annotations PRIMARY KEY (id),
        CONSTRAINT FK_meta_annotations_annotations FOREIGN KEY (annotation_id)
            REFERENCES [CogStack].[annotations] (id)
    );
END;
GO

COMMIT TRANSACTION;
GO
