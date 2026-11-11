#!/usr/bin/env bash
# Shared file selection for deployment settings and security helpers.

cogstack_config_init() {
  COGSTACK_REPO_ROOT="$1"
  if [[ -n "${COGSTACK_CONFIG_DIR:-}" ]]; then
    case "$COGSTACK_CONFIG_DIR" in
      /*) ;;
      *) COGSTACK_CONFIG_DIR="$COGSTACK_REPO_ROOT/$COGSTACK_CONFIG_DIR" ;;
    esac
    if [[ ! -d "$COGSTACK_CONFIG_DIR" ]]; then
      echo "ERROR: COGSTACK_CONFIG_DIR is not a directory: $COGSTACK_CONFIG_DIR" >&2
      return 1
    fi
    COGSTACK_CONFIG_DIR="$(cd "$COGSTACK_CONFIG_DIR" && pwd)" || return 1
  fi
  export COGSTACK_CONFIG_DIR
}

cogstack_env_file() {
  local relative_path="$1"
  local selected_path="${2:-$COGSTACK_REPO_ROOT/$relative_path}"
  local custom_path=""

  if [[ -n "${COGSTACK_CONFIG_DIR:-}" ]]; then
    case "$relative_path" in
      deploy/*) custom_path="$COGSTACK_CONFIG_DIR/${relative_path#deploy/}" ;;
      security/env/*) custom_path="$COGSTACK_CONFIG_DIR/security/${relative_path#security/env/}" ;;
    esac
    if [[ -n "$custom_path" && ( -e "$custom_path" || -L "$custom_path" ) ]]; then
      selected_path="$custom_path"
    fi
  fi
  if [[ ! -f "$selected_path" || ! -r "$selected_path" ]]; then
    echo "ERROR: Configuration file is not a readable regular file: $selected_path" >&2
    return 1
  fi
  printf '%s\n' "$selected_path"
}
