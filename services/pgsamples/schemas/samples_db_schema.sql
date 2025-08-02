--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.procedures DROP CONSTRAINT IF EXISTS procedures_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.procedures DROP CONSTRAINT IF EXISTS procedures_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.observations DROP CONSTRAINT IF EXISTS observations_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.observations DROP CONSTRAINT IF EXISTS observations_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.nlp_meta_annotations DROP CONSTRAINT IF EXISTS meta_annotations_annotation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.medications DROP CONSTRAINT IF EXISTS medications_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.medications DROP CONSTRAINT IF EXISTS medications_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.immunizations DROP CONSTRAINT IF EXISTS immunizations_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.immunizations DROP CONSTRAINT IF EXISTS immunizations_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.imaging_studies DROP CONSTRAINT IF EXISTS imaging_studies_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.imaging_studies DROP CONSTRAINT IF EXISTS imaging_studies_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.encounters DROP CONSTRAINT IF EXISTS encounters_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.conditions DROP CONSTRAINT IF EXISTS conditions_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.conditions DROP CONSTRAINT IF EXISTS conditions_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.careplans DROP CONSTRAINT IF EXISTS careplans_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.careplans DROP CONSTRAINT IF EXISTS careplans_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.nlp_annotations DROP CONSTRAINT IF EXISTS annotations_model_id_used_fkey;
ALTER TABLE IF EXISTS ONLY public.allergies DROP CONSTRAINT IF EXISTS allergies_patient_fkey;
ALTER TABLE IF EXISTS ONLY public.allergies DROP CONSTRAINT IF EXISTS allergies_encounter_fkey;
ALTER TABLE IF EXISTS ONLY public.procedures DROP CONSTRAINT IF EXISTS procedures_pkey;
ALTER TABLE IF EXISTS ONLY public.patients DROP CONSTRAINT IF EXISTS patients_pkey;
ALTER TABLE IF EXISTS ONLY public.observations DROP CONSTRAINT IF EXISTS observations_pkey;
ALTER TABLE IF EXISTS ONLY public.nlp_models DROP CONSTRAINT IF EXISTS nlp_models_pkey;
ALTER TABLE IF EXISTS ONLY public.mtsamples DROP CONSTRAINT IF EXISTS mtsamples_pkey;
ALTER TABLE IF EXISTS ONLY public.nlp_meta_annotations DROP CONSTRAINT IF EXISTS meta_annotations_pkey;
ALTER TABLE IF EXISTS ONLY public.medications DROP CONSTRAINT IF EXISTS medications_pkey;
ALTER TABLE IF EXISTS ONLY public.medical_reports_text DROP CONSTRAINT IF EXISTS medical_reports_text_pkey;
ALTER TABLE IF EXISTS ONLY public.immunizations DROP CONSTRAINT IF EXISTS immunizations_pkey;
ALTER TABLE IF EXISTS ONLY public.imaging_studies DROP CONSTRAINT IF EXISTS imaging_studies_pkey;
ALTER TABLE IF EXISTS ONLY public.encounters DROP CONSTRAINT IF EXISTS encounters_pkey;
ALTER TABLE IF EXISTS ONLY public.encounters_pdf_text_small DROP CONSTRAINT IF EXISTS encounters_pdf_text_small_pk;
ALTER TABLE IF EXISTS ONLY public.encounters_pdf_img_small DROP CONSTRAINT IF EXISTS encounters_pdf_img_small_pk;
ALTER TABLE IF EXISTS ONLY public.encounters_jpg_small DROP CONSTRAINT IF EXISTS encounters_jpg_small_pk;
ALTER TABLE IF EXISTS ONLY public.encounters_docx_small DROP CONSTRAINT IF EXISTS encounters_docx_small_pk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey1;
ALTER TABLE IF EXISTS ONLY public.nlp_documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.conditions DROP CONSTRAINT IF EXISTS conditions_pkey;
ALTER TABLE IF EXISTS ONLY public.careplans DROP CONSTRAINT IF EXISTS careplans_pkey;
ALTER TABLE IF EXISTS ONLY public.nlp_annotations DROP CONSTRAINT IF EXISTS annotations_pkey;
ALTER TABLE IF EXISTS ONLY public.allergies DROP CONSTRAINT IF EXISTS allergies_pkey;
ALTER TABLE IF EXISTS public.procedures ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.observations ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.mtsamples ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.medications ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.immunizations ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.conditions ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.careplans ALTER COLUMN cid DROP DEFAULT;
ALTER TABLE IF EXISTS public.allergies ALTER COLUMN cid DROP DEFAULT;
DROP VIEW IF EXISTS public.procedures_view;
DROP SEQUENCE IF EXISTS public.procedures_cid_seq;
DROP TABLE IF EXISTS public.procedures;
DROP VIEW IF EXISTS public.observations_view;
DROP SEQUENCE IF EXISTS public.observations_cid_seq;
DROP TABLE IF EXISTS public.observations;
DROP TABLE IF EXISTS public.nlp_models;
DROP TABLE IF EXISTS public.nlp_meta_annotations;
DROP TABLE IF EXISTS public.nlp_documents;
DROP TABLE IF EXISTS public.nlp_annotations;
DROP SEQUENCE IF EXISTS public.mtsamples_cid_seq;
DROP TABLE IF EXISTS public.mtsamples;
DROP VIEW IF EXISTS public.medications_view;
DROP SEQUENCE IF EXISTS public.medications_cid_seq;
DROP TABLE IF EXISTS public.medications;
DROP TABLE IF EXISTS public.medical_reports_text;
DROP VIEW IF EXISTS public.immunizations_view;
DROP SEQUENCE IF EXISTS public.immunizations_cid_seq;
DROP TABLE IF EXISTS public.immunizations;
DROP VIEW IF EXISTS public.imaging_studies_view;
DROP TABLE IF EXISTS public.imaging_studies;
DROP SEQUENCE IF EXISTS public.imaging_studies_cid_seq;
DROP TABLE IF EXISTS public.encounters_pdf_text_small;
DROP TABLE IF EXISTS public.encounters_pdf_img_small;
DROP TABLE IF EXISTS public.encounters_jpg_small;
DROP TABLE IF EXISTS public.encounters_docx_small;
DROP SEQUENCE IF EXISTS public.encounters_cid_seq;
DROP TABLE IF EXISTS public.documents;
DROP VIEW IF EXISTS public.conditions_view;
DROP SEQUENCE IF EXISTS public.conditions_cid_seq;
DROP TABLE IF EXISTS public.conditions;
DROP VIEW IF EXISTS public.careplans_view;
DROP SEQUENCE IF EXISTS public.careplans_cid_seq;
DROP TABLE IF EXISTS public.careplans;
DROP VIEW IF EXISTS public.allergies_view;
DROP VIEW IF EXISTS public.patient_encounters_view;
DROP TABLE IF EXISTS public.patients;
DROP TABLE IF EXISTS public.encounters;
DROP SEQUENCE IF EXISTS public.allergies_cid_seq;
DROP TABLE IF EXISTS public.allergies;
DROP FUNCTION IF EXISTS public.create_paenc_view(table_name character varying);
DROP DOMAIN IF EXISTS public.text_type;
DROP DOMAIN IF EXISTS public.key_type;
--
-- Name: key_type; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.key_type AS uuid NOT NULL;


