#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
FRONTEND_INDEX="$FRONTEND_DIR/build/index.html"
PORT="${PORT:-8080}"
APP_URL="http://localhost:$PORT"
HEALTH_URL="$APP_URL/api/health"
FORCE_BUILD="${1:-}"
OPEN_BROWSER="${OPEN_BROWSER:-1}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

wait_for_health() {
  local attempts=0

  while (( attempts < 60 )); do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "[start-prod] Backend process exited before readiness check completed."
      return 1
    fi

    if ./venv/bin/python3 -c "import sys, urllib.request; urllib.request.urlopen('$HEALTH_URL', timeout=1); sys.exit(0)" >/dev/null 2>&1; then
      return 0
    fi

    attempts=$((attempts + 1))
    sleep 1
  done

  echo "[start-prod] Timed out waiting for $HEALTH_URL"
  return 1
}

open_browser() {
  if [[ "$OPEN_BROWSER" != "1" ]]; then
    return 0
  fi

  if [[ -n "${WSL_DISTRO_NAME:-}" ]] || [[ -n "${WSL_INTEROP:-}" ]]; then
    if command -v cmd.exe >/dev/null 2>&1; then
      cmd.exe /C start "" "$APP_URL" >/dev/null 2>&1 || true
      return 0
    fi
  fi

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$APP_URL" >/dev/null 2>&1 || true
    return 0
  fi

  if command -v open >/dev/null 2>&1; then
    open "$APP_URL" >/dev/null 2>&1 || true
  fi
}

trap cleanup INT TERM

if [[ ! -f "$FRONTEND_INDEX" || "$FORCE_BUILD" == "--build" ]]; then
  echo "[start-prod] Building frontend bundle..."
  cd "$FRONTEND_DIR"
  npm run build
fi

echo "[start-prod] Stopping existing backend on port $PORT..."
pkill -f "python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT" 2>/dev/null || true

echo "[start-prod] Starting backend on $APP_URL"
cd "$BACKEND_DIR"
./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" &
SERVER_PID=$!

if wait_for_health; then
  echo "[start-prod] CEE Hypervisor is ready at $APP_URL"
  echo "[start-prod] API docs: $APP_URL/docs"
  open_browser
else
  cleanup
  exit 1
fi

wait "$SERVER_PID"