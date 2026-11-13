# Kubernetes deployment

This directory contains the Kubernetes deployment entry point, repository-owned
Helm charts, deployment values, and cluster prerequisites.

```text
kubernetes/
├── Makefile
├── charts/
│   ├── nifi/
│   ├── opensearch/
│   └── postgresql/
├── values/
│   ├── nifi.yaml
│   ├── opensearch.yaml
│   ├── postgresql.yaml
│   └── gitea.yaml
└── bootstrap/
    └── cnpg.mk
```

## Commands

Run these commands from the repository root:

```bash
make -C deploy/kubernetes help
make -C deploy/kubernetes helm-template-nifi
make -C deploy/kubernetes helm-template-opensearch
make -C deploy/kubernetes helm-template-postgresql
```

The corresponding `helm-install-*` targets install or upgrade releases. Install
the CloudNativePG operator before deploying PostgreSQL:

```bash
make -C deploy/kubernetes kube-install-cnpg-operator
make -C deploy/kubernetes helm-install-postgresql
```

Gitea uses its official upstream chart. The Makefile pins its chart version and
loads `values/gitea.yaml`; `helm-template-gitea` and `helm-install-gitea` add or
update the upstream Helm repository first.

Existing commands such as `make -C deploy helm-template-nifi` remain supported.
The parent Makefile includes this Makefile, so both entry points use the same
targets and accept the same `HELM_*` and `CNPG_OPERATOR_*` overrides.

## Configuration

- `charts/<service>/values.yaml` contains reusable chart defaults.
- `values/<service>.yaml` contains CogStack deployment overrides, including
  storage, ingress, certificate Secret names, and replica counts.
- `bootstrap/cnpg.mk` contains the pinned CloudNativePG operator version and its
  installation target, separate from application releases.

Shared `.env` settings remain in `deploy/` and `security/env/`. The owned chart
Make targets honor `COGSTACK_CONFIG_DIR` and pass selected files through
`--set-file`. Chart `files/` symlinks point to the same shared configuration and
SQL sources used by Compose. Keep these links relative and update them if a
chart or source file moves.

Use a deployment-specific values file with the relevant `HELM_*_VALUES_FILE`
override:

```bash
COGSTACK_CONFIG_DIR=/path/to/deployment-config \
  make -C deploy/kubernetes helm-template-nifi \
  HELM_NIFI_VALUES_FILE=/path/to/cluster/nifi.yaml
```

Custom values files are merged with chart defaults. To also retain the repository
deployment overrides, pass both files in order:

```bash
make -C deploy/kubernetes helm-template-nifi \
  HELM_NIFI_VALUES_ARG='-f values/nifi.yaml -f /path/to/cluster/nifi.yaml'
```

Absolute custom paths work with either Makefile entry point. Relative custom
paths are resolved from the directory selected by `make -C`.

See the [deployment guide](../../docs/deploy/deployment.md) for TLS Secret setup
and the chart READMEs under [charts/](charts/README.md) for service details.
