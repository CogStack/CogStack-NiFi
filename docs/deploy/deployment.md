
# 📦 Deployment

The [`deploy`](https://github.com/CogStack/CogStack-NiFi/tree/main/deploy/) directory contains an example dockerized deployment setup of the customised NiFi image, along with related services for document processing, NLP, and text analytics.

Make sure you have read the [Prerequisites](./main.md) section before proceeding.

## 🗂️ Key files

- **`services.yml`** – defines the *core* services that are orchestrated directly from this repository via Docker Compose.

- **`Makefile`** – provides convenient commands for starting, stopping, and managing the deployment.

- **`.env` files in `./deploy/`** , environment variables used across services, specifications:
  - environment variables that apply **only to the services defined inside `services.yml`**.  
  - Security-related `.env` files (certificates, users) are under **`/security`**

  These variables configure core services such as NiFi, Elasticsearch/OpenSearch,
  OpenSearch Dashboards or Kibana, Beats, and the databases.

> **Important:** If you run `docker compose` directly (instead of `make`),
> change to the deployment directory and load the environment first:
>
> ```bash
> cd deploy
> source ./export_env_vars.sh
> ```
>
> The Makefile targets already do this for you.

## 🧩 Modular service design (important)

This repository follows a **modular deployment model**:

- Only the services defined in **`services.yml`** use the environment files located in **`./deploy/*.env`**.  
- **All other services** included in the ecosystem are launched via `docker-compose` commands inside their own directories, for example:  

  ```bash
  ./services/<service_name>/docker/docker-compose.yml
  ```

- Each of these standalone services maintains **its own environment configuration** in:

  ```bash
  ./services/<service_name>/env/
  ```

This design allows each service to be:

- independently configurable  
- versioned and deployed in isolation  
- consumed by other projects without modifying the core deployment  

> These are the files you will most commonly modify when creating or adjusting a deployment.

## ⚙️ Additional service configuration

- Service-specific configurations are located under:  
  [`./services`](https://github.com/CogStack/CogStack-NiFi/tree/main/services/)
- NiFi-specific configuration (properties, custom processors, drivers, Python scripts, etc.) is under:  
  [`./nifi`](https://github.com/CogStack/CogStack-NiFi/tree/main/nifi/)

## ⎈ Helm (NiFi)

A default Helm chart for the customised CogStack NiFi image is available at:

```bash
./deploy/charts/nifi
```

Quick usage:

```bash
# render manifests
make -C deploy helm-template-nifi

# install or upgrade
make -C deploy helm-install-nifi
```

Key defaults live in:

```bash
./deploy/helm/nifi.values.yaml
```

The chart reads selected defaults from `deploy/nifi.env`, `security/env/certificates_nifi.env`, and `security/env/users_nifi.env`.

Before install, create a NiFi TLS Secret from the repo-generated keystore and truststore files. The chart generates a separate sensitive-config Secret from the security env files for the keystore/truststore passwords, `nifi.sensitive.props.key`, and single-user credentials:

```bash
kubectl create namespace cogstack --dry-run=client -o yaml | kubectl apply -f -

kubectl -n cogstack create secret generic nifi-certs \
  --from-file=nifi-keystore.jks=./security/certificates/nifi/nifi-keystore.jks \
  --from-file=nifi-truststore.jks=./security/certificates/nifi/nifi-truststore.jks \
  --dry-run=client -o yaml | kubectl apply -f -
```

For production, pre-create the sensitive-config Secret and set `sensitiveConfig.create=false` plus `sensitiveConfig.existingSecret=<secret-name>` if you do not want sensitive values rendered into Helm manifests and release metadata.

Current defaults keep the deployment conservative:

- single NiFi replica
- TLS on port `8443`
- `/nifi` proxy context path
- per-pod PVCs for NiFi configuration, logs, repositories, state, Python working directories, and flowfile error output
- runtime config/assets bootstrapped from the custom CogStack NiFi image into writable volumes
- Kubernetes Lease/ConfigMap clustering support available but disabled by default

For clustered NiFi, set `replicaCount > 1` and `nifi.cluster.enabled=true` only after reviewing certificate and authorizer configuration. The repo defaults use single-user authentication and a shared NiFi certificate, which are appropriate for a default single-node deployment rather than a production NiFi cluster.

## ⎈ Helm (OpenSearch)

An initial Helm chart for OpenSearch + OpenSearch Dashboards is available at:

```bash
./deploy/charts/opensearch
```

Quick usage:

```bash
# render manifests
helm template cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml

# install or upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml \
  --namespace cogstack --create-namespace
```

> The chart expects pre-created Kubernetes Secrets for TLS materials (see the chart README).
> The chart already consumes the shared OpenSearch, Dashboards, and security YAML files automatically from this repo.
> The values file is only for cluster-specific overrides such as secret names, storage classes, replicas, and snapshot PVC claims.

## ⎈ Helm (GitEA / Gitea)

GitEA can be deployed with the official Gitea Helm chart. The Makefile adds the
upstream repo automatically and pins a chart version for reproducible installs.

Quick usage:

```bash
# render manifests
make -C deploy helm-template-gitea

# install or upgrade
make -C deploy helm-install-gitea
```

Key defaults live in:

```bash
./deploy/helm/gitea.values.yaml
```

Current defaults keep the Helm deployment close to the existing Docker Compose
service:

- single replica
- embedded SQLite
- bundled PostgreSQL/Valkey disabled
- ClusterIP services on ports `3000` and `2222`
- direct HTTPS inside the Gitea pod using a dedicated Gitea leaf certificate

For a local/reference deployment, first run `make -C deploy init-security-gitea`, then create a `gitea-tls` Secret containing `gitea.pem` and `gitea.key` from `security/certificates/gitea/`. Never mount `root-ca.key` into Gitea. Production deployments should provide a deployment-specific certificate for their public hostname through the platform certificate manager.

You can optionally create `gitea-admin-credentials` with `username` and `password` if you want Helm to bootstrap an admin user.

## 🧰 Makefile Command Overview

A concise reference for controlling the CogStack deployment stack (NiFi,
Elasticsearch, MedCAT, OCR, Gitea, Beats, databases, and optional services).
All commands automatically load environment variables via `export_env_vars.sh`.

Before running a `start-*` target on a fresh checkout, generate the local
certificate sets:

```bash
make -C deploy init-security
```

The command is idempotent and leaves complete existing certificate sets
unchanged.

### 🔎 Discover available Make targets

You can list all available `deploy/Makefile` targets with descriptions:

```bash
# from repository root
make -C deploy help
```

```bash
# from ./deploy
make help
```

### 🌐 Manage a specific service on a specific machine

Use remote targets to run Docker Compose on a remote host over SSH.

Prerequisites:

- SSH access to the target machine
- this repository checked out on the target machine
- Docker + Docker Compose available on the target machine

```bash
# deploy (up -d)
make -C deploy remote-deploy-service \
  REMOTE_HOST=ubuntu@10.20.0.15 \
  REMOTE_REPO_DIR=/opt/cogstack_nifi \
  REMOTE_SERVICES="nifi nifi-nginx" \
  REMOTE_SSH_KEY=$HOME/.ssh/cogstack_prod.pem \
  REMOTE_COMPOSE_FILE=services.yml
```

```bash
# stop
make -C deploy remote-stop-service \
  REMOTE_HOST=ubuntu@10.20.0.15 \
  REMOTE_REPO_DIR=/opt/cogstack_nifi \
  REMOTE_SERVICES="nifi nifi-nginx" \
  REMOTE_SSH_KEY=$HOME/.ssh/cogstack_prod.pem \
  REMOTE_COMPOSE_FILE=services.yml
```

```bash
# delete containers (docker compose rm -f -s)
make -C deploy remote-delete-service \
  REMOTE_HOST=ubuntu@10.20.0.15 \
  REMOTE_REPO_DIR=/opt/cogstack_nifi \
  REMOTE_SERVICES="nifi nifi-nginx" \
  REMOTE_SSH_KEY=$HOME/.ssh/cogstack_prod.pem \
  REMOTE_COMPOSE_FILE=services.yml
```

- Set `REMOTE_SERVICES` to one service (for example `kibana`) or multiple services.
- Use `services.dev.yml` by setting `REMOTE_COMPOSE_FILE=services.dev.yml`.
- `REMOTE_SSH_KEY` is optional; if omitted, normal SSH config/agent auth is used.
- `REMOTE_SSH_OPTS` is optional for extra flags (for example `-p 2222 -o StrictHostKeyChecking=accept-new`).
- `remote-delete-service` removes containers; it does not remove volumes.

---

### 🔧 Utilities

| Command                 | Description                                |
|------------------------|---------------------------------------------|
| `make load-env`        | Load all environment variables              |
| `make show-env`        | Print environment variables (sorted)        |
| `make init-security`   | Generate missing NiFi, Gitea, and selected search-backend certificates |
| `make init-security-root-ca` | Generate the shared root CA if missing |
| `make init-security-nifi` | Generate the NiFi certificate set if missing |
| `make init-security-gitea` | Generate the dedicated Gitea leaf certificate if missing |
| `make init-security-opensearch` | Generate the OpenSearch certificate set if missing |
| `make init-security-elasticsearch` | Generate the native Elasticsearch certificate set if missing |
| `make git-freeze-security`   | Freeze all security submodules (read-only) |
| `make git-unfreeze-security` | Unfreeze security submodules              |
| `make git-update-submodules` | Update all submodules                      |

---

### 🚀 Start Services

| Command                         | Description |
|---------------------------------|-------------|
| `make start-nifi`               | Start NiFi and NiFi-Nginx |
| `make start-nifi-dev`           | Start NiFi dev services from `services.dev.yml` |
| `make start-nifi-dev-build`     | Build and start NiFi dev services from `services.dev.yml` |
| `make start-elastic`            | Start ES-1, ES-2, Kibana             |
| `make start-elastic-cluster`    | Start ES-1, ES-2, ES-3               |
| `make start-elastic-1/2/3`      | Start individual Elasticsearch nodes |
| `make start-metricbeat-1/2/3`   | Start Metricbeat agents              |
| `make start-filebeat-1/2/3`     | Start Filebeat agents                |
| `make start-kibana`             | Start Kibana only                    |
| `make start-samples`            | Start samples DB                     |
| `make start-jupyter`            | Start JupyterHub (prod config)       |
| `make start-medcat-service`     | Start MedCAT service                 |
| `make start-medcat-service-deid`| Start DE-ID MedCAT service           |
| `make start-medcat-trainer`     | Start MedCAT Trainer + Solr + Nginx  |
| `make start-ocr-services`       | Start OCR-service (full + text-only) |
| `make start-git-ea`             | Start GitEA                          |
| `make start-production-db`      | Start Databank DB                    |
| **`make start-data-infra`**     | Start NiFi + Elastic + Samples DB    |
| **`make start-all`**            | Start data infrastructure + MedCAT inference + both OCR services |

---

### 🛑 Stop Services

| Command                         | Description |
|---------------------------------|-------------|
| `make stop-nifi`                | Stop NiFi stack                     |
| `make stop-nifi-dev`            | Stop NiFi dev services (`services.dev.yml`) |
| `make stop-elastic`             | Stop ES-1, ES-2, Kibana             |
| `make stop-elastic-cluster`     | Stop ES-1, ES-2                     |
| `make stop-elastic-1/2/3`       | Stop individual ES nodes            |
| `make stop-metricbeat-1/2/3`    | Stop Metricbeat agents              |
| `make stop-filebeat-1/2/3`      | Stop Filebeat agents                |
| `make stop-kibana`              | Stop Kibana                         |
| `make stop-samples`             | Stop samples DB                     |
| `make stop-jupyter`             | Stop JupyterHub                     |
| `make stop-medcat-service`      | Stop MedCAT service                 |
| `make stop-medcat-service-deid` | Stop DE-ID MedCAT service           |
| `make stop-medcat-trainer`      | Stop MedCAT Trainer stack           |
| `make stop-ocr-services`        | Stop OCR-service stack              |
| `make stop-git-ea`              | Stop GitEA                          |
| `make stop-production-db`       | Stop Databank DB                    |
| **`make stop-data-infra`**      | Stop NiFi + Elastic + Samples       |
| **`make stop-all`**             | Stop the service groups wired into the `stop-all` target |

---

### 🗑️ Delete Services

| Command                         | Description |
|---------------------------------|-------------|
| `make delete-nifi`              | Delete NiFi and NiFi-Nginx containers |
| `make delete-nifi-containers`   | Delete NiFi and NiFi-Nginx containers |
| `make delete-nifi-dev-containers` | Delete NiFi dev containers (`services.dev.yml`) |
| `make delete-nifi-images`       | Delete NiFi/NiFi-Nginx images from `services.yml` |
| `make delete-nifi-dev-images`   | Delete NiFi/NiFi-Nginx images from `services.dev.yml` |
| `make delete-nifi-volumes`      | Remove NiFi-related volumes (via compose down `-v`) |
| `make delete-elastic`           | Delete Elasticsearch and Kibana containers |
| `make delete-elastic-volumes`   | Remove Elasticsearch and Kibana volumes (via compose down `-v`) |
| `make delete-databank`          | Delete Databank DB containers |
| `make delete-databank-volumes`  | Remove Databank DB volumes (via compose down `-v`) |
| `make delete-samples-db`        | Delete samples DB container |
| `make delete-samples-db-volumes`| Remove samples DB volumes (via compose down `-v`) |
| `make delete-medcat-trainer`    | Delete MedCAT Trainer containers (`medcattrainer`, `nginx`, `solr`) |
| `make delete-medcat-trainer-volumes`| Remove MedCAT Trainer volumes (via compose down `-v`) |
| `make delete-jupyter`           | Delete JupyterHub container (alias: `make make-delete-jupyter`) |
| `make delete-medcat-service`    | Delete MedCAT service container (alias: `make make-delete-medcat-service`) |
| `make delete-medcat-service-deid`| Delete DE-ID MedCAT service container (alias: `make make-delete-medcat-service-deid`) |
| `make delete-ocr-services`      | Delete OCR-service containers (alias: `make make-delete-ocr-services`) |

---

### 🧹 Cleanup

| Command           | Description                                |
|------------------|---------------------------------------------|
| `make down-all`  | Docker Compose `down` for all core services |
| `make cleanup`   | Full teardown, including volumes            |

---

### 📝 Notes

- Core-service targets use `deploy/services.yml`; standalone-service targets
  use the Compose files in their respective `services/` directories.
- `start-all` currently starts `start-data-infra`, `start-medcat-service`, and
  `start-ocr-services`. Start other optional services explicitly.
- `stop-all` follows the dependencies declared in the Makefile; check
  `make -C deploy help` before relying on it for a customised deployment.
- Environment variables are sourced using the integrated `WITH_ENV` macro.

## 🚀 Common startup patterns

The commands below assume that you are in `deploy/`. From the repository root,
use the same target with `make -C deploy`, for example
`make -C deploy start-data-infra`. The command table above is the complete
target reference.

### 🧩 Core NiFi Services

```bash
make start-nifi
```

Starts:

- **nifi** — the Apache NiFi instance (main ETL/orchestration engine)  
- **nifi-nginx** — reverse proxy/front-end for NiFi  

Use when you want to run, debug, or modify NiFi workflows without bringing up the entire ecosystem.

---

### 🏗️ Start Core Data Infrastructure

```bash
make start-data-infra
```

Starts:

- NiFi
- NiFi Nginx
- Elasticsearch  
- Samples DB  

Ideal for running ingestion pipelines and ETL workflows.

### 🚀 Start the standard service set

```bash
make start-all
```

Starts:

- Core infra
- MedCAT inference service
- OCR and text-only OCR services

It does not start every optional service. Start Gitea, the production database,
MedCAT de-identification, MedCAT Trainer, or other optional services with their
individual targets when needed.
