#!/bin/bash
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

api_get()  { curl --silent --show-error "${CURL_TLS_ARGS[@]}" -H "Authorization: token ${GITEA_TOKEN}" "$1"; }
api_post() { curl --silent --show-error "${CURL_TLS_ARGS[@]}" -X POST -H "Authorization: token ${GITEA_TOKEN}" -H "Content-Type: application/json" "$1" --data-binary @-; }

# 1. check if the Organization exists, if not create it
echo "================================================================================================================================================="
echo "# 1. check if the Organization exists, if not create it"
echo "🔎 Checking if org '$GITEA_ORG' exists..."
if curl --silent --show-error "${CURL_TLS_ARGS[@]}" -H "Authorization: token $GITEA_TOKEN" \
   "$GITEA_HOST_URL/api/v1/orgs/$GITEA_ORG" | grep -q '"username"'; then
  echo "✅ Org '$GITEA_ORG' already exists — skipping creation."
else
  echo "🏢 Creating org '$GITEA_ORG'..."
  curl --silent --show-error "${CURL_TLS_ARGS[@]}" -X POST "$GITEA_HOST_URL/api/v1/orgs" \
    -H "Authorization: token $GITEA_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
          \"username\": \"$GITEA_ORG\",
          \"full_name\": \"$GITEA_ORG\",
          \"description\": \"Auto-created org for submodules\",
          \"visibility\": \"private\"
        }" \
    | grep -E '"id"|\"username\"' || { echo "❌ Failed to create org"; exit 1; }
  echo "✅ Org '$GITEA_ORG' created."
fi

# 2. Create the main repo if it doesn't exist
echo "================================================================================================================================================="
echo "# 2. Create the main repo if it doesn't exist"
echo "🔎 Check if main repo exists: ${GITEA_ORG}/${GITEA_MAIN_REPO_NAME}"
if ! api_get "${GITEA_API}/repos/${GITEA_ORG}/${GITEA_MAIN_REPO_NAME}" | grep -q '"full_name"'; then
  echo '{"name":"'"${GITEA_MAIN_REPO_NAME}"'","private":true}' | api_post "${GITEA_API}/orgs/${GITEA_ORG}/repos" >/dev/null
  echo "✅ created repo ${GITEA_MAIN_REPO_NAME}"
  # add as remote
  if git remote get-url $GITEA_DEFAULT_MAIN_REMOTE_NAME >/dev/null 2>&1; then
    git remote set-url $GITEA_DEFAULT_MAIN_REMOTE_NAME "$GITEA_BASE_URL"
  else
    git remote add $GITEA_DEFAULT_MAIN_REMOTE_NAME "$GITEA_BASE_URL"
  fi
else
  echo "✅ ${GITEA_MAIN_REPO_NAME} main repo exists"
  # still ensure remote exists/points correctly
  if git remote get-url $GITEA_DEFAULT_MAIN_REMOTE_NAME >/dev/null 2>&1; then
    git remote set-url $GITEA_DEFAULT_MAIN_REMOTE_NAME "$GITEA_BASE_URL"
  else
    git remote add $GITEA_DEFAULT_MAIN_REMOTE_NAME "$GITEA_BASE_URL"
  fi
fi

git config core.sshCommand "ssh -i $GITEA_LOCAL_KEY_PATH -o IdentitiesOnly=yes"

# 3. Create submodule repos if they don't exist
echo "================================================================================================================================================="
echo "# 3. Create submodule repos if they don't exist"
echo "==> Ensure org repos for submodules, keep original .gitmodules, add '$GITEA_DEFAULT_MAIN_REMOTE_NAME' remotes"

# ensure .gitmodules exists
[ -f .gitmodules ] || { echo "ℹ️ .gitmodules not found"; exit 0; }

# command to extract submodule paths
paths_cmd='git config -f .gitmodules --get-regexp "^submodule\..*\.path$" | awk "{print \$2}"'

