# ⚙️ Configuration

CogStack separates deployment configuration from local-development security
settings:

- `deploy/*.env` configures services, images, ports, resource limits, and the
  shared Docker network.
- `security/env/*.env` configures certificate generation and local-development
  users.
- Standalone services under `services/` keep additional environment files in
  their own directories.

The tracked values are development defaults. Keep deployment-specific values
outside the repository or inject them with your platform's secret manager.
Never commit production credentials or generated private keys.

## Core deployment files

The core Compose file, `deploy/services.yml`, loads these files:

| File | Main purpose |
|------|--------------|
| `deploy/project.env` | Compose project naming and shared project settings |
| `deploy/general.env` | General Docker logging and shared defaults |
| `deploy/nifi.env` | NiFi image, ports, resources, proxy settings, and paths |
| `deploy/elasticsearch.env` | Elasticsearch/OpenSearch, Dashboards/Kibana, and Beats |
| `deploy/database.env` | Sample and production database resources |
| `deploy/gitea.env` | Gitea image, ports, and application settings |
| `deploy/nginx.env` | NiFi nginx proxy settings |
| `deploy/telemetry.env` | Telemetry configuration |
| `deploy/network_settings.env` | Hostnames and shared network settings |

The following security files are also loaded where required:

- `security/env/certificates_general.env`
- `security/env/certificates_elasticsearch.env`
- `security/env/certificates_nifi.env`
- `security/env/users_database.env`
- `security/env/users_elasticsearch.env`
- `security/env/users_nginx.env`
- `security/env/users_nifi.env`

See the `env_file` anchors at the top of `deploy/services.yml` for the exact
files consumed by each core service.

## Standalone service files

Services launched from their own Compose projects use environment files below
their respective directories. The deployment helper currently loads, when
present:

- `services/cogstack-jupyter-hub/env/jupyter.env`
- `services/ocr-service/env/ocr_service.env`
- `services/cogstack-nlp/medcat-service/env/app.env`
- `services/cogstack-nlp/medcat-service/env/medcat.env`
- `services/cogstack-nlp/medcat-trainer/envs/env-prod`

Check each service's Compose file for variant-specific files, such as MedCAT
de-identification or OCR text-only overrides.

## Loading configuration

Make targets load the required files automatically. If you invoke Docker
Compose directly, change to the deployment directory and load the same
environment first:

```bash
cd deploy
source ./export_env_vars.sh
```

To inspect the combined environment used by the Makefile:

```bash
make -C deploy show-env
```

Be careful when sharing this output because it includes development
credentials and certificate passwords.

## Deployment-specific overrides

For a separate deployment, copy the tracked defaults to a protected location
and edit the copies there:

```bash
cp deploy/*.env /path/to/deployment-config/
cp security/env/*.env /path/to/deployment-config/security/
```

You must then adapt your Compose invocation or deployment tooling to load those
copies. The repository Makefile always loads the paths listed in
`deploy/export_env_vars.sh`.

## Multiple deployments on one host

The supplied Compose file uses explicit container and volume names in several
places. Merely changing `COMPOSE_PROJECT_NAME` therefore does not isolate every
resource. For concurrent deployments, use deployment-specific Compose
overrides that remove or replace explicit names and assign distinct host ports.

Within a Compose network, services should address one another by service name,
for example `elasticsearch-1`, rather than by host-published ports.

## Security setup

Generated certificates and private keys are stored under
`security/certificates/` and ignored by Git. Generate the local certificate sets
before starting services:

```bash
make -C deploy init-security
```

Do not reuse development certificates or tracked development credentials in
production. See the [security overview](../security/main.md) for production
guidance.

## Workflows

For settings required by the supplied NiFi templates, see the
[workflow documentation](./workflows.md). For general service endpoints and
ports, see [Services](./services.md).
