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

# Install/upgrade
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

The OpenSearch and Dashboards config files should come from `services/`, and the security files from `security/`, so Docker and Kubernetes use the same source files.
Only keys in `envFile.includeKeys`, `usersEnvFile.includeKeys`, and `certificatesEnvFile.includeKeys` are imported.
