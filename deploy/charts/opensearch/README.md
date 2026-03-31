# cogstack-opensearch Helm Chart

Helm chart for deploying OpenSearch and/or OpenSearch Dashboards using the CogStack configuration baseline.

## What this chart deploys

- OpenSearch `StatefulSet` (default: 3 replicas, controlled by `opensearch.enabled`)
- OpenSearch client + headless Services (when `opensearch.enabled=true`)
- OpenSearch Dashboards `Deployment` + Service (enabled by default)
- ConfigMaps for:
  - `opensearch.yml` (when `opensearch.enabled=true`)
  - `log4j2.properties` (when `opensearch.enabled=true`)
  - OpenSearch Security files (`config.yml`, `internal_users.yml`, `roles.yml`, `roles_mapping.yml`) (when `opensearch.enabled=true`)
  - `opensearch_dashboards.yml`
- PVC-backed `data`, `logs`, and performance-analyzer storage for OpenSearch by default

## Prerequisites

1. Kubernetes cluster with dynamic PV provisioning (if `opensearch.enabled=true` and `persistence.enabled=true`).
2. Kubernetes Secrets containing TLS materials for enabled components.
3. If `credentials.create=false`, an existing Secret with:
   - `OPENSEARCH_INITIAL_ADMIN_PASSWORD` when `opensearch.enabled=true`
   - `KIBANA_USER` and `KIBANA_PASSWORD` when `dashboards.enabled=true`

## Required certificate secrets

Set these in `values.yaml` for enabled components:

- `certificates.opensearchSecretName` (if `opensearch.enabled=true`)
- `certificates.dashboardsSecretName` (if `dashboards.enabled=true`)

Secret keys are mapped via:

- `certificates.opensearchFiles.*` (if `opensearch.enabled=true`)
- `certificates.opensearchNodeFiles[*]` for per-pod node cert/key selection (if `opensearch.enabled=true`)
- `certificates.dashboardsFiles.*` (if `dashboards.enabled=true`)

Repo-aligned certificate source paths:

- OpenSearch shared certs:
  - `security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem`
  - `security/certificates/elastic/opensearch/admin.crt`
  - `security/certificates/elastic/opensearch/admin.key.pem`
- OpenSearch node certs:
  - `security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.crt`
  - `security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.key`
  - `security/certificates/elastic/opensearch/elasticsearch/elasticsearch-2/elasticsearch-2.crt`
  - `security/certificates/elastic/opensearch/elasticsearch/elasticsearch-2/elasticsearch-2.key`
  - `security/certificates/elastic/opensearch/elasticsearch/elasticsearch-3/elasticsearch-3.crt`
  - `security/certificates/elastic/opensearch/elasticsearch/elasticsearch-3/elasticsearch-3.key`
- Dashboards certs:
  - `security/certificates/elastic/opensearch/es_kibana_client.pem`
  - `security/certificates/elastic/opensearch/es_kibana_client.key`

Example secret creation from the repo layout:

```bash
kubectl create secret generic opensearch-certs \
  --from-file=elastic-stack-ca.crt.pem=./security/certificates/elastic/opensearch/elastic-stack-ca.crt.pem \
  --from-file=admin.crt=./security/certificates/elastic/opensearch/admin.crt \
  --from-file=admin.key.pem=./security/certificates/elastic/opensearch/admin.key.pem \
  --from-file=elasticsearch-1.crt=./security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.crt \
  --from-file=elasticsearch-1.key=./security/certificates/elastic/opensearch/elasticsearch/elasticsearch-1/elasticsearch-1.key \
  --from-file=elasticsearch-2.crt=./security/certificates/elastic/opensearch/elasticsearch/elasticsearch-2/elasticsearch-2.crt \
  --from-file=elasticsearch-2.key=./security/certificates/elastic/opensearch/elasticsearch/elasticsearch-2/elasticsearch-2.key \
  --from-file=elasticsearch-3.crt=./security/certificates/elastic/opensearch/elasticsearch/elasticsearch-3/elasticsearch-3.crt \
  --from-file=elasticsearch-3.key=./security/certificates/elastic/opensearch/elasticsearch/elasticsearch-3/elasticsearch-3.key \
  --from-file=es_kibana_client.pem=./security/certificates/elastic/opensearch/es_kibana_client.pem \
  --from-file=es_kibana_client.key=./security/certificates/elastic/opensearch/es_kibana_client.key
```

## Install

```bash
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml \
  --namespace cogstack --create-namespace
```

## Dashboards-only install

Use this mode when OpenSearch is managed externally:

```bash
helm upgrade --install cogstack-dashboards ./deploy/charts/opensearch \
  --set opensearch.enabled=false \
  --set dashboards.enabled=true \
  --set 'dashboards.opensearchHosts[0]=https://opensearch-client.cogstack.svc:9200' \
  --namespace cogstack --create-namespace
```

## Render templates

```bash
helm template cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml
```

## Notes

- Helm templates cannot read arbitrary `../../...` paths directly; `.Files.Get` only sees files packaged inside the chart.
- In this repo, the chart `files/` entries are symlinked to the shared `deploy/`, `services/`, and `security/` sources so Docker and Kubernetes stay aligned.
- The standard install/render commands now use `-f ./deploy/helm/opensearch.values.yaml`; that file is for cluster-specific overrides only.
- The shared `services/`, `security/`, and selected `deploy/` env files are consumed automatically by the chart defaults; you do not need to repeat those paths in the values file.
- `envFile.raw` defaults to `deploy/elasticsearch.env` and can still be overridden; the chart reads only `ELASTICSEARCH_CLUSTER_NAME`, `ELASTICSEARCH_JAVA_OPTS` / `OPENSEARCH_JAVA_OPTS`, and `KIBANA_SERVER_NAME`, while pod IP and discovery hosts remain Kubernetes-specific.
- `usersEnvFile.raw` defaults to `security/env/users_elasticsearch.env` and can still be overridden; only the credential keys required by the enabled components are imported.
- `certificatesEnvFile.raw` defaults to `security/env/certificates_elasticsearch.env` and can still be overridden; currently `ES_CLIENT_CERT_NAME` is used to resolve Dashboards cert secret keys (`<name>.pem` / `<name>.key`).
- `deploy/elasticsearch.env` shared values are used where they make sense on Kubernetes (`ELASTICSEARCH_CLUSTER_NAME`, `ELASTICSEARCH_JAVA_OPTS` / `OPENSEARCH_JAVA_OPTS`, `KIBANA_SERVER_NAME`), while pod IP and discovery hosts remain Kubernetes-specific.
- By default, `certificates.opensearchNodeFiles[*]` maps pod ordinals `0/1/2` to repo-style node cert keys `elasticsearch-1/2/3`.
- `opensearch.logPersistence` and `opensearch.performanceAnalyzerPersistence` default to PVC-backed storage to stay closer to the Docker Compose deployment.
- `opensearch.snapshotBackups` adds shared PVC-backed mounts for `/mnt/es_data_backups` and `/mnt/es_config_backups`; use RWX storage or set `existingClaim` values, and still set `path.repo` in the shared OpenSearch config if you want the cluster to use them.
- `configFiles.opensearchRaw` can be set from `services/elasticsearch/config/opensearch.yml`.
- `configFiles.log4jRaw` can be set from `services/elasticsearch/config/log4j2_opensearch.properties`.
- `configFiles.dashboardsRaw` can be set from `services/kibana/config/opensearch.yml`.
- `securityFiles.*Raw` can be set from `security/es_roles/opensearch/*.yml` and overrides the chart-bundled OpenSearch security files.
- Review security and certificate settings before production use.
