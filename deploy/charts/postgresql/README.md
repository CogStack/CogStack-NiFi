# cogstack-postgresql Helm Chart

Helm chart for deploying the repo's production PostgreSQL database on Kubernetes using the CloudNativePG operator.

## What this chart deploys

- A CloudNativePG `Cluster` resource for PostgreSQL
- An application credentials `Secret` by default
- A bootstrap SQL `ConfigMap` sourced from `services/cogstack-db/pgsql/schemas/`

## Prerequisites

1. Install the CloudNativePG operator and CRDs first.
2. Have a working default `StorageClass`, or set `cluster.storage.storageClass` in your values file.
3. Use at least 3 worker nodes for HA production deployments.

Pinned operator install example:

```bash
kubectl apply --server-side -f \
  https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.28/releases/cnpg-1.28.1.yaml
```

## Install

```bash
helm upgrade --install cogstack-postgresql ./deploy/charts/postgresql \
  -f ./deploy/helm/postgresql.values.yaml \
  --namespace cogstack --create-namespace
```

## Render templates

```bash
helm template cogstack-postgresql ./deploy/charts/postgresql \
  -f ./deploy/helm/postgresql.values.yaml \
  --namespace cogstack
```

## Notes

- The chart consumes shared repo sources through bundled files under `deploy/charts/postgresql/files/`.
- `deploy/database.env` is used as the default source for `DATABASE_DB_NAME`, `POSTGRES_DB_MAX_CONNECTIONS`, and the default CPU/memory sizing hints.
- `security/env/users_database.env` is used as the default source for `DATABASE_USER` and `DATABASE_PASSWORD`.
- The bootstrap SQL comes from the shared PostgreSQL schema files under `services/cogstack-db/pgsql/schemas/`.
- `POSTGRES_DB_SCHEMA_PREFIX` is respected when selecting bundled custom schema files after `annotations_nlp_create_schema.sql`.
- Docker-specific settings that do not map cleanly to Kubernetes, such as `DATABASE_DOCKER_SHM_SIZE`, are intentionally not consumed.
- By default, the application owner is not granted PostgreSQL superuser. If you need compose-like behavior, set `cluster.ownerSuperuser=true`.
- Backups are intentionally not enabled by default in this chart. Wire object storage and WAL archiving before using this for production data.
