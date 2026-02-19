#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

git submodule update --init --recursive

echo "Updating submodules to latest release tag on each origin default branch (fallback: branch HEAD)..."

git submodule foreach --recursive '
  set -e

  # Fetch full branch refs + tag refs so tag selection is reliable.
  git fetch --no-recurse-submodules --prune origin \
    "+refs/heads/*:refs/remotes/origin/*" \
    "+refs/tags/*:refs/tags/*"

  default_branch=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed "s@^origin/@@")
  if [ -z "$default_branch" ]; then
    if git show-ref --verify --quiet refs/remotes/origin/main; then
      default_branch=main
    elif git show-ref --verify --quiet refs/remotes/origin/master; then
      default_branch=master
    else
      default_branch=$(git for-each-ref --sort=-committerdate --format="%(refname:strip=3)" refs/remotes/origin | head -n1 || true)
    fi
  fi

  latest=""
  if [ -n "$default_branch" ] && git show-ref --verify --quiet "refs/remotes/origin/$default_branch"; then
    latest=$(git for-each-ref --merged "refs/remotes/origin/$default_branch" --sort=-creatordate --format="%(refname:strip=2)" refs/tags \
      | grep -Eiv "(^|[._/-])(alpha|beta|rc|pre|preview|snapshot)([0-9._-]*|$)" | head -n1 || true)

    if [ -z "$latest" ]; then
      latest=$(git for-each-ref --merged "refs/remotes/origin/$default_branch" --sort=-creatordate --format="%(refname:strip=2)" refs/tags | head -n1 || true)
    fi
  fi

  # Fallback for repositories where tags are not merged into the default branch.
  if [ -z "$latest" ]; then
    latest=$(git for-each-ref --sort=-creatordate --format="%(refname:strip=2)" refs/tags \
      | grep -Eiv "(^|[._/-])(alpha|beta|rc|pre|preview|snapshot)([0-9._-]*|$)" | head -n1 || true)
  fi
  if [ -z "$latest" ]; then
    latest=$(git for-each-ref --sort=-creatordate --format="%(refname:strip=2)" refs/tags | head -n1 || true)
  fi

  if [ -n "$latest" ]; then
    echo "-> $name: checkout tag $latest"
    git checkout -q --detach "refs/tags/$latest"
  elif [ -n "$default_branch" ]; then
    echo "-> $name: no tags found, checkout origin/$default_branch"
    git checkout -q --detach "refs/remotes/origin/$default_branch"
  else
    echo "-> $name: no tags/branches found; keeping current commit"
  fi
'

#git submodule foreach git pull origin main
git add $(git config -f .gitmodules --get-regexp '^submodule\..*\.path$' | awk '{print $2}') || true
git commit -m "Update submodules to latest release tags (or default branch)" || echo "ℹ️ No changes to commit."
echo "✅ Submodule update complete."

# fix jupyter-hub cookie file permissions
for f in \
  "../services/cogstack-jupyter-hub/config/jupyterhub_cookie_secret" \
  "services/cogstack-jupyter-hub/config/jupyterhub_cookie_secret"
do

    [ -f "$f" ] && chmod 500 "$f" && echo "Fixing jupyter-hub cookie secret file permissions. $f"
done

exec "$@"
