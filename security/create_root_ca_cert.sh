#!/bin/bash

################################################################
# 
# This script generates the root CA key and certificate
#

set -e

CA_ROOT_CERT="root-ca.pem"
CA_ROOT_KEY="root-ca.key"

CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=cogstack"

KEY_SIZE=4096
KEY_PASSWORD="cogstackNifi"

echo "Generating root CA key"
openssl genrsa -out $CA_ROOT_KEY $KEY_SIZE

echo "Generating root CA cert"
openssl req -x509 -new -key $CA_ROOT_KEY -sha256 -out $CA_ROOT_CERT -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS -subj $SUBJ_LINE

# create p12 version manually
openssl pkcs12 -export -out root-ca.p12 -inkey root-ca.key -in root-ca.pem -passin pass:$KEY_PASSWORD -passout pass:$KEY_PASSWORD
