#!/bin/bash

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#

set -e

ES_CERTIFICATES_FOLDER="./es_certificates/"

CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730

CLIENT_CERT_NAME="es_kibana_client"

CA_ROOT_CERT="root-ca.pem"
CA_ROOT_KEY="root-ca.key"

if [ ! -e $CA_ROOT_CERT ]; then
	echo "Root CA certificate and key does not exist: $CA_ROOT_CERT , $CA_ROOT_KEY"
	exit 1
fi

SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=CLIENT"
SUBJ_ALT_NAMES="subjectAltName=DNS:kibana,DNS:elasticsearch-cogstack-node-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:nifi,DNS:cogstack"

echo "Generating a key for: $CLIENT_CERT_NAME"
openssl genrsa -out "$CLIENT_CERT_NAME-pkcs12.key" 4096

echo "Converting the key to PKCS 12"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$CLIENT_CERT_NAME-pkcs12.key" -topk8 -out "$CLIENT_CERT_NAME.key" -nocrypt

echo "Generating the certificate ..."
openssl req -new -key "$CLIENT_CERT_NAME.key" -out "$CLIENT_CERT_NAME.csr" -subj $SUBJ_LINE

# -config <(cat /etc/ssl/openssl.cnf <(printf "\nsubjectAltName=DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost"))

echo "Signing the certificate ..."
openssl x509 -req -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS -in "$CLIENT_CERT_NAME.csr" -CA $CA_ROOT_CERT -CAkey $CA_ROOT_KEY -CAcreateserial -out "$CLIENT_CERT_NAME.pem" -extensions v3_ca -extfile ./ssl-extensions-x509.cnf

#-extfile <(printf "\nsubjectAltName=DNS:esnode-1,DNS:esnode-2,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost") 

mv "$CLIENT_CERT_NAME"* $ES_CERTIFICATES_FOLDER

