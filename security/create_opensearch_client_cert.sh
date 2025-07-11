#!/bin/bash

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#

set -e

OPENSEARCH_ES_CERTIFICATES_FOLDER="./es_certificates/opensearch/"

if [[ -z "${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS}" ]]; then
    ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS=1460
    echo "ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS not set, defaulting to ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS=1460"
else
    ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS=${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS}
fi

if [[ -z "${ES_CLIENT_CERT_NAME}" ]]; then
    ES_CLIENT_CERT_NAME="es_kibana_client"
    echo "ES_CLIENT_CERT_NAME not set, defaulting to ES_CLIENT_CERT_NAME=es_kibana_client"
else
    ES_CLIENT_CERT_NAME=${ES_CLIENT_CERT_NAME}
fi

if [[ -z "${ROOT_CERTIFICATE_NAME}" ]]; then
    ROOT_CERTIFICATE_NAME="root-ca"
    echo "ROOT_CERTIFICATE_NAME not set, defaulting to ROOT_CERTIFICATE_NAME=root-ca"
else
    ROOT_CERTIFICATE_NAME=${ROOT_CERTIFICATE_NAME}
fi

CA_ROOT_CERT="./root_certificates/"$ROOT_CERTIFICATE_NAME".pem"
CA_ROOT_KEY="./root_certificates/"$ROOT_CERTIFICATE_NAME".key"

if [ ! -e $CA_ROOT_CERT ]; then
	echo "Root CA certificate and key does not exist: $CA_ROOT_CERT , $CA_ROOT_KEY"
	exit 1
fi

if [[ -z "${ES_CLIENT_SUBJ_LINE}" ]]; then
    ES_CLIENT_SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=CLIENT"
    echo "ES_CLIENT_SUBJ_LINE not set, defaulting to ES_CLIENT_SUBJ_LINE=/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=CLIENT"
else
    ES_CLIENT_SUBJ_LINE=${ES_CLIENT_SUBJ_LINE}
fi

if [[ -z "${ES_CLIENT_SUBJ_ALT_NAMES}" ]]; then
    ES_CLIENT_SUBJ_ALT_NAMES="subjectAltName=DNS:kibana,DNS:elasticsearch-3,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-2,DNS:nifi,DNS:cogstack"
    echo "ES_CLIENT_SUBJ_ALT_NAMES not set, defaulting to ES_CLIENT_SUBJ_ALT_NAMES=subjectAltName=DNS:kibana,DNS:elasticsearch-3,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:nifi,DNS:cogstack"
else
    ES_CLIENT_SUBJ_ALT_NAMES=${ES_CLIENT_SUBJ_ALT_NAMES}
fi

if [[ -z "${ES_KEY_SIZE}" ]]; then
    ES_KEY_SIZE=4096
    echo "ES_KEY_SIZE not set, defaulting to ES_KEY_SIZE=4096"
else
    ES_KEY_SIZE=${ES_KEY_SIZE}
fi


echo "Generating a key for: $ES_CLIENT_CERT_NAME"
openssl genrsa -out "$ES_CLIENT_CERT_NAME.p12" $ES_KEY_SIZE

echo "Converting the key to PKCS 12"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$ES_CLIENT_CERT_NAME.p12" -topk8 -out "$ES_CLIENT_CERT_NAME.key" -nocrypt

echo "Generating the certificate ..."
openssl req -new -key "$ES_CLIENT_CERT_NAME.key" -out "$ES_CLIENT_CERT_NAME.csr" -subj $ES_CLIENT_SUBJ_LINE

# -config <(cat /etc/ssl/openssl.cnf <(printf "\nsubjectAltName=DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost"))

echo "Signing the certificate ..."
openssl x509 -req -days $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS -in "$ES_CLIENT_CERT_NAME.csr" -CA $CA_ROOT_CERT -CAkey $CA_ROOT_KEY -CAcreateserial -out "$ES_CLIENT_CERT_NAME.pem" -extensions v3_ca -extfile ./ssl-extensions-x509.cnf

#-extfile <(printf "\nsubjectAltName=DNS:esnode-1,DNS:esnode-2,DNS:elasticsearch-1,DNS:elasticsearch-2,DNS:elasticsearch-node-1,DNS:elasticsearch-node-2,DNS:elasticsearch-cogstack-node-2,DNS:elasticsearch-cogstack-node-1,DNS:localhost") 

chmod -R 755 "./$ES_CLIENT_CERT_NAME"*

mv "$ES_CLIENT_CERT_NAME"* $OPENSEARCH_ES_CERTIFICATES_FOLDER

