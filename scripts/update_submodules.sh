#!/bin/bash
set -e

echo "🔄 Updating all submodules..."
git submodule foreach git pull origin main