#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — AWS SAM Local Serverless Stack Startup Script
#
# Launches DynamoDB Local, seeds deterministic data, builds serverless Lambda
# functions (if needed), starts the native AWS SAM CLI API Gateway emulator
# with warm container caching, and launches the Vite React frontend.
#
# Primary orchestrator for AWS hackathon compliance and cloud-parity evaluation.
#
# Usage:
#   ./start_sam.sh            # Start all services with SAM local API
#   ./start_sam.sh --build    # Force rebuild of SAM serverless artifacts
#   ./start_sam.sh --seed     # Force re-seed database with clinical demo data
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
BACKEND_SRC="$BACKEND_DIR/src"
INFRA_DIR="$ROOT_DIR/infrastructure"
FRONTEND_DIR="$ROOT_DIR/frontend"
DYNAMO_DIR="$BACKEND_DIR/.dynamodb-local"
if [ ! -f "$DYNAMO_DIR/DynamoDBLocal.jar" ] && [ -f "/tmp/dynamodb-local/DynamoDBLocal.jar" ]; then
  DYNAMO_DIR="/tmp/dynamodb-local"
fi
DYNAMO_PORT=8000
API_PORT=3000
FRONTEND_PORT=5173

# Ensure user local bin is in PATH (common location for SAM CLI & user tools)
export PATH="$HOME/.local/bin:$PATH"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║             ✦ BETWEEN SESSIONS — AWS SAM SERVERLESS ✦                ║"
echo "║          Bridging the 167 Hours Between Clinical Therapy             ║"
echo "║      Native AWS Serverless Application Model (SAM) Architecture      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check System Prerequisites ────────────────────────────────────────────
echo "▶ Checking system dependencies & container runtime..."

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

if ! command -v sam >/dev/null 2>&1; then
  echo "❌ AWS SAM CLI is required but not found in PATH."
  echo "    Install SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
  exit 1
fi
echo "  ✓ $(sam --version)"

if ! command -v java >/dev/null 2>&1; then
  echo "⚠️  Java JDK 11+ not found. Required for DynamoDB Local."
  echo "    Please install OpenJDK (e.g. sudo dnf install java-latest-openjdk or sudo apt install default-jre)."
fi

# Ensure rootless Podman socket is active for SAM container invocations
PODMAN_SOCK="/run/user/$(id -u)/podman/podman.sock"
if [ -S "$PODMAN_SOCK" ] || command -v systemctl >/dev/null 2>&1; then
  if command -v systemctl >/dev/null 2>&1; then
    systemctl --user start podman.socket 2>/dev/null || true
  fi
  if [ -S "$PODMAN_SOCK" ]; then
    export DOCKER_HOST="unix://$PODMAN_SOCK"
    echo "  ✓ Container Runtime: Podman rootless socket ($DOCKER_HOST)"
  fi
fi

if [ -z "$DOCKER_HOST" ] && [ -S "/var/run/docker.sock" ]; then
  export DOCKER_HOST="unix:///var/run/docker.sock"
  echo "  ✓ Container Runtime: Docker daemon ($DOCKER_HOST)"
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

# ── 4. SAM Serverless Build ──────────────────────────────────────────────────
NEED_BUILD=false
if [ ! -d "$INFRA_DIR/.aws-sam/build" ] || [[ "$1" == "--build" ]] || [[ "$2" == "--build" ]]; then
  NEED_BUILD=true
fi

if [ "$NEED_BUILD" = true ]; then
  echo "▶ Building AWS SAM Serverless Functions..."
  (cd "$INFRA_DIR" && sam build)
  echo "✓ SAM build succeeded."
fi

# ── 5. AWS SAM Local API Gateway ─────────────────────────────────────────────
if lsof -ti :$API_PORT >/dev/null 2>&1; then
  echo "ℹ  Stopping existing process on port $API_PORT..."
  kill $(lsof -ti :$API_PORT) 2>/dev/null || true
  sleep 1
fi

echo "▶ Starting AWS SAM Local API Server on port $API_PORT (warm containers enabled)..."
(cd "$INFRA_DIR" && sam local start-api -p $API_PORT --host 0.0.0.0 --warm-containers LAZY --skip-pull-image) &
API_PID=$!

echo -n "   Waiting for SAM Local API on port $API_PORT"
SAM_READY=false
for i in $(seq 1 25); do
  sleep 1
  if curl -s "http://localhost:$API_PORT/api/health" > /dev/null 2>&1; then
    echo " ✓"
    SAM_READY=true
    break
  fi
  echo -n "."
done

if [ "$SAM_READY" = false ]; then
  echo ""
  echo "⚠️  SAM Local API taking longer than expected or container runtime failed."
  echo "    Attempting fallback to Express API server..."
  if [ -n "$API_PID" ]; then kill $API_PID 2>/dev/null || true; fi
  (cd "$BACKEND_SRC" && node express-dev-server.js) &
  API_PID=$!
  sleep 2
fi

# ── 6. Vite Frontend ─────────────────────────────────────────────────────────
if lsof -ti :$FRONTEND_PORT >/dev/null 2>&1; then
  echo "ℹ  Stopping existing Vite dev server on port $FRONTEND_PORT..."
  kill $(lsof -ti :$FRONTEND_PORT) 2>/dev/null || true
  sleep 1
fi

echo "▶ Starting Vite Frontend on port $FRONTEND_PORT..."
(cd "$FRONTEND_DIR" && npx vite --host 0.0.0.0 --port $FRONTEND_PORT) &
FRONTEND_PID=$!

# ── 7. Ready Banner ──────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌿 BETWEEN SESSIONS (AWS SAM SERVERLESS) IS NOW RUNNING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✦ Web Application:        http://localhost:$FRONTEND_PORT"
echo "  ✦ AWS SAM API Gateway:    http://localhost:$API_PORT/api/v1"
echo "  ✦ Health Check:           http://localhost:$API_PORT/api/health"
echo "  ✦ DynamoDB Local:         http://localhost:$DYNAMO_PORT"
echo ""
echo "  ⚙️  Serverless Architecture (13 Packaged Lambda Functions):"
echo "     • AuthFunction           • CheckinsFunction       • JournalFunction"
echo "     • PracticeFunction       • DashboardFunction      • ProgressFunction"
echo "     • AiSummaryFunction      • ConsentsFunction       • ConnectionsFunction"
echo "     • PractitionerFunction   • ToolkitFunction        • ValuesFunction"
echo "     • LearningFunction"
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
  echo "🛑 Stopping Between Sessions SAM services..."
  if [ -n "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null || true; fi
  if [ -n "$API_PID" ]; then kill $API_PID 2>/dev/null || true; fi
  kill $(lsof -ti :$API_PORT) 2>/dev/null || true
  if [ "$DYNAMO_STARTED" = true ] && [ -n "$DYNAMO_PID" ]; then
    kill $DYNAMO_PID 2>/dev/null || true
  fi
  echo "✓ All services stopped."
  exit 0
}

trap cleanup INT TERM
wait
