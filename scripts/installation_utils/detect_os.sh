#!/usr/bin/env bash

# Read one canonical ID instead of matching every release file, which can emit
# duplicate distribution names and filename prefixes on the same machine.
if [ ! -r /etc/os-release ]; then
    echo "Distribution version could not be found. Stopping script..." >&2
    exit 1
fi

# shellcheck disable=SC1091 # Standard OS metadata file provided by Linux distributions.
. /etc/os-release

case "${ID:-}" in
    debian|ubuntu|centos) echo "$ID" ;;
    rhel) echo "redhat" ;;
    *) echo "Unsupported distribution: ${ID:-unknown}" >&2; exit 1 ;;
esac
