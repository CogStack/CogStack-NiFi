# 📦 Services

This section provides a complete overview of all services included in the CogStack-NiFi deployment.  
All services run in Docker and interact within a shared internal Docker network.

---

## 📊 Overview

Below is a high-level architecture diagram illustrating how CogStack services communicate when all components are enabled:

![nifi-services](../_static/img/nifi_services.png)

---

## 🧩 Primary Services

The core services defined in `services.yml` include:

- **samples-db** — PostgreSQL database populated with demo datasets.
- **cogstack-databank-db / cogstack-databank-db-mssql** — Production-grade PostgreSQL and optional MSSQL instances.
- **elasticsearch-1 / elasticsearch-2 / elasticsearch-3** — Multi-node Elasticsearch or OpenSearch cluster.
- **metricbeat / filebeat** — Elastic monitoring and log forwarder services.
- **nifi** — Apache NiFi single-node instance with embedded ZooKeeper.
- **nifi-nginx** — Reverse proxy providing secure access to NiFi.
- **ocr-service / ocr-service-text-only** — High-performance Python OCR and text extraction services.
- **nlp-medcat-service-production** — MedCAT NLP model service with REST API.
- **medcat-trainer-ui / medcat-trainer-nginx** — Web UI and reverse proxy for model training and refinement.

- **kibana** — OpenSearch Dashboards UI.
- **jupyter-hub** — Fully featured data science interface.
- **git-ea** — Self‑hosted Git service (Gitea).

> 🔐 **Note:** Important configuration options and environment variables for these services are managed in `services.yml` and the associated `.env` files under `deploy/` and `security/`.

## 🗂️ Service Definitions

All core services are defined in:

```bash
deploy/services.yml
```

They run inside the internal Docker network `cognet`.  
Some services expose ports to the host for convenience.

---

## 🗣️ NLP/OCR and other services API Endpoints

Most web ETL & data-enrichment API services that we use will offer thw following endpoints for querying.

- **GET** `/api/info`
- **POST** `/api/process`
- **POST** `/api/process_bulk`

Useful for NiFi workflows (see `workflows.md`).

---

## 🧬 MedCAT Service

