#!/bin/bash

################################################################
# 
# This script creates the admin key and certificate that can 
#  be used by ElasticSearch
#

set -e

ES_CERTIFICATES_FOLDER="./es_certificates/"

CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730

SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=ADMIN"

# Admin cert
openssl genrsa -out admin-key-temp.pem 4096
echo "Converting to PCKS8 key"
openssl pkcs8 -inform PEM -outform PEM -in admin-key-temp.pem -topk8 -nocrypt -v1 PBE-SHA1-3DES -out admin-key.pem
echo "Generating client cert"
openssl req -new -key admin-key.pem -subj $SUBJ_LINE -out admin.csr
openssl x509 -req -in admin.csr -CA root-ca.pem -CAkey root-ca.key -CAcreateserial -sha256 -out admin.pem -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS

mv "./admin.pem" $ES_CERTIFICATES_FOLDER
mv "./admin.csr" $ES_CERTIFICATES_FOLDER
mv "./admin-key.pem" $ES_CERTIFICATES_FOLDER
mv "./admin-key-temp.pem" $ES_CERTIFICATES_FOLDER