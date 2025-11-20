
# 📦 Deployment

The [`deploy`](https://github.com/CogStack/CogStack-NiFi/tree/main/deploy/) directory contains an example dockerized deployment setup of the customised NiFi image, along with related services for document processing, NLP, and text analytics.

Make sure you have read the [Prerequisites](./main.md) section before proceeding.

## 🗂️ Key files

- **`services.yml`** – defines the *core* services that are orchestrated directly from this repository via Docker Compose.   (Kubernetes-based multi-container deployments are coming soon.)

- **`Makefile`** – provides convenient commands for starting, stopping, and managing the deployment.

- **`.env` files in `./deploy/`** , environment variables used across services, specifications:
  - environment variables that apply **only to the services defined inside `services.yml`**.  
  - Security-related `.env` files (certificates, users) are under **`/security`**

  These variables configure NiFi, Elasticsearch/OpenSearch, Kibana, Jupyter, Metricbeat, the sample DB, etc.

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

#### 🧩 Core NiFi Services

```bash
make start-nifi
```

Starts:

- **nifi** — the Apache NiFi instance (main ETL/orchestration engine)  
- **nifi-nginx** — reverse proxy/front-end for NiFi  
- **nifi-registry-flow** — NiFi Registry backend that stores flow versions

Use when you want to run, debug, or modify NiFi workflows without bringing up the entire ecosystem.

---

### 🏗️ Start Core Data Infrastructure

```bash
make start-data-infra
```

Starts:

- NiFi
- NiFi Registry Flow
- NiFi Nginx
- Elasticsearch  
- Samples DB  

Ideal for running ingestion pipelines and ETL workflows.

---

#### 🛢️ Elasticsearch / OpenSearch Services

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

#### 🗄️ Databases

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

#### 📚 JupyterHub

```bash
make start-jupyter
```

Starts the CogStack JupyterHub instance. Used for notebooks, analysis, model testing, and visualisation.

---

#### 🧠 NLP Services (MedCAT & Trainer)

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

#### 📝 OCR Services

```bash
make start-ocr-services
```

Starts:

- **ocr-service** — main OCR pipeline  
- **ocr-service-text-only** — lightweight OCR/text extraction  

Use for PDF ingestion, OCR debugging, and pipeline validation.

---

#### 🛠️ Miscellaneous Services (GIT EA)'

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
