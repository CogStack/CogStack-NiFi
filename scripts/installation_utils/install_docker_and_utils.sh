#!/usr/bin/env bash

echo "This script must be run with root privileges."

os_distribution="$(sudo bash ./detect_os.sh)"

echo "Found distribution: $os_distribution "

if [ "$os_distribution" == "debian" ] || [ "$os_distribution" == "ubuntu" ];
then
    sudo apt-get update -y && sudo apt-get upgrade -y

    # NFS STUFF
    sudo apt-get install -y samba cifs-utils nfs-common nfs-kernel-server archivemount

    # monitoring
    sudo apt-get install -y htop iotop sysstat

    sudo apt-get install -y jq wget curl gnupg-agent git ca-certificates apt-transport-https python3 python3-pip python3-full libssl-dev zip unzip tar nano gcc make python3-dev build-essential software-properties-common

    sudo add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/$os_distribution $(lsb_release -cs) stable"

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt -y update 
    sudo apt -y upgrade 
    sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # create docker group and add the root user to it, as root will be used to run the docker
    sudo groupadd docker
    sudo usermod -aG docker root
    sudo usermod -aG docker $USER

    # start the service
    sudo systemctl enable docker.service
    sudo systemctl start docker

    sudo apt-get -y autoremove

elif  [ "$os_distribution" == "redhat" ] || [ "$os_distribution" == "red hat" ] || [ "$os_distribution" == "centos" ]; 
then
    yum -y update && yum -y upgrade

    # NFS STUFF
    sudo yum install samba samba-client cifs-utils nfs-utils rpcbind archivemount

    # monitoring
    sudo yum install htop iotop sysstat
  
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
    sudo yum install -y jq yum-utils wget curl git device-mapper-persistent-data lvm2 python3 python3-pip libffi-devel openssl-devel zip unzip tar nano gcc gcc-c++ make python3-devel libevent-devel
    
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum-config-manager --enable docker-ce-stable
    sudo yum-config-manager --enable docker-ce-stable-source
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # create docker group and add the root user to it, as root will be used to run the docker process
    sudo groupadd docker
    sudo usermod -aG docker root
    sudo usermod -aG docker $USER

    # start the service
    sudo systemctl enable docker.service
    sudo systemctl start docker

    sudo yum -y autoremove
else
    exit 1
fi;

echo "Installing require python packages.."

sudo -H pip3 install --upgrade pip
sudo -H pip3 install html2text jsoncsv detect --break-system-packages

echo "Finished installing docker and utils.."

sudo sysctl -w vm.max_map_count=262144

sudo sh -c "echo 'vm.max_map_count=262144' >> /etc/sysctl.conf"
sudo sysctl -p 
