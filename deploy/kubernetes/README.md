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

## Install Kubernetes tools

On Debian/Ubuntu or RHEL/CentOS, the host installer installs Docker, containerd,
`kubeadm`, `kubelet`, `kubectl`, Helm, and K3s together:

```bash
bash scripts/installation_utils/install_docker_and_utils.sh
```

### Enable or disable K3s installation

Set `INSTALL_K3S` to `true` to install K3s or `false` to skip it. When unset,
it follows `INSTALL_KUBERNETES`, which defaults to `true`. The flag accepts only
the literal values `true` and `false`.

```bash
# Install K3s alongside the kubeadm packages and Helm (the normal default).
INSTALL_K3S=true bash scripts/installation_utils/install_docker_and_utils.sh

# Keep the kubeadm packages and Helm, and skip K3s.
INSTALL_K3S=false bash scripts/installation_utils/install_docker_and_utils.sh

# Install K3s without the standalone kubeadm packages and Helm.
INSTALL_KUBERNETES=false INSTALL_K3S=true \
  bash scripts/installation_utils/install_docker_and_utils.sh

# Docker and existing utilities only; omit Kubernetes tools, Helm, and K3s.
INSTALL_KUBERNETES=false bash scripts/installation_utils/install_docker_and_utils.sh
```

This flag controls installation; service startup is a separate step. Skipping
installation leaves any existing K3s installation and service state intact.

### Versions and cluster startup

The default Kubernetes minor release is `v1.37`; the latest available packages
from that minor release are installed. Kubernetes packages are held on Debian/
Ubuntu and excluded from normal yum upgrades so cluster upgrades can be managed
with kubeadm. Helm defaults to `v4.3.1`, matching the deployment CI version.
K3s is pinned independently to `v1.37.2+k3s1`. Override versions with environment
variables:

```bash
KUBERNETES_MINOR_VERSION=v1.37 HELM_VERSION=v4.3.1 K3S_VERSION=v1.37.1+k3s1 \
  bash scripts/installation_utils/install_docker_and_utils.sh
```

The K3s installer leaves its service unenabled and unstarted and
skips command symlinks, preserving the standalone `kubectl`. It does not select
or overwrite your kubeconfig. These behaviors use the official
[K3s installation options](https://docs.k3s.io/reference/env-variables).

To start a new K3s cluster on a host that is not already running a kubeadm node:

```bash
sudo systemctl disable --now kubelet.service
sudo systemctl enable --now k3s.service
sudo k3s kubectl get nodes
```

Both installations can remain on disk. Run one node's Kubernetes services at a
time on the host; K3s runs its own kubelet and containerd. To use kubeadm, leave
K3s stopped and follow the kubeadm preparation steps below. Configure the desired
cluster's kubeconfig before using the standalone `kubectl` or Helm.

Run the installer on a fresh host. Changing the minor-release override is for
new installations; it does not perform a coordinated upgrade of an existing
cluster or remove package holds.

For kubeadm, the installer enables kubelet and installs the tools. Before creating
or joining a kubeadm cluster, configure containerd with CRI enabled and the `systemd` cgroup driver,
configure swap and kernel networking, and review the node's firewall and SELinux
requirements. Docker's containerd package can disable CRI by default. Follow the
official [container runtime setup](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)
and [kubeadm installation prerequisites](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/),
then [create a cluster and install a Pod network](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)
or join an existing cluster. Configure your kubeconfig before running the Helm
deployment commands below.

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
