#!/usr/bin/env bash

################################################################
# 
# This script creates JAVA keystore with previously generated
#  keys and certificates
#

set -e

KEYSTORE_PASSWORD="cogstackNifi"

if [ -z "$1" ] || [ -z "$2" ]; then
	echo "Usage: $0 <cert_name> <jks_store> <password> | the password is optional"
	exit 1
fi

if [ -z "$3" ]; 
then
	echo "Password argument not set, setting it to $KEYSTORE_PASSWORD by default."
else
	KEYSTORE_PASSWORD=$3
fi

if [ ! -e "$1.pem" ] || [ ! -e "$1.key" ]; then
	echo "Error: $1.pem or $1.key file do not exist"
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

echo "Converting x509 Cert and Key to a pkcs12 file"
openssl pkcs12 -export -in "$1.pem" -inkey "$1.key" \
               -out "$1.p12" -name "$1" \
               -CAfile $CA_ROOT_CERT -passout pass:$KEYSTORE_PASSWORD

echo "Importing the pkcs12 file to a java keystore"

keytool -importkeystore -destkeystore "$2.jks" \
        -srckeystore "$1.p12" -srcstoretype PKCS12 -alias "$1" -srcstorepass $KEYSTORE_PASSWORD -deststorepass $KEYSTORE_PASSWORD -storepass $KEYSTORE_PASSWORD

echo "Importing TrustedCertEntry"
keytool -importcert -file $CA_ROOT_CERT -keystore "$2.jks" -deststorepass $KEYSTORE_PASSWORD -noprompt -storepass $KEYSTORE_PASSWORD 

echo "Checking which certificates are in a Java keystore"
keytool -list -v -keystore $2".jks" -noprompt -storepass $KEYSTORE_PASSWORD

echo "Creating truststore key"
keytool -import -file $1.pem -keystore $1-"truststore.key" -storepass $KEYSTORE_PASSWORD -noprompt