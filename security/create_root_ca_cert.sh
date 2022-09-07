#!/bin/bash

################################################################
# 
# This script generates the root CA key and certificate
#

set -e

if [[ -z "${CERTIFICATE_NAME}" ]]; then
    CERTIFICATE_NAME="root-ca"
    echo "CERTIFICATE_NAME not set, defaulting to CERTIFICATE_NAME=root-ca"
else
    CERTIFICATE_NAME=${CERTIFICATE_NAME}
fi

if [[ -z "${KEY_PASSWORD}" ]]; then
    KEY_PASSWORD="cogstackNifi"
    echo "KEY_PASSWORD not set, defaulting to KEY_PASSWORD=cogstackNifi"
else
    KEY_PASSWORD=${KEY_PASSWORD}
fi

if [[ -z "${SUBJ_LINE}" ]]; then
    SUBJ_LINE="/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=cogstack"
    echo "SUBJ_LINE not set, defaulting to SUBJ_LINE=/C=UK/ST=UK/L=UK/O=cogstack/OU=cogstack/CN=cogstack"
else
    SUBJ_LINE=${SUBJ_LINE}
fi

if [[ -z "${CERTIFICATE_ALIAS_NAME}" ]]; then
    CERTIFICATE_ALIAS_NAME=$CERTIFICATE_NAME
    echo "CERTIFICATE_ALIAS_NAME not set, defaulting to CERTIFICATE_ALIAS_NAME=$CERTIFICATE_NAME"
else
    CERTIFICATE_ALIAS_NAME=${CERTIFICATE_ALIAS_NAME}
fi

if [[ -z "${CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730
    echo "CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to CERTIFICATE_TIME_VAILIDITY_IN_DAYS=730"
else
    CERTIFICATE_TIME_VAILIDITY_IN_DAYS=${CERTIFICATE_TIME_VAILIDITY_IN_DAYS}
fi

CA_ROOT_CERT=$CERTIFICATE_NAME".pem"
CA_ROOT_KEY=$CERTIFICATE_NAME".key"

KEY_SIZE=4096

echo "Generating root CA key"
openssl genrsa -out $CA_ROOT_KEY $KEY_SIZE

echo "Generating root CA cert"
openssl req -x509 -new -key $CA_ROOT_KEY -sha256 -out $CA_ROOT_CERT -days $CERTIFICATE_TIME_VAILIDITY_IN_DAYS -subj $SUBJ_LINE

# create p12 version manually
echo "Generation pkcs12 keystore"
openssl pkcs12 -export -out root-ca.p12 -inkey root-ca.key -in root-ca.pem -passin pass:$KEY_PASSWORD -passout pass:$KEY_PASSWORD -name $CERTIFICATE_ALIAS_NAME
