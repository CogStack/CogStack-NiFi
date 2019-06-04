#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
	echo "Usage: $0 <cert_name> <jks_store>"
	exit 1
fi

if [ ! -e "$1.pem" ] || [ ! -e "$1.key" ]; then
	echo "Error: $1.pem or $1.key file do not exist"
	exit 1
fi

CA_ROOT_CERT="root-ca.pem"
CA_ROOT_KEY="root-ca.key"

echo "Converting x509 Cert and Key to a pkcs12 file"
openssl pkcs12 -export -in "$1.pem" -inkey "$1.key" \
               -out "$1.p12" -name "$1" \
               -CAfile $CA_ROOT_CERT

echo "Importing the pkcs12 file to a java keystore"
keytool -importkeystore -destkeystore "$2.jks" \
        -srckeystore "$1.p12" -srcstoretype PKCS12 -alias "$1"

echo "Importing TrustedCertEntry"
keytool -importcert -file $CA_ROOT_CERT -keystore "$2.jks"

echo "Checking which certificates are in a Java keystore"
keytool -list -v -keystore "$2.jks"​
