#!/usr/bin/env bash

echo "This script must be run with root privileges."

os_distribution="$(exec ./detect_os.sh)"
echo "Found distribution: $os_distribution "

if [ "$os_distribution" == "debian" ] || [ "$os_distribution" == "ubuntu" ];
then
    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install -y postgresql-client
elif  [ "$os_distribution" == "redhat" ] || [ "$os_distribution" == "red hat" ] || [ "$os_distribution" == "centos" ]; 
then
    yum -y update && yum -y upgrade
    
    # install postgresql client
    sudo dnf -y module enable postgresql:12
    sudo dnf -y install postgresql

    sudo yum -y autoremove
else
    echo "No instructions given for distribution: $os_distribution" 
    exit 1
fi;

echo "Finished installing docker and utils.."