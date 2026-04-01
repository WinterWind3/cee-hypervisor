# ─────────────────────────────────────────────
# Stage 1: Build React frontend
# ─────────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Python backend + built frontend
# ─────────────────────────────────────────────
FROM python:3.12-slim

# System deps for libvirt-python
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvirt-dev \
    libvirt-clients \
    pkg-config \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

WORKDIR /app/backend

ENV PORT=8080
ENV LIBVIRT_URI=qemu:///system

EXPOSE 8080

CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
