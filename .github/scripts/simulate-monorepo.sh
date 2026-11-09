#!/usr/bin/env bash
# TEST ONLY. Moves the checked-out app into <app dir> (default apps/web), the way Phase 2 will,
# so the phone build workflows can be proven against the new layout before the real move.
set -euo pipefail
APP_DIR="${1:-apps/web}"
[ "$APP_DIR" = "." ] && { echo "simulate-monorepo needs a target folder such as apps/web"; exit 1; }
mkdir -p "$APP_DIR"
shopt -s dotglob
for item in *; do
  case "$item" in
    .git|.github|apps) ;;
    *) mv "$item" "$APP_DIR/" ;;
  esac
done
echo "App moved into $APP_DIR:"; ls "$APP_DIR" | head -40
