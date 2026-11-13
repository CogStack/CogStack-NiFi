#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target_user="${SUDO_USER:-${USER:-$(id -un)}}"
install_kubernetes="${INSTALL_KUBERNETES:-true}"
# INSTALL_K3S=true installs K3s; false skips it. Unset follows INSTALL_KUBERNETES.
install_k3s="${INSTALL_K3S:-$install_kubernetes}"
kubernetes_minor_version="${KUBERNETES_MINOR_VERSION:-v1.37}"
helm_version="${HELM_VERSION:-v4.3.1}"
k3s_version="${K3S_VERSION:-v1.37.2+k3s1}"

case "$install_kubernetes" in
    true|false) ;;
    *) echo "INSTALL_KUBERNETES must be true or false." >&2; exit 1 ;;
esac

case "$install_k3s" in
    true|false) ;;
    *) echo "INSTALL_K3S must be true or false." >&2; exit 1 ;;
esac

if [ "$install_kubernetes" = "true" ]; then
    if [[ ! "$kubernetes_minor_version" =~ ^v1\.[0-9]+$ ]]; then
        echo "KUBERNETES_MINOR_VERSION must be a minor release such as v1.37." >&2
        exit 1
    fi
    if [[ ! "$helm_version" =~ ^v4\.[0-9]+\.[0-9]+$ ]]; then
        echo "HELM_VERSION must be a Helm 4 release such as v4.3.1." >&2
        exit 1
    fi
fi

if [ "$install_k3s" = "true" ] && [[ ! "$k3s_version" =~ ^v1\.[0-9]+\.[0-9]+\+k3s[0-9]+$ ]]; then
    echo "K3S_VERSION must be a K3s release such as v1.37.2+k3s1." >&2
    exit 1
fi

if [ "$(id -u)" -eq 0 ]; then
    echo "Running with root privileges."
else
    echo "This script installs system packages and may prompt for sudo privileges."
    sudo -v
fi

os_distribution="$(bash "${script_dir}/detect_os.sh")"

echo "Found distribution: $os_distribution "

if [ "$os_distribution" == "debian" ] || [ "$os_distribution" == "ubuntu" ];
then
    sudo apt-get update -y
    sudo apt-get upgrade -y

    # NFS STUFF
    sudo apt-get install -y samba cifs-utils nfs-common nfs-kernel-server archivemount

    # monitoring
    sudo apt-get install -y htop iotop sysstat

    sudo apt-get install -y jq wget curl gnupg gnupg-agent git ca-certificates apt-transport-https python3 python3-pip python3-full openssl libssl-dev zip unzip tar nano gcc make python3-dev build-essential software-properties-common

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL "https://download.docker.com/linux/${os_distribution}/gpg" | sudo gpg --batch --yes --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo "Installing Azure CLI..."
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

    # shellcheck disable=SC1091 # Standard OS metadata file provided by Debian/Ubuntu.
    docker_codename="$(. /etc/os-release && printf '%s' "$VERSION_CODENAME")"
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${os_distribution} \
    ${docker_codename} stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt -y update 
    sudo apt -y upgrade 
    sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # create docker group and add the root user to it, as root will be used to run the docker
    sudo groupadd -f docker
    sudo usermod -aG docker root
    if [ -n "$target_user" ] && [ "$target_user" != "root" ] && id "$target_user" >/dev/null 2>&1; then
        sudo usermod -aG docker "$target_user"
    fi

    # start the service
    sudo systemctl enable docker.service
    sudo systemctl start docker

    sudo apt-get -y autoremove

elif  [ "$os_distribution" == "redhat" ] || [ "$os_distribution" == "red hat" ] || [ "$os_distribution" == "centos" ]; 
then
    sudo yum -y update
    sudo yum -y upgrade

    # NFS STUFF
    sudo yum install -y samba samba-client cifs-utils nfs-utils rpcbind archivemount

    # monitoring
    sudo yum install -y htop iotop sysstat
  
    sudo yum remove -y docker \
                    docker-client \
                    docker-client-latest \
                    docker-common \
                    docker-latest \
                    docker-latest-logrotate \
                    docker-logrotate \
                    docker-engine

    sudo yum remove -y buildah podman

    # install necessary prerequisites
    sudo yum install -y jq yum-utils wget curl git device-mapper-persistent-data lvm2 python3 python3-pip libffi-devel openssl openssl-devel zip unzip tar nano gcc gcc-c++ make python3-devel libevent-devel

    echo "Installing Azure CLI..."
    sudo rpm --import https://packages.microsoft.com/keys/microsoft-2025.asc
    sudo dnf install -y azure-cli
    
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum-config-manager --enable docker-ce-stable
    sudo yum-config-manager --enable docker-ce-stable-source
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # create docker group and add the root user to it, as root will be used to run the docker process
    sudo groupadd -f docker
    sudo usermod -aG docker root
    if [ -n "$target_user" ] && [ "$target_user" != "root" ] && id "$target_user" >/dev/null 2>&1; then
        sudo usermod -aG docker "$target_user"
    fi

    # start the service
    sudo systemctl enable docker.service
    sudo systemctl start docker

    sudo yum -y autoremove
