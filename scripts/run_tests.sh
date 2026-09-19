#!/usr/bin/env bash
# ==============================================================================
# Between Sessions — Automated Test Suite Runner
#
# Runs all 3 end-to-end verification suites:
#   1. Backend & Security E2E (auth, password reset, Cedar WASM, registration)
#   2. Clinical AI & RAG Pipeline (retrieval, structured output, isolation)
#   3. User & Practitioner Journey (multi-persona clinical lifecycle)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

export NODE_PATH="$ROOT_DIR/backend/src/node_modules"

echo ""
echo "========================================================"
echo "  🌿 BETWEEN SESSIONS — RUNNING AUTOMATED TEST SUITES"
echo "========================================================"
echo ""

echo "▶ [1/4] Running Email Delivery & Provider Abstraction Suite..."
node "$ROOT_DIR/tests/test_email_service.js"

echo ""
echo "▶ [2/4] Running Backend & Security E2E Suite..."
node "$ROOT_DIR/tests/test_backend_e2e.js"

echo ""
echo "▶ [3/4] Running Clinical AI & RAG Pipeline Suite..."
node "$ROOT_DIR/tests/test_ai_rag.js"

echo ""
echo "▶ [4/4] Running Comprehensive Journey Suite..."
node "$ROOT_DIR/tests/test_e2e_journey.js"

echo ""
echo "========================================================"
echo "  ✓ ALL 4 TEST SUITES PASSED SUCCESSFULLY!"
echo "========================================================"
echo ""