--
-- Name: text_type; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.text_type AS character varying(256);


--
-- Name: create_paenc_view(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_paenc_view(table_name character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
	view_name varchar(64);
BEGIN
	view_name = table_name || '_view';
	EXECUTE FORMAT(E'
		CREATE OR REPLACE VIEW %I AS
		SELECT
			patient_encounters_view.*,
			%I.*,
			%I.cid AS cog_pk,
			%I.created as cog_timestamp
		FROM
			patient_encounters_view
		JOIN
			%I
		on
			%I.patient = patient_encounters_view.patient_id AND
			%I.encounter = patient_encounters_view.encounter_id
		',
		view_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: allergies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.allergies (
    cid integer NOT NULL,
    created timestamp without time zone,
    start date,
    stop date,
    patient uuid,
    encounter uuid,
    code character varying(64),
    description text
);


--
-- Name: allergies_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.allergies_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: allergies_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.allergies_cid_seq OWNED BY public.allergies.cid;


--
-- Name: encounters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounters (
    cid integer NOT NULL,
    id uuid NOT NULL,
    start timestamp without time zone NOT NULL,
    stop timestamp without time zone,
    patient uuid,
    code character varying(64) NOT NULL,
    description character varying(256) NOT NULL,
    cost real NOT NULL,
    reasoncode character varying(64),
    reasondescription character varying(256),
    binarydocument bytea,
    document text DEFAULT 'none'::text
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id uuid NOT NULL,
    birthdate date NOT NULL,
    deathdate date,
    ssn character varying(64) NOT NULL,
    drivers character varying(64),
    passport character varying(64),
    prefix character varying(8),
    first character varying(64) NOT NULL,
    last character varying(64) NOT NULL,
    suffix character varying(8),
    maiden character varying(64),
    marital character(1),
    race character varying(64) NOT NULL,
    ethnicity character varying(64) NOT NULL,
    gender character(1) NOT NULL,
    birthplace character varying(64) NOT NULL,
    address character varying(64) NOT NULL,
    city character varying(64) NOT NULL,
    state character varying(64) NOT NULL,
    zip character varying(64)
);


--
-- Name: patient_encounters_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.patient_encounters_view AS
 SELECT p.id AS patient_id,
    p.birthdate AS patient_birth_date,
    p.deathdate AS death_date,
    p.ssn AS patient_ssn,
    p.drivers AS patient_drivers,
    p.passport AS patient_passport,
    p.prefix AS patient_prefix,
    p.first AS patient_first_name,
    p.last AS patient_last_name,
    p.suffix AS patient_suffix,
    p.maiden AS patient_maiden,
    p.marital AS patient_marital,
    p.race AS patient_race,
    p.ethnicity AS patient_ethnicity,
    p.gender AS patient_gender,
    p.birthplace AS patient_birthplace,
    p.address AS patient_addr,
    p.city AS patient_city,
    p.state AS patient_state,
    p.zip AS patient_zip,
    enc.id AS encounter_id,
    enc.start AS encounter_start,
    enc.stop AS encounter_stop,
    enc.code AS encounter_code,
    enc.description AS encounter_desc,
    enc.cost AS encounter_cost,
    enc.reasoncode AS encounter_reason_code,
    enc.reasondescription AS encounter_reason_desc
   FROM public.patients p,
    public.encounters enc
  WHERE (enc.patient = p.id);


--
-- Name: allergies_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.allergies_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    allergies.cid,
    allergies.created,
    allergies.start,
    allergies.stop,
    allergies.patient,
    allergies.encounter,
    allergies.code,
    allergies.description,
    allergies.cid AS cog_pk,
    allergies.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.allergies ON (((allergies.patient = patient_encounters_view.patient_id) AND (allergies.encounter = patient_encounters_view.encounter_id))));


--
-- Name: careplans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.careplans (
    cid integer,
    created timestamp without time zone,
    id uuid NOT NULL,
    start date,
    stop date,
    patient uuid,
    encounter uuid,
    code character varying(64),
    description text,
    reasoncode character varying(64),
    reasondescription text
);


--
-- Name: careplans_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.careplans_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: careplans_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.careplans_cid_seq OWNED BY public.careplans.cid;


--
-- Name: careplans_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.careplans_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    careplans.cid,
    careplans.created,
    careplans.id,
    careplans.start,
    careplans.stop,
    careplans.patient,
    careplans.encounter,
    careplans.code,
    careplans.description,
    careplans.reasoncode,
    careplans.reasondescription,
    careplans.cid AS cog_pk,
    careplans.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.careplans ON (((careplans.patient = patient_encounters_view.patient_id) AND (careplans.encounter = patient_encounters_view.encounter_id))));


--
-- Name: conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conditions (
    cid integer NOT NULL,
    created timestamp without time zone,
    start date,
    stop date,
    patient uuid,
    encounter uuid,
    code character varying(64),
    description text
);


--
-- Name: conditions_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conditions_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conditions_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conditions_cid_seq OWNED BY public.conditions.cid;


--
-- Name: conditions_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.conditions_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    conditions.cid,
    conditions.created,
    conditions.start,
    conditions.stop,
    conditions.patient,
    conditions.encounter,
    conditions.code,
    conditions.description,
    conditions.cid AS cog_pk,
    conditions.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.conditions ON (((conditions.patient = patient_encounters_view.patient_id) AND (conditions.encounter = patient_encounters_view.encounter_id))));


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    document_id character varying NOT NULL,
    document_text text
);


