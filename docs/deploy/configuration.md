# ⚙️ Configuration

CogStack selects deployment configuration and security settings from the
repository defaults or a directory selected with `COGSTACK_CONFIG_DIR`:

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
| `deploy/ollama.env` | Ollama image, model selection, port, and resource limits |
| `deploy/sglang.env` | Existing SGLang endpoint, served model, and API key |
| `deploy/openwebui.env` | Open WebUI image, access, and resource limits |
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

- `services/cogstack-platform/apps/cogstack-jupyter-hub/env/jupyter.env`
- `services/cogstack-platform/apps/ocr-service/env/ocr_service.env`
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

Copy the files you need to customize into a protected directory. Run these
commands from the repository root:

```bash
mkdir -p /path/to/deployment-config/security
cp deploy/nifi.env /path/to/deployment-config/nifi.env
cp security/env/users_nifi.env /path/to/deployment-config/security/users_nifi.env
cp security/env/certificates_nifi.env /path/to/deployment-config/security/certificates_nifi.env

# Edit the copied files, then validate and start the deployment.
COGSTACK_CONFIG_DIR=/path/to/deployment-config make -C deploy check-config
COGSTACK_CONFIG_DIR=/path/to/deployment-config make -C deploy init-security
COGSTACK_CONFIG_DIR=/path/to/deployment-config make -C deploy start-data-infra
```

You can also copy all `deploy/*.env` files and all `security/env/*.env` files
into these two directories. Protect files containing credentials with the
permissions required by your deployment.

For local configuration, `deploy/local/` is ignored by Git:

```bash
mkdir -p deploy/local
cp deploy/nifi.env deploy/local/nifi.env
COGSTACK_CONFIG_DIR=deploy/local make -C deploy check-config
```

Relative `COGSTACK_CONFIG_DIR` paths are resolved from the repository root,
including when using `make -C deploy`. An explicit missing directory, an
unreadable selected file, or a broken profile symlink causes an error.

### File selection and precedence

| Setting | Selected file, in priority order |
|---|---|
| Core settings such as `nifi.env` | `$COGSTACK_CONFIG_DIR/nifi.env`, then `deploy/nifi.env` |
| Security settings such as `users_nifi.env` | `$COGSTACK_CONFIG_DIR/security/users_nifi.env`, then `security/env/users_nifi.env` |

A matching profile file replaces the complete default file. Copy the original
before editing it; individual keys are not merged with the original. Files
absent from the profile use their repository defaults. Make, Compose,
certificate helpers, and the owned Helm Make targets use the selected files.

Files are sourced as shell assignments. Plain `KEY=value` assignments replace
inherited values. Assignments such as `KEY=${KEY:-default}` honor an existing
value, as used by the SGLang settings. Use plain assignments for authoritative
profile values, and keep these trusted files compatible with Compose's
environment-file syntax.

For direct Compose commands, select the profile before loading configuration:

```bash
export COGSTACK_CONFIG_DIR=/path/to/deployment-config
source deploy/export_env_vars.sh
docker compose -f deploy/services.yml config --quiet
docker compose -f deploy/services.yml up -d nifi nifi-nginx
```

After editing a selected file, source the loader again before invoking Compose.
It exports `COGSTACK_*_ENV_FILE` paths for Compose and preserves the caller's
shell options. Explicit Compose `environment` entries and `docker compose run -e`
retain their normal [precedence](https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/).

Relative data and model mount paths remain relative to `deploy/`; absolute paths
are supported through `NIFI_DATA_PATH` and
`NIFI_MEDCAT_SERVICE_MODEL_PRODUCTION_PATH`. Certificate material is generated
and mounted under `security/certificates/` using the selected security settings.

### Helm and standalone services

The owned Helm Make targets pass selected files through `--set-file`:

```bash
COGSTACK_CONFIG_DIR=/path/to/deployment-config make -C deploy helm-template-nifi
```

Use `HELM_NIFI_VALUES_FILE`, `HELM_OPENSEARCH_VALUES_FILE`, or
`HELM_POSTGRESQL_VALUES_FILE` for cluster-specific values. Direct Helm commands
should supply selected files with `--set-file envFile.raw`,
`--set-file usersEnvFile.raw`, and, where used, `--set-file certificatesEnvFile.raw`.

Standalone services in submodules retain their own environment configuration.

## NiFi memory defaults and validation

| Setting | Default |
|---|---|
| Initial JVM heap | `NIFI_JVM_HEAP_INIT=768m` |
| Maximum JVM heap | `NIFI_JVM_HEAP_MAX=1g` |
| Container memory limit | `NIFI_DOCKER_RAM=2g` |

The remaining memory accommodates native JVM allocations and Python processors.
Tune these values together for the workload; see the
[NiFi sizing guidance](../nifi/main.md#critical-deploynifienv-settings).

`make -C deploy check-config` validates the resolved memory settings and both
core Compose files without starting services. NiFi start targets run the memory
check automatically. Direct Helm rendering also rejects inconsistent heap and
limit values.

Validation requires positive memory sizes, an initial heap no larger than the
maximum heap, and a maximum heap smaller than the container limit. JVM heaps
use whole numbers with optional `k`, `m`, or `g` suffixes. Container memory
also accepts units such as `GiB`.

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
