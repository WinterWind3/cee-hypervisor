from __future__ import annotations

import json
import os
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


MANIFEST_FILENAME = "manifest.json"


def get_backups_root() -> Path:
    env_path = os.getenv("BACKUPS_ROOT", "").strip()
    if env_path:
        return Path(env_path).expanduser().resolve()
    return (Path(__file__).resolve().parents[2] / "backups").resolve()


def ensure_backups_root() -> Path:
    root = get_backups_root()
    root.mkdir(parents=True, exist_ok=True)
    return root


def sanitize_backup_name(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip())
    sanitized = sanitized.strip("-._")
    return sanitized or "vm"


def generate_backup_id(vm_name: str) -> str:
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    return f"{timestamp}-{sanitize_backup_name(vm_name)}"


def get_backup_dir(vm_name: str, backup_id: str) -> Path:
    return ensure_backups_root() / sanitize_backup_name(vm_name) / backup_id


def read_manifest(manifest_path: Path) -> dict[str, Any]:
    with manifest_path.open("r", encoding="utf-8") as file_obj:
        return json.load(file_obj)


def write_manifest(manifest_path: Path, payload: dict[str, Any]) -> None:
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with manifest_path.open("w", encoding="utf-8") as file_obj:
        json.dump(payload, file_obj, ensure_ascii=False, indent=2)


def list_backup_manifests() -> list[dict[str, Any]]:
    root = ensure_backups_root()
    manifests: list[dict[str, Any]] = []
    for manifest_path in root.glob(f"**/{MANIFEST_FILENAME}"):
        try:
            payload = read_manifest(manifest_path)
            payload["_backup_dir"] = str(manifest_path.parent)
            manifests.append(payload)
        except (OSError, json.JSONDecodeError):
            continue

    manifests.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return manifests


def get_backup_manifest(backup_id: str) -> dict[str, Any] | None:
    for payload in list_backup_manifests():
        if payload.get("id") == backup_id:
            return payload
    return None


def get_backup_dir_by_id(backup_id: str) -> Path | None:
    payload = get_backup_manifest(backup_id)
    if not payload:
        return None
    backup_dir = payload.get("_backup_dir")
    if not backup_dir:
        return None
    return Path(str(backup_dir))


def summarize_backups_status() -> str:
    count = len(list_backup_manifests())
    if count == 0:
        return "0 резервных копий"
    if count == 1:
        return "1 резервная копия"
    if 2 <= count <= 4:
        return f"{count} резервные копии"
    return f"{count} резервных копий"