--
-- Name: encounters_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encounters_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: encounters_docx_small; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounters_docx_small (
    cid integer,
    id uuid NOT NULL,
    binarydocument bytea
);


--
-- Name: encounters_jpg_small; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounters_jpg_small (
    cid integer,
    id uuid NOT NULL,
    binarydocument bytea
);


--
-- Name: encounters_pdf_img_small; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounters_pdf_img_small (
    cid integer,
    id uuid NOT NULL,
    binarydocument bytea
);


--
-- Name: encounters_pdf_text_small; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounters_pdf_text_small (
    cid integer,
    id uuid NOT NULL,
    binarydocument bytea
);


--
-- Name: imaging_studies_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.imaging_studies_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: imaging_studies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imaging_studies (
    cid integer DEFAULT nextval('public.imaging_studies_cid_seq'::regclass),
    created timestamp without time zone,
    id uuid NOT NULL,
    date date,
    patient uuid,
    encounter uuid,
    bodysite_code character varying(64),
    bodysite_description character varying(64),
    modality_code character varying(64),
    modality_description character varying(64),
    sop_code character varying(64),
    sop_description character varying(64)
);


--
-- Name: imaging_studies_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.imaging_studies_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    imaging_studies.cid,
    imaging_studies.created,
    imaging_studies.id,
    imaging_studies.date,
    imaging_studies.patient,
    imaging_studies.encounter,
    imaging_studies.bodysite_code,
    imaging_studies.bodysite_description,
    imaging_studies.modality_code,
    imaging_studies.modality_description,
    imaging_studies.sop_code,
    imaging_studies.sop_description,
    imaging_studies.cid AS cog_pk,
    imaging_studies.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.imaging_studies ON (((imaging_studies.patient = patient_encounters_view.patient_id) AND (imaging_studies.encounter = patient_encounters_view.encounter_id))));


