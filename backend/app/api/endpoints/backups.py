from __future__ import annotations

import os
import shutil
import time
import xml.etree.ElementTree as ET
from datetime import UTC, datetime
from pathlib import Path

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.endpoints.vms import DEFAULT_VM_IMAGES_DIR, _get_libvirt_conn, _get_storage_pool_paths
from app.core.backups import (
    MANIFEST_FILENAME,
    generate_backup_id,
    get_backup_dir,
    get_backup_dir_by_id,
    get_backup_manifest,
    list_backup_manifests,
    write_manifest,
)


import subprocess

router = APIRouter()

DiskDescriptor = dict[str, str | int]


def _safe_copy(source_path: str | Path, target_path: str | Path, chown_user: bool = False) -> None:
    source_str = str(source_path)
    target_str = str(target_path)
    try:
        shutil.copy2(source_str, target_str)
        return
    except PermissionError:
        pass

    in_wsl = False
    try:
        with open("/proc/version", "r") as f:
            if "microsoft" in f.read().lower():
                in_wsl = True
    except Exception:
        pass

    try:
        if in_wsl and shutil.which("wsl.exe"):
            distro = os.getenv("WSL_DISTRO_NAME")
            wsl_cmd = ["wsl.exe", "-d", distro, "-u", "root"] if distro else ["wsl.exe", "-u", "root"]
            subprocess.run(wsl_cmd + ["cp", source_str, target_str], check=True)
            if chown_user:
                uid = os.getuid()
                gid = os.getgid()
                subprocess.run(wsl_cmd + ["chown", f"{uid}:{gid}", target_str], check=True)
        else:
            subprocess.run(["sudo", "-n", "cp", source_str, target_str], check=True)
            if chown_user:
                uid = os.getuid()
                gid = os.getgid()
                subprocess.run(["sudo", "-n", "chown", f"{uid}:{gid}", target_str], check=True)
    except Exception as exc:
        raise PermissionError(f"Permission denied copying '{source_str}' -> '{target_str}', and elevated fallback failed: {exc}") from exc


class BackupDiskItem(BaseModel):
    target_dev: str
    file_name: str
    original_path: str
    backup_file_path: str | None = None
    format: str
    size_bytes: int


class BackupItem(BaseModel):
    id: str
    vm_name: str
    created_at: str
    disks_count: int
    total_size_bytes: int
    status: str
    backup_path: str
    mode: str = "offline"
    consistency: str = "crash-consistent"
    has_nvram: bool = False
    warnings: list[str] = Field(default_factory=list)
    disks: list[BackupDiskItem] = Field(default_factory=list)


class BackupRestoreRequest(BaseModel):
    target_name: str
    storage_pool: str | None = None
    start_vm: bool = False


class BackupActionResponse(BaseModel):
    id: str
    status: str
    message: str
    vm_name: str | None = None


def _get_domain_or_404(conn: libvirt.virConnect, vm_name: str) -> libvirt.virDomain:  # type: ignore[name-defined]
    try:
        return conn.lookupByName(vm_name)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{vm_name}' не найдена: {exc}")


def _require_stopped_domain(dom: libvirt.virDomain, vm_name: str) -> None:  # type: ignore[name-defined]
    try:
        if dom.isActive() == 1:  # type: ignore[no-untyped-call]
            raise HTTPException(status_code=400, detail=f"Резервное копирование доступно только для выключенной ВМ '{vm_name}'")
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось проверить состояние ВМ '{vm_name}': {exc}")


def _is_domain_active(dom: libvirt.virDomain, vm_name: str) -> bool:  # type: ignore[name-defined]
    try:
        return dom.isActive() == 1  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось проверить состояние ВМ '{vm_name}': {exc}")


