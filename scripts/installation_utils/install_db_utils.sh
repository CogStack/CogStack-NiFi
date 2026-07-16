#!/usr/bin/env bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install -y postgresql-client
elif  [ "$os_distribution" == "redhat" ] || [ "$os_distribution" == "red hat" ] || [ "$os_distribution" == "centos" ]; 
then
    sudo yum -y update && sudo yum -y upgrade
    
    # install postgresql client
    sudo dnf -y module enable postgresql:12
    sudo dnf -y install postgresql

    sudo yum -y autoremove
else
    echo "No instructions given for distribution: $os_distribution" 
    exit 1
fi;

echo "Finished installing database utilities.."
