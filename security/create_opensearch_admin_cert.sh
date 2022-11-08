#!/bin/bash

################################################################
# 
# This script creates the admin key and certificate that can 
#  be used by ElasticSearch
#

set -e

OPENSEARCH_ES_CERTIFICATES_FOLDER="./es_certificates/opensearch/"

if [[ -z "${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS}" ]]; then
    ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS=730
    echo "ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS not set, defaulting to ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS=730"
else
    ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS=$ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS
fi

if [[ -z "${ES_ADMIN_SUBJ_LINE}" ]]; then
    ES_ADMIN_SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=ADMIN"
    echo "ES_ADMIN_SUBJ_LINE not set, defaulting to ES_ADMIN_SUBJ_LINE=/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=ADMIN"
else
    ES_ADMIN_SUBJ_LINE=$ES_ADMIN_SUBJ_LINE
fi

if [[ -z "${ES_ADMIN_KEY_SIZE}" ]]; then
    ES_ADMIN_KEY_SIZE=4096
    echo "ES_ADMIN_KEY_SIZE not set, defaulting to ES_ADMIN_KEY_SIZE=4096"
else
    ES_ADMIN_KEY_SIZE=${ES_ADMIN_KEY_SIZE}
fi

# Admin cert
openssl genrsa -out admin-key-temp.pem $ES_KEY_SIZE
echo "Converting to PCKS8 key"
openssl pkcs8 -inform PEM -outform PEM -in admin-key-temp.pem -topk8 -nocrypt -v1 PBE-SHA1-3DES -out admin.key.pem
echo "Generating client cert"
openssl req -new -key admin.key.pem -subj $ES_ADMIN_SUBJ_LINE -out admin.csr
openssl x509 -req -in admin.csr -CA root-ca.pem -CAkey root-ca.key -CAcreateserial -sha256 -out admin.crt -days $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS

mv "./admin.crt" $OPENSEARCH_ES_CERTIFICATES_FOLDER
mv "./admin.csr" $OPENSEARCH_ES_CERTIFICATES_FOLDER
mv "./admin.key.pem" $OPENSEARCH_ES_CERTIFICATES_FOLDER
mv "./admin-key-temp.pem" $OPENSEARCH_ES_CERTIFICATES_FOLDER

chmod -R 755 "./es_certificates"