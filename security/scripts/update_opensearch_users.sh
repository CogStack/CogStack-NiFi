#!/usr/bin/env bash

# ==============================================================================
# Update OpenSearch internal user password hashes from env vars.
#
# Usage:
#     ./update_opensearch_users.sh <opensearch_container_name> [--apply] [--skip-securityadmin]
#
# Notes:
#     - Reads users from ../es_roles/opensearch/internal_users.yml.
#     - Reads passwords from ../env/users_elasticsearch.env.
#     - Generates bcrypt hashes with OpenSearch's own hash.sh inside the container.
#     - Uses securityadmin.sh so reserved users such as "admin" are included.
#     - securityadmin.sh with "-f ... -t internalusers" overwrites the internal
#       users config in the security index. It does not update roles or mappings.
#
# Password env var resolution:
#     - admin: ELASTIC_PASSWORD by default, with ADMIN_PASSWORD override support.
#     - kibanaserver: KIBANA_PASSWORD when KIBANA_USER=kibanaserver.
#     - built-in demo users: ES_LOGSTASH_PASS, ES_KIBANARO_PASS,
#       ES_READALL_PASS, ES_SNAPSHOTRESTORE_PASS.
#     - any other user: <USERNAME>_PASSWORD, uppercased with non-alphanumerics
#       converted to underscores. Example: new-user -> NEW_USER_PASSWORD.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECURITY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SECURITY_DIR}/.." && pwd)"

SECURITY_ENV_FOLDER="${SECURITY_DIR}/env"
INTERNAL_USERS_YML="${SECURITY_DIR}/es_roles/opensearch/internal_users.yml"

usage() {
  cat <<USAGE
Usage: $0 <opensearch_container_name> [--apply] [--skip-securityadmin]

Options:
  --apply                 Patch internal_users.yml and apply it with securityadmin.sh.
  --skip-securityadmin    Patch internal_users.yml but do not push it to the cluster.
  -h, --help              Show this help.

By default this runs in dry-run mode: it validates password env vars and generates
hashes, but it does not write files or apply cluster changes.
USAGE
}

source_env_files() {
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/deploy/elasticsearch.env"
  # shellcheck disable=SC1091
  source "${SECURITY_ENV_FOLDER}/certificates_elasticsearch.env"
  # shellcheck disable=SC1091
  source "${SECURITY_ENV_FOLDER}/certificates_general.env"
  # shellcheck disable=SC1091
  source "${SECURITY_ENV_FOLDER}/users_elasticsearch.env"
}

configure_opensearch_paths() {
  HASH_TOOL="${OPENSEARCH_HASH_TOOL:-/usr/share/opensearch/plugins/opensearch-security/tools/hash.sh}"
  SECURITYADMIN_TOOL="${OPENSEARCH_SECURITYADMIN_TOOL:-/usr/share/opensearch/plugins/opensearch-security/tools/securityadmin.sh}"
  CONTAINER_INTERNAL_USERS_YML="${OPENSEARCH_INTERNAL_USERS_YML:-/usr/share/opensearch/config/opensearch-security/internal_users.yml}"
  SECURITYADMIN_HOST="${OPENSEARCH_SECURITYADMIN_HOST:-localhost}"
  SECURITYADMIN_PORT="${OPENSEARCH_SECURITYADMIN_PORT:-9200}"
  SECURITYADMIN_CA_CERT="${OPENSEARCH_SECURITYADMIN_CA_CERT:-/usr/share/opensearch/config/root-ca.crt}"
  SECURITYADMIN_CERT="${OPENSEARCH_SECURITYADMIN_CERT:-/usr/share/opensearch/config/admin.crt}"
  SECURITYADMIN_KEY="${OPENSEARCH_SECURITYADMIN_KEY:-/usr/share/opensearch/config/admin.key.pem}"
}

normalize_user_for_env() {
  printf '%s' "$1" | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9_]/_/g'
}

