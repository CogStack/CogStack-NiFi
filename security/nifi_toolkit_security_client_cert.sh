#!/usr/bin/env bash

set -e

NIFI_TOOLKIT_VERSION=${NIFI_VERSION:-"2.2.0"}

if [[ -z "${NIFI_TOOLKIT_VERSION}" ]]; then
    NIFI_TOOLKIT_VERSION=$NIFI_TOOLKIT_VERSION
    echo "NIFI_TOOLKIT_VERSION not set, getting default version, NIFI_TOOLKIT_VERSION=$NIFI_TOOLKIT_VERSION"
else
    NIFI_TOOLKIT_VERSION=${NIFI_TOOLKIT_VERSION}
fi

if [ ! -d "./nifi_toolkit" ]
then
    if [ ! -f ./nifi-toolkit-$NIFI_TOOLKIT_VERSION-bin.zip ]; then
        wget https://archive.apache.org/dist/nifi/$NIFI_TOOLKIT_VERSION/nifi-toolkit-$NIFI_TOOLKIT_VERSION-bin.zip
    fi
    unzip nifi-toolkit-$NIFI_TOOLKIT_VERSION-bin.zip
    mv nifi-toolkit-$NIFI_TOOLKIT_VERSION nifi_toolkit
    rm nifi-toolkit-$NIFI_TOOLKIT_VERSION-bin.zip
fi

# MORE INFO ON THE TOOLKIT : https://nifi.apache.org/docs/nifi-docs/components/nifi-docs/html/toolkit-guide.html#tls_toolkit
# The default value is 1460 days.

if [[ -z "${NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" ]]; then
    NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=1460
    echo "NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS not set, defaulting to NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=1460"
else
    NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=${NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS}
fi

# -k, --keySize <arg> Number of bits for generated keys (default: 2048)
KEY_SIZE=4096

# -n, --hostnames <arg> Comma separated list of hostnames i.e "server1,server2,localhost" etc.
HOSTNAMES="localhost"

OUTPUT_DIRECTORY="./nifi_certificates"

# -C,--clientCertDn <arg> Generate client certificate suitable for use in browser with specified DN (Can be specified multiple times)
# this should respect whatever is used to generate the other certificate with regards CN=nifi, this needs to match the HOSTNAME of the nifi container(s)
if [[ -z "${NIFI_SUBJ_LINE_CERTIFICATE_CN}" ]]; then
    NIFI_SUBJ_LINE_CERTIFICATE_CN="CN=cogstack, OU=cogstack, C=UK, ST=UK, L=UK, O=cogstack"
    echo "NIFI_SUBJ_LINE_CERTIFICATE_CN not set, defaulting to NIFI_SUBJ_LINE_CERTIFICATE_CN=CN=cogstack, OU=cogstack, C=UK, ST=UK, L=UK, O=cogstack"
else
    NIFI_SUBJ_LINE_CERTIFICATE_CN=${NIFI_SUBJ_LINE_CERTIFICATE_CN}
fi