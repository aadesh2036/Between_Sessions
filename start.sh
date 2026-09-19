#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — Master Launcher Entrypoint
#
# Proxies to ./scripts/start_local.sh
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$ROOT_DIR/scripts/start_local.sh" "$@"