--
-- Name: immunizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.immunizations (
    cid integer NOT NULL,
    created timestamp without time zone,
    date date,
    patient uuid,
    encounter uuid,
    code character varying(64),
    description text,
    cost numeric
);


--
-- Name: immunizations_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.immunizations_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: immunizations_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.immunizations_cid_seq OWNED BY public.immunizations.cid;


--
-- Name: immunizations_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.immunizations_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    immunizations.cid,
    immunizations.created,
    immunizations.date,
    immunizations.patient,
    immunizations.encounter,
    immunizations.code,
    immunizations.description,
    immunizations.cost,
    immunizations.cid AS cog_pk,
    immunizations.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.immunizations ON (((immunizations.patient = patient_encounters_view.patient_id) AND (immunizations.encounter = patient_encounters_view.encounter_id))));


--
-- Name: medical_reports_text; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_reports_text (
    docid integer NOT NULL,
    sampleid integer NOT NULL,
    typeid integer NOT NULL,
    dct timestamp without time zone NOT NULL,
    filename character varying(256) NOT NULL,
    document text NOT NULL
);


--
-- Name: medications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medications (
    cid integer NOT NULL,
    created timestamp without time zone,
    start date,
    stop date,
    patient uuid,
    encounter uuid,
    code character varying(64),
    description text,
    cost numeric,
    dispenses numeric,
    totalcost numeric,
    reasoncode character varying(64),
    reasondescription text
);


--
-- Name: medications_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medications_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medications_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medications_cid_seq OWNED BY public.medications.cid;


--
-- Name: medications_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.medications_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    medications.cid,
    medications.created,
    medications.start,
    medications.stop,
    medications.patient,
    medications.encounter,
    medications.code,
    medications.description,
    medications.cost,
    medications.dispenses,
    medications.totalcost,
    medications.reasoncode,
    medications.reasondescription,
    medications.cid AS cog_pk,
    medications.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.medications ON (((medications.patient = patient_encounters_view.patient_id) AND (medications.encounter = patient_encounters_view.encounter_id))));


--
-- Name: mtsamples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mtsamples (
    cid integer NOT NULL,
    sample_id integer NOT NULL,
    type character varying(256) NOT NULL,
    type_id integer NOT NULL,
    name character varying(256) NOT NULL,
    description text NOT NULL,
    document text NOT NULL,
    dct timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: mtsamples_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mtsamples_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mtsamples_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mtsamples_cid_seq OWNED BY public.mtsamples.cid;


--
-- Name: nlp_annotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nlp_annotations (
    id bigint NOT NULL,
    elasticsearch_id character varying,
    label character varying(255) NOT NULL,
    label_id character varying(10),
    source_value character varying,
    accuracy numeric,
    context_similarity numeric,
    star_char integer,
    end_char integer,
    medcat_info character varying,
    tui character varying(20),
    cui character varying(20),
    icd10 character varying,
    ontologies character varying,
    snomed character varying,
    type character varying(255),
    medcat_version character varying,
    model_id_used integer
);


--
-- Name: nlp_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nlp_documents (
    id uuid NOT NULL,
    document_id character varying NOT NULL,
    document_text text
);


--
-- Name: nlp_meta_annotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nlp_meta_annotations (
    id bigint NOT NULL,
    annotation_id bigint,
    value character varying,
    confidence numeric,
    name character varying
);


--
-- Name: nlp_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nlp_models (
    id bigint NOT NULL,
    name character varying NOT NULL,
    tag character varying,
    description character varying,
    domains character varying,
    url character varying
);


--
-- Name: observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.observations (
    cid integer NOT NULL,
    created timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + (random() * '5 years'::interval)),
    document text,
    doc_id integer,
    date date NOT NULL,
    patient uuid,
    encounter uuid,
    code character varying(64) NOT NULL,
    description character varying(256) NOT NULL,
    value character varying(64) NOT NULL,
    units character varying(64),
    type character varying(64) NOT NULL
);