def _collect_file_disks(root: ET.Element) -> list[DiskDescriptor]:
    disks: list[DiskDescriptor] = []
    for disk_node in root.findall("./devices/disk[@device='disk']"):
        source_node = disk_node.find("./source")
        target_node = disk_node.find("./target")
        driver_node = disk_node.find("./driver")
        source_path = source_node.get("file") if source_node is not None else None
        target_dev = target_node.get("dev") if target_node is not None else None
        driver_type = driver_node.get("type") if driver_node is not None else None

        if not source_path or not target_dev:
            raise HTTPException(status_code=400, detail="Поддерживаются только file-based диски с target dev")

        normalized_path = os.path.abspath(source_path)
        if not os.path.isfile(normalized_path):
            raise HTTPException(status_code=400, detail=f"Файл диска '{normalized_path}' не найден")

        disks.append(
            {
                "source_path": normalized_path,
                "target_dev": target_dev,
                "format": driver_type or "qcow2",
                "size_bytes": int(os.path.getsize(normalized_path)),
            }
        )
    return disks


def _collect_nvram(root: ET.Element) -> dict[str, str] | None:
    nvram_path = root.findtext("./os/nvram")
    if not nvram_path:
        return None

    normalized_path = os.path.abspath(nvram_path)
    if not os.path.isfile(normalized_path):
        return None

    return {
        "source_path": normalized_path,
        "file_name": os.path.basename(normalized_path),
    }


def _as_list(value: object) -> list[object]:
    return value if isinstance(value, list) else []


def _as_int(value: object) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(value)
        except ValueError:
            return 0
    try:
        return int(str(value))
    except (TypeError, ValueError):
        return 0


def _map_backup_item(payload: dict[str, object]) -> BackupItem:
    backup_path = str(payload.get("backup_path", ""))
    disks_payload = _as_list(payload.get("disks"))
    return BackupItem(
        id=str(payload.get("id", "")),
        vm_name=str(payload.get("vm_name", "")),
        created_at=str(payload.get("created_at", "")),
        disks_count=_as_int(payload.get("disks_count", 0) or 0),
        total_size_bytes=_as_int(payload.get("total_size_bytes", 0) or 0),
        status=str(payload.get("status", "ready")),
        backup_path=backup_path,
        mode=str(payload.get("mode", "offline") or "offline"),
        consistency=str(payload.get("consistency", "crash-consistent") or "crash-consistent"),
        has_nvram=bool(payload.get("nvram")),
        warnings=[str(item) for item in _as_list(payload.get("warnings")) if str(item).strip()],
        disks=[
            BackupDiskItem(
                target_dev=str(disk.get("target_dev") or "") if isinstance(disk, dict) else "",
                file_name=str(disk.get("file_name") or "") if isinstance(disk, dict) else "",
                original_path=str(disk.get("original_path") or "") if isinstance(disk, dict) else "",
                backup_file_path=(
                    str(Path(backup_path) / "disks" / str(disk.get("file_name") or ""))
                    if backup_path and isinstance(disk, dict) and disk.get("file_name")
                    else None
                ),
                format=str(disk.get("format") or "qcow2") if isinstance(disk, dict) else "qcow2",
                size_bytes=_as_int(disk.get("size_bytes") or 0) if isinstance(disk, dict) else 0,
            )
            for disk in disks_payload
        ],
    )


def _resolve_restore_directory(conn: libvirt.virConnect, storage_pool: str | None) -> str:  # type: ignore[name-defined]
    pool_name = (storage_pool or "").strip()
    if not pool_name:
        os.makedirs(DEFAULT_VM_IMAGES_DIR, exist_ok=True)
        return DEFAULT_VM_IMAGES_DIR

    pool_paths = _get_storage_pool_paths(conn)
    pool_path = pool_paths.get(pool_name)
    if not pool_path:
        raise HTTPException(status_code=404, detail=f"Пул хранения '{pool_name}' не найден")

    try:
        pool = conn.storagePoolLookupByName(pool_name)  # type: ignore[no-untyped-call]
        if pool.isActive() != 1:  # type: ignore[no-untyped-call]
            raise HTTPException(status_code=400, detail=f"Пул хранения '{pool_name}' не запущен")
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось проверить пул хранения '{pool_name}': {exc}")

    os.makedirs(pool_path, exist_ok=True)
    return pool_path


