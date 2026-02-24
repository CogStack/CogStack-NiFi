# cogstack-opensearch Helm Chart

Helm chart for deploying OpenSearch plus OpenSearch Dashboards using the CogStack configuration baseline.

## What this chart deploys

- OpenSearch `StatefulSet` (default: 3 replicas)
- OpenSearch client + headless Services
- OpenSearch Dashboards `Deployment` + Service (enabled by default)
- ConfigMaps for:
  - `opensearch.yml`
  - `log4j2.properties`
  - OpenSearch Security files (`config.yml`, `internal_users.yml`, `roles.yml`, `roles_mapping.yml`)
  - `opensearch_dashboards.yml`

## Prerequisites

1. Kubernetes cluster with dynamic PV provisioning (or set `persistence.enabled=false`).
2. Kubernetes Secrets containing TLS materials.
3. If `credentials.create=false`, an existing Secret with:
   - `OPENSEARCH_INITIAL_ADMIN_PASSWORD`
   - `KIBANA_USER`
   - `KIBANA_PASSWORD`

## Required certificate secrets

Set these in `values.yaml`:

- `certificates.opensearchSecretName`
- `certificates.dashboardsSecretName`

Secret keys are mapped via:

- `certificates.opensearchFiles.*`
- `certificates.dashboardsFiles.*`

## Install

```bash
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --namespace cogstack --create-namespace
```

## Render templates

```bash
helm template cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env
```

## Notes

- The chart packages current repository config files under `files/`.
- `envFile.raw` can be set from `deploy/elasticsearch.env` and is loaded via `envFrom` into OpenSearch and Dashboards.
- Only keys listed in `envFile.includeKeys` are imported (to avoid leaking secrets from env files into ConfigMaps).
- Review security and certificate settings before production use.
