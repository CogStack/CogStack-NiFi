#!/bin/bash
set -e

GITEA_ENV_FILE="./deploy/gitea.env"

if [ -f "$GITEA_ENV_FILE" ]; then
  echo "📦 Loading environment from $GITEA_ENV_FILE"f
  set -a
  source "$GITEA_ENV_FILE"
  set +a
else
  echo "⚠️  $GITEA_ENV_FILE not found — attempting to load from ../deploy/gitea.env"
  set -a
  source ".$GITEA_ENV_FILE"
  set +a
fi

git submodule foreach "
  git fetch origin --tags
  git pull --ff-only origin $(git rev-parse --abbrev-ref HEAD || echo main)
  git push $GITEA_DEFAULT_MAIN_REMOTE_NAME --all; git push $GITEA_DEFAULT_MAIN_REMOTE_NAME --tags
"