--
-- Name: observations_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.observations_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: observations_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.observations_cid_seq OWNED BY public.observations.cid;


--
-- Name: observations_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.observations_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    observations.cid,
    observations.created,
    observations.date,
    observations.patient,
    observations.encounter,
    observations.code,
    observations.description,
    observations.value,
    observations.units,
    observations.type,
    observations.cid AS cog_pk,
    observations.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.observations ON (((observations.patient = patient_encounters_view.patient_id) AND (observations.encounter = patient_encounters_view.encounter_id))));


--
-- Name: procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedures (
    cid integer NOT NULL,
    created timestamp without time zone,
    date date,
    patient uuid,
    encounter uuid,
    code character varying(64),
    description text,
    cost real,
    reasoncode character varying(64),
    reasondescription text
);


--
-- Name: procedures_cid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.procedures_cid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: procedures_cid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.procedures_cid_seq OWNED BY public.procedures.cid;


--
-- Name: procedures_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.procedures_view AS
 SELECT patient_encounters_view.patient_id,
    patient_encounters_view.patient_birth_date,
    patient_encounters_view.death_date,
    patient_encounters_view.patient_ssn,
    patient_encounters_view.patient_drivers,
    patient_encounters_view.patient_passport,
    patient_encounters_view.patient_prefix,
    patient_encounters_view.patient_first_name,
    patient_encounters_view.patient_last_name,
    patient_encounters_view.patient_suffix,
    patient_encounters_view.patient_maiden,
    patient_encounters_view.patient_marital,
    patient_encounters_view.patient_race,
    patient_encounters_view.patient_ethnicity,
    patient_encounters_view.patient_gender,
    patient_encounters_view.patient_birthplace,
    patient_encounters_view.patient_addr,
    patient_encounters_view.patient_city,
    patient_encounters_view.patient_state,
    patient_encounters_view.patient_zip,
    patient_encounters_view.encounter_id,
    patient_encounters_view.encounter_start,
    patient_encounters_view.encounter_stop,
    patient_encounters_view.encounter_code,
    patient_encounters_view.encounter_desc,
    patient_encounters_view.encounter_cost,
    patient_encounters_view.encounter_reason_code,
    patient_encounters_view.encounter_reason_desc,
    procedures.cid,
    procedures.created,
    procedures.date,
    procedures.patient,
    procedures.encounter,
    procedures.code,
    procedures.description,
    procedures.cost,
    procedures.reasoncode,
    procedures.reasondescription,
    procedures.cid AS cog_pk,
    procedures.created AS cog_timestamp
   FROM (public.patient_encounters_view
     JOIN public.procedures ON (((procedures.patient = patient_encounters_view.patient_id) AND (procedures.encounter = patient_encounters_view.encounter_id))));


--
-- Name: allergies cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allergies ALTER COLUMN cid SET DEFAULT nextval('public.allergies_cid_seq'::regclass);


--
-- Name: careplans cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careplans ALTER COLUMN cid SET DEFAULT nextval('public.careplans_cid_seq'::regclass);


--
-- Name: conditions cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conditions ALTER COLUMN cid SET DEFAULT nextval('public.conditions_cid_seq'::regclass);


--
-- Name: immunizations cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immunizations ALTER COLUMN cid SET DEFAULT nextval('public.immunizations_cid_seq'::regclass);


--
-- Name: medications cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications ALTER COLUMN cid SET DEFAULT nextval('public.medications_cid_seq'::regclass);


--
-- Name: mtsamples cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mtsamples ALTER COLUMN cid SET DEFAULT nextval('public.mtsamples_cid_seq'::regclass);