def _build_restored_disk_name(target_name: str, disk_index: int, target_dev: str, disk_format: str, disks_count: int) -> str:
    extension = "qcow2" if (disk_format or "").lower() == "qcow2" else (disk_format or "img").lower()
    if disks_count == 1:
        return f"{target_name}.{extension}"
    return f"{target_name}-{disk_index + 1}-{target_dev}.{extension}"


def _cleanup_restore_artifacts(copied_paths: list[str], defined_domain: libvirt.virDomain | None) -> None:  # type: ignore[name-defined]
    if defined_domain is not None:
        try:
            if defined_domain.isActive() == 1:  # type: ignore[no-untyped-call]
                defined_domain.destroy()  # type: ignore[no-untyped-call]
        except libvirt.libvirtError:  # type: ignore[attr-defined]
            pass
        try:
            defined_domain.undefine()  # type: ignore[no-untyped-call]
        except libvirt.libvirtError:  # type: ignore[attr-defined]
            pass

    for copied_path in reversed(copied_paths):
        try:
            if os.path.exists(copied_path):
                os.remove(copied_path)
        except OSError:
            continue


def _build_online_snapshot_xml(snapshot_name: str, overlay_specs: list[dict[str, str]]) -> str:
    root = ET.Element("domainsnapshot")
    name_node = ET.SubElement(root, "name")
    name_node.text = snapshot_name
    disks_node = ET.SubElement(root, "disks")

    for spec in overlay_specs:
        disk_node = ET.SubElement(disks_node, "disk", {"name": spec["target_dev"], "snapshot": "external"})
        ET.SubElement(disk_node, "driver", {"type": "qcow2"})
        ET.SubElement(disk_node, "source", {"file": spec["overlay_path"]})

    return ET.tostring(root, encoding="unicode")


def _start_online_backup_snapshot(
    dom: libvirt.virDomain,  # type: ignore[name-defined]
    vm_name: str,
    backup_id: str,
    backup_dir: Path,
    disks: list[DiskDescriptor],
) -> tuple[list[dict[str, str]], str, list[str]]:
    overlays_dir = backup_dir / "_runtime" / "overlays"
    overlays_dir.mkdir(parents=True, exist_ok=True)

    overlay_specs: list[dict[str, str]] = []
    for disk in disks:
        target_dev = str(disk["target_dev"])
        overlay_specs.append(
            {
                "target_dev": target_dev,
                "base_path": str(disk["source_path"]),
                "overlay_path": str(overlays_dir / f"{target_dev}.qcow2"),
            }
        )

    snapshot_xml = _build_online_snapshot_xml(f"backup-{backup_id}", overlay_specs)
    base_flags = (
        libvirt.VIR_DOMAIN_SNAPSHOT_CREATE_DISK_ONLY
        | libvirt.VIR_DOMAIN_SNAPSHOT_CREATE_NO_METADATA
        | libvirt.VIR_DOMAIN_SNAPSHOT_CREATE_ATOMIC
    )

    try:
        dom.snapshotCreateXML(snapshot_xml, base_flags)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось создать live backup snapshot для ВМ '{vm_name}': {exc}")

    return overlay_specs, "crash-consistent-live", []


def _extract_block_job_progress(job_info: object) -> tuple[int, int]:
    if isinstance(job_info, dict):
        return int(job_info.get("cur") or 0), int(job_info.get("end") or 0)

    if isinstance(job_info, (list, tuple)) and len(job_info) >= 4:
        return int(job_info[2] or 0), int(job_info[3] or 0)

    current = int(getattr(job_info, "cur", 0) or 0)
    end = int(getattr(job_info, "end", 0) or 0)
    return current, end


def _wait_for_block_job_ready(dom: libvirt.virDomain, target_dev: str, vm_name: str, timeout_seconds: int = 600) -> None:  # type: ignore[name-defined]
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            job_info = dom.blockJobInfo(target_dev, 0)  # type: ignore[no-untyped-call]
        except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
            raise HTTPException(status_code=500, detail=f"Не удалось получить состояние block job для диска '{target_dev}' ВМ '{vm_name}': {exc}")

        if not job_info:
            raise HTTPException(status_code=500, detail=f"Block job для диска '{target_dev}' ВМ '{vm_name}' завершился раньше pivot")

        current, end = _extract_block_job_progress(job_info)
        if end > 0 and current >= end:
            return

        time.sleep(1)

    raise HTTPException(status_code=500, detail=f"Таймаут ожидания готовности block job для диска '{target_dev}' ВМ '{vm_name}'")


