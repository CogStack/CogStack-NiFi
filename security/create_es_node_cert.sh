#!/bin/bash

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#

set -e

ES_CERTIFICATES_FOLDER="./es_certificates/"

if [[ -z "${CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
    echo "CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730"
fi

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

# The SUBJECT LINE is important, the CN (Company Name) should be the docker service container name, this is used for host VERIFICATION afterwards (see kibana/config/kibana_*.yml)
if [[ -z "${ES_NODE_SUBJ_LINE}" ]]; then
    ES_NODE_SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=$1"
    echo "ES_NODE_SUBJ_LINE not set, defaulting to ES_NODE_SUBJ_LINE=/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=$1"
	echo "The CN at the end must always contain CN=$1"
fi

if [[ -z "${ES_NODE_SUBJ_ALT_NAMES}" ]]; then
    ES_NODE_SUBJ_ALT_NAMES="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=$1"
    echo "ES_NODE_SUBJ_ALT_NAMES not set, defaulting to ES_NODE_SUBJ_ALT_NAMES=subjectAltName=DNS:$1,DNS:elasticsearch-cogstack-node-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:nifi,DNS:cogstack"
	echo "The DNS end must always contain DNS:$1"
fi

# IMPRTANT: this is used in StandardSSLContextService controllers on the NiFi side, trusted keystore password field.
if [[ -z "${KEY_PASSWORD}" ]]; then
    KEY_PASSWORD="cogstackNifi"
    echo "KEY_PASSWORD not set, defaulting to KEY_PASSWORD=cogstackNifi"
fi

KEY_SIZE=4096

echo "Generating a key for: $1"
openssl genrsa -out "$1-pkcs12.key" $KEY_SIZE

echo "Converting the key to PKCS 12"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$1-pkcs12.key" -topk8 -out "$1.key" -nocrypt 

echo "Generating the certificate ..."
openssl req -new -key "$1.key" -out "$1.csr" -subj $SUBJ_LINE -addext $SUBJ_ALT_NAMES


echo "Signing the certificate ..."
openssl x509 -req -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS -in "$1.csr" -CA $CA_ROOT_CERT -CAkey $CA_ROOT_KEY -CAcreateserial -out "$1.pem" -extensions v3_ca -extfile ./ssl-extensions-x509.cnf

#-extfile <(printf "\nsubjectAltName=DNS:esnode-1,DNS:esnode-2,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost") 

echo "Creating keystore"
bash create_keystore.sh $1 $1"-keystore"

mv "./$1"* $ES_CERTIFICATES_FOLDER

chmod -R 755 "./$ES_CERTIFICATES_FOLDER"
