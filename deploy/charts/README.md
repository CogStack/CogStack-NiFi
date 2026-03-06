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
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --set-file usersEnvFile.raw=./security/env/users_elasticsearch.env \
  --set-file securityFiles.configRaw=./security/es_roles/opensearch/config.yml \
  --set-file securityFiles.internalUsersRaw=./security/es_roles/opensearch/internal_users.yml \
  --set-file securityFiles.rolesRaw=./security/es_roles/opensearch/roles.yml \
  --set-file securityFiles.rolesMappingRaw=./security/es_roles/opensearch/roles_mapping.yml

# Install/upgrade
helm upgrade --install cogstack-opensearch ./deploy/charts/opensearch \
  --set-file envFile.raw=./deploy/elasticsearch.env \
  --set-file usersEnvFile.raw=./security/env/users_elasticsearch.env \
  --set-file securityFiles.configRaw=./security/es_roles/opensearch/config.yml \
  --set-file securityFiles.internalUsersRaw=./security/es_roles/opensearch/internal_users.yml \
  --set-file securityFiles.rolesRaw=./security/es_roles/opensearch/roles.yml \
  --set-file securityFiles.rolesMappingRaw=./security/es_roles/opensearch/roles_mapping.yml \
  --namespace cogstack --create-namespace
```

Only keys in `envFile.includeKeys` and `usersEnvFile.includeKeys` are imported.
