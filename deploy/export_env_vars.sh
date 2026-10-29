#!/usr/bin/env bash
# Source selected configuration without changing the caller's shell options.

_cogstack_load_environment() {
  local loader_path
  if [[ -n "${ZSH_VERSION:-}" ]]; then
    # The expression is evaluated only by zsh; Bash uses BASH_SOURCE below.
    eval 'loader_path=${(%):-%x}'
  else
    loader_path="${BASH_SOURCE[0]}"
  fi
  local deploy_path
  deploy_path="$(cd "$(dirname "$loader_path")" && pwd)" || return 1
  # shellcheck disable=SC1091
  source "$deploy_path/config_files.sh" || return 1
  cogstack_config_init "$(cd "$deploy_path/.." && pwd)" || return 1

  local relative_files=(
    security/env/certificates_nifi.env
    security/env/certificates_general.env
    security/env/certificates_elasticsearch.env
    security/env/users_elasticsearch.env
    security/env/users_database.env
    security/env/users_nifi.env
    security/env/users_nginx.env
    deploy/general.env
    deploy/nifi.env
    deploy/elasticsearch.env
    deploy/ollama.env
    deploy/sglang.env
    deploy/openwebui.env
    deploy/database.env
    deploy/network_settings.env
    deploy/project.env
    deploy/gitea.env
    deploy/nginx.env
    deploy/telemetry.env
  )
  local relative_file selected_file variable_name file_name
  local restore_allexport=1
  case "$-" in *a*) restore_allexport=0 ;; esac
  set -a
  for relative_file in "${relative_files[@]}"; do
    selected_file="$(cogstack_env_file "$relative_file")" || {
      if [[ "$restore_allexport" == 1 ]]; then set +a; fi
      return 1
    }
    file_name="${relative_file##*/}"
    variable_name="COGSTACK_$(printf '%s' "${file_name%.env}" | tr '[:lower:]' '[:upper:]')_ENV_FILE"
    export "$variable_name=$selected_file"
    # shellcheck disable=SC1090
    source "$selected_file" || {
      echo "ERROR: Failed to load configuration: $selected_file" >&2
      if [[ "$restore_allexport" == 1 ]]; then set +a; fi
      return 1
    }
  done

  # Service-owned configuration remains optional and uses its own directories.
  local service_files=(
    services/cogstack-platform/apps/cogstack-jupyter-hub/env/jupyter.env
    services/cogstack-platform/apps/ocr-service/env/ocr_service.env
    services/cogstack-nlp/medcat-service/env/app.env
    services/cogstack-nlp/medcat-service/env/medcat.env
    services/cogstack-nlp/medcat-trainer/envs/env-prod
  )
  for relative_file in "${service_files[@]}"; do
    selected_file="$COGSTACK_REPO_ROOT/$relative_file"
    if [[ -f "$selected_file" ]]; then
      # shellcheck disable=SC1090
      source "$selected_file" || {
        echo "ERROR: Failed to load service configuration: $selected_file" >&2
        if [[ "$restore_allexport" == 1 ]]; then set +a; fi
        return 1
      }
    fi
  done
  export DOLLAR='$'
  if [[ "$restore_allexport" == 1 ]]; then set +a; fi
  echo "Configuration loaded from ${COGSTACK_CONFIG_DIR:-repository defaults}."
}

if _cogstack_load_environment; then
  unset -f _cogstack_load_environment
else
  unset -f _cogstack_load_environment
  # Also support executing the loader instead of sourcing it.
  # shellcheck disable=SC2317
  return 1 2>/dev/null || exit 1
fi
