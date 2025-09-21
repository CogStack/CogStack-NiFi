#!/usr/bin/env bash

# ==========================================================================================
# 🧊 Freeze all local certificates and OpenSearch config from Git tracking
#
# Usage:
#     ./freeze_certs.sh
#
# Prevents Git from showing diffs, pull conflicts, or accidental commits for:
#   - Root CA certs (./security/root)
#   - NiFi certs (./security/nifi)
#   - OpenSearch/Elastic certs (./security/elastic)
#   - OpenSearch/Elastic internal roles/users (./security/es_roles)
#
# This is meant for local or per-deployment certs/configs that should not interfere
# with shared Git history. Safe to run multiple times.
# ==========================================================================================

set -euo pipefail

echo "🧊 Freezing certificates and Elastic/OpenSearch roles/internal_users configs from Git tracking..."

CERT_AND_CONFIG_PATHS=(
  "./security/certificates/root"
  "./security/certificates/elastic"
  "./security/certificates/nifi"
  "./security/es_roles"
)

for path in "${CERT_AND_CONFIG_PATHS[@]}"; do
  git ls-files -z "$path" 2>/dev/null | xargs -0 git update-index --skip-worktree || true
done

echo "✅ Freeze complete — all sensitive or deployment-specific files are now ignored by Git"