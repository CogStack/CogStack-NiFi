\set ON_ERROR_STOP on
\getenv ingest_user COGSTACK_INGEST_USER
\getenv ingest_password COGSTACK_INGEST_PASSWORD
BEGIN;
SELECT set_config('cogstack.ingest_user', :'ingest_user', true);

-- A configured application login must never reuse an administrator, owner,
-- or a role with inherited permissions.
DO $guard$
DECLARE
    app_name text := current_setting('cogstack.ingest_user');
    app_oid oid := (SELECT oid FROM pg_roles WHERE rolname = app_name);
BEGIN
    IF octet_length(app_name) > 63 THEN
        RAISE EXCEPTION 'The ingestion login exceeds PostgreSQL identifier length limits';
    END IF;
    IF app_name = current_user OR EXISTS (
        SELECT 1 FROM pg_roles
        WHERE oid = app_oid AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
    ) OR EXISTS (
        SELECT 1 FROM pg_auth_members WHERE member = app_oid
    ) OR EXISTS (
        SELECT 1 FROM pg_database WHERE datdba = app_oid
    ) OR EXISTS (
        SELECT 1 FROM pg_namespace WHERE nspowner = app_oid
    ) OR EXISTS (
        SELECT 1 FROM pg_class WHERE relowner = app_oid
    ) THEN
        RAISE EXCEPTION 'Choose a separate, unprivileged ingestion login instead of %', app_name;
    END IF;
END
$guard$;

SELECT format(
    'CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS',
    :'ingest_user'
) WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'ingest_user')
\gexec
SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'ingest_user', :'ingest_password')
\gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'ingest_user')
\gexec
GRANT USAGE ON SCHEMA public TO :"ingest_user";
SELECT format('REVOKE CREATE ON DATABASE %I FROM %I', current_database(), :'ingest_user')
\gexec
REVOKE CREATE ON SCHEMA public FROM :"ingest_user";
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM :"ingest_user";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM :"ingest_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM :"ingest_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM :"ingest_user";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"ingest_user";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"ingest_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"ingest_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO :"ingest_user";

-- Fail rather than silently inheriting CREATE from legacy PUBLIC grants.
DO $guard$
BEGIN
    IF has_schema_privilege(current_setting('cogstack.ingest_user'), 'public', 'CREATE')
       OR has_database_privilege(current_setting('cogstack.ingest_user'), current_database(), 'CREATE') THEN
        RAISE EXCEPTION 'The ingestion login inherits CREATE privileges; remove legacy PUBLIC CREATE grants first';
    END IF;
END
$guard$;
COMMIT;
