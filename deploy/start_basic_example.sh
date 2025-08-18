#!/bin/bash
set -uo pipefail

bash export_env_vars.sh

make start-data-infra

# Restore safe defaults for interactive/dev shell
set +u
set +o pipefail