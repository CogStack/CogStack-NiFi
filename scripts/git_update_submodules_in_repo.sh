#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# Check before initialization so local edits are never carried into an upgrade.
# shellcheck disable=SC2016
git submodule foreach --recursive '
  if [ -n "$(git status --porcelain --untracked-files=normal --ignore-submodules=none)" ]; then
    echo "ERROR: $displaypath has local changes; commit or stash them before upgrading." >&2
    exit 1
  fi
'

"$repo_root/scripts/git_init_submodules_in_repo.sh"

echo "Updating submodules to latest release tag on each origin default branch (fallback: branch HEAD)..."

# Variables in this block are intentionally expanded by each submodule shell.
# shellcheck disable=SC2016
# Upgrade only direct dependencies. Nested submodules must stay at the commits
# recorded by each selected dependency release.
git submodule foreach '
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
    latest=$(git for-each-ref --merged "refs/remotes/origin/$default_branch" --sort=-version:refname --format="%(refname:strip=2)" refs/tags \
      | grep -Eiv "(^|[._/-])(alpha|beta|rc|pre|preview|snapshot)([0-9._-]*|$)" | head -n1 || true)

    if [ -z "$latest" ]; then
      latest=$(git for-each-ref --merged "refs/remotes/origin/$default_branch" --sort=-version:refname --format="%(refname:strip=2)" refs/tags | head -n1 || true)
    fi
  fi

  # Fallback for repositories where tags are not merged into the default branch.
  if [ -z "$latest" ]; then
    latest=$(git for-each-ref --sort=-version:refname --format="%(refname:strip=2)" refs/tags \
      | grep -Eiv "(^|[._/-])(alpha|beta|rc|pre|preview|snapshot)([0-9._-]*|$)" | head -n1 || true)
  fi
  if [ -z "$latest" ]; then
    latest=$(git for-each-ref --sort=-version:refname --format="%(refname:strip=2)" refs/tags | head -n1 || true)
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

  git submodule update --init --recursive --checkout
'

echo "Submodule upgrades are ready for review; nothing was staged or committed."
git diff --ignore-submodules=none --submodule=log
echo "After testing, stage the changed submodule paths and commit them explicitly."
