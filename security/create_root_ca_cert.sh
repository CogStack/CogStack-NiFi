#!/bin/bash

################################################################
# 
# This script generates the root CA key and certificate
#

set -e

# required env var files
source ../deploy/general.env
source certificates_general.env

if [[ -z "${ROOT_CERTIFICATE_NAME}" ]]; then
    ROOT_CERTIFICATE_NAME="root-ca"
    echo "ROOT_CERTIFICATE_NAME not set, defaulting to ROOT_CERTIFICATE_NAME=root-ca"
else
    ROOT_CERTIFICATE_NAME=${ROOT_CERTIFICATE_NAME}
fi

if [[ -z "${ROOT_CERTIFICATE_KEY_PASSWORD}" ]]; then
    ROOT_CERTIFICATE_KEY_PASSWORD="cogstackNifi"
    echo "ROOT_CERTIFICATE_KEY_PASSWORD not set, defaulting to ROOT_CERTIFICATE_KEY_PASSWORD=cogstackNifi"
else
    ROOT_CERTIFICATE_KEY_PASSWORD=${ROOT_CERTIFICATE_KEY_PASSWORD}
fi

if [[ -z "${ROOT_CERTIFICATE_SUBJ_LINE}" ]]; then
    ROOT_CERTIFICATE_SUBJ_LINE="/CN=cogstack/OU=NIFI/C=UK/ST=UK/L=UK/O=cogstack"
    echo "ROOT_CERTIFICATE_SUBJ_LINE not set, defaulting to ROOT_CERTIFICATE_SUBJ_LINE=CN=cogstack/OU=NIFI/C=UK/ST=UK/L=UK/O=cogstack"
else
    ROOT_CERTIFICATE_SUBJ_LINE=${ROOT_CERTIFICATE_SUBJ_LINE}
fi

if [[ -z "${ROOT_CERTIFICATE_SUBJ_ALT_NAMES}" ]]; then
    ROOT_CERTIFICATE_SUBJ_ALT_NAMES="subjectAltName=DNS:cogstack-net.test"
    echo "ROOT_CERTIFICATE_SUBJ_ALT_NAMES not set, defaulting to ROOT_CERTIFICATE_SUBJ_ALT_NAMES=subjectAltName=DNS:cogstack-net.test"
else
    ROOT_CERTIFICATE_SUBJ_ALT_NAMES=${ROOT_CERTIFICATE_SUBJ_ALT_NAMES}
fi

if [[ -z "${ROOT_CERTIFICATE_ALIAS_NAME}" ]]; then
    ROOT_CERTIFICATE_ALIAS_NAME=$ROOT_CERTIFICATE_NAME
    echo "ROOT_CERTIFICATE_ALIAS_NAME not set, defaulting to ROOT_CERTIFICATE_ALIAS_NAME=$ROOT_CERTIFICATE_NAME"
else
    ROOT_CERTIFICATE_ALIAS_NAME=${ROOT_CERTIFICATE_ALIAS_NAME}
fi

if [[ -z "${ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=1460
    echo "ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=1460"
else
    ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=${ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS}
fi

if [[ -z "${ROOT_CERTIFICATE_KEY_SIZE}" ]]; then
    ROOT_CERTIFICATE_KEY_SIZE=4096
    echo "ROOT_CERTIFICATE_KEY_SIZE not set, defaulting to ROOT_CERTIFICATE_KEY_SIZE=4096"
else
    ROOT_CERTIFICATE_KEY_SIZE=${ROOT_CERTIFICATE_KEY_SIZE}
fi

CA_ROOT_CERT_FILE_NAME=$ROOT_CERTIFICATE_NAME".pem"
CA_ROOT_KEY_FILE_NAME=$ROOT_CERTIFICATE_NAME".key"
CA_ROOT_KEYSTORE_FILE_NAME=$ROOT_CERTIFICATE_NAME".p12"
CA_ROOT_CERT_509_FILE_NAME=$ROOT_CERTIFICATE_NAME".crt"
CA_ROOT_CERT_CSR_FILE_NAME=$ROOT_CERTIFICATE_NAME".csr"
CA_ROOT_CERT_KEYSTORE_FILE_NAME=$ROOT_CERTIFICATE_NAME"-keystore.jks"
CA_ROOT_CERT_TRUSTSTORE_FILE_NAME=$ROOT_CERTIFICATE_NAME"-truststore.jks"

echo "Generating root CA key"
openssl genrsa -out $CA_ROOT_KEY_FILE_NAME $ROOT_CERTIFICATE_KEY_SIZE

echo "Generating root CA cert"
openssl req -x509 -new -key $CA_ROOT_KEY_FILE_NAME -sha256 -out $CA_ROOT_CERT_FILE_NAME -days $ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS -subj $ROOT_CERTIFICATE_SUBJ_LINE -addext $ROOT_CERTIFICATE_SUBJ_ALT_NAMES 

echo "Generating root CA .crt file"
openssl x509 -outform der -in $CA_ROOT_CERT_FILE_NAME -out $CA_ROOT_CERT_509_FILE_NAME

echo "Generating root CA.csr file"
openssl req -key $CA_ROOT_KEY_FILE_NAME -new -out $CA_ROOT_CERT_CSR_FILE_NAME -subj $ROOT_CERTIFICATE_SUBJ_LINE -addext $ROOT_CERTIFICATE_SUBJ_ALT_NAMES 

# create p12 version manually
echo "Generating pkcs12 keystore"
openssl pkcs12 -export -out $CA_ROOT_KEYSTORE_FILE_NAME -inkey $CA_ROOT_KEY_FILE_NAME -in $CA_ROOT_CERT_FILE_NAME -passin pass:$ROOT_CERTIFICATE_KEY_PASSWORD -passout pass:$ROOT_CERTIFICATE_KEY_PASSWORD -name $ROOT_CERTIFICATE_ALIAS_NAME

echo "Convert keystore pkcs12 to JKS"
keytool -importkeystore -srckeystore $CA_ROOT_KEYSTORE_FILE_NAME -srcstoretype PKCS12 -destkeystore $CA_ROOT_CERT_KEYSTORE_FILE_NAME -deststoretype jks -srcstorepass $ROOT_CERTIFICATE_KEY_PASSWORD -deststorepass $ROOT_CERTIFICATE_KEY_PASSWORD -srcalias $ROOT_CERTIFICATE_ALIAS_NAME -destalias $ROOT_CERTIFICATE_ALIAS_NAME -srckeypass $ROOT_CERTIFICATE_KEY_PASSWORD -destkeypass $ROOT_CERTIFICATE_KEY_PASSWORD

echo "Create JKS truststore"
keytool -importcert -keystore $CA_ROOT_CERT_TRUSTSTORE_FILE_NAME -storetype JKS -alias $ROOT_CERTIFICATE_ALIAS_NAME -file $CA_ROOT_CERT_509_FILE_NAME -srckeypass $ROOT_CERTIFICATE_KEY_PASSWORD -deststorepass $ROOT_CERTIFICATE_KEY_PASSWORD -noprompt

mkdir -p ./root_certificates

mv -v "./${ROOT_CERTIFICATE_NAME}-"* "./root_certificates/"
mv -v "./${ROOT_CERTIFICATE_NAME}."* "./root_certificates/"

echo "Root CA certificate and key files have been generated and moved to ./root_certificates/"