password_candidates_for_user() {
  local user="$1"
  local normalized
  normalized="$(normalize_user_for_env "$user")"

  if [[ "${KIBANA_USER:-}" == "$user" ]]; then
    printf '%s\n' "KIBANA_PASSWORD ${normalized}_PASSWORD"
    return
  fi

  if [[ "${INGEST_SERVICE_USER:-}" == "$user" ]]; then
    printf '%s\n' "INGEST_SERVICE_PASSWORD ${normalized}_PASSWORD"
    return
  fi

  if [[ "${METRICBEAT_USER:-}" == "$user" ]]; then
    printf '%s\n' "METRICBEAT_PASSWORD ${normalized}_PASSWORD"
    return
  fi

  if [[ "${FILEBEAT_USER:-}" == "$user" ]]; then
    printf '%s\n' "FILEBEAT_PASSWORD ${normalized}_PASSWORD"
    return
  fi

  case "$user" in
    admin)
      printf '%s\n' "ADMIN_PASSWORD OPENSEARCH_ADMIN_PASSWORD ELASTIC_PASSWORD OPENSEARCH_INITIAL_ADMIN_PASSWORD ${normalized}_PASSWORD"
      ;;
    cogstack_user|cogstack_pipeline|nifi)
      printf '%s\n' "INGEST_SERVICE_PASSWORD ${normalized}_PASSWORD"
      ;;
    logstash)
      printf '%s\n' "ES_LOGSTASH_PASS LOGSTASH_PASSWORD ${normalized}_PASSWORD"
      ;;
    kibanaro)
      printf '%s\n' "ES_KIBANARO_PASS KIBANARO_PASSWORD ${normalized}_PASSWORD"
      ;;
    readall)
      printf '%s\n' "ES_READALL_PASS READALL_PASSWORD ${normalized}_PASSWORD"
      ;;
    snapshotrestore)
      printf '%s\n' "ES_SNAPSHOTRESTORE_PASS SNAPSHOTRESTORE_PASSWORD ${normalized}_PASSWORD"
      ;;
    *)
      printf '%s\n' "${normalized}_PASSWORD"
      ;;
  esac
}

resolve_password_var() {
  local user="$1"
  local candidates
  local var_name

  RESOLVED_PASSWORD_VAR=""
  RESOLVED_PASSWORD_VALUE=""

  candidates="$(password_candidates_for_user "$user")"
  for var_name in $candidates; do
    if [[ -n "${!var_name:-}" ]]; then
      RESOLVED_PASSWORD_VAR="$var_name"
      RESOLVED_PASSWORD_VALUE="${!var_name}"
      return 0
    fi
  done

  return 1
}

list_internal_users() {
  awk '
    /^[[:alnum:]_][[:alnum:]_-]*:[[:space:]]*$/ {
      user = $1
      sub(/:$/, "", user)
      if (user != "_meta") {
        print user
      }
    }
  ' "$INTERNAL_USERS_YML"
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "ERROR: Required command not found: $command_name" >&2
    exit 1
  fi
}

generate_hash() {
  local container_name="$1"
  local password="$2"
  local raw_output
  local hash

  if ! raw_output="$(docker exec "$container_name" "$HASH_TOOL" -p "$password")"; then
    echo "ERROR: Failed to run OpenSearch hash.sh in container '$container_name'." >&2
    exit 1
  fi
  hash="$(printf '%s\n' "$raw_output" | awk '/^\$2[aby]\$/ { value = $0 } END { if (value != "") print value; else exit 1 }')"

  if [[ -z "$hash" ]]; then
    echo "ERROR: Failed to parse bcrypt hash from OpenSearch hash.sh output." >&2
    exit 1
  fi

  printf '%s\n' "$hash"
}

replace_user_hash() {
  local user="$1"
  local hash="$2"
  local file="$3"
  local tmpfile

  tmpfile="$(mktemp)"

  if ! awk -v target_user="$user" -v new_hash="$hash" '
    BEGIN {
      in_target_user = 0
      replaced = 0
    }
    /^[^[:space:]#][^:]*:[[:space:]]*$/ {
      current_user = $1
      sub(/:$/, "", current_user)
      in_target_user = (current_user == target_user)
    }
    in_target_user && /^[[:space:]]*hash:[[:space:]]*/ {
      match($0, /^[[:space:]]*/)
      indent = substr($0, RSTART, RLENGTH)
      print indent "hash: \"" new_hash "\""
      replaced = 1
      next
    }
    {
      print
    }
    END {
      if (replaced == 0) {
        exit 2
      }
    }
  ' "$file" > "$tmpfile"; then
    rm -f "$tmpfile"
    echo "ERROR: Could not replace hash for user '$user' in $file" >&2
    exit 1
  fi

  mv "$tmpfile" "$file"
}

