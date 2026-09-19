#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — Database Seeding Script
#
# Seeds DynamoDB Local with deterministic clinical demo data:
#   - Priya Sharma (veteran OCD patient, 21-day longitudinal history)
#   - Alex Chen (new OCD patient, 3-day history)
#   - Dr. Kavita Mehra (verified MCI clinical psychiatrist)
#   - Public practitioner directory listing
#   - Cedar WASM cryptographic consent policies
#   - Exposure practice plans, toolkit logs, and values actions
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
DYNAMO_PORT=8000

# Check if DynamoDB Local is accessible
if ! curl -s "http://localhost:$DYNAMO_PORT" >/dev/null 2>&1; then
  echo "⚠️  DynamoDB Local is not running on port $DYNAMO_PORT."
  echo "    Starting temporary DynamoDB Local..."
  DYNAMO_DIR="$BACKEND_DIR/.dynamodb-local"
  if [ ! -f "$DYNAMO_DIR/DynamoDBLocal.jar" ] && [ -f "/tmp/dynamodb-local/DynamoDBLocal.jar" ]; then
    DYNAMO_DIR="/tmp/dynamodb-local"
  fi
  java -Djava.library.path="$DYNAMO_DIR/DynamoDBLocal_lib" \
       -jar "$DYNAMO_DIR/DynamoDBLocal.jar" \
       -inMemory -port $DYNAMO_PORT > /dev/null 2>&1 &
  DYNAMO_PID=$!
  sleep 2
  TRAP_KILL=true
else
  TRAP_KILL=false
fi

echo "⏳ Seeding BetweenSessionsTable with clinical demo data..."
(cd "$BACKEND_DIR/src" && node seed.js)
echo "✓ Seeding complete."

if [ "$TRAP_KILL" = true ] && [ -n "$DYNAMO_PID" ]; then
  kill $DYNAMO_PID 2>/dev/null || true
fi