Runs a REST API for model inference uses the [MedCAT library](https://github.com/CogStack/cogstack-nlp/tree/main/medcat-v2) which performss clinical concept extraction and linking. 

The service has two operation modes:

- concept detection: exctracts medical concepts: outputs original text + annotations list.
- de-id mode aka. AnonCAT mode, for de-identifying documents: outputs de-identified text + (will output annotations that represent what was de-id in a future version).

### Access

- `https://localhost:5555/api/info` - NER container, check if model loads successfully
- `https://localhost:5556/api/info` - DE-ID/AnonCAT container

### Containers

- `cogstack-medcat-service-production` - for concept NER
- `cogstack-medcat-service-production-deid` - for DE-ID/AnonCAT

### Service location & files

- dir: `/services/cogstack-nlp/medcat-service/`
- docker compose file: `/services/cogstack-nlp/medcat-service/docker/docker-compose.yml`
- env: located in `services/cogstack-nlp/medcat-service/env/`

    ```bash
        app.env - controls APP settings (number of cpus used, log level, etc) used by the NER container cogstack-medcat-service-production
        medcat.env - used by the NER container, controls MedCAT settings directly.
        app_deid.env - used by the DE-ID container, same app setting control, the main difference being the `APP_DEID_MODE`.
        medcat_deid.env  - used by the DE-ID container, controls MedCAT settings directly
    ```

### Ports

| Service            | External Port | Internal Port |
|--------------------|---------------|----------------|
| NER (MedCAT)       | `5555`        | `5000`         |
| DE-ID / AnonCAT    | `5556`        | `5000`         |

### Models

- A default MedMentions `MedMen` NER+L model (includes MetaCAT models) is available for public use but needs to be downloaded.
- To download a model head to the directory of the service `services/cogstack-nlp/medcat-service/scripts`
- Execute: `bash download_medmen.sh`, wait for download to complete.

### README

Please check the service's own [README.md](https://github.com/CogStack/cogstack-nlp/tree/main/medcat-service)

---

## 🛠️ MedCAT Trainer

Provides UI workflows for annotation, correction, and iterative model training.

### Access

- `https://localhost:8001`

### Containers

- `medcattrainer`
- `medcattrainer_nginx`
- `mct_solr`

### Service location & files

- dir: `services/cogstack-nlp/medcat-trainer/`
- docker compose file: `services/cogstack-nlp/medcat-trainer/docker-compose-prod.yml`
- env: `services/cogstack-nlp/medcat-trainer/envs/env-prod`

### Ports

- external: `8001`

### README

Please check the service's own [README.md](https://github.com/CogStack/cogstack-nlp/blob/main/medcat-trainer/README.md) file and [docs](https://docs.cogstack.org/projects/medcat-trainer/en/latest/).

---

## 📚 Jupyter Hub

A multi-user JupyterHub instance deployed via Docker.

### Access

- `https://localhost:8888`

### Containers

- `cogstack-jupyter-hub`
- `cogstack-jupyter-singleuser-<USERNAME>` (per user container started by each user once hub is up)

### Service location & files

- dir: `services/cogstack-jupyter-hub/`
- docker compose file: `services/cogstack-jupyter-hub/docker/`
- env: `services/cogstack-jupyter-hub/env/jupyter.env`

### Supports

- Per-user containers
- CPU/RAM limits (via  `services/cogstack-jupyter-hub/env/jupyter.env`)
- Optional GPU support
- Notebook image selection

### Ports

| Component   | External Port | Internal Port(s) |
|-------------|---------------|------------------|
| JupyterHub  | `8888`        | `8087`, `443`    |

### README

Please check the service's own [README.md](https://github.com/CogStack/cogstack-jupyter-hub/blob/main/README.md) file.

---

## 🧪 Samples DB (PostgreSQL)

Demo dataset with:

- patients  
- encounters  
- observations  
- raw medical reports  
- cleaned reports  
- annotation tables  

### Acess

- `localhost:5555`

### Ports

- external: `5432`
- internal: `5432`

### Credentials

- user - `test`, password - `test`

---

## 🏦 Cogstack databank production DB (Production only: PgSQL, MSSQL)

Empty database for production ingestion pipelines.  
Supports both PostgreSQL and MSSQL.

Place schema files inside and they will be loaded instantly on container startup:  

```bash
services/cogstack-db/<DB_PROVIDER>/schemas/
```

Where `<DB_PROVIDER>` can be: `mssql`,`pgsql`.

### Credentials

- PgSQL: user - `admin` password - `admin`
- MsSQL: user - `admin` password - `admin!COGSTACK2022`

### Access

- PgSQL: `localhost:5558` → container `5432`  
- MSSQL: `localhost:1443` → container `1433`  

### Containers

- PgSQL: `cogstack-databank-db`
- MSSQL: `cogstack-databank-db-mssql`

### Service location & files

- docker compose file: `services.yml`
- dir: `services/cogstack-db/`
- env:
  - `security/users/users_database.env` - controlers DB user credentials
  - `deploy/database.env` - general DB configs

### Ports

| Database | External Port | Internal Port |
|----------|---------------|---------------|
| PgSQL    | `5558`        | `5432`        |
| MSSQL    | `1433`        | `1433`        |

---

## 💧 Apache NiFi & NiFi Registry

Primary ETL/processing engine.

This service is complex and is completely described in [this section](../nifi/main.md).

### Credentials

- PgSQL: user - `admin` password - `cogstackNiFi`

### Access

`https://localhost:8443` (via nifi-nginx)

### Containers

- NiFi: `cogstack-nifi`
- NiFi-Registry-flow: `cogstack-nifi-registry-flow`

### Service location & files

- docker compose file: `services.yml`
- dir: `nifi/`
- env:
  - `/deploy/nifi.env` - general NiFi & NiFi Registry flow settings, JVM memory, etc.
  - `/security/nifi_users.env`  - controlers DB user credentials
  - `/security/certificates_nifi.env`

### Ports

| Component            | External Port | Internal Port |
|---------------------|---------------|----------------|
| NiFi                | `8443`        | `8082`, `10000` |
| NiFi Registry Flow  | `18443`       | `8083`        |

---

## 🔎 ELK Stack (Elasticsearch / OpenSearch)

Backend search and indexing engine powering document storage, query, analytics, and NLP output retrieval.

This service is fully described in the Elasticsearch section of the documentation.

The repo supports both:

- ElasticSearch (native)
- OpenSearch (Amazon fork)

Switch between modes via environment variables in `deploy/elasticsearch.env`.

### 🛢️ Elasticsearch / OpenSearch

#### Credentials

- OpenSearch: user - `admin`, password - `admin`
- ElasticSearch: user - `elastic`, password - `kibanaserver`

#### Access

- `http://localhost:9200` — Node 1
- `http://localhost:9201` — Node 2
- `http://localhost:9202` — Node 3

#### Containers

- `elasticsearch-1`
- `elasticsearch-2`
- `elasticsearch-3`

#### Ports

- all ports need to be exposed via firewall to allow for intercluster communication, we assume 1 different port per node if hosted on the same machine/VM, in production mode all machines can have and use the following ports (if they live on separarate VMs/machines ): `9200`, `9300`, `9600`
- internal: `9300`, `9301`, `9302`, `9600`, `9601`, `9602`, `9200`, `9201`, `9202`
- external: `9300`, `9301`, `9302`, `9600`, `9601`, `9602`, `9200`, `9201`, `9202`

| Node | HTTP | Transport | Analyzer |
|------|------|-----------|----------|
| ES1 | `${ELASTICSEARCH_NODE_1_OUTPUT_PORT:-9200}` | `${ELASTICSEARCH_NODE_1_COMM_OUTPUT_PORT:-9300}` | `${ELASTICSEARCH_NODE_1_ANALYZER_OUTPUT_PORT:-9600}` |
| ES2 | `${ELASTICSEARCH_NODE_2_OUTPUT_PORT:-9201}` | `${ELASTICSEARCH_NODE_2_COMM_OUTPUT_PORT:-9301}` | `${ELASTICSEARCH_NODE_2_ANALYZER_OUTPUT_PORT:-9601}` |
| ES3 | `${ELASTICSEARCH_NODE_3_OUTPUT_PORT:-9202}` | `${ELASTICSEARCH_NODE_3_COMM_OUTPUT_PORT:-9302}` | `${ELASTICSEARCH_NODE_3_ANALYZER_OUTPUT_PORT:-9602}` |

#### Service Location & files

- docker compose: `deploy/services.yml`
- config: `services/elasticsearch/config/`
- env:
  - `/deploy/elasticsearch.env`
  - `/security/certificates_elasticsearch.env`
  - `/security/elasticsearch_users.env`

#### SSL & Certificates

Certificates stored in:

```bash
/security/certificates/elastic/<ELASTICSEARCH_VERSION>/
```

Settings in:

- `certificates_elasticsearch.env`

### 📊 Metricbeat & Filebeat

Lightweight Elastic stack agents used for **monitoring** and **log forwarding**.  
They run alongside Elasticsearch to provide observability of the cluster and ingestion pipelines.

**Purpose:**

- **Metricbeat** — collects system & Elasticsearch metrics (CPU, memory, JVM, node health).  
- **Filebeat** — ships container and service logs into Elasticsearch.

Both run as independent containers in the deployment.

#### Containers

Metricbeat:

- `metricbeat-1`
- `metricbeat-2`
- `metricbeat-3`

Filebeat:

- `filebeat-1`
- `filebeat-2`
- `filebeat-3`

#### **Service Location & Files**

- compose: `deploy/services.yml`
- config:
  - `services/metricbeat/metricbeat.yml`
  - `services/filebeat/filebeat.yml`
- env:
  - `/deploy/elasticsearch.env`
  - `/security/elasticsearch_users.env`

#### **Ports**

No external ports exposed.  
All communication occurs internally within the `cogstack-net` Docker network.

#### **Notes**

- Elasticsearch must be running before Metricbeat or Filebeat start.  
- Only Elastic-native Beats are available; OpenSearch-native Beats do not exist.  
- Authentication/credentials come from `elasticsearch_users.env`.

### 📉 Kibana / OpenSearch Dashboards

Web UI for exploring indexed data, visualising documents, managing index templates, monitoring the cluster, and debugging ingestion pipelines.

**Purpose:**

- Search & browse Elasticsearch/OpenSearch indices  
- Visualise ingestion outputs and cluster metrics  
- Manage index patterns, dashboards, and Dev Tools  
- Validate mappings and test queries used in NiFi flows  

#### Host Access

- URL: **https://localhost:5601**

#### credentials

- **OpenSearch Dashboards:** `admin` / `admin`  
- **Elasticsearch Native:** `elastic` / `kibanaserver`  

#### Containers

- `cogstack-kibana` (OpenSearch Dashboards or Kibana depending on configuration)

#### **Service Location & Files**

- docker compose: `deploy/services.yml`
- config files:
  - `services/kibana/config/elasticsearch.yml` (Elasticsearch)
  - `services/kibana/config/opensearch.yml` (OpenSearch Dashboards)
- env:
  - `/deploy/elasticsearch.env`  
  - `/security/certificates_elasticsearch.env`  
  - `/security/elasticsearch_users.env`

Image selection controlled by:

- `${ELASTICSEARCH_KIBANA_DOCKER_IMAGE}`  
- `${KIBANA_VERSION}`  
- `${KIBANA_CONFIG_FILE_VERSION}`  

#### Ports

| Component | External | Internal |
|-----------|----------|----------|
| Kibana / OpenSearch Dashboards | `5601` | `5601` |

#### Notes

- Must be started after Elasticsearch/OpenSearch  
- Connects automatically using `ELASTICSEARCH_HOSTS`  
- TLS/user settings are applied from the `/security` env files  

---

## 🤖 OCR Service

High-performance document text extraction engine replacing legacy Tika for OCR + text processing.
In the near future it will be possible to use LLMs/custom models for ocr-ing (pending v2 release, ETA 2026).

The service comes in **two variants**:

- **ocr-service** — full OCR pipeline (images → text)  
- **ocr-service-text-only** — lightweight mode (text extraction only, no OCR)

Both expose a simple REST API.

**Purpose:**

- Extract text from PDFs, images, and scanned documents  
- Provide OCR via Tesseract (wrapped in optimised Python service)  
- Provide fast plain text extraction for digital PDFs (text-only variant)  
- Designed for large-scale throughput within NiFi ingestion pipelines

### Access

- ocr-service: `http://localhost:8090/api/process`
- ocr-seervice-text-only: `http://localhost:8091/api/process`

### Containers

- `ocr-service`  
- `ocr-service-text-only`

Both built from:

```bash
cogstacksystems/cogstack-ocr-service:<release>
```

### Service Location & Files

- docker compose file: `services/ocr-service/docker/docker-compose.yml`
- service directory: `services/ocr-service/`
- logs:  
  - Host: `services/ocr-service/log/`  
  - Container: `/ocr_service/log/`

- env files:
  - `deploy/general.env` — shared variables  
  - `services/ocr-service/env/ocr_service.env` — full OCR config  
  - `services/ocr-service/env/ocr_service_text_only.env` — overrides for text-only pipeline  

### Ports

| Service | External | Internal |
|---------|----------|----------|
| ocr-service | `8090` | `8090` |
| ocr-service-text-only | `8091` | `8090` |

Both expose the API internally on port `8090`.

Please check the service's own [README.md](https://github.com/CogStack/ocr-service/blob/main/README.md)

---

## 🗂️ Git-ea

Self-hosted Git instance (Gitea).
Lightweight GitHub/GitLab-style service used for hosting repositories inside secure or offline environments.

**Purpose:**

- Internal code hosting for organisations without external Git access  
- Repository management, issue tracking, wiki, and basic CI hooks  
- Ideal for notebooks, configs, workflows, and internal project code

### Access

- URL: **http://localhost:3000** *(default Gitea port)*

### Containers

- `gitea`

### Service Location & Files

- docker compose file: `deploy/services.yml`
- config file: `services/gitea/app.ini`
- env files:
  - `/security/certificates_general.env`

Persistent repository data is stored in the volume defined in `services.yml`.

### Ports

| Service | External | Internal |
|---------|----------|----------|
| Git-ea  | `3000`   | `3000`   |

### Notes

- Supports repository migration from external Git servers  
- Mirroring available when external access is allowed  
- Can use CogStack certificates for HTTPS if configured  

---

## 🧱 NGINX

*Note: this component may eventually be replaced by **Traefik** as the preferred reverse‑proxy and ingress layer for CogStack deployments.*

NGINX is used as a lightweight reverse proxy to provide secure, unified access to internal CogStack services.  
It handles HTTPS, routing, and access control for NiFi, MedCAT Trainer, and other components.

MedCAT-Trainer has its own nginx instance that runs independently.

**Purpose:**

- Secure external access to internal services  
- Reverse proxy for NiFi, MedCAT Trainer, and service UIs  
- TLS termination (optional)  
- Basic auth / access control where required  

Two variants are included:

- **nginx-nifi** — main proxy for NiFi and related services  
- **nginx-medcat-trainer** — specialized proxy for MedCAT Trainer

Two variants:

- **nginx-nifi** — main proxy for services
- **nginx-medcat-trainer** — dedicated trainer proxy

### Access

Examples (actual paths depend on config):

- NiFi: `https://localhost:8443`  
- MedCAT Trainer: `https://localhost:8001`

Routing rules are defined in the NGINX configuration files.

### Containers

- `nifi-nginx` — main proxy for NiFi & NiFi Registry
- `medcat-trainer-nginx` — proxy dedicated to MedCAT Trainer

### Service Location & Files

- docker compose file: `deploy/services.yml`, trainer - `deploy/cogstack-nlp/medcat-trainer`
- config files:
  - `services/nginx/config/nifi.conf`
  - `services/nginx/config/medcat-trainer.conf`
  - additional templates under `services/nginx/config/`
- env / certificates:
  - `/security/certificates_general.env`
  - `/security/certificates_nifi.env`
- Uses shared CogStack Root CA & NiFi certs (`root-ca.p12`, `root-ca.key`, `nifi.key`, `nifi.pem`)

### Port

| Proxy Target     | External | Internal |
|------------------|----------|----------|
| NiFi             | `8443`   | `8443`   |
| NiFi Registry Flow      | `18443`   | `18443`   |

### Notes

- Provides HTTPS entrypoints for internal services  
- Works with CogStack certificate bundle  
- Trainer uses a separate NGINX instance for routing differences  
- Modify NGINX configs only if comfortable with its syntax
