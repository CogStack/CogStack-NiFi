#!/bin/bash
set -e

# Config
GITEA_API="https://localhost:3000/api/v1"
GITEA_TOKEN="${GITEA_TOKEN:?GITEA_TOKEN is required}"
GITEA_ORG="cogstack"

echo "🚀 Creating Gitea repos for all submodules..."

for path in $(git config --file .gitmodules --get-regexp path | awk '{ print $2 }'); do
  name=$(basename "$path")

  echo "📦 Creating repo: $name"
  curl -k -s -X POST "$GITEA_API/orgs/$GITEA_ORG/repos" \
    -H "Authorization: token $GITEA_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"'"$name"'", "private":true}'
done

echo "✅ All submodule repos created on Gitea."