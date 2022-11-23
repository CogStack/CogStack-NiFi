#!/bin/bash

set -e

NIFI_GID=${NIFI_GID:-1000}
NIFI_UID=${NIFI_UID:-1000}

docker build  --build-arg GID=${NIFI_GID} --build-arg UID=${NIFI_UID} -t cogstacksystems/cogstack-nifi:latest -f Dockerfile .