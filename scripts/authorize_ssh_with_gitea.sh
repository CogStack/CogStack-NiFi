#!/bin/bash
set -e

GITEA_HOST=${GITEA_HOST:-"https://localhost:3000"}
# Configuration
# Adjust this to match your Git-EA org
GITEA_BASE=${GITEA_BASE:-"ssh://git@localhost:2222/cogstack/deployment-nifi.git"}
GITEA_USER=${GITEA_USER:-"cogstack"}
# this token is a sample, create yours
# navigate to https://localhost:3000/user/settings/applications/
GITEA_TOKEN=${GITEA_TOKEN:-""}
GITEA_SUBMODULE_DIR="services"

KEY_PATH="$HOME/.ssh/id_rsa_gitea_cogstack"
PUB_KEY_PATH="$KEY_PATH.pub"
KEY_TITLE="gitea-cogstack-$(hostname)-$(date +%s)"

# 1. Generate SSH key if it doesn't exist
if [ ! -f "$KEY_PATH" ]; then
  echo "🔐 Generating SSH key..."
  ssh-keygen -t rsa -b 4096 -C "$GITEA_USER@localhost" -f "$KEY_PATH" -N ""
fi

# 2. Add it to the ssh-agent
eval "$(ssh-agent -s)"
ssh-add "$KEY_PATH"

# 3. Upload to Gitea via API
echo "🌐 Uploading SSH key to Gitea..."
curl -s -k -X POST "$GITEA_HOST/api/v1/user/keys" \
  -H "Authorization: token $GITEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "title": "$KEY_TITLE",
  "key": "$(cat "$PUB_KEY_PATH")"
}
EOF

echo "✅ SSH key uploaded as '$KEY_TITLE'"