--
-- Name: observations cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations ALTER COLUMN cid SET DEFAULT nextval('public.observations_cid_seq'::regclass);


--
-- Name: procedures cid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures ALTER COLUMN cid SET DEFAULT nextval('public.procedures_cid_seq'::regclass);


--
-- Name: allergies allergies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allergies
    ADD CONSTRAINT allergies_pkey PRIMARY KEY (cid);


--
-- Name: nlp_annotations annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_annotations
    ADD CONSTRAINT annotations_pkey PRIMARY KEY (id);


--
-- Name: careplans careplans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careplans
    ADD CONSTRAINT careplans_pkey PRIMARY KEY (id);


--
-- Name: conditions conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_pkey PRIMARY KEY (cid);


--
-- Name: nlp_documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey1 PRIMARY KEY (id);


--
-- Name: encounters_docx_small encounters_docx_small_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounters_docx_small
    ADD CONSTRAINT encounters_docx_small_pk PRIMARY KEY (id);


--
-- Name: encounters_jpg_small encounters_jpg_small_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounters_jpg_small
    ADD CONSTRAINT encounters_jpg_small_pk PRIMARY KEY (id);


--
-- Name: encounters_pdf_img_small encounters_pdf_img_small_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounters_pdf_img_small
    ADD CONSTRAINT encounters_pdf_img_small_pk PRIMARY KEY (id);


--
-- Name: encounters_pdf_text_small encounters_pdf_text_small_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounters_pdf_text_small
    ADD CONSTRAINT encounters_pdf_text_small_pk PRIMARY KEY (id);


--
-- Name: encounters encounters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounters
    ADD CONSTRAINT encounters_pkey PRIMARY KEY (id);


--
-- Name: imaging_studies imaging_studies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imaging_studies
    ADD CONSTRAINT imaging_studies_pkey PRIMARY KEY (id);


--
-- Name: immunizations immunizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immunizations
    ADD CONSTRAINT immunizations_pkey PRIMARY KEY (cid);


--
-- Name: medical_reports_text medical_reports_text_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_reports_text
    ADD CONSTRAINT medical_reports_text_pkey PRIMARY KEY (docid);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (cid);


--
-- Name: nlp_meta_annotations meta_annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_meta_annotations
    ADD CONSTRAINT meta_annotations_pkey PRIMARY KEY (id);


--
-- Name: mtsamples mtsamples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mtsamples
    ADD CONSTRAINT mtsamples_pkey PRIMARY KEY (cid);


--
-- Name: nlp_models nlp_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_models
    ADD CONSTRAINT nlp_models_pkey PRIMARY KEY (id);


--
-- Name: observations observations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_pkey PRIMARY KEY (cid);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: procedures procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_pkey PRIMARY KEY (cid);


--
-- Name: allergies allergies_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allergies
    ADD CONSTRAINT allergies_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: allergies allergies_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allergies
    ADD CONSTRAINT allergies_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: nlp_annotations annotations_model_id_used_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_annotations
    ADD CONSTRAINT annotations_model_id_used_fkey FOREIGN KEY (model_id_used) REFERENCES public.nlp_models(id);


--
-- Name: careplans careplans_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careplans
    ADD CONSTRAINT careplans_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: careplans careplans_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careplans
    ADD CONSTRAINT careplans_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: conditions conditions_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: conditions conditions_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: encounters encounters_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounters
    ADD CONSTRAINT encounters_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: imaging_studies imaging_studies_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imaging_studies
    ADD CONSTRAINT imaging_studies_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: imaging_studies imaging_studies_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imaging_studies
    ADD CONSTRAINT imaging_studies_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: immunizations immunizations_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immunizations
    ADD CONSTRAINT immunizations_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: immunizations immunizations_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immunizations
    ADD CONSTRAINT immunizations_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: medications medications_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: medications medications_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: nlp_meta_annotations meta_annotations_annotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_meta_annotations
    ADD CONSTRAINT meta_annotations_annotation_id_fkey FOREIGN KEY (annotation_id) REFERENCES public.nlp_annotations(id);


--
-- Name: observations observations_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: observations observations_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- Name: procedures procedures_encounter_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_encounter_fkey FOREIGN KEY (encounter) REFERENCES public.encounters(id);


--
-- Name: procedures procedures_patient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_patient_fkey FOREIGN KEY (patient) REFERENCES public.patients(id);


--
-- PostgreSQL database dump complete
--

