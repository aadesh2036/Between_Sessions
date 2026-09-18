#!/usr/bin/env bash
# start-local.sh — Start DynamoDB Local + Express API server for development
#
# Usage:
#   ./start-local.sh          # start both services
#   ./start-local.sh --seed   # start + re-seed the database
#
# Prerequisites:
#   - Java (any JDK 11+) in PATH
#   - Node.js in PATH
#   - npm install already run in src/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src"
DYNAMO_DIR="/tmp/dynamodb-local"
DYNAMO_PORT=8000
API_PORT=3000

# ── DynamoDB Local ────────────────────────────────────────────────────────────

# Download if not already present
if [ ! -f "$DYNAMO_DIR/DynamoDBLocal.jar" ]; then
  echo "⏳  Downloading DynamoDB Local..."
  mkdir -p "$DYNAMO_DIR"
  curl -# -L "https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz" \
    -o "$DYNAMO_DIR/dynamodb_local_latest.tar.gz"
  tar xzf "$DYNAMO_DIR/dynamodb_local_latest.tar.gz" -C "$DYNAMO_DIR"
  echo "✓  DynamoDB Local downloaded."
fi

# Kill any previous instance on that port
if lsof -ti :$DYNAMO_PORT > /dev/null 2>&1; then
  echo "ℹ  Stopping existing DynamoDB Local on port $DYNAMO_PORT..."
  kill $(lsof -ti :$DYNAMO_PORT) 2>/dev/null || true
  sleep 1
fi

echo "▶  Starting DynamoDB Local (in-memory) on port $DYNAMO_PORT..."
java -Djava.library.path="$DYNAMO_DIR/DynamoDBLocal_lib" \
     -jar "$DYNAMO_DIR/DynamoDBLocal.jar" \
     -inMemory -port $DYNAMO_PORT &
DYNAMO_PID=$!

# Wait for DynamoDB to be ready
echo -n "   Waiting for DynamoDB Local"
for i in $(seq 1 15); do
  sleep 1
  if curl -s "http://localhost:$DYNAMO_PORT" > /dev/null 2>&1; then
    echo " ✓"
    break
  fi
  echo -n "."
done

# ── Seed ─────────────────────────────────────────────────────────────────────

if [[ "$1" == "--seed" ]] || [[ "$2" == "--seed" ]]; then
  echo "⏳  Seeding database..."
  node "$SRC_DIR/seed.js"
else
  # Always seed on first start (table won't exist yet)
  echo "⏳  Seeding database (first run)..."
  node "$SRC_DIR/seed.js" 2>&1 || true
fi

# ── Express API server ────────────────────────────────────────────────────────

# Kill any previous API instance
if lsof -ti :$API_PORT > /dev/null 2>&1; then
  echo "ℹ  Stopping existing API server on port $API_PORT..."
  kill $(lsof -ti :$API_PORT) 2>/dev/null || true
  sleep 1
fi

echo "▶  Starting Express API on port $API_PORT..."
node "$SRC_DIR/express-dev-server.js" &
API_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✦ DynamoDB Local    http://localhost:$DYNAMO_PORT  (PID $DYNAMO_PID)"
echo "  ✦ API server        http://localhost:$API_PORT/api/v1  (PID $API_PID)"
echo ""
echo "  Demo login:  demo@betweensessions.com / Demo1234!"
echo "  Health:      curl http://localhost:$API_PORT/api/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Press Ctrl+C to stop both services."

# Wait and forward signals to child processes
trap "echo ''; echo 'Stopping...'; kill $DYNAMO_PID $API_PID 2>/dev/null; exit" INT TERM
wait
