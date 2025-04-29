#!/bin/bash

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#

set -e

OPENSEARCH_FOLDER="./es_certificates/opensearch/"
ES_CERTIFICATES_FOLDER=$OPENSEARCH_FOLDER"elasticsearch"

if [[ -z "${ES_CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    ES_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
    echo "ES_CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to ES_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730"
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
CA_ROOT_KEYSTORE=$ROOT_CERTIFICATE_NAME".p12"

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
    ES_NODE_SUBJ_LINE=${ES_NODE_SUBJ_LINE}"/CN=$1"
fi

if [[ -z "${ES_NODE_SUBJ_ALT_NAMES}" ]]; then
    ES_NODE_SUBJ_ALT_NAMES="subjectAltName=DNS:$1,DNS:elasticsearch-cogstack-node-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:nifi,DNS:cogstack"
    echo "ES_NODE_SUBJ_ALT_NAMES not set, defaulting to ES_NODE_SUBJ_ALT_NAMES=subjectAltName=DNS:$1,DNS:elasticsearch-cogstack-node-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:nifi,DNS:cogstack"
	echo "The DNS end must always contain DNS:$1"
else
    ES_NODE_SUBJ_ALT_NAMES="subjectAltName=DNS:$1,"${ES_NODE_SUBJ_ALT_NAMES}
fi

# IMPRTANT: this is used in StandardSSLContextService controllers on the NiFi side, trusted keystore password field.
if [[ -z "${ES_CERTIFICATE_PASSWORD}" ]]; then
    ES_CERTIFICATE_PASSWORD="cogstackNifi"
    echo "ES_CERTIFICATE_PASSWORD not set, defaulting to ES_CERTIFICATE_PASSWORD=cogstackNifi"
else
    ES_CERTIFICATE_PASSWORD=${ES_CERTIFICATE_PASSWORD}
fi

if [[ -z "${ES_KEY_SIZE}" ]]; then
    ES_KEY_SIZE=4096
    echo "ES_KEY_SIZE not set, defaulting to ES_KEY_SIZE=4096"
else
    ES_KEY_SIZE=${ES_KEY_SIZE}
fi

echo "Generating a key for: $1"
openssl genrsa -out "$1.p12" $ES_KEY_SIZE

echo "Converting the key to PKCS 12"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$1.p12" -topk8 -out "$1.key" -nocrypt 

echo "Generating the certificate ..."
openssl req -new -key "$1.key" -out "$1.csr" -subj $ES_NODE_SUBJ_LINE -addext $ES_NODE_SUBJ_ALT_NAMES  #-new -newkey rsa:$ES_KEY_SIZE -key "$1.key" -out "$1.csr" -subj $ES_NODE_SUBJ_LINE -addext $ES_NODE_SUBJ_ALT_NAMES 

#openssl req -new -key "$1.key" -out "$1.csr" -subj $SUBJ_LINE -addext $SUBJ_ALT_NAMES

echo "Signing the certificate ..."
openssl x509 -req -days $ES_CERTIFICATE_TIME_VAILIDITY_IN_DAYS -in "$1.csr" -out "$1.crt" -CA $CA_ROOT_CERT -CAkey $CA_ROOT_KEY -CAcreateserial  -extensions v3_ca -extfile ./ssl-extensions-x509.cnf

#-extfile <(printf "\nsubjectAltName=DNS:esnode-1,DNS:esnode-2,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost") 

echo "Creating keystore"
bash create_keystore.sh $1 $1"-keystore"

mkdir -p $ES_CERTIFICATES_FOLDER/$1

mv $1* $ES_CERTIFICATES_FOLDER/$1

# copy the original root-ca certificates and rename them to match the ES native naming convention
output_file_name="elastic-stack-ca"

if [ -f "$CA_ROOT_KEY" ] || [ -f "$CA_ROOT_CERT"] | [ -f "$CA_ROOT_KEYSTORE"]; then
    echo "$ROOT_CERTIFICATE_NAME files found."
    echo "Copying and renaming root-ca.* certs to elastic-stack-ca"
    ELASTICSEARCH_ROOT_CERTIFICATE_NAME="elastic-stack-ca"
    cp ./$CA_ROOT_KEY $OPENSEARCH_FOLDER && mv $OPENSEARCH_FOLDER"$CA_ROOT_KEY" $OPENSEARCH_FOLDER"$ELASTICSEARCH_ROOT_CERTIFICATE_NAME.key.pem"
    cp ./$CA_ROOT_CERT $OPENSEARCH_FOLDER && mv $OPENSEARCH_FOLDER"$CA_ROOT_CERT" $OPENSEARCH_FOLDER"$ELASTICSEARCH_ROOT_CERTIFICATE_NAME.crt.pem"
    cp ./$CA_ROOT_KEYSTORE $OPENSEARCH_FOLDER && mv $OPENSEARCH_FOLDER"$CA_ROOT_KEYSTORE" $OPENSEARCH_FOLDER"$ELASTICSEARCH_ROOT_CERTIFICATE_NAME.p12"
else 
    echo "One of the following files: $CA_ROOT_KEY,$CA_ROOT_CERT,$CA_ROOT_KEYSTORE don't exist. Please create them by executing the 'create_root_ca_cert.sh' file from this folder."
fi


chmod -R 755 "./$ES_CERTIFICATES_FOLDER"
