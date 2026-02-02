#!/usr/bin/env bash

set -euo pipefail

# Support being run from any directory.
SCRIPT_SOURCE="${BASH_SOURCE[0]-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="${1:-services.yml}"
if [[ "$COMPOSE_FILE" != /* ]]; then
  if [[ "$COMPOSE_FILE" == services*.yml ]]; then
    COMPOSE_FILE="deploy/$COMPOSE_FILE"
  fi
  COMPOSE_PATH="$REPO_ROOT/$COMPOSE_FILE"
else
  COMPOSE_PATH="$COMPOSE_FILE"
fi

if [ ! -f "$COMPOSE_PATH" ]; then
  echo "Compose file not found: $COMPOSE_PATH" >&2
  exit 1
fi

if [ "${SKIP_EXPORT_ENV:-}" != "1" ]; then
  set -a
  source "$REPO_ROOT/deploy/export_env_vars.sh"
  set +a
fi

docker compose -f "$COMPOSE_PATH" run --rm --no-deps --user root --entrypoint bash -T nifi-registry-flow \
  -c 'chown -R nifi:nifi /opt/nifi-registry/nifi-registry-current/{database,flow_storage,work,logs}'
