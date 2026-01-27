#!/bin/bash

set -e

NIFI_GID=${NIFI_GID:-1000}
NIFI_UID=${NIFI_UID:-1000}

if [[ $NIFI_UID == 1000 ]]; then
    NIFI_UID=$(id -u)
fi

if [[ $NIFI_GID == 1000 ]]; then
    NIFI_GID=$(id -g)
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

docker build --build-arg GID=${NIFI_GID} \
  --build-arg UID=${NIFI_UID} \
  -t cogstacksystems/cogstack-nifi:latest \
  -f "$SCRIPT_DIR/Dockerfile" \
  "$REPO_ROOT"
