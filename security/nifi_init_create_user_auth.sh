#!/bin/bash

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
# ⚠️ Must be run from the root of the CogStack-NiFi repository.
#
# Usage:
#     ./nifi_init_create_user_auth.sh
# ==============================================================================

set -euo pipefail

echo "🧹 Removing any existing 'cogstack-nifi' container..."
docker container rm -f $(docker ps -a -q --filter name="cogstack-nifi*") || true

echo "🚀 Starting NiFi container (for credential injection)..."
docker compose --project-directory ../deploy -f ../deploy/services.yml up -d nifi

echo "🔐 Setting NiFi single-user credentials from inside the container..."
docker exec -it cogstack-nifi \
  /bin/bash /opt/nifi/nifi-current/security_scripts/nifi_create_single_user_auth.sh

echo "🧼 Removing temporary NiFi container..."
docker container rm -f $(docker ps -a -q --filter name="cogstack-nifi*") || true

echo "✅ NiFi single-user credential setup completed."
