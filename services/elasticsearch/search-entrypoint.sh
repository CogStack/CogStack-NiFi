#!/usr/bin/env bash
set -euo pipefail

# Keep host bind mounts and Kubernetes projections separate from the writable
# runtime configuration. The image's bundled config (including jvm.options and
# its keystore) remains in place; deployment files override only supplied files.
backend="${ELASTICSEARCH_VERSION:-opensearch}"
case "$backend" in
  opensearch|elasticsearch) ;;
  *) echo "Unsupported search backend: $backend" >&2; exit 1 ;;
esac

search_home="${COGSTACK_SEARCH_HOME:-/usr/share/$backend}"
input_dir="$search_home/config-input"
config_dir="$search_home/config"
if [[ ! -f "$input_dir/$backend.yml" ]]; then
  echo "Missing deployment configuration: $input_dir/$backend.yml" >&2
  exit 1
fi

umask 077
cp -RL "$input_dir/." "$config_dir/"

if [[ "$backend" == opensearch ]]; then
  # find is not installed in all official images. Use Bash to normalize modes
  # without requiring root or changing the source files on the host.
  shopt -s nullglob dotglob
  secure_config_directory() {
    local directory="$1" item
    chmod 0700 "$directory"
    for item in "$directory"/*; do
      if [[ -L "$item" ]]; then
        echo "Runtime configuration must contain regular files, not symlinks: $item" >&2
        exit 1
      elif [[ -d "$item" ]]; then
        secure_config_directory "$item"
      else
        chmod 0600 "$item"
      fi
    done
  }
  secure_config_directory "$config_dir"
  export DISABLE_INSTALL_DEMO_CONFIG=true
  # OpenSearch 3.x removed the RCA application, but some images still contain
  # its agent launcher. Avoid starting a JVM whose main class is not installed.
  # An explicitly supplied flag takes precedence for custom images.
  if [[ -z "${DISABLE_PERFORMANCE_ANALYZER_AGENT_CLI+x}" ]] \
      && ! compgen -G "$search_home/performance-analyzer-rca/lib/*.jar" >/dev/null; then
    export DISABLE_PERFORMANCE_ANALYZER_AGENT_CLI=true
    echo "Performance Analyzer RCA libraries are absent; the legacy agent and port 9600 API are unavailable."
  fi
  exec "$search_home/opensearch-docker-entrypoint.sh" "$@"
else
  exec /usr/local/bin/docker-entrypoint.sh "$@"
fi
