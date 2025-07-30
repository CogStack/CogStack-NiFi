#!/usr/bin/env bash

curl https://raw.githubusercontent.com/CogStack/CogStack-NiFi/refs/heads/main/deploy/general.env > ./env/general.env
curl https://raw.githubusercontent.com/CogStack/CogStack-NiFi/refs/heads/main/security/root-ca.key > ./security/root-ca.key
curl https://raw.githubusercontent.com/CogStack/CogStack-NiFi/refs/heads/main/security/root-ca.pem > ./security/root-ca.pem