apply_with_securityadmin() {
  local container_name="$1"
  local securityadmin_cmd

  securityadmin_cmd=(
    docker exec "$container_name" "$SECURITYADMIN_TOOL"
    -f "$CONTAINER_INTERNAL_USERS_YML"
    -t internalusers
    -icl
    -nhnv
    -h "$SECURITYADMIN_HOST"
    -p "$SECURITYADMIN_PORT"
    -cacert "$SECURITYADMIN_CA_CERT"
    -cert "$SECURITYADMIN_CERT"
    -key "$SECURITYADMIN_KEY"
  )

  if [[ -n "${OPENSEARCH_SECURITYADMIN_KEYPASS:-}" ]]; then
    securityadmin_cmd+=(-keypass "$OPENSEARCH_SECURITYADMIN_KEYPASS")
  fi

  "${securityadmin_cmd[@]}"
}

main() {
  local container_name=""
  local apply=false
  local run_securityadmin=true
  local arg
  local users
  local user
  local missing_vars=""
  local hash_file
  local hash
  local backup_file

  while [[ $# -gt 0 ]]; do
    arg="$1"
    case "$arg" in
      --apply)
        apply=true
        ;;
      --skip-securityadmin)
        run_securityadmin=false
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      -*)
        echo "ERROR: Unknown option: $arg" >&2
        usage
        exit 1
        ;;
      *)
        if [[ -n "$container_name" ]]; then
          echo "ERROR: Multiple container names supplied: '$container_name' and '$arg'" >&2
          usage
          exit 1
        fi
        container_name="$arg"
        ;;
    esac
    shift
  done

  if [[ -z "$container_name" ]]; then
    usage
    exit 1
  fi

  if [[ "$run_securityadmin" == false && "$apply" == false ]]; then
    echo "ERROR: --skip-securityadmin is only meaningful with --apply." >&2
    exit 1
  fi

  source_env_files
  configure_opensearch_paths
  require_command docker

  if [[ ! -f "$INTERNAL_USERS_YML" ]]; then
    echo "ERROR: Missing internal users file: $INTERNAL_USERS_YML" >&2
    exit 1
  fi

  users="$(list_internal_users)"
  if [[ -z "$users" ]]; then
    echo "ERROR: No users found in $INTERNAL_USERS_YML" >&2
    exit 1
  fi

  echo "Validating password env vars for users in $INTERNAL_USERS_YML"
  for user in $users; do
    if resolve_password_var "$user"; then
      echo "  $user -> $RESOLVED_PASSWORD_VAR"
    else
      missing_vars="${missing_vars}
  $user -> expected one of: $(password_candidates_for_user "$user")"
    fi
  done

  if [[ -n "$missing_vars" ]]; then
    echo "" >&2
    echo "ERROR: Missing password env vars in ${SECURITY_ENV_FOLDER}/users_elasticsearch.env:" >&2
    echo "$missing_vars" >&2
    exit 1
  fi

  hash_file="$(mktemp)"
  trap 'rm -f "$hash_file"' EXIT

  echo ""
  echo "Generating password hashes with $HASH_TOOL in container: $container_name"
  for user in $users; do
    resolve_password_var "$user"
    hash="$(generate_hash "$container_name" "$RESOLVED_PASSWORD_VALUE")"
    printf '%s\t%s\n' "$user" "$hash" >> "$hash_file"
    echo "  generated hash for $user"
  done

  if [[ "$apply" == false ]]; then
    echo ""
    echo "Dry run complete. Re-run with --apply to update internal_users.yml and apply the internal users config."
    exit 0
  fi

  backup_file="${INTERNAL_USERS_YML}.bak.$(date +%Y%m%d%H%M%S)"
  cp "$INTERNAL_USERS_YML" "$backup_file"
  echo ""
  echo "Backed up $INTERNAL_USERS_YML to $backup_file"

  while IFS="$(printf '\t')" read -r user hash; do
    replace_user_hash "$user" "$hash" "$INTERNAL_USERS_YML"
    echo "  updated hash for $user"
  done < "$hash_file"

  echo "Updated password hashes in $INTERNAL_USERS_YML"

  if [[ "$run_securityadmin" == true ]]; then
    echo ""
    echo "Applying internal users config with securityadmin.sh"
    apply_with_securityadmin "$container_name"
    echo "OpenSearch internal users updated."
  else
    echo "Skipped securityadmin.sh. The YAML file has been updated, but the running cluster has not."
  fi
}

main "$@"
