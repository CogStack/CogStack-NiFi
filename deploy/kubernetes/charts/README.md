# Deploy Helm Charts

This directory contains the reusable NiFi Helm chart.

## Convention

- Keep platform-level infrastructure charts in `cogstack-platform`.
- Keep service-owned charts in their own service repositories/submodules.

## Current charts

- `nifi/` - Apache NiFi StatefulSet chart used by this repo.

## Quick usage

```bash
# Render NiFi manifests
helm template cogstack-nifi ./deploy/kubernetes/charts/nifi \
  -f ./deploy/kubernetes/values/nifi.yaml \
  --namespace cogstack

# Install/upgrade NiFi
helm upgrade --install cogstack-nifi ./deploy/kubernetes/charts/nifi \
  -f ./deploy/kubernetes/values/nifi.yaml \
  --namespace cogstack --create-namespace
```

The NiFi chart reads selected defaults from `deploy/nifi.env`, `security/env/certificates_nifi.env`, and `security/env/users_nifi.env`, then bootstraps runtime configuration and local assets from the custom CogStack NiFi image into writable Kubernetes volumes.
