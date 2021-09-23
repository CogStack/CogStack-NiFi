#!/usr/bin/env bash

if [ ! -d "./nifi_toolkit" ] 
then
    wget https://dlcdn.apache.org/nifi/1.14.0/nifi-toolkit-1.14.0-bin.tar.gz
    tar xvfz nifi-toolkit-1.14.0-bin.tar.gz 
    mv nifi-toolkit-1.14.0 nifi_toolkit
    rm nifi-toolkit-1.14.0-bin.tar.gz 
fi

bash nifi_toolkit/bin/tls-toolkit.sh standalone -n "localhost"
