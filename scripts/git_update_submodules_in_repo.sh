#!/bin/bash
set -e

git submodule update --init --recursive --depth 1

echo "🔄 Updating submodules to latest release tag on origin/main (fallback: HEAD of main)…"

git submodule foreach '
  set -e
  # fetch only main and tags, shallow + no blobs
  git fetch --no-recurse-submodules --force --depth=1 origin \
    +refs/heads/main:refs/remotes/origin/main
  git fetch --no-recurse-submodules --force --tags --depth=1 origin

  # pick newest tag that’s reachable from main; fallback to main head
  latest=$(git tag --merged origin/main --sort=-v:refname | head -n1 || true)

  if [ -n "${latest:-}" ]; then
    echo "→ $name: checkout tag $latest"
    git checkout -q --detach "tags/$latest"
  else
    echo "→ $name: checkout origin/main"
    git checkout -q --detach origin/main
  fi
'

#git submodule foreach git pull origin main
git add $(git config -f .gitmodules --get-regexp '^submodule\..*\.path$' | awk '{print $2}') || true
git commit -m "Update submodules to latest release tags (or main)" || echo "ℹ️ No changes to commit."
echo "✅ Submodule update complete."
