#!/usr/bin/env bash

# ==============================================================================
# 🔐 Initialize NiFi Single-User Authentication (from host)
#
# Compatibility helper for older published images. Rebuilt images apply the
# configured credentials automatically at startup. This helper only updates and
# restarts the running NiFi service; it never deletes NiFi or proxy containers.
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

compose=(docker compose --project-directory "$DEPLOY_DIR" -f "$DEPLOY_DIR/services.yml")
# Expand these variables inside the container, not in the host shell.
# shellcheck disable=SC2016
"${compose[@]}" exec -T nifi /bin/bash -ec \
  '"${NIFI_HOME}/bin/nifi.sh" set-single-user-credentials "${NIFI_SINGLE_USER_CREDENTIALS_USERNAME:?}" "${NIFI_SINGLE_USER_CREDENTIALS_PASSWORD:?}"'
"${compose[@]}" restart nifi
echo "NiFi credentials updated. Rebuilt images apply these settings automatically."
