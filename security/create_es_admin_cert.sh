#!/bin/bash

################################################################
# 
# This script creates the admin key and certificate that can 
#  be used by ElasticSearch
#

set -e

ES_CERTIFICATES_FOLDER="./es_certificates/opensearch/"

if [[ -z "${CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
    echo "CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730"
else
    ES_SUBJ_LINE=$CERTIFICATE_TIME_VAILIDITY_IN_DAYS
fi

if [[ -z "${ES_SUBJ_LINE}" ]]; then
    ES_SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=ADMIN"
    echo "ES_SUBJ_LINE not set, defaulting to ES_SUBJ_LINE=/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=ADMIN"
else
    ES_SUBJ_LINE=$ES_SUBJ_LINE
fi

KEY_SIZE=4096

# Admin cert
openssl genrsa -out admin-key-temp.pem $KEY_SIZE
echo "Converting to PCKS8 key"
openssl pkcs8 -inform PEM -outform PEM -in admin-key-temp.pem -topk8 -nocrypt -v1 PBE-SHA1-3DES -out admin-key.pem
echo "Generating client cert"
openssl req -new -key admin-key.pem -subj $ES_SUBJ_LINE -out admin.csr
openssl x509 -req -in admin.csr -CA root-ca.pem -CAkey root-ca.key -CAcreateserial -sha256 -out admin.pem -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS

mv "./admin.pem" $ES_CERTIFICATES_FOLDER
mv "./admin.csr" $ES_CERTIFICATES_FOLDER
mv "./admin-key.pem" $ES_CERTIFICATES_FOLDER
mv "./admin-key-temp.pem" $ES_CERTIFICATES_FOLDER