# CEE Hypervisor

CEE Hypervisor is a local virtualization management interface built on FastAPI, libvirt, and React. The current repository is oriented around a single practical runtime mode: FastAPI serves both the API and the built frontend on `http://localhost:8080`.

## What Works

- Virtual machine listing and lifecycle actions through libvirt
- Image management for project-local images
- Upload of image files from disk
- Import of images by URL, local file path, or whole local directory
- Basic views for clusters, servers, networks, storage, and snapshots
- React production build served directly by FastAPI

## Runtime Model

- Preferred local entrypoint on Linux or WSL: `./start-prod.sh`
- Preferred local entrypoint on Windows PowerShell: `./start-prod.ps1`
- Compatibility wrapper on Windows PowerShell: `./run_all.ps1`
- Default app URL: `http://localhost:8080`
- API docs: `http://localhost:8080/docs`

This mode avoids the React dev server and avoids `uvicorn --reload`, which was significantly slower for this project on WSL-mounted paths.

## Requirements

- Python 3.12+
- Node.js 18+
- libvirt and QEMU/KVM available on the host where the backend runs
- WSL is required if you use `start-prod.ps1`, because it delegates execution to `start-prod.sh`

## Initial Setup

### Backend

```bash
cd backend
python3 -m venv venv
. venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

On Windows, if you are creating a Windows-side virtual environment for editor tooling, use:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Start The Application

### Linux or WSL

```bash
./start-prod.sh
```

### Windows PowerShell

```powershell
.\start-prod.ps1
```

To force a fresh frontend build before startup:

```powershell
.\start-prod.ps1 --build
```

The startup script does the following:

- builds `frontend/build` if it does not exist, or when `--build` is passed
- stops an existing backend process on port `8080`
- starts FastAPI on `0.0.0.0:8080`
- waits for `/api/health` to respond and prints a ready message
- tries to open the app URL in the default browser automatically
- serves both API routes and the React production bundle from the same process

To disable browser auto-open for a single run:

```bash
OPEN_BROWSER=0 ./start-prod.sh --build
```

## Makefile Commands

```bash
make setup
make build-prod
make start-prod
make test
make clean
```

## Image Storage

- Project-managed writable images are stored in `backend/Images`
- A shared host image directory may also be read from the backend configuration
- Image uploads and imports use atomic temporary files before final rename

## Useful URLs

- App: `http://localhost:8080`
- API docs: `http://localhost:8080/docs`
- OpenAPI schema: `http://localhost:8080/openapi.json`
- Health check: `http://localhost:8080/api/health`

## Project Layout

```text
cee-hypervisor/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- models/
|   |   |-- schemas/
|   |   `-- services/
|   |-- requirements.txt
|   `-- test_app.py
|-- frontend/
|   |-- build/
|   |-- public/
|   |-- src/
|   `-- package.json
|-- web/
|-- Makefile
|-- run_all.ps1
|-- start-prod.ps1
`-- start-prod.sh
```

## Notes

- Docker-based startup files were removed from the active project tree.
- Legacy duplicate project snapshots were removed to keep one supported workflow.
- If libvirt is unavailable, endpoints that depend on it can return backend errors until the host environment is configured correctly.
