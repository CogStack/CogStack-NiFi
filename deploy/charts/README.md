# Deploy Helm Charts

This directory contains Helm charts owned by this repository's deployment layer.

## Convention

- Put deployment-level/platform charts here (for services orchestrated from `deploy/`).
- Keep service-owned charts in their own service repositories/submodules.

## Current charts

- `nifi/` - Apache NiFi StatefulSet chart used by this repo.
- `opensearch/` - OpenSearch and/or OpenSearch Dashboards chart used by this repo.
- `postgresql/` - CloudNativePG-backed PostgreSQL cluster chart used by this repo.

## Quick usage

```bash
# Render NiFi manifests
helm template cogstack-nifi ./deploy/charts/nifi \
  -f ./deploy/helm/nifi.values.yaml \
  --namespace cogstack

# Install/upgrade NiFi
helm upgrade --install cogstack-nifi ./deploy/charts/nifi \
  -f ./deploy/helm/nifi.values.yaml \
  --namespace cogstack --create-namespace

# Render manifests
helm template cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml

# Install/upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  -f ./deploy/helm/opensearch.values.yaml \
  --namespace cogstack --create-namespace
```

The NiFi chart reads selected defaults from `deploy/nifi.env`, `security/env/certificates_nifi.env`, and `security/env/users_nifi.env`, then bootstraps runtime configuration and local assets from the custom CogStack NiFi image into writable Kubernetes volumes.

The OpenSearch and Dashboards chart reads config files from `services/`, and security/env files from `security/` and `deploy/`, so Docker and Kubernetes use the same source files. Its values file is for cluster-specific overrides only; it does not need to repeat the shared YAML or env file paths. Only keys in `envFile.includeKeys`, `usersEnvFile.includeKeys`, and `certificatesEnvFile.includeKeys` are imported.
