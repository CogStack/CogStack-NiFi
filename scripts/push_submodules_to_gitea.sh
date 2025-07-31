#!/bin/bash
set -e

# Configuration
# Adjust this to match your Git-EA org
GITEA_BASE=${GITEA_BASE:-"git@localhost:2222/cogstack/deployment-nifi.git"}
SUBMODULE_DIR="services"

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