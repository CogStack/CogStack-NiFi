#!/usr/bin/env bash
# Source this helper before selecting deployment-specific security env files.

COGSTACK_SECURITY_CONFIG_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck disable=SC1091
source "$COGSTACK_SECURITY_CONFIG_ROOT/deploy/config_files.sh" || return 1
cogstack_config_init "$COGSTACK_SECURITY_CONFIG_ROOT" || return 1
