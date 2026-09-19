#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — Express Development Environment Startup Script
#
# Launches DynamoDB Local, seeds deterministic data, starts the Express API
# backend, and launches the Vite frontend dev server with a single command.
# Ideal for rapid local feature iteration and UI development.
#
# Usage:
#   ./start_express.sh          # Start all services (auto-seeds on first run)
#   ./start_express.sh --seed   # Start all services and force re-seed database
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend/between-sessions-backend"
BACKEND_SRC="$BACKEND_DIR/src"
DYNAMO_DIR="$BACKEND_DIR/.dynamodb-local"
if [ ! -f "$DYNAMO_DIR/DynamoDBLocal.jar" ] && [ -f "/tmp/dynamodb-local/DynamoDBLocal.jar" ]; then
  DYNAMO_DIR="/tmp/dynamodb-local"
fi
DYNAMO_PORT=8000
API_PORT=3000
FRONTEND_PORT=5173
FRONTEND_DIR="$ROOT_DIR/frontend"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║             ✦ BETWEEN SESSIONS — EXPRESS DEV RUNNER ✦                ║"
echo "║          Bridging the 167 Hours Between Clinical Therapy             ║"
echo "║             Organic Strategic Editorial Behavioral Stack             ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check Prerequisites ───────────────────────────────────────────────────
echo "▶ Checking system dependencies..."

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required but not found in PATH."
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required but not found in PATH."
  exit 1
fi
echo "  ✓ npm $(npm -v)"

if ! command -v java >/dev/null 2>&1; then
  echo "⚠️  Java JDK 11+ not found. Required for DynamoDB Local."
  echo "    Please install OpenJDK (e.g. sudo dnf install java-latest-openjdk or sudo apt install default-jre)."
fi

# ── 2. DynamoDB Local ────────────────────────────────────────────────────────
DYNAMO_STARTED=false

if lsof -ti :$DYNAMO_PORT >/dev/null 2>&1; then
  echo "ℹ  DynamoDB Local is already running on port $DYNAMO_PORT. Keeping existing instance."
else
  if [ ! -f "$DYNAMO_DIR/DynamoDBLocal.jar" ]; then
    echo "⏳ Downloading DynamoDB Local into $DYNAMO_DIR..."
    mkdir -p "$DYNAMO_DIR"
    curl -# -L "https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz" \
      -o "$DYNAMO_DIR/dynamodb_local_latest.tar.gz"
    tar xzf "$DYNAMO_DIR/dynamodb_local_latest.tar.gz" -C "$DYNAMO_DIR"
    echo "✓ DynamoDB Local extracted."
  fi

  echo "▶ Starting DynamoDB Local (in-memory) on port $DYNAMO_PORT..."
  java -Djava.library.path="$DYNAMO_DIR/DynamoDBLocal_lib" \
       -jar "$DYNAMO_DIR/DynamoDBLocal.jar" \
       -inMemory -port $DYNAMO_PORT > /dev/null 2>&1 &
  DYNAMO_PID=$!
  DYNAMO_STARTED=true

  echo -n "   Waiting for DynamoDB Local on port $DYNAMO_PORT"
  for i in $(seq 1 15); do
    sleep 1
    if curl -s "http://localhost:$DYNAMO_PORT" > /dev/null 2>&1; then
      echo " ✓"
      break
    fi
    echo -n "."
  done
fi

# ── 3. Seed Database ─────────────────────────────────────────────────────────
if [[ "$1" == "--seed" ]] || [[ "$2" == "--seed" ]] || [ "$DYNAMO_STARTED" = true ]; then
  echo "⏳ Seeding DynamoDB Local tables and clinical demo datasets..."
  (cd "$BACKEND_SRC" && node seed.js) || true
  echo "✓ Seed completed."
fi

# ── 4. Express API Backend ───────────────────────────────────────────────────
if lsof -ti :$API_PORT >/dev/null 2>&1; then
  echo "ℹ  Stopping existing process on port $API_PORT..."
  kill $(lsof -ti :$API_PORT) 2>/dev/null || true
  sleep 1
fi

echo "▶ Starting Express API Dev Server on port $API_PORT..."
(cd "$BACKEND_SRC" && node express-dev-server.js) &
API_PID=$!

echo -n "   Waiting for API server on port $API_PORT"
for i in $(seq 1 12); do
  sleep 1
  if curl -s "http://localhost:$API_PORT/api/health" > /dev/null 2>&1; then
    echo " ✓"
    break
  fi
  echo -n "."
done

# ── 5. Vite Frontend ─────────────────────────────────────────────────────────
if lsof -ti :$FRONTEND_PORT >/dev/null 2>&1; then
  echo "ℹ  Stopping existing Vite dev server on port $FRONTEND_PORT..."
  kill $(lsof -ti :$FRONTEND_PORT) 2>/dev/null || true
  sleep 1
fi

echo "▶ Starting Vite Frontend on port $FRONTEND_PORT..."
(cd "$FRONTEND_DIR" && npx vite --host 0.0.0.0 --port $FRONTEND_PORT) &
FRONTEND_PID=$!

# ── 6. Ready Banner ──────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌿 BETWEEN SESSIONS (EXPRESS DEV) IS NOW RUNNING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✦ Web Application:        http://localhost:$FRONTEND_PORT"
echo "  ✦ Express Backend API:    http://localhost:$API_PORT/api/v1"
echo "  ✦ Health Check:           http://localhost:$API_PORT/api/health"
echo "  ✦ DynamoDB Local:         http://localhost:$DYNAMO_PORT"
echo ""
echo "  👤 Individual Patient Login:"
echo "     • Email:    priya@betweensessions.com  (or demo@betweensessions.com)"
echo "     • Password: Demo1234!"
echo ""
echo "  🩺 Verified Clinician Login:"
echo "     • Email:    kavita@betweensessions.com (or dr.elena@claritypsych.org)"
echo "     • Password: Prac1234!                  (or Clinician123!)"
echo "     • Cert ID:  MCI-2024-KM-7741           (or PSY-2024-8841)"
echo "     • Portal:   http://localhost:$FRONTEND_PORT/practitioner/login"
echo ""
echo "  🛡️  Core Clinical Architecture:"
echo "     • Anti-Gamification (zero streaks, zero points, objective SUDS)"
echo "     • AWS Cedar WASM Cryptographic Consent & Instant Revocation"
echo "     • BetweenLoading Signature Clock Animation"
echo "     • Delayed Ritual Practice Timer (Habit Extinction pacing)"
echo "     • 24/7 Tele-MANAS Crisis Access (14416 / 1800-891-4416)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to gracefully stop all services."
echo ""

cleanup() {
  echo ""
  echo "🛑 Stopping Between Sessions Express dev services..."
  if [ -n "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null || true; fi
  if [ -n "$API_PID" ]; then kill $API_PID 2>/dev/null || true; fi
  if [ "$DYNAMO_STARTED" = true ] && [ -n "$DYNAMO_PID" ]; then
    kill $DYNAMO_PID 2>/dev/null || true
  fi
  echo "✓ All services stopped."
  exit 0
}

trap cleanup INT TERM
wait
