# Deploy Helm Charts

This directory contains Helm charts owned by this repository's deployment layer.

## Convention

- Put deployment-level/platform charts here (for services orchestrated from `deploy/`).
- Keep service-owned charts in their own service repositories/submodules.

## Current charts

- `opensearch/` - OpenSearch and/or OpenSearch Dashboards chart used by this repo.

## Quick usage

```bash
# Render manifests
helm template cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml

# Install/upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml \
  --namespace cogstack --create-namespace
```

The OpenSearch and Dashboards config files should come from `services/`, and the security and env files from `security/` and `deploy/`, so Docker and Kubernetes use the same source files.
The values file is for cluster-specific overrides only; it does not need to repeat the shared YAML or env file paths.
Only keys in `envFile.includeKeys`, `usersEnvFile.includeKeys`, and `certificatesEnvFile.includeKeys` are imported.
