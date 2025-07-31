#!/bin/bash
set -e

GITEA_HOST=${GITEA_HOST:-"https://localhost:3000"}
# Configuration
# Adjust this to match your Git-EA org
GITEA_BASE=${GITEA_BASE:-"ssh://git@localhost:2222/cogstack/deployment-nifi.git"}
GITEA_USER=${GITEA_USER:-"admin"}
# this token is a sample, create yours
# navigate to https://localhost:3000/user/settings/applications/
GITEA_TOKEN=${GITEA_TOKEN:-"5f4cebe360c6bd883276f99540332287291bcc41"}
GITEA_SUBMODULE_DIR="services"

# Loop through each submodule
for path in $(git config --file .gitmodules --get-regexp path | awk '{ print $2 }'); do
  name=$(basename "$path")
  echo "🚀 Pushing $name ($path) to Git-EA..."

  cd "$path"

  # Set upstream (if not already set)
  if ! git remote get-url gitea >/dev/null 2>&1; then
    git remote add gitea "$GITEA_BASE/$name.git"
  fi

  # Push everything (branches, tags)
  git push --mirror gitea

  cd - > /dev/null
done