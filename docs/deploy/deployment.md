
# 📦 Deployment

The [`deploy`](https://github.com/CogStack/CogStack-NiFi/tree/main/deploy/) directory contains an example dockerized deployment setup of the customised NiFi image, along with related services for document processing, NLP, and text analytics.

Make sure you have read the [Prerequisites](./main.md) section before proceeding.

## 🗂️ Key files

- **`services.yml`** – defines the *core* services that are orchestrated directly from this repository via Docker Compose.

- **`Makefile`** – provides convenient commands for starting, stopping, and managing the deployment.

- **`.env` files in `./deploy/`** , environment variables used across services, specifications:
  - environment variables that apply **only to the services defined inside `services.yml`**.  
  - Security-related `.env` files (certificates, users) are under **`/security`**

  These variables configure NiFi, Elasticsearch/OpenSearch, Kibana, Jupyter, Metricbeat, the sample DB, etc.

> **Important:** If you run `docker compose` directly (instead of `make`), first load the envs with:
>
> ```bash
> source ./deploy/export_env_vars.sh
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

## ⎈ Helm (OpenSearch)

An initial Helm chart for OpenSearch + OpenSearch Dashboards is available at:

```bash
./deploy/charts/opensearch
```

Quick usage:

```bash
# render manifests
helm template cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --set-file usersEnvFile.raw=./security/env/users_elasticsearch.env \
  --set-file certificatesEnvFile.raw=./security/env/certificates_elasticsearch.env \
  --set-file securityFiles.configRaw=./security/es_roles/opensearch/config.yml \
  --set-file securityFiles.internalUsersRaw=./security/es_roles/opensearch/internal_users.yml \
  --set-file securityFiles.rolesRaw=./security/es_roles/opensearch/roles.yml \
  --set-file securityFiles.rolesMappingRaw=./security/es_roles/opensearch/roles_mapping.yml

# install or upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --set-file usersEnvFile.raw=./security/env/users_elasticsearch.env \
  --set-file certificatesEnvFile.raw=./security/env/certificates_elasticsearch.env \
  --set-file securityFiles.configRaw=./security/es_roles/opensearch/config.yml \
  --set-file securityFiles.internalUsersRaw=./security/es_roles/opensearch/internal_users.yml \
  --set-file securityFiles.rolesRaw=./security/es_roles/opensearch/roles.yml \
  --set-file securityFiles.rolesMappingRaw=./security/es_roles/opensearch/roles_mapping.yml \
  --namespace cogstack --create-namespace
```

> The chart expects pre-created Kubernetes Secrets for TLS materials (see the chart README).
> The `--set-file envFile.raw=...` flag injects values from `deploy/elasticsearch.env` into pod environment variables.
> The `--set-file usersEnvFile.raw=...` flag feeds credentials (`OPENSEARCH_INITIAL_ADMIN_PASSWORD`, `KIBANA_USER`, `KIBANA_PASSWORD`) into the chart Secret.
> The `--set-file certificatesEnvFile.raw=...` flag loads certificate metadata from `security/env/certificates_elasticsearch.env` (`ES_CLIENT_CERT_NAME` currently).
> The `--set-file securityFiles.*Raw=...` flags use `security/es_roles/opensearch/*.yml` as the source of OpenSearch security config.

## 🧰 Makefile Command Overview

A concise reference for controlling the full CogStack deployment stack (NiFi, Elasticsearch, JupyterHub, MedCAT, OCR-service, GitEA, Beats, DB, etc.).  
All commands automatically load environment variables via `export_env_vars.sh`.

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
| **`make start-all`**            | Full stack: data infra + NLP + JupyterHub + OCR |

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
| **`make stop-all`**             | Stop entire stack                   |

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

- All `start-*` commands use `docker compose -f services.yml` unless referencing a specific service’s Dockerfile.
- `start-all` and `stop-all` act as the top-level orchestration entry points.
- Environment variables are **always sourced** using the integrated `WITH_ENV` macro.

---

If you want, I can also generate a **minimal cheat sheet**, or an **ASCII tree diagram** that shows how `start-all` expands into all services.

## 🚀 Starting the Services

All core services defined in `services.yml` can be started using the Makefile in the `deploy/` directory.

For most services in the `services` folder that are not part of the core stack defined in `services.yml` and are pulled from external git submodule repositories, the start-up process is the same.

### ▶️ Start each service individually

You can start individual components of the CogStack-NiFi stack using the `make start-*` commands.  
Each target loads all required environment variables automatically via `export_env_vars.sh`.

This is useful for:

- debugging a single service  
- restarting only one component after config changes  
- running lightweight subsets of the stack  
- isolating problems or logs per service  

---

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

---

#### 🛢️ Elasticsearch / OpenSearch Services

Please note that to switch from OpenSearch (Amazon open-source fork) to ElasticSearch you will need to change some environment variables, see the [configuration](./configuration.md) section.

```bash
make start-elastic
```

Starts the standard 2-node Elasticsearch cluster + Kibana.

```bash
make start-elastic-cluster
```

Starts all 3 ES nodes. Useful for testing clustering, sharding, and replication.

```bash
make start-elastic-1
make start-elastic-2
make start-elastic-3
```

Start individual Elasticsearch nodes for debugging or failure-scenario testing.

---

#### 📈 Kibana

```bash
make start-kibana
```

Starts Kibana for inspecting logs, checking index mappings, monitoring ES health, and debugging pipelines.

---

### 🗄️ Databases

```bash
make start-samples
```

Starts **samples-db**, the small example DB used for demo flows.

```bash
make start-production-db
```

Starts the **cogstack-databank-db** production database.

Use when testing SQL ingestion or verifying DB-driven NiFi flows.

---

### 📚 JupyterHub

```bash
make start-jupyter
```

Starts the CogStack JupyterHub instance. Used for notebooks, analysis, model testing, and visualisation.

---

### 🧠 NLP Services (MedCAT Service & Trainer)

```bash
make start-medcat-service
```

Starts the MedCAT concept extraction inference API.

```bash
make start-medcat-service-deid
```

Starts the MedCAT DEID (de-identification) inference API.

```bash
make start-medcat-trainer
```

Starts the full MedCAT Trainer stack (Trainer UI + Solr + NGINX). Useful for annotation and supervised training tasks.

---

### 📝 OCR Services

```bash
make start-ocr-services
```

Starts:

- **ocr-service** — main OCR pipeline  
- **ocr-service-text-only** — lightweight OCR/text extraction  

Use for PDF ingestion, OCR debugging, and pipeline validation.

---

### 🛠️ Miscellaneous Services (GIT EA)

```bash
make start-git-ea
```

Starts the internal Gitea Git server used for local code/config storage.

---

### 🚀 Start the Entire Stack

```bash
make start-all
```

Starts everything:

- Core infra
- JupyterHub  
- MedCAT NLP services  
- OCR services  

Use for complete deployments, demos, or full-stack development.
