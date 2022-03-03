#!/usr/bin/env bash

echo "This script must be run with root privileges."

os_distribution="$(exec ./detect_os.sh)"
echo "Found distribution: $os_distribution "

if [ "$os_distribution" == "debian" ] || [ "$os_distribution" == "ubuntu" ];
then
    sudo apt-get update -y && sudo apt-get upgrade -y

    sudo apt-get install -y --no-install-recommends libreoffice-core libreoffice-writer
    sudo apt-get install -y jq wget curl gnupg-agent git ca-certificates apt-transport-https python3 python3-pip openssl-devel zip unzip tar nano gcc gcc-c++ make python3-dev build-essential software-properties-common

    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
    sudo apt -y update 
    sudo apt -y upgrade 
    sudo apt -y install docker-ce docker-ce-cli containerd.io

    # create docker group and add the root user to it, as root will be used to run the docker process
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

    sudo yum install libreoffice-base libreoffice-writer
  
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
    sudo yum install -y docker-ce docker-ce-cli containerd.io

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
sudo -H pip3 install wheel docker-compose
sudo -H pip3 install html2text jsoncsv detect

echo "Finished installing docker and utils.."