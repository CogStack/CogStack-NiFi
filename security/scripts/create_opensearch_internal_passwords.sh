#!/usr/bin/env bash

# ==============================================================================
# 🔐 Generate OpenSearch internal user password hashes using container
#
# Usage:
#     ./create_opensearch_internal_passwords.sh <es_container_name> [--apply]
#
# Requires:
#     - ../../deploy/elasticsearch.env
#     - ../env/certificates_elasticsearch.env
#     - ../env/users_elasticsearch.env
#
# Produces:
#     - Two hashes (admin + kibanaserver) printed to stdout
#     - Optionally updates: ./es_roles/opensearch/internal_users.yml
#
# ==============================================================================

set -euo pipefail


SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"

ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root_certificates/"

OPENSEARCH_ES_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}es_certificates/opensearch/"

# required env var files
source ../../deploy/elasticsearch.env
source "${SECURITY_ENV_FOLDER}certificates_elasticsearch.env"
source "${SECURITY_ENV_FOLDER}users_elasticsearch.env"

# === Validate input ===
if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "❌ Usage: $0 <es_container_name> [--apply]"
  exit 1
fi

# Validate required passwords
: "${ES_ADMIN_PASS:?Must be set in elasticsearch_users.env}"
: "${ES_KIBANA_PASS:?Must be set in elasticsearch_users.env}"

ES_CONTAINER_NAME="$1"

APPLY=${2:-}

INTERNAL_USERS_YML="./es_roles/opensearch/internal_users.yml"
BACKUP_YML="${INTERNAL_USERS_YML}.bak"

# === Generate hashes ===
echo "🔐 Generating password hashes from container: $ES_CONTAINER_NAME"

# connect to the container and generate hashes
ES_ADMIN_HASH=$( docker exec "$ES_CONTAINER_NAME" /bin/sh /usr/share/opensearch/plugins/opensearch-security/tools/hash.sh -p "$ES_ADMIN_PASS" )
ES_KIBANA_HASH=$( docker exec "$ES_CONTAINER_NAME" /bin/sh /usr/share/opensearch/plugins/opensearch-security/tools/hash.sh -p "$ES_KIBANA_PASS" )

echo ""
echo "--------------------------------"
echo "user:     \"admin\""
echo "password: \"$ES_ADMIN_PASS\""
echo "hash:     \"$ES_ADMIN_HASH\""
echo "--------------------------------"
echo "user:     \"kibanaserver\""
echo "password: \"$ES_KIBANA_PASS\""
echo "hash:     \"$ES_KIBANA_HASH\""
echo "--------------------------------"
echo "✅ Now apply these hashes manually in 'internal_users.yml'"

# === Patch YAML if --apply is given ===
if [[ "$APPLY" == "--apply" ]]; then
  echo "📁 Backing up $INTERNAL_USERS_YML to $BACKUP_YML"
  cp "$INTERNAL_USERS_YML" "$BACKUP_YML"

  echo "🛠️  Replacing hashes in $INTERNAL_USERS_YML..."

  tmpfile=$(mktemp)
  sed \
    -e "/^admin:/,/^ *roles:/ s|^\( *hash: \).*|  hash: \"$ES_ADMIN_HASH\"|" \
    -e "/^kibanaserver:/,/^ *roles:/ s|^\( *hash: \).*|  hash: \"$ES_KIBANA_HASH\"|" \
    "$BACKUP_YML" > "$tmpfile"

  mv "$tmpfile" "$INTERNAL_USERS_YML"

  echo "✅ Password hashes updated in $INTERNAL_USERS_YML"
else
  echo "📝 Skipping YAML patch — run with '--apply' to inject into internal_users.yml"
fi
