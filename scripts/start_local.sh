#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — Master Local Application Launcher
#
# Usage:
#   ./scripts/start_local.sh            # SAM Local Serverless Stack (Default)
#   ./scripts/start_local.sh --express  # Lightweight Express Dev Server
#   ./scripts/start_local.sh --seed     # Force re-seed of DynamoDB Local
#   ./scripts/start_local.sh --build    # Rebuild SAM artifacts before start
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$1" == "--express" ]] || [[ "$2" == "--express" ]]; then
  ARGS=()
  for arg in "$@"; do
    if [ "$arg" != "--express" ]; then
      ARGS+=("$arg")
    fi
  done
  exec "$SCRIPT_DIR/start_express.sh" "${ARGS[@]}"
else
  exec "$SCRIPT_DIR/start_sam.sh" "$@"
fi