# count
count=$(eval "$paths_cmd" | grep -v '^$' | wc -l | tr -d ' ')
[ "$count" -eq 0 ] && { echo "ℹ️ No submodules found in .gitmodules"; exit 0; }
echo "==> Found $count submodule(s):"
eval "$paths_cmd" | while IFS= read -r path; do
  printf ' - %s\n' "$path"
done

eval "$paths_cmd" | while IFS= read -r path; do
  [ -z "$path" ] && continue
  name="$(basename "$path")"
  gitea_url="${GITEA_NAMESPACE_URL}/${name}.git"
  echo "→ ${name}  (${path})"

  # 3.1 ensure org repo exists
  if ! api_get "${GITEA_API}/repos/${GITEA_ORG}/${name}" | grep -q '"full_name"'; then
    printf '{"name":"%s","private":true}\n' "$name" \
      | api_post "${GITEA_API}/orgs/${GITEA_ORG}/repos" >/dev/null
    echo "✅ created ${GITEA_ORG}/${name}"
  else
    echo "ℹ️ ${GITEA_ORG}/${name} exists"
  fi

  # 3.2 inside submodule: add/ensure 'gitea' remote; keep origin as original
  (
    set -e
    cd "$path" || { echo "   ❌ missing submodule dir: $path"; exit 1; }

    # ensure submodule also uses your SSH key (main repo already set above, but keep it explicit)
    git config core.sshCommand "ssh -i $GITEA_LOCAL_KEY_PATH -o IdentitiesOnly=yes"

    if git remote get-url $GITEA_DEFAULT_MAIN_REMOTE_NAME >/dev/null 2>&1; then
      git remote set-url $GITEA_DEFAULT_MAIN_REMOTE_NAME "$gitea_url"
    else
      git remote add $GITEA_DEFAULT_MAIN_REMOTE_NAME "$gitea_url"
    fi

    # make default pushes go to Gitea; fetch stays on origin (GitHub)
    if ! git remote -v | awk '$1=="origin"&&$2=="'"$gitea_url"'"&&$3=="(push)"{f=1}END{exit(!f)}'; then
      git remote set-url --add --push origin "$gitea_url"
    fi

    if git show-ref --quiet; then
      # unshallow if needed so server accepts updates
      if git rev-parse --is-shallow-repository | grep -q true; then
        git fetch --unshallow --tags || git fetch --depth=2147483647 --tags
      else
        git fetch --tags
      fi

      # avoid mirror pushes (which include refs/remotes/origin/*)
      git config --get-all remote.$GITEA_DEFAULT_MAIN_REMOTE_NAME.mirror >/dev/null 2>&1 && \
        git config --unset-all remote.$GITEA_DEFAULT_MAIN_REMOTE_NAME.mirror || true

      # push only local branches + tags
      echo "↗️ pushing branches & tags to $GITEA_DEFAULT_MAIN_REMOTE_NAME…"
      git push $GITEA_DEFAULT_MAIN_REMOTE_NAME --all
      git push $GITEA_DEFAULT_MAIN_REMOTE_NAME --tags
    else
      echo "ℹ️ no local refs; skip push"
    fi
  )
done

# 4. Push the main repo to gitea
echo "================================================================================================================================================="
echo "# 4. Pushing the main repo to $GITEA_DEFAULT_MAIN_REMOTE_NAME"
git push -u $GITEA_DEFAULT_MAIN_REMOTE_NAME HEAD:main

# 5. Verify submodules point/fetch/push as expected to gitea
echo "================================================================================================================================================="
echo "# 5. Verify submodules point/fetch/push as expected to $GITEA_DEFAULT_MAIN_REMOTE_NAME"
git submodule foreach 'echo $name; git remote -v'

# 6. Make sure SSH key is always used
echo "================================================================================================================================================="
echo "# 6. Make sure SSH key is always used"
git config core.sshCommand "ssh -i $GITEA_LOCAL_KEY_PATH -o IdentitiesOnly=yes"
git submodule foreach 'git config core.sshCommand "ssh -i $GITEA_LOCAL_KEY_PATH -o IdentitiesOnly=yes"'
