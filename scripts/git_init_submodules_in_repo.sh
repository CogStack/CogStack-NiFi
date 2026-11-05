#!/usr/bin/env bash
# Restore exactly the submodule commits recorded by this checkout.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
git -C "$repo_root" submodule update --init --recursive --checkout
echo "Submodules initialized at the recorded commits."
