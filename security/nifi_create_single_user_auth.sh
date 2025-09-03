#!/usr/bin/env bash

# ==============================================================================
# 🔐 Set NiFi single-user credentials (inside Docker container)
#
# This script sets the NiFi single-user login credentials, typically used
# when NiFi is running in standalone secure mode.
#
# ⚠️ Intended to be run *within* the NiFi Docker container.
#     → Called by `nifi_init_create_user_auth.sh` from the host.
#
# Expects the following environment variables to be set:
#   - NIFI_SINGLE_USER_CREDENTIALS_USERNAME
#   - NIFI_SINGLE_USER_CREDENTIALS_PASSWORD
#   - NIFI_HOME (usually /opt/nifi/nifi-current)
#
# Usage:
#     Inside container only:
#     ./nifi_create_single_user_auth.sh
# ==============================================================================

set -euo pipefail

: "${NIFI_SINGLE_USER_CREDENTIALS_USERNAME:?Must be set}"
: "${NIFI_SINGLE_USER_CREDENTIALS_PASSWORD:?Must be set}"
: "${NIFI_HOME:?Must be set (NiFi installation root)}"

echo "🔐 Setting NiFi single-user credentials..."
"${NIFI_HOME}/bin/nifi.sh" set-single-user-credentials \
  "${NIFI_SINGLE_USER_CREDENTIALS_USERNAME}" \
  "${NIFI_SINGLE_USER_CREDENTIALS_PASSWORD}"

echo "✅ NiFi single-user credentials set successfully."
