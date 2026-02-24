# Deploy Helm Charts

This directory contains Helm charts owned by this repository's deployment layer.

## Convention

- Put deployment-level/platform charts here (for services orchestrated from `deploy/`).
- Keep service-owned charts in their own service repositories/submodules.

## Current charts

- `opensearch/` - OpenSearch + OpenSearch Dashboards chart used by this repo.

## Quick usage

```bash
# Render manifests
helm template cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env

# Install/upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --namespace cogstack --create-namespace
```

Only keys in `envFile.includeKeys` are imported from the env file.
