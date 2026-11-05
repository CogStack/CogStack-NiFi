# Docker database security

## Accounts and credential delivery

The tracked `security/env/users_database.env` contains public development defaults.
For shared or production deployments, copy it into the selected
`COGSTACK_CONFIG_DIR/security/` directory and replace the passwords there.
Profiles replace whole files, so existing profiles must add all six new ingestion
username/password settings.

| Service | Bootstrap account settings | Application account settings | Application privileges |
|---|---|---|---|
| Samples PostgreSQL | `POSTGRES_USER_SAMPLES`, `POSTGRES_PASSWORD_SAMPLES` | `POSTGRES_INGEST_USER_SAMPLES`, `POSTGRES_INGEST_PASSWORD_SAMPLES` | SELECT on `public` tables/views |
| Databank PostgreSQL | `DATABASE_USER`, `DATABASE_PASSWORD` | `DATABASE_INGEST_USER`, `DATABASE_INGEST_PASSWORD` | SELECT, INSERT, UPDATE, DELETE on `public` tables and sequence access |
| Databank MSSQL | `MSSQL_SA_USER`, `MSSQL_SA_PASSWORD` | `MSSQL_INGEST_USER`, `MSSQL_INGEST_PASSWORD` | SELECT, INSERT, UPDATE, DELETE on the `CogStack` schema |

Database services use explicit environment mappings rather than loading the
complete database credentials file. PostgreSQL needs its bootstrap and ingestion
credentials to initialize roles; the MSSQL server gets only its SA password, and
the separate initializer gets that password plus its ingestion credentials.
NiFi gets ingestion credentials only. Its certificate mounts cover NiFi/search
material and public root/database CAs. Database private keys and the root signing
key are excluded from NiFi, nginx, and Dashboards mounts.

Application roles cannot administer databases or create application schemas.
PostgreSQL grants include existing objects and future objects created by the
bootstrap owner in `public`. Site SQL using other schemas or migration owners
must supply explicit grants. Access SQL remains mounted and editable.

Provisioning rejects an ingestion name that reuses an administrator, object
owner, or role member. PostgreSQL also rejects inherited CREATE permissions from
legacy PUBLIC grants instead of reporting that the application role is restricted.

Environment scoping is not an encrypted secret store. Protect deployment-local
configuration and Docker daemon access, or inject values using deployment
tooling. Avoid sharing `make show-env` or resolved Compose output containing
credentials.

## Existing volumes and flows

Fresh PostgreSQL initialization configures ingestion access after loading its
schemas/data. These Make targets also apply access SQL against existing volumes:

```bash
make -C deploy start-samples
make -C deploy start-production-db
make -C deploy start-production-db-mssql
```

They recreate service configuration when needed and provision the named
application accounts. They do not reset data or demote the existing bootstrap
administrator. Bootstrap credentials must match the existing database; changing
the PostgreSQL administrator password in an environment file does not rotate the
stored password.

The MSSQL target applies the schema and then configures the application login.
The bundled schema preserves existing tables; column upgrades require migrations.

Existing NiFi flows must switch their database controller services to ingestion
credentials. The maintained database/OCR templates use:

- URL: `${POSTGRES_SAMPLES_JDBC_URL}`
- User: `${POSTGRES_INGEST_USER_SAMPLES}`
- Password: `${POSTGRES_INGEST_PASSWORD_SAMPLES}`

These are environment references, not password values committed in the flow.
Existing running flows are not overwritten. For databank pools, use the
corresponding ingestion settings from the table above.

## Host access

Database host ports default to `127.0.0.1`:

| Settings | Default |
|---|---|
| `POSTGRES_SAMPLES_OUTPUT_HOST`, `POSTGRES_SAMPLES_OUTPUT_PORT` | `127.0.0.1:5554` |
| `POSTGRES_DATABANK_OUTPUT_HOST`, `POSTGRES_DATABANK_OUTPUT_PORT` | `127.0.0.1:5558` |
| `MSSQL_OUTPUT_HOST`, `MSSQL_OUTPUT_PORT` | `127.0.0.1:1433` |

Override these in the deployment's `database.env` when remote host access is
required. Container clients keep using Compose service DNS and internal ports.

## PostgreSQL TLS

Both PostgreSQL services require TLS in `deploy/services.yml`. Bundled clients
use certificate and hostname verification; plaintext network connections are
rejected. No additional Compose file is needed.

Generate the local reference bundles before starting services:

```bash
make -C deploy init-security-postgresql
```

This target is also included in `make -C deploy init-security`. It signs the
database certificates with the deployment's shared root CA and leaves complete
existing bundles unchanged. The default directories, configured in
`deploy/database.env`, are:

| Setting | Default path, relative to `deploy/` |
|---|---|
| `POSTGRES_SAMPLES_TLS_DIR` | `../security/certificates/postgresql/samples` |
| `POSTGRES_DATABANK_TLS_DIR` | `../security/certificates/postgresql/databank` |

Profiles can override either TLS directory; omitted settings use these defaults.

For production, override these settings with directories containing trusted
`server.crt`, `server.key`, and `ca.crt` files. The server certificates must have
subject alternative names covering `samples-db` and `cogstack-databank-db`,
respectively, plus any other hostname used by clients. Keep host private keys
restricted. At startup, each service copies its bundle into a PostgreSQL-owned
runtime directory with the required permissions, so host key ownership does not
need to match the container's PostgreSQL UID. Certificate files remain
deployment-local inputs.

The services enable TLS 1.2 or later and SCRAM password authentication while
retaining local Unix-socket provisioning. The Make start targets apply access
configuration against existing volumes using verified TLS. NiFi receives only
the public database CAs at `/run/database-cas/samples-ca.crt` and
`/run/database-cas/databank-ca.crt`. The sample JDBC URL defaults to
`sslmode=verify-full`. For a databank controller service, use:

```text
jdbc:postgresql://cogstack-databank-db:5432/cogstack?sslmode=verify-full&sslrootcert=/run/database-cas/databank-ca.crt
```

Adjust the database name if necessary. Other clients must also configure CA and
hostname verification; server encryption alone does not establish server identity.

## MSSQL TLS

The initializer always passes `-N` to request encryption.
`MSSQL_TRUST_SERVER_CERTIFICATE=true` is the explicit local-development default
for the reference server's self-signed certificate.

For managed certificates, configure the SQL Server certificate/key and
server-side encryption policy, install the issuing CA in the initializer image's
OS trust store, and set `MSSQL_TRUST_SERVER_CERTIFICATE=false`.
An optional `MSSQL_TLS_HOSTNAME` supplies the certificate hostname via `-F`.
Verified mode never falls back to `-C`.

A custom initializer image can be supplied through a deployment-specific Compose
override and must retain an immutable digest. The hostname setting does not
install a CA or a server certificate. Other MSSQL clients, including NiFi JDBC
pools, must require encryption and certificate verification independently.
