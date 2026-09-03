#!/usr/bin/env bash

# ==============================================================================
# 🔐 Initialize NiFi Single-User Authentication (from host)
#
# This script:
#   1. Starts the `cogstack-nifi` container (detached)
#   2. Executes the single-user credential setup script inside the container
#   3. Deletes the container afterward
#
# ⚠️ Assumes that the following environment variables are injected into
#     the container via `users_nifi.env` or equivalent:
#     - NIFI_SINGLE_USER_CREDENTIALS_USERNAME
#     - NIFI_SINGLE_USER_CREDENTIALS_PASSWORD
#
# Usage:
#     bash security/scripts/nifi_init_create_user_auth.sh
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
DEPLOY_DIR="${REPO_ROOT}/deploy"

# Load the repository's existing Docker and security .env files so Compose
# interpolation behaves the same way as the deploy/Makefile targets.
# shellcheck disable=SC1091
source "${DEPLOY_DIR}/export_env_vars.sh"

remove_existing_nifi_containers() {
  local container_id
  local -a container_ids=()

  while IFS= read -r container_id; do
    if [[ -n "$container_id" ]]; then
      container_ids+=("$container_id")
    fi
  done < <(docker ps -a -q --filter name="cogstack-nifi*")

  if (( ${#container_ids[@]} > 0 )); then
    docker container rm -f "${container_ids[@]}"
  fi
}

echo "🧹 Removing any existing 'cogstack-nifi' container..."
remove_existing_nifi_containers

echo "🚀 Starting NiFi container (for credential injection)..."
docker compose --project-directory "${DEPLOY_DIR}" -f "${DEPLOY_DIR}/services.yml" up -d nifi

echo "🔐 Setting NiFi single-user credentials from inside the container..."
docker exec cogstack-nifi \
  /bin/bash /opt/nifi/nifi-current/security_scripts/nifi_create_single_user_auth.sh

echo "🧼 Removing temporary NiFi container..."
remove_existing_nifi_containers

echo "✅ NiFi single-user credential setup completed."
