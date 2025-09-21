#!/usr/bin/env bash

# ==========================================================================================
# 🔓 Unfreeze certs and OpenSearch config — re-enable Git tracking
#
# Usage:
#     ./unfreeze_certs.sh
#
# Only run if you intentionally want to commit new certs or update role templates.
# Otherwise, keep these frozen to avoid pull conflicts and accidental commits.
# ==========================================================================================

set -euo pipefail

echo "🔓 Unfreezing certificates and OpenSearch roles/internal_users configs..."

CERT_AND_CONFIG_PATHS=(
  "./security/certificates/root"
  "./security/certificates/elastic"
  "./security/certificates/nifi"
  "./security/es_roles"
)

for path in "${CERT_AND_CONFIG_PATHS[@]}"; do
  git ls-files -z "$path" 2>/dev/null | xargs -0 git update-index --no-skip-worktree || true
done

echo "✅ Unfreeze complete — Git will now track changes in all certs and role configs"
