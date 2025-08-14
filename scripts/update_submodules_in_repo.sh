#!/bin/bash
set -e

git submodule update --init --recursive

echo "🔄 Updating all submodules..."
git submodule foreach git pull origin main
