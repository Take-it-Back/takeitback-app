#!/usr/bin/env bash
# Installs packages for the phone builds, today (npm, one package at the root) or after the monorepo move
# (pnpm workspace at the root, app in apps/web). Usage: install.sh <app dir>
set -euo pipefail
APP_DIR="${1:-.}"
if [ -f pnpm-lock.yaml ]; then
  corepack enable
  pnpm install --frozen-lockfile
elif [ -f "$APP_DIR/package-lock.json" ]; then
  (cd "$APP_DIR" && npm ci --no-audit --no-fund)
else
  npm ci --no-audit --no-fund
fi
test -d "$APP_DIR/node_modules/@capacitor/cli" || test -d node_modules/@capacitor/cli || { echo "Capacitor CLI not installed"; exit 1; }
