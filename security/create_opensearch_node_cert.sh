#!/bin/bash

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#

set -e

ES_CERTIFICATES_FOLDER="./es_certificates/opensearch/elasticsearch"

if [[ -z "${CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
    echo "CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730"
fi

if [ -z "$1" ]; then
	echo "Usage: $0 <cert_name>"
	exit 1
fi

if [[ -z "${ROOT_CERTIFICATE_NAME}" ]]; then
    ROOT_CERTIFICATE_NAME="root-ca"
    echo "ROOT_CERTIFICATE_NAME not set, defaulting to ROOT_CERTIFICATE_NAME=root-ca"
else
    ROOT_CERTIFICATE_NAME=${ROOT_CERTIFICATE_NAME}
fi

CA_ROOT_CERT=$ROOT_CERTIFICATE_NAME".pem"
CA_ROOT_KEY=$ROOT_CERTIFICATE_NAME".key"

if [ ! -e $CA_ROOT_CERT ]; then
	echo "Root CA certificate and key does not exist: $CA_ROOT_CERT , $CA_ROOT_KEY"
	exit 1
fi

# The SUBJECT LINE is important, the CN (Company Name) should be the docker service container name, this is used for host VERIFICATION afterwards (see kibana/config/kibana_*.yml)
if [[ -z "${ES_NODE_SUBJ_LINE}" ]]; then
    ES_NODE_SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=$1"
    echo "ES_NODE_SUBJ_LINE not set, defaulting to ES_NODE_SUBJ_LINE=/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=$1"
	echo "The CN at the end must always contain CN=$1"
else
    ES_NODE_SUBJ_LINE=${ES_NODE_SUBJ_LINE}
fi

if [[ -z "${ES_NODE_SUBJ_ALT_NAMES}" ]]; then
    ES_NODE_SUBJ_ALT_NAMES="subjectAltName=DNS:$1,DNS:elasticsearch-cogstack-node-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:nifi,DNS:cogstack"
    echo "ES_NODE_SUBJ_ALT_NAMES not set, defaulting to ES_NODE_SUBJ_ALT_NAMES=subjectAltName=DNS:$1,DNS:elasticsearch-cogstack-node-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:nifi,DNS:cogstack"
	echo "The DNS end must always contain DNS:$1"
else
    ES_NODE_SUBJ_ALT_NAMES=${ES_NODE_SUBJ_ALT_NAMES}
fi

# IMPRTANT: this is used in StandardSSLContextService controllers on the NiFi side, trusted keystore password field.
if [[ -z "${KEY_PASSWORD}" ]]; then
    KEY_PASSWORD="cogstackNifi"
    echo "KEY_PASSWORD not set, defaulting to KEY_PASSWORD=cogstackNifi"
else
    KEY_PASSWORD=${KEY_PASSWORD}
fi

KEY_SIZE=4096

echo "Generating a key for: $1"
openssl genrsa -out "$1-pkcs12.key" $KEY_SIZE

echo "Converting the key to PKCS 12"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$1-pkcs12.key" -topk8 -out "$1.key" -nocrypt 

echo "Generating the certificate ..."
openssl req -new -key "$1.key" -out "$1.csr" -subj $ES_NODE_SUBJ_LINE -addext $ES_NODE_SUBJ_ALT_NAMES  #-new -newkey rsa:$KEY_SIZE -key "$1.key" -out "$1.csr" -subj $ES_NODE_SUBJ_LINE -addext $ES_NODE_SUBJ_ALT_NAMES 

#openssl req -new -key "$1.key" -out "$1.csr" -subj $SUBJ_LINE -addext $SUBJ_ALT_NAMES

echo "Signing the certificate ..."
openssl x509 -req -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS -in "$1.csr" -out "$1.pem" -CA $CA_ROOT_CERT -CAkey $CA_ROOT_KEY -CAcreateserial  -extensions v3_ca -extfile ./ssl-extensions-x509.cnf

#-extfile <(printf "\nsubjectAltName=DNS:esnode-1,DNS:esnode-2,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost") 

echo "Creating keystore"
bash create_keystore.sh $1 $1"-keystore"

mkdir -p $ES_CERTIFICATES_FOLDER/$1

mv $1* $ES_CERTIFICATES_FOLDER/$1

chmod -R 755 "./$ES_CERTIFICATES_FOLDER"
