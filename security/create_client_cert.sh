#!/bin/bash

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#

set -e

ES_CERTIFICATES_FOLDER="./es_certificates/"

CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730

if [ -z "$1" ]; then
	echo "Usage: $0 <cert_name>"
	exit 1
fi

CA_ROOT_CERT="root-ca.pem"
CA_ROOT_KEY="root-ca.key"

if [ ! -e $CA_ROOT_CERT ]; then
	echo "Root CA certificate and key does not exist: $CA_ROOT_CERT , $CA_ROOT_KEY"
	exit 1
fi

SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=$1/emailAddress=admin@cogstack.net"

echo "Generating a key for: $1"
openssl genrsa -out "$1-pkcs12.key" 4096

echo "Converting the key to PKCS 12"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$1-pkcs12.key" -topk8 -out "$1.key" -nocrypt

echo "Generating the certificate ..."
openssl req -new -key "$1.key" -out "$1.csr" -subj $SUBJ_LINE -config <(cat /etc/ssl/openssl.cnf <(printf "\nsubjectAltName=DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost"))

echo "Signing the certificate ..."
openssl x509 -req -extfile <(printf "\nsubjectAltName=DNS:esnode-1,DNS:esnode-2,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost") -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS -in "$1.csr" -CA $CA_ROOT_CERT -CAkey $CA_ROOT_KEY -CAcreateserial -out "$1.pem"

mv "$1-pkcs12.key" $ES_CERTIFICATES_FOLDER
mv "$1.key" $ES_CERTIFICATES_FOLDER
mv "$1.csr" $ES_CERTIFICATES_FOLDER
mv "$1.pem" $ES_CERTIFICATES_FOLDER
