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

## Prerequisites

1. Kubernetes cluster with dynamic PV provisioning (if `opensearch.enabled=true` and `persistence.enabled=true`).
2. Kubernetes Secrets containing TLS materials for enabled components.
3. If `credentials.create=false`, an existing Secret with:
   - `OPENSEARCH_INITIAL_ADMIN_PASSWORD`
   - `KIBANA_USER`
   - `KIBANA_PASSWORD`

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
  --set-file configFiles.opensearchRaw=./services/elasticsearch/config/opensearch.yml \
  --set-file configFiles.log4jRaw=./services/elasticsearch/config/log4j2_opensearch.properties \
  --set-file configFiles.dashboardsRaw=./services/kibana/config/opensearch.yml \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --set-file usersEnvFile.raw=./security/env/users_elasticsearch.env \
  --set-file certificatesEnvFile.raw=./security/env/certificates_elasticsearch.env \
  --set-file securityFiles.configRaw=./security/es_roles/opensearch/config.yml \
  --set-file securityFiles.internalUsersRaw=./security/es_roles/opensearch/internal_users.yml \
  --set-file securityFiles.rolesRaw=./security/es_roles/opensearch/roles.yml \
  --set-file securityFiles.rolesMappingRaw=./security/es_roles/opensearch/roles_mapping.yml \
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
  --set-file configFiles.opensearchRaw=./services/elasticsearch/config/opensearch.yml \
  --set-file configFiles.log4jRaw=./services/elasticsearch/config/log4j2_opensearch.properties \
  --set-file configFiles.dashboardsRaw=./services/kibana/config/opensearch.yml \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --set-file usersEnvFile.raw=./security/env/users_elasticsearch.env \
  --set-file certificatesEnvFile.raw=./security/env/certificates_elasticsearch.env \
  --set-file securityFiles.configRaw=./security/es_roles/opensearch/config.yml \
  --set-file securityFiles.internalUsersRaw=./security/es_roles/opensearch/internal_users.yml \
  --set-file securityFiles.rolesRaw=./security/es_roles/opensearch/roles.yml \
  --set-file securityFiles.rolesMappingRaw=./security/es_roles/opensearch/roles_mapping.yml
```

## Notes

- Helm templates cannot read arbitrary `../../...` paths directly; `.Files.Get` only sees files packaged inside the chart.
- In this repo, the chart `files/` entries are symlinked to the shared `services/` and `security/` sources so Docker and Kubernetes stay aligned.
- The standard install/render commands still use `--set-file` explicitly to make the source-of-truth paths obvious at invocation time.
- If you run Helm from `deploy/charts/opensearch`, the equivalent relative paths are `../../../services/...` and `../../../security/...`.
- `envFile.raw` can be set from `deploy/elasticsearch.env` and is loaded via `envFrom` into OpenSearch and Dashboards.
- `usersEnvFile.raw` can be set from `security/env/users_elasticsearch.env` and feeds the credentials Secret (`OPENSEARCH_INITIAL_ADMIN_PASSWORD`, `KIBANA_USER`, `KIBANA_PASSWORD`).
- `certificatesEnvFile.raw` can be set from `security/env/certificates_elasticsearch.env`; currently `ES_CLIENT_CERT_NAME` is used to resolve Dashboards cert secret keys (`<name>.pem` / `<name>.key`).
- `deploy/elasticsearch.env` shared values are used where they make sense on Kubernetes (`ELASTICSEARCH_CLUSTER_NAME`, `OPENSEARCH_JAVA_OPTS`, `KIBANA_SERVER_NAME`), while pod IP and discovery hosts remain Kubernetes-specific.
- By default, `certificates.opensearchNodeFiles[*]` maps pod ordinals `0/1/2` to repo-style node cert keys `elasticsearch-1/2/3`.
- `configFiles.opensearchRaw` can be set from `services/elasticsearch/config/opensearch.yml`.
- `configFiles.log4jRaw` can be set from `services/elasticsearch/config/log4j2_opensearch.properties`.
- `configFiles.dashboardsRaw` can be set from `services/kibana/config/opensearch.yml`.
- `securityFiles.*Raw` can be set from `security/es_roles/opensearch/*.yml` and overrides the chart-bundled OpenSearch security files.
- Only keys listed in `envFile.includeKeys` are imported (to avoid leaking secrets from env files into ConfigMaps).
- Review security and certificate settings before production use.