def _wait_for_block_job_finish(dom: libvirt.virDomain, target_dev: str, vm_name: str, timeout_seconds: int = 120) -> None:  # type: ignore[name-defined]
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            job_info = dom.blockJobInfo(target_dev, 0)  # type: ignore[no-untyped-call]
        except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
            raise HTTPException(status_code=500, detail=f"Не удалось дождаться завершения block job для диска '{target_dev}' ВМ '{vm_name}': {exc}")

        if not job_info:
            return

        time.sleep(1)

    raise HTTPException(status_code=500, detail=f"Таймаут завершения block job для диска '{target_dev}' ВМ '{vm_name}'")


def _finalize_online_backup_snapshot(
    dom: libvirt.virDomain,  # type: ignore[name-defined]
    vm_name: str,
    overlay_specs: list[dict[str, str]],
    backup_dir: Path,
) -> None:
    for spec in overlay_specs:
        target_dev = spec["target_dev"]
        base_path = spec["base_path"]
        overlay_path = spec["overlay_path"]

        try:
            dom.blockCommit(target_dev, base_path, overlay_path, 0, libvirt.VIR_DOMAIN_BLOCK_COMMIT_ACTIVE)  # type: ignore[no-untyped-call]
            _wait_for_block_job_ready(dom, target_dev, vm_name)
            dom.blockJobAbort(target_dev, libvirt.VIR_DOMAIN_BLOCK_JOB_ABORT_PIVOT)  # type: ignore[no-untyped-call]
            _wait_for_block_job_finish(dom, target_dev, vm_name)
        except HTTPException:
            raise
        except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
            raise HTTPException(status_code=500, detail=f"Не удалось завершить live backup для диска '{target_dev}' ВМ '{vm_name}': {exc}")

        try:
            if os.path.exists(overlay_path):
                os.remove(overlay_path)
        except OSError:
            continue

    shutil.rmtree(backup_dir / "_runtime", ignore_errors=True)


@router.get("/backups", response_model=list[BackupItem])
async def list_backups() -> list[BackupItem]:
    return [_map_backup_item(payload) for payload in list_backup_manifests()]


