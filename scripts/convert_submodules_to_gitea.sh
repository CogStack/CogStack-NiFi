#!/bin/bash
set -e

# Configuration
# Adjust this to match your Git-EA org
GITEA_BASE=${GITEA_BASE:-"git@localhost:2222/cogstack/deployment-nifi.git"}

echo "🔧 Rewriting submodule URLs in .gitmodules..."

for path in $(git config --file .gitmodules --get-regexp path | awk '{ print $2 }'); do
  name=$(basename "$path")
  new_url="$GITEA_BASE/$name.git"
  echo "🔁 $name → $new_url"

  git config -f .gitmodules submodule."$path".url "$new_url"
  git submodule sync -- "$path"
done

git add .gitmodules
git commit -m "Rewrite submodule URLs to use Git-EA"