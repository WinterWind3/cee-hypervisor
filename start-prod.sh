#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
FRONTEND_INDEX="$FRONTEND_DIR/build/index.html"
PORT="${PORT:-8080}"
FORCE_BUILD="${1:-}"

if [[ ! -f "$FRONTEND_INDEX" || "$FORCE_BUILD" == "--build" ]]; then
  echo "[start-prod] Building frontend bundle..."
  cd "$FRONTEND_DIR"
  npm run build
fi

echo "[start-prod] Stopping existing backend on port $PORT..."
pkill -f "python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT" 2>/dev/null || true

echo "[start-prod] Starting backend on http://localhost:$PORT"
cd "$BACKEND_DIR"
exec ./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"