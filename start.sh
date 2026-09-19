#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — Master Application Launcher
#
# Launches the Between Sessions full stack.
#
# Modes:
#   ./start.sh                # Launches AWS SAM Local API Serverless Stack (Default for Hackathon)
#   ./start.sh --build        # Rebuilds SAM serverless Lambda artifacts before launching
#   ./start.sh --seed         # Re-seeds DynamoDB Local with clinical demo datasets
#   ./start.sh --express      # Launches lightweight Express Dev Server (Fast iteration)
#
# Dedicated launchers are also directly executable:
#   ./start_sam.sh            # Native AWS SAM Serverless CLI emulator (Port 3000)
#   ./start_express.sh        # Express Dev Server (Port 3000)
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$1" == "--express" ]] || [[ "$2" == "--express" ]]; then
  # Filter out --express flag and pass remaining arguments
  ARGS=()
  for arg in "$@"; do
    if [ "$arg" != "--express" ]; then
      ARGS+=("$arg")
    fi
  done
  exec "$ROOT_DIR/start_express.sh" "${ARGS[@]}"
else
  exec "$ROOT_DIR/start_sam.sh" "$@"
fi