@router.post("/backups/vms/{vm_name}", response_model=BackupItem)
async def create_backup(vm_name: str) -> BackupItem:
    conn = _get_libvirt_conn()
    dom = _get_domain_or_404(conn, vm_name)
    is_active = _is_domain_active(dom, vm_name)

    try:
        domain_xml = dom.XMLDesc()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось получить XML ВМ '{vm_name}': {exc}")

    try:
        root = ET.fromstring(domain_xml)
    except ET.ParseError as exc:
        raise HTTPException(status_code=500, detail=f"Некорректный XML конфигурации ВМ '{vm_name}': {exc}")

    disks = _collect_file_disks(root)
    if not disks:
        raise HTTPException(status_code=400, detail=f"У ВМ '{vm_name}' нет поддерживаемых дисков для backup")

    backup_id = generate_backup_id(vm_name)
    backup_dir = get_backup_dir(vm_name, backup_id)
    disks_dir = backup_dir / "disks"
    nvram_dir = backup_dir / "nvram"
    copied_disks: list[DiskDescriptor] = []
    nvram_meta = _collect_nvram(root)
    overlay_specs: list[dict[str, str]] = []
    consistency = "crash-consistent"
    warnings: list[str] = []
    mode = "online" if is_active else "offline"

    try:
        backup_dir.mkdir(parents=True, exist_ok=False)
        disks_dir.mkdir(parents=True, exist_ok=False)

        if is_active:
            overlay_specs, consistency, warnings = _start_online_backup_snapshot(dom, vm_name, backup_id, backup_dir, disks)

        try:
            for disk in disks:
                source_path = str(disk["source_path"])
                target_dev = str(disk["target_dev"])
                file_name = f"{target_dev}-{os.path.basename(source_path)}"
                backup_disk_path = disks_dir / file_name
                _safe_copy(source_path, backup_disk_path, chown_user=True)
                copied_disks.append(
                    {
                        "target_dev": target_dev,
                        "file_name": file_name,
                        "original_path": source_path,
                        "format": str(disk["format"]),
                        "size_bytes": _as_int(disk["size_bytes"]),
                    }
                )

            if nvram_meta:
                nvram_dir.mkdir(parents=True, exist_ok=True)
                _safe_copy(str(nvram_meta["source_path"]), nvram_dir / str(nvram_meta["file_name"]), chown_user=True)
        finally:
            if overlay_specs:
                _finalize_online_backup_snapshot(dom, vm_name, overlay_specs, backup_dir)

        manifest = {
            "id": backup_id,
            "vm_name": vm_name,
            "created_at": datetime.now(UTC).isoformat(),
            "status": "ready",
            "mode": mode,
            "consistency": consistency,
            "warnings": warnings,
            "disks_count": len(copied_disks),
            "total_size_bytes": sum(_as_int(item["size_bytes"]) for item in copied_disks),
            "backup_path": str(backup_dir),
            "domain_xml": domain_xml,
            "disks": copied_disks,
            "nvram": (
                {
                    "file_name": str(nvram_meta["file_name"]),
                    "original_path": str(nvram_meta["source_path"]),
                }
                if nvram_meta
                else None
            ),
        }
        write_manifest(backup_dir / MANIFEST_FILENAME, manifest)
    except FileExistsError:
        raise HTTPException(status_code=409, detail=f"Backup '{backup_id}' уже существует")
    except OSError as exc:
        shutil.rmtree(backup_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Ошибка создания backup для ВМ '{vm_name}': {exc}")
    except HTTPException:
        shutil.rmtree(backup_dir, ignore_errors=True)
        raise

    return _map_backup_item(manifest)


@router.post("/backups/{backup_id}/restore", response_model=BackupActionResponse)
async def restore_backup(backup_id: str, payload: BackupRestoreRequest) -> BackupActionResponse:
    manifest = get_backup_manifest(backup_id)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Backup '{backup_id}' не найден")

    target_name = payload.target_name.strip()
    if not target_name:
        raise HTTPException(status_code=400, detail="Укажите имя ВМ для восстановления")

    conn = _get_libvirt_conn()
    try:
        existing = conn.lookupByName(target_name)  # type: ignore[no-untyped-call]
        if existing is not None:
            raise HTTPException(status_code=400, detail=f"ВМ '{target_name}' уже существует")
    except HTTPException:
        raise
    except libvirt.libvirtError:
        pass

    restore_dir = _resolve_restore_directory(conn, payload.storage_pool)
    backup_dir = get_backup_dir_by_id(backup_id)
    if backup_dir is None:
        raise HTTPException(status_code=404, detail=f"Каталог backup '{backup_id}' не найден")

    try:
        root = ET.fromstring(str(manifest.get("domain_xml") or ""))
    except ET.ParseError as exc:
        raise HTTPException(status_code=500, detail=f"Некорректный XML в backup '{backup_id}': {exc}")

    name_node = root.find("./name")
    if name_node is None:
        raise HTTPException(status_code=500, detail="В backup отсутствует имя исходной ВМ")
    name_node.text = target_name

    uuid_node = root.find("./uuid")
    if uuid_node is not None:
        root.remove(uuid_node)

    copied_paths: list[str] = []
    defined_domain = None
    disk_restore_map: dict[str, str] = {}
    backup_disks = list(manifest.get("disks") or [])
    try:
        for index, disk in enumerate(backup_disks):
            target_dev = str(disk.get("target_dev") or "")
            file_name = str(disk.get("file_name") or "")
            disk_format = str(disk.get("format") or "qcow2")
            source_backup_path = backup_dir / "disks" / file_name
            if not source_backup_path.is_file():
                raise HTTPException(status_code=500, detail=f"Файл backup диска '{file_name}' не найден")

            restored_disk_name = _build_restored_disk_name(target_name, index, target_dev, disk_format, len(backup_disks))
            restored_disk_path = os.path.join(restore_dir, restored_disk_name)
            if os.path.exists(restored_disk_path):
                raise HTTPException(status_code=400, detail=f"Файл диска '{restored_disk_name}' уже существует")

            _safe_copy(source_backup_path, restored_disk_path, chown_user=False)
            copied_paths.append(restored_disk_path)
            disk_restore_map[target_dev] = restored_disk_path

        for disk_node in root.findall("./devices/disk[@device='disk']"):
            target_node = disk_node.find("./target")
            source_node = disk_node.find("./source")
            driver_node = disk_node.find("./driver")
            target_dev = target_node.get("dev") if target_node is not None else None
            if not target_dev or target_dev not in disk_restore_map:
                continue

            if source_node is None:
                source_node = ET.SubElement(disk_node, "source")
            source_node.attrib.clear()
            source_node.set("file", disk_restore_map[target_dev])
            disk_node.set("type", "file")

            if driver_node is not None:
                for item in backup_disks:
                    if str(item.get("target_dev") or "") == target_dev:
                        driver_node.set("type", str(item.get("format") or "qcow2"))
                        break

        nvram_payload = manifest.get("nvram")
        nvram_node = root.find("./os/nvram")
        if nvram_payload and nvram_node is not None:
            original_nvram_path = str(nvram_payload.get("original_path") or "")
            source_nvram_path = backup_dir / "nvram" / str(nvram_payload.get("file_name") or "")
            if source_nvram_path.is_file() and original_nvram_path:
                original_nvram = Path(original_nvram_path)
                new_nvram_name = f"{target_name}{original_nvram.suffix or '.vars'}"
                restored_nvram_path = str(original_nvram.with_name(new_nvram_name))
                if os.path.exists(restored_nvram_path):
                    raise HTTPException(status_code=400, detail=f"NVRAM файл '{new_nvram_name}' уже существует")
                os.makedirs(os.path.dirname(restored_nvram_path), exist_ok=True)
                _safe_copy(source_nvram_path, restored_nvram_path, chown_user=False)
                copied_paths.append(restored_nvram_path)
                nvram_node.text = restored_nvram_path

        domain_xml = ET.tostring(root, encoding="unicode")
        defined_domain = conn.defineXML(domain_xml)  # type: ignore[no-untyped-call]
        if defined_domain is None:
            raise HTTPException(status_code=500, detail=f"Не удалось определить ВМ '{target_name}' из backup")

        if payload.start_vm:
            defined_domain.create()  # type: ignore[no-untyped-call]
    except HTTPException:
        _cleanup_restore_artifacts(copied_paths, defined_domain)
        raise
    except (libvirt.libvirtError, OSError) as exc:  # type: ignore[attr-defined]
        _cleanup_restore_artifacts(copied_paths, defined_domain)
        raise HTTPException(status_code=500, detail=f"Ошибка восстановления backup '{backup_id}': {exc}")

    return BackupActionResponse(
        id=backup_id,
        status="restored",
        message=f"Backup '{backup_id}' восстановлен как ВМ '{target_name}'",
        vm_name=target_name,
    )


@router.delete("/backups/{backup_id}", response_model=BackupActionResponse)
async def delete_backup(backup_id: str) -> BackupActionResponse:
    backup_dir = get_backup_dir_by_id(backup_id)
    manifest = get_backup_manifest(backup_id)
    if backup_dir is None or manifest is None:
        raise HTTPException(status_code=404, detail=f"Backup '{backup_id}' не найден")

    try:
        shutil.rmtree(backup_dir)
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Не удалось удалить backup '{backup_id}': {exc}")

    return BackupActionResponse(
        id=backup_id,
        status="deleted",
        message=f"Backup '{backup_id}' удален",
        vm_name=str(manifest.get("vm_name") or ""),
    )