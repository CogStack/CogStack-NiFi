#!/bin/bash

################################################################
# 
# This script generates the root CA key and certificate
#

set -e

CA_ROOT_CERT="root-ca.pem"
CA_ROOT_KEY="root-ca.key"

echo "Generating root CA key"
openssl genrsa -out $CA_ROOT_KEY 2048

echo "Generating root CA cert"
openssl req -x509 -new -key $CA_ROOT_KEY -sha256 -out $CA_ROOT_CERT
