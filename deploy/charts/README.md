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
helm template cogstack-opensearch ./deploy/charts/opensearch

# Install/upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  --namespace cogstack --create-namespace
```
