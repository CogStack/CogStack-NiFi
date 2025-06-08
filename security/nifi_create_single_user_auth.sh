#!/usr/bin/env bash

set -e

# required env var files
source ../deploy/general.env
source certificates_general.env
source certificates_nifi.env

if [ -n "${NIFI_SINGLE_USER_CREDENTIALS_USERNAME}" ] && [ -n "
    ${NIFI_SINGLE_USER_CREDENTIALS_PASSWORD}" ]; then
    ${NIFI_HOME}/bin/nifi.sh set-single-user-credentials "${NIFI_SINGLE_USER_CREDENTIALS_USERNAME}" "${NIFI_SINGLE_USER_CREDENTIALS_PASSWORD}"
fi
