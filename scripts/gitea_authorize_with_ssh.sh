#!/bin/bash
# shellcheck disable=SC1090 # Environment file location is selected at runtime.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GITEA_ENV_FILE="./deploy/gitea.env"

if [ -f "$GITEA_ENV_FILE" ]; then
  echo "📦 Loading environment from $GITEA_ENV_FILE"
  set -a
  source "$GITEA_ENV_FILE"
  set +a
else
  echo "⚠️  $GITEA_ENV_FILE not found — attempting to load from ../deploy/gitea.env"
  set -a
  source ".$GITEA_ENV_FILE"
  set +a
fi

CURL_TLS_ARGS=()
if [[ "$GITEA_HOST_URL" == https://* ]]; then
  GITEA_CA_CERT="${GITEA_CA_CERT:-${REPO_ROOT}/security/certificates/root/root-ca.pem}"
  if [[ ! -r "$GITEA_CA_CERT" ]]; then
    echo "❌ Gitea CA certificate is not readable: $GITEA_CA_CERT" >&2
    exit 1
  fi
  CURL_TLS_ARGS=(--cacert "$GITEA_CA_CERT")
fi

# 1. Generate SSH key if it doesn't exist
echo "================================================================================================================================================="
echo "# 1. Generate SSH key if it doesn't exist"

# Clean up stale host fingerprints for Gitea SSH
ssh-keygen -R "[127.0.0.1]:2222" >/dev/null 2>&1 || true
ssh-keygen -R "[localhost]:2222" >/dev/null 2>&1 || true

if [ ! -f "$GITEA_LOCAL_KEY_PATH" ]; then
  echo "🔐 Generating SSH key..."
  ssh-keygen -t rsa -b 4096 -C "$GITEA_USER@localhost" -f "$GITEA_LOCAL_KEY_PATH" -N ""
fi

if [ -f "$GITEA_LOCAL_KEY_PATH" ]; then
  if ssh-add -l | grep -q "$GITEA_LOCAL_KEY_PATH"; then
    ssh-add -d "$GITEA_LOCAL_KEY_PATH"
    echo "🗑️ Removed SSH key from agent: $GITEA_LOCAL_KEY_PATH"
  else
    echo "ℹ️ SSH key not loaded in agent: $GITEA_LOCAL_KEY_PATH"
  fi
else
  echo "❌ SSH key file not found: $GITEA_LOCAL_KEY_PATH"
fi


# 2. Add it to the ssh-agent
echo "================================================================================================================================================="
echo "# 2. Add it to the ssh-agent"
eval "$(ssh-agent -s)"
ssh-add "$GITEA_LOCAL_KEY_PATH"

# 3. Upload to Gitea via API
echo "================================================================================================================================================="
echo "# 3. Upload to Gitea via API"

echo "🌐 Uploading SSH key to Gitea..."
curl --silent --show-error "${CURL_TLS_ARGS[@]}" -X POST "$GITEA_HOST_URL/api/v1/user/keys" \
  -H "Authorization: token $GITEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "title": "$GITEA_LOCAL_KEY_TITLE",
  "key": "$(cat "$GITEA_LOCAL_PUB_KEY_PATH")"
}
EOF

echo "✅ SSH key uploaded as '$GITEA_LOCAL_KEY_TITLE'"