else
    echo "No instructions given for distribution: $os_distribution" >&2
    exit 1
fi;

if [ "$install_kubernetes" = "true" ] || [ "$install_k3s" = "true" ]; then
    installer_temp_dir="$(mktemp -d)"
    trap 'rm -rf "$installer_temp_dir"' EXIT
fi

if [ "$install_kubernetes" = "true" ]; then
    echo "Installing Kubernetes ${kubernetes_minor_version} (kubeadm, kubelet, kubectl)..."
    kubernetes_repository="https://pkgs.k8s.io/core:/stable:/${kubernetes_minor_version}"

    if [ "$os_distribution" = "debian" ] || [ "$os_distribution" = "ubuntu" ]; then
        curl -fsSL "${kubernetes_repository}/deb/Release.key" | \
            sudo gpg --batch --yes --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
        sudo chmod a+r /etc/apt/keyrings/kubernetes-apt-keyring.gpg
        echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] ${kubernetes_repository}/deb/ /" | \
            sudo tee /etc/apt/sources.list.d/kubernetes.list > /dev/null
        sudo apt-get update -y
        sudo apt-get install -y kubelet kubeadm kubectl
        # Cluster upgrades must be coordinated with kubeadm, not unattended upgrades.
        sudo apt-mark hold kubelet kubeadm kubectl
    else
        sudo tee /etc/yum.repos.d/kubernetes.repo > /dev/null <<EOF
[kubernetes]
name=Kubernetes
baseurl=${kubernetes_repository}/rpm/
enabled=1
gpgcheck=1
gpgkey=${kubernetes_repository}/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
        sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
    fi

    # kubeadm init/join configures and starts kubelet when the node's role is chosen.
    sudo systemctl enable kubelet.service

    echo "Installing Helm ${helm_version}..."
    helm_installer="${installer_temp_dir}/get-helm-4"
    curl -fsSL "https://raw.githubusercontent.com/helm/helm/${helm_version}/scripts/get-helm-4" -o "$helm_installer"
    # The official installer verifies the release archive's checksum by default.
    sudo bash "$helm_installer" --version "$helm_version"

    kubectl version --client
    helm version --short
    echo "Kubernetes tools installed. Prepare containerd CRI, swap and networking before kubeadm init/join."
    echo "See deploy/kubernetes/README.md for cluster setup and deployment steps."
fi

if [ "$install_k3s" = "true" ]; then
    echo "Installing K3s ${k3s_version} alongside the Kubernetes tools..."
    k3s_installer="${installer_temp_dir}/install-k3s.sh"
    curl -fsSL https://get.k3s.io -o "$k3s_installer"
    # Install the binary and service without starting a cluster or replacing the
    # standalone kubectl command. K3s also provides its own `k3s kubectl` command.
    sudo env INSTALL_K3S_VERSION="$k3s_version" \
        INSTALL_K3S_SKIP_ENABLE=true INSTALL_K3S_SKIP_START=true INSTALL_K3S_SYMLINK=skip \
        sh "$k3s_installer" server
    k3s --version
    echo "K3s installed. Its service is not automatically enabled or started."
fi

echo "Installing required Python packages..."

# Keep the distribution's pip; newer releases require an explicit override when
# installing utilities into an externally managed system Python environment.
pip_options=(install html2text jsoncsv detect)
if pip3 install --help | grep -- '--break-system-packages' > /dev/null; then
    pip_options+=(--break-system-packages)
fi
sudo -H pip3 "${pip_options[@]}"

sudo sysctl -w vm.max_map_count=262144

sudo sh -c "echo 'vm.max_map_count=262144' >> /etc/sysctl.conf"
sudo sysctl -p 

echo "Finished installing Docker and utilities."
