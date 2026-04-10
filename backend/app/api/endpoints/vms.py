import os
import json
import shutil
import subprocess
import xml.etree.ElementTree as ET
from typing import List, Literal

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.endpoints.images import get_project_images_dir


router = APIRouter()
DEFAULT_VM_IMAGES_DIR = "/var/lib/libvirt/images"
PORTGROUPS_FILE = os.getenv("PORTGROUPS_FILE", "/app/backend/portgroups.json")
IMAGE_BACKED_EXTENSIONS = {".qcow2", ".img", ".vmdk", ".vdi"}
ISO_EXTENSION = ".iso"
DISK_FORMAT_BY_EXTENSION = {
    ".qcow2": "qcow2",
    ".img": "raw",
    ".vmdk": "vmdk",
    ".vdi": "vdi",
}


class VMItem(BaseModel):
    id: str
    name: str
    status: str
    cpu_cores: int | None = None
    memory_mb: int | None = None
    disk_gb: int | None = None
    cluster_id: int | None = None
    storage_pool: str | None = None
    storage_volume: str | None = None
    disk_path: str | None = None
    disk_format: str | None = None
    network_source_type: str | None = None
    network_name: str | None = None
    vswitch_name: str | None = None
    vswitch_portgroup: str | None = None
    cdrom_image: str | None = None
    extra_disks: list["VMAttachedDisk"] = Field(default_factory=list)


class VMAttachedDisk(BaseModel):
    target_dev: str
    disk_path: str
    disk_format: str | None = None
    disk_gb: int | None = None
    storage_pool: str | None = None
    storage_volume: str | None = None


class VMExtraDiskCreate(BaseModel):
    size_gb: int
    storage_pool: str | None = None


class VMCdromAttachRequest(BaseModel):
    image_name: str


class VMCreate(BaseModel):
    name: str
    cpu_cores: int
    memory_mb: int
    disk_gb: int
    disk_mode: Literal["create", "existing"] = "create"
    storage_pool: str | None = None
    existing_volume: str | None = None
    boot_source_image: str | None = None
    cdrom_image: str | None = None
    network_source_type: Literal["libvirt", "vswitch"] = "libvirt"
    network_name: str | None = "default"
    vswitch_name: str | None = None
    vswitch_portgroup: str | None = None
    additional_disks: list[VMExtraDiskCreate] = Field(default_factory=list)


class VMDiskLocation(BaseModel):
    disk_path: str
    storage_pool: str | None
    storage_volume: str
    owns_disk: bool = True
    disk_format: str = "qcow2"


def _build_volume_xml(volume_name: str, disk_gb: int, disk_format: str = "qcow2") -> str:
    capacity_bytes = disk_gb * 1024 * 1024 * 1024
    return f"""
    <volume>
      <name>{volume_name}</name>
      <capacity unit='bytes'>{capacity_bytes}</capacity>
      <allocation unit='bytes'>0</allocation>
      <target>
                <format type='{disk_format}'/>
      </target>
    </volume>
    """.strip()


def _detect_disk_format(disk_path: str) -> str:
    ext = os.path.splitext(disk_path)[1].lower()
    return DISK_FORMAT_BY_EXTENSION.get(ext, "qcow2")


def _load_portgroups() -> dict[str, list[dict]]:
    if not os.path.exists(PORTGROUPS_FILE):
        return {}
    try:
        with open(PORTGROUPS_FILE, "r", encoding="utf-8") as file_obj:
            data = json.load(file_obj)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}


def _ovs_bridge_exists(bridge_name: str) -> bool:
    result = subprocess.run(
        ["ovs-vsctl", "br-exists", bridge_name],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def _parse_trunk_vlan_ids(vlan_trunk: str) -> list[int]:
    vlan_ids: list[int] = []
    for segment in (item.strip() for item in vlan_trunk.split(",") if item.strip()):
        if "-" in segment:
            start_raw, end_raw = segment.split("-", 1)
            start = int(start_raw)
            end = int(end_raw)
            if start > end:
                start, end = end, start
            vlan_ids.extend(range(start, end + 1))
        else:
            vlan_ids.append(int(segment))
    # Keep order stable and remove duplicates.
    return list(dict.fromkeys(vlan_ids))


def _build_interface_xml(vm: VMCreate) -> str:
    if vm.network_source_type == "vswitch":
        switch_name = (vm.vswitch_name or "").strip()
        if not switch_name:
            raise HTTPException(status_code=400, detail="Для подключения к vSwitch укажите имя коммутатора")
        if not _ovs_bridge_exists(switch_name):
            raise HTTPException(status_code=404, detail=f"vSwitch '{switch_name}' не найден")

        vlan_xml = ""
        portgroup_name = (vm.vswitch_portgroup or "").strip()
        if portgroup_name:
            portgroups = _load_portgroups().get(switch_name, [])
            match = next((pg for pg in portgroups if str(pg.get("name")) == portgroup_name), None)
            if match is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Порт-группа '{portgroup_name}' не найдена в vSwitch '{switch_name}'",
                )

            vlan_type = str(match.get("vlan_type") or "").lower()
            if vlan_type in {"access", "tagged"}:
                vlan_id = int(match.get("vlan_id") or 0)
                if vlan_id <= 0:
                    raise HTTPException(status_code=400, detail=f"Некорректный VLAN ID в порт-группе '{portgroup_name}'")
                vlan_xml = f"<vlan><tag id='{vlan_id}'/></vlan>"
            elif vlan_type == "trunk":
                trunk_raw = str(match.get("vlan_trunk") or "").strip()
                if not trunk_raw:
                    raise HTTPException(status_code=400, detail=f"В порт-группе '{portgroup_name}' не указан trunk VLAN")
                vlan_ids = _parse_trunk_vlan_ids(trunk_raw)
                tags = "".join(f"<tag id='{vlan_id}'/>" for vlan_id in vlan_ids)
                vlan_xml = f"<vlan trunk='yes'>{tags}</vlan>"

        return (
            "<interface type='bridge'>"
            f"<source bridge='{switch_name}'/>"
            "<model type='virtio'/>"
            "<virtualport type='openvswitch'/>"
            f"{vlan_xml}"
            "</interface>"
        )

    network_name = (vm.network_name or "default").strip() or "default"
    return (
        "<interface type='network'>"
        f"<source network='{network_name}'/>"
        "<model type='virtio'/>"
        "</interface>"
    )


def _get_libvirt_conn() -> libvirt.virConnect:  # type: ignore[name-defined]
    uri = os.getenv("LIBVIRT_URI", "qemu:///system")
    try:
        conn = libvirt.open(uri)  # type: ignore[no-untyped-call]
        if conn is None:
            raise HTTPException(status_code=500, detail="Не удалось подключиться к libvirt")
        return conn
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка подключения к libvirt: {exc}")


def _vm_status_from_domain(dom: libvirt.virDomain) -> str:  # type: ignore[name-defined]
    try:
        return "running" if dom.isActive() == 1 else "stopped"  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        return "unknown"


def _get_storage_pool_paths(conn: libvirt.virConnect) -> dict[str, str]:  # type: ignore[name-defined]
    try:
        pools = conn.listAllStoragePools()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:
        return {}

    pool_paths: dict[str, str] = {}
    for pool in pools:
        try:
            xml_root = ET.fromstring(pool.XMLDesc(0))  # type: ignore[no-untyped-call]
            pool_name = pool.name()  # type: ignore[no-untyped-call]
            pool_path = xml_root.findtext("./target/path")
            if pool_name and pool_path:
                pool_paths[pool_name] = os.path.abspath(pool_path)
        except Exception:
            continue
    return pool_paths


def _find_storage_pool_by_path(conn: libvirt.virConnect, target_path: str) -> tuple[libvirt.virStoragePool, str] | tuple[None, None]:  # type: ignore[name-defined]
    normalized_target_path = os.path.abspath(target_path)
    try:
        pools = conn.listAllStoragePools()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:
        return None, None

    for pool in pools:
        try:
            xml_root = ET.fromstring(pool.XMLDesc(0))  # type: ignore[no-untyped-call]
            pool_name = pool.name()  # type: ignore[no-untyped-call]
            pool_path = xml_root.findtext("./target/path")
            if pool_name and pool_path and os.path.abspath(pool_path) == normalized_target_path:
                return pool, pool_name
        except Exception:
            continue

    return None, None


def _ensure_default_images_pool(conn: libvirt.virConnect) -> tuple[libvirt.virStoragePool, str]:  # type: ignore[name-defined]
    existing_pool, existing_pool_name = _find_storage_pool_by_path(conn, DEFAULT_VM_IMAGES_DIR)
    if existing_pool is not None and existing_pool_name is not None:
        try:
            if existing_pool.isActive() != 1:  # type: ignore[no-untyped-call]
                existing_pool.create(0)  # type: ignore[no-untyped-call]
                existing_pool.refresh(0)  # type: ignore[no-untyped-call]
        except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
            raise HTTPException(status_code=500, detail=f"Не удалось запустить пул хранения '{existing_pool_name}': {exc}")
        return existing_pool, existing_pool_name

    os.makedirs(DEFAULT_VM_IMAGES_DIR, exist_ok=True)

    base_pool_name = "cee-default-images"
    pool_name = base_pool_name
    suffix = 2
    while True:
        try:
            pool = conn.storagePoolLookupByName(pool_name)  # type: ignore[no-untyped-call]
            xml_root = ET.fromstring(pool.XMLDesc(0))  # type: ignore[no-untyped-call]
            pool_path = xml_root.findtext("./target/path")
            if pool_path and os.path.abspath(pool_path) == os.path.abspath(DEFAULT_VM_IMAGES_DIR):
                if pool.isActive() != 1:  # type: ignore[no-untyped-call]
                    pool.create(0)  # type: ignore[no-untyped-call]
                    pool.refresh(0)  # type: ignore[no-untyped-call]
                return pool, pool_name
            pool_name = f"{base_pool_name}-{suffix}"
            suffix += 1
        except libvirt.libvirtError:
            break

    pool_xml = f"""
    <pool type='dir'>
      <name>{pool_name}</name>
      <target>
        <path>{DEFAULT_VM_IMAGES_DIR}</path>
      </target>
    </pool>
    """.strip()

    try:
        pool = conn.storagePoolDefineXML(pool_xml, 0)  # type: ignore[no-untyped-call]
        if pool is None:
            raise HTTPException(status_code=500, detail="Не удалось определить пул хранения для системного каталога")
        pool.setAutostart(1)  # type: ignore[no-untyped-call]
        pool.build(0)  # type: ignore[no-untyped-call]
        pool.create(0)  # type: ignore[no-untyped-call]
        pool.refresh(0)  # type: ignore[no-untyped-call]
        return pool, pool_name
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось подготовить системный пул хранения '{DEFAULT_VM_IMAGES_DIR}': {exc}")


def _get_attached_disk_paths(conn: libvirt.virConnect) -> set[str]:  # type: ignore[name-defined]
    try:
        domains = conn.listAllDomains()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:
        return set()

    disk_paths: set[str] = set()
    for dom in domains:
        try:
            root = ET.fromstring(dom.XMLDesc())  # type: ignore[no-untyped-call]
        except Exception:
            continue

        for disk_node in root.findall("./devices/disk[@device='disk']/source"):
            disk_path = disk_node.get("file") or disk_node.get("dev") or disk_node.get("name")
            if not disk_path:
                continue
            try:
                disk_paths.add(os.path.abspath(disk_path))
            except OSError:
                continue

    return disk_paths


def _resolve_storage_pool_by_path(disk_path: str, pool_paths: dict[str, str]) -> str | None:
    if not disk_path:
        return None

    normalized_disk_path = os.path.abspath(disk_path)
    best_match: tuple[str, int] | None = None
    for pool_name, pool_path in pool_paths.items():
        try:
            common_path = os.path.commonpath([normalized_disk_path, pool_path])
        except ValueError:
            continue
        if common_path != pool_path:
            continue
        match_length = len(pool_path)
        if best_match is None or match_length > best_match[1]:
            best_match = (pool_name, match_length)
    return best_match[0] if best_match else None


def _get_disk_size_gb(disk_path: str | None) -> int | None:
    if not disk_path or not os.path.exists(disk_path):
        return None
    try:
        size_bytes = os.path.getsize(disk_path)
        if size_bytes <= 0:
            return None
        gib = 1024 * 1024 * 1024
        return max(1, int(round(size_bytes / gib)))
    except OSError:
        return None


def _get_domain_affect_flags(dom: libvirt.virDomain) -> int:  # type: ignore[name-defined]
    config_flag = int(getattr(libvirt, 'VIR_DOMAIN_AFFECT_CONFIG', 2))
    live_flag = int(getattr(libvirt, 'VIR_DOMAIN_AFFECT_LIVE', 1))

    try:
        is_active = dom.isActive() == 1  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:
        is_active = False

    return config_flag | (live_flag if is_active else 0)


def _next_virtio_disk_target_from_root(root: ET.Element) -> str:
    used_targets: set[str] = set()
    for disk_node in root.findall("./devices/disk[@device='disk']"):
        target_node = disk_node.find('./target')
        target_dev = target_node.get('dev') if target_node is not None else None
        if target_dev:
            used_targets.add(target_dev)

    for code in range(ord('a'), ord('z') + 1):
        candidate = f"vd{chr(code)}"
        if candidate not in used_targets:
            return candidate

    raise HTTPException(status_code=400, detail='У ВМ больше нет свободных virtio-слотов для подключения диска')


def _build_data_disk_xml(disk_path: str, disk_format: str, target_dev: str, boot_order: int | None = None) -> str:
    boot_order_xml = f"<boot order='{boot_order}'/>" if boot_order is not None else ""
    return (
        "<disk type='file' device='disk'>"
        f"<driver name='qemu' type='{disk_format}'/>"
        f"<source file='{disk_path}'/>"
        f"<target dev='{target_dev}' bus='virtio'/>"
        f"{boot_order_xml}"
        "</disk>"
    )


def _build_cdrom_xml(cdrom_iso_path: str, boot_order: int | None = None) -> str:
    boot_order_xml = f"<boot order='{boot_order}'/>" if boot_order is not None else ""
    return (
        "<disk type='file' device='cdrom'>"
        "<driver name='qemu' type='raw'/>"
        f"<source file='{cdrom_iso_path}'/>"
        "<target dev='hda' bus='ide'/>"
        "<readonly/>"
        f"{boot_order_xml}"
        "</disk>"
    )


def _build_vm_xml(
    vm: VMCreate,
    disk_path: str,
    disk_format: str,
    cdrom_iso_path: str | None = None,
    extra_disks: list[VMDiskLocation] | None = None,
) -> str:
    interface_xml = _build_interface_xml(vm)
    boot_order = 1
    cdrom_xml = _build_cdrom_xml(cdrom_iso_path, boot_order) if cdrom_iso_path else ""
    primary_disk_boot_order = 2 if cdrom_iso_path else 1
    primary_disk_xml = _build_data_disk_xml(disk_path, disk_format, 'vda', primary_disk_boot_order)

    extra_disk_xml_parts: list[str] = []
    next_boot_order = primary_disk_boot_order + 1
    for index, extra_disk in enumerate(extra_disks or [], start=1):
        target_dev = f"vd{chr(ord('a') + index)}"
        extra_disk_xml_parts.append(
            _build_data_disk_xml(extra_disk.disk_path, extra_disk.disk_format, target_dev, next_boot_order)
        )
        next_boot_order += 1

    extra_disk_xml = "\n        ".join(extra_disk_xml_parts)

    return f"""
    <domain type='kvm'>
      <name>{vm.name}</name>
      <memory unit='MiB'>{vm.memory_mb}</memory>
      <currentMemory unit='MiB'>{vm.memory_mb}</currentMemory>
      <vcpu>{vm.cpu_cores}</vcpu>
      <os>
        <type arch='x86_64'>hvm</type>
      </os>
      <devices>
        <emulator>/usr/bin/qemu-system-x86_64</emulator>
        {primary_disk_xml}
                {cdrom_xml}
                {extra_disk_xml}
                {interface_xml}
                <graphics type='vnc' autoport='yes' listen='0.0.0.0'/>
      </devices>
    </domain>
    """.strip()


def _get_target_pool_for_volume(
    conn: libvirt.virConnect,
    pool_name: str | None,
) -> tuple[libvirt.virStoragePool, str]:  # type: ignore[name-defined]
    if not (pool_name or "").strip():
        return _ensure_default_images_pool(conn)

    resolved_pool_name = (pool_name or "").strip()
    try:
        pool = conn.storagePoolLookupByName(resolved_pool_name)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"Пул хранения '{resolved_pool_name}' не найден: {exc}")

    try:
        if pool.isActive() != 1:  # type: ignore[no-untyped-call]
            raise HTTPException(status_code=400, detail=f"Пул хранения '{resolved_pool_name}' не запущен")
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Не удалось проверить пул '{resolved_pool_name}': {exc}")

    return pool, resolved_pool_name


def _create_named_volume(
    conn: libvirt.virConnect,
    volume_name: str,
    disk_gb: int,
    pool_name: str | None = None,
) -> VMDiskLocation:  # type: ignore[name-defined]
    pool, resolved_pool_name = _get_target_pool_for_volume(conn, pool_name)

    try:
        pool.storageVolLookupByName(volume_name)  # type: ignore[no-untyped-call]
        raise HTTPException(status_code=400, detail=f"Том '{volume_name}' уже существует в пуле '{resolved_pool_name}'")
    except HTTPException:
        raise
    except libvirt.libvirtError:
        pass

    try:
        volume = pool.createXML(_build_volume_xml(volume_name, disk_gb), 0)  # type: ignore[no-untyped-call]
        pool.refresh(0)  # type: ignore[no-untyped-call]
        disk_path = volume.path()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка создания тома '{volume_name}': {exc}")

    return VMDiskLocation(
        disk_path=disk_path,
        storage_pool=resolved_pool_name,
        storage_volume=volume_name,
        owns_disk=True,
        disk_format="qcow2",
    )


def _create_default_disk(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    return _create_named_volume(conn, f"{vm.name}.qcow2", vm.disk_gb)


def _create_pool_volume(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    pool_name = (vm.storage_pool or "").strip()
    if not pool_name:
        return _create_default_disk(conn, vm)
    return _create_named_volume(conn, f"{vm.name}.qcow2", vm.disk_gb, pool_name)


def _use_existing_pool_volume(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    pool_name = (vm.storage_pool or "").strip()
    volume_name = (vm.existing_volume or "").strip()

    if not pool_name:
        raise HTTPException(status_code=400, detail="Для использования существующего тома выберите пул хранения")
    if not volume_name:
        raise HTTPException(status_code=400, detail="Для использования существующего тома выберите том")

    try:
        pool = conn.storagePoolLookupByName(pool_name)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"Пул хранения '{pool_name}' не найден: {exc}")

    try:
        if pool.isActive() != 1:  # type: ignore[no-untyped-call]
            raise HTTPException(status_code=400, detail=f"Пул хранения '{pool_name}' не запущен")
        volume = pool.storageVolLookupByName(volume_name)  # type: ignore[no-untyped-call]
        disk_path = volume.path()  # type: ignore[no-untyped-call]
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"Том '{volume_name}' не найден в пуле '{pool_name}': {exc}")

    attached_disk_paths = _get_attached_disk_paths(conn)
    normalized_disk_path = os.path.abspath(disk_path)
    if normalized_disk_path in attached_disk_paths:
        raise HTTPException(
            status_code=400,
            detail=f"Том '{volume_name}' из пула '{pool_name}' уже подключен к другой виртуальной машине",
        )

    return VMDiskLocation(
        disk_path=disk_path,
        storage_pool=pool_name,
        storage_volume=volume_name,
        owns_disk=False,
        disk_format=_detect_disk_format(disk_path),
    )


def _create_disk_from_uploaded_image(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    image_name = (vm.boot_source_image or "").strip()
    if not image_name:
        raise HTTPException(status_code=400, detail="Не выбран исходный образ диска")

    if (vm.storage_pool or "").strip():
        raise HTTPException(
            status_code=400,
            detail="Запуск из загруженного образа поддерживается только для системного каталога /var/lib/libvirt/images",
        )

    source_path = os.path.join(get_project_images_dir(), image_name)
    if not os.path.isfile(source_path):
        raise HTTPException(status_code=404, detail=f"Образ '{image_name}' не найден в разделе Образы")

    source_ext = os.path.splitext(image_name)[1].lower()
    if source_ext not in IMAGE_BACKED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Для диска ВМ поддерживаются только qcow2/img/vmdk/vdi образы",
        )

    os.makedirs(DEFAULT_VM_IMAGES_DIR, exist_ok=True)
    target_name = f"{vm.name}{source_ext}"
    target_path = os.path.join(DEFAULT_VM_IMAGES_DIR, target_name)
    if os.path.exists(target_path):
        raise HTTPException(status_code=400, detail=f"Диск '{target_name}' уже существует")

    try:
        shutil.copy2(source_path, target_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Не удалось скопировать образ '{image_name}': {exc}")

    pool, pool_name = _ensure_default_images_pool(conn)
    try:
        if pool.isActive() == 1:  # type: ignore[no-untyped-call]
            pool.refresh(0)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:
        pass

    return VMDiskLocation(
        disk_path=target_path,
        storage_pool=pool_name,
        storage_volume=target_name,
        owns_disk=True,
        disk_format=_detect_disk_format(target_path),
    )


def _get_uploaded_image_path(image_name: str) -> str:
    source_path = os.path.join(get_project_images_dir(), image_name)
    if not os.path.isfile(source_path):
        raise HTTPException(status_code=404, detail=f"Образ '{image_name}' не найден в разделе Образы")
    return source_path


def _resolve_boot_iso(vm: VMCreate) -> str | None:
    image_name = ((vm.cdrom_image or "").strip() or (vm.boot_source_image or "").strip())
    if not image_name:
        return None

    source_ext = os.path.splitext(image_name)[1].lower()
    if source_ext != ISO_EXTENSION:
        return None

    source_path = _get_uploaded_image_path(image_name)

    # libvirt runs on the host — it cannot access container-internal paths.
    # Copy the ISO into the libvirt images directory so the host daemon can read it.
    os.makedirs(DEFAULT_VM_IMAGES_DIR, exist_ok=True)
    target_path = os.path.join(DEFAULT_VM_IMAGES_DIR, image_name)
    if not os.path.exists(target_path):
        try:
            shutil.copy2(source_path, target_path)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Не удалось скопировать ISO '{image_name}' в каталог libvirt: {exc}")

    return target_path


def _create_additional_disks(conn: libvirt.virConnect, vm: VMCreate) -> list[VMDiskLocation]:  # type: ignore[name-defined]
    created_disks: list[VMDiskLocation] = []
    for index, extra_disk in enumerate(vm.additional_disks, start=1):
        if extra_disk.size_gb <= 0:
            raise HTTPException(status_code=400, detail=f"Размер дополнительного диска #{index} должен быть больше нуля")

        volume_name = f"{vm.name}-data-{index}.qcow2"
        created_disks.append(_create_named_volume(conn, volume_name, extra_disk.size_gb, extra_disk.storage_pool))

    return created_disks


def _extract_cdrom_image(root: ET.Element) -> str | None:
    cdrom_node = root.find("./devices/disk[@device='cdrom']")
    if cdrom_node is None:
        return None

    source_node = cdrom_node.find('./source')
    iso_path = source_node.get('file') if source_node is not None else None
    return os.path.basename(iso_path) if iso_path else None


def _extract_additional_disks(root: ET.Element, pool_paths: dict[str, str]) -> list[VMAttachedDisk]:
    extra_disks: list[VMAttachedDisk] = []
    for disk_node in root.findall("./devices/disk[@device='disk']"):
        target_node = disk_node.find('./target')
        target_dev = target_node.get('dev') if target_node is not None else None
        if not target_dev or target_dev == 'vda':
            continue

        source_node = disk_node.find('./source')
        disk_path = source_node.get('file') or source_node.get('dev') or source_node.get('name') if source_node is not None else None
        if not disk_path:
            continue

        driver = disk_node.find('./driver')
        disk_format = driver.get('type') if driver is not None else None
        extra_disks.append(
            VMAttachedDisk(
                target_dev=target_dev,
                disk_path=disk_path,
                disk_format=disk_format,
                disk_gb=_get_disk_size_gb(disk_path),
                storage_pool=_resolve_storage_pool_by_path(disk_path, pool_paths),
                storage_volume=os.path.basename(disk_path),
            )
        )

    return extra_disks


def _get_domain_or_404(conn: libvirt.virConnect, vm_name: str) -> libvirt.virDomain:  # type: ignore[name-defined]
    try:
        return conn.lookupByName(vm_name)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{vm_name}' не найдена: {exc}")


def _find_cdrom_disk_xml(dom: libvirt.virDomain) -> str | None:  # type: ignore[name-defined]
    try:
        root = ET.fromstring(dom.XMLDesc())  # type: ignore[no-untyped-call]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Не удалось прочитать XML виртуальной машины: {exc}")

    cdrom_node = root.find("./devices/disk[@device='cdrom']")
    if cdrom_node is None:
        return None
    return ET.tostring(cdrom_node, encoding='unicode')


def _resolve_vm_disk(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    image_name = (vm.boot_source_image or "").strip()
    if image_name:
        source_path = _get_uploaded_image_path(image_name)
        source_ext = os.path.splitext(source_path)[1].lower()
        if source_ext == ISO_EXTENSION:
            if vm.disk_mode == "existing":
                return _use_existing_pool_volume(conn, vm)
            return _create_pool_volume(conn, vm)
        return _create_disk_from_uploaded_image(conn, vm)

    if vm.disk_mode == "existing":
        return _use_existing_pool_volume(conn, vm)
    return _create_pool_volume(conn, vm)


def _extract_vm_network_details(root: ET.Element) -> tuple[str | None, str | None, str | None, str | None]:
    interface = root.find("./devices/interface")
    if interface is None:
        return None, None, None, None

    interface_type = interface.get("type")
    source_node = interface.find("./source")
    if interface_type == "network":
        return "libvirt", source_node.get("network") if source_node is not None else None, None, None

    if interface_type == "bridge":
        bridge_name = source_node.get("bridge") if source_node is not None else None
        vlan_node = interface.find("./vlan")
        if vlan_node is None:
            return "vswitch", None, bridge_name, None

        tag_nodes = vlan_node.findall("./tag")
        if not tag_nodes:
            return "vswitch", None, bridge_name, None

        trunk = vlan_node.get("trunk") == "yes"
        if trunk:
            portgroup = "trunk:" + ",".join(tag.get("id") for tag in tag_nodes if tag.get("id"))
            return "vswitch", None, bridge_name, portgroup

        return "vswitch", None, bridge_name, tag_nodes[0].get("id")

    return None, None, None, None


def _extract_primary_disk(root: ET.Element) -> tuple[str | None, str | None]:
    disk_node = root.find("./devices/disk[@device='disk']")
    if disk_node is None:
        return None, None

    source_node = disk_node.find("./source")
    if source_node is None:
        return None, None

    disk_path = source_node.get("file") or source_node.get("dev") or source_node.get("name")
    driver = disk_node.find("./driver")
    disk_format = driver.get("type") if driver is not None else None
    return disk_path, disk_format


def _delete_disk_artifact(conn: libvirt.virConnect, disk: VMDiskLocation) -> None:  # type: ignore[name-defined]
    if not disk.owns_disk:
        return

    try:
        if disk.storage_pool:
            pool = conn.storagePoolLookupByName(disk.storage_pool)  # type: ignore[no-untyped-call]
            volume = pool.storageVolLookupByName(disk.storage_volume)  # type: ignore[no-untyped-call]
            volume.delete(0)  # type: ignore[no-untyped-call]
            if pool.isActive() == 1:  # type: ignore[no-untyped-call]
                pool.refresh(0)  # type: ignore[no-untyped-call]
            return
    except Exception:
        pass

    try:
        if disk.disk_path and os.path.exists(disk.disk_path):
            os.remove(disk.disk_path)
    except OSError:
        pass


@router.post("/vms", response_model=VMItem)
async def create_vm(vm: VMCreate) -> VMItem:
    conn = _get_libvirt_conn()

    try:
        existing = conn.lookupByName(vm.name)  # type: ignore[no-untyped-call]
        if existing is not None:
            raise HTTPException(status_code=400, detail=f"ВМ '{vm.name}' уже существует")
    except HTTPException:
        raise
    except libvirt.libvirtError:
        pass

    disk = None
    additional_disks: list[VMDiskLocation] = []
    try:
        disk = _resolve_vm_disk(conn, vm)
        additional_disks = _create_additional_disks(conn, vm)
        boot_iso_path = _resolve_boot_iso(vm)
    except Exception:
        if disk is not None:
            _delete_disk_artifact(conn, disk)
        for extra_disk in additional_disks:
            _delete_disk_artifact(conn, extra_disk)
        raise

    vm_xml = _build_vm_xml(vm, disk.disk_path, disk.disk_format, boot_iso_path, additional_disks)

    disk_gb = vm.disk_gb if vm.disk_mode == "create" else _get_disk_size_gb(disk.disk_path)

    try:
        dom = conn.defineXML(vm_xml)  # type: ignore[no-untyped-call]
        if dom is None:
            _delete_disk_artifact(conn, disk)
            for extra_disk in additional_disks:
                _delete_disk_artifact(conn, extra_disk)
            raise HTTPException(status_code=500, detail="Не удалось создать ВМ через libvirt")
        return VMItem(
            id=vm.name,
            name=vm.name,
            status=_vm_status_from_domain(dom),
            cpu_cores=vm.cpu_cores,
            memory_mb=vm.memory_mb,
            disk_gb=disk_gb,
            cluster_id=None,
            storage_pool=disk.storage_pool,
            storage_volume=disk.storage_volume,
            disk_path=disk.disk_path,
            disk_format=disk.disk_format,
            network_source_type=vm.network_source_type,
            network_name=vm.network_name if vm.network_source_type == "libvirt" else None,
            vswitch_name=vm.vswitch_name if vm.network_source_type == "vswitch" else None,
            vswitch_portgroup=vm.vswitch_portgroup if vm.network_source_type == "vswitch" else None,
            cdrom_image=os.path.basename(boot_iso_path) if boot_iso_path else None,
            extra_disks=[
                VMAttachedDisk(
                    target_dev=f"vd{chr(ord('a') + index)}",
                    disk_path=extra_disk.disk_path,
                    disk_format=extra_disk.disk_format,
                    disk_gb=_get_disk_size_gb(extra_disk.disk_path),
                    storage_pool=extra_disk.storage_pool,
                    storage_volume=extra_disk.storage_volume,
                )
                for index, extra_disk in enumerate(additional_disks, start=1)
            ],
        )
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:
        _delete_disk_artifact(conn, disk)
        for extra_disk in additional_disks:
            _delete_disk_artifact(conn, extra_disk)
        raise HTTPException(status_code=500, detail=f"Ошибка libvirt: {exc}")


@router.get("/vms", response_model=list[VMItem])
async def list_vms() -> List[VMItem]:
    conn = _get_libvirt_conn()

    try:
        domains = conn.listAllDomains()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка получения списка ВМ: {exc}")

    items: List[VMItem] = []
    vm_names = []
    pool_paths = _get_storage_pool_paths(conn)

    for dom in domains:
        try:
            name = dom.name()  # type: ignore[no-untyped-call]
        except libvirt.libvirtError:
            continue

        vm_names.append(name)
        status = _vm_status_from_domain(dom)
        try:
            xml = dom.XMLDesc()  # type: ignore[no-untyped-call]
            root = ET.fromstring(xml)
            cpu_cores = int(root.findtext('./vcpu') or 0) or None
            memory_kib = int(root.findtext('./memory') or 0) or None
            memory_mb = int(memory_kib / 1024) if memory_kib else None
            disk_path, disk_format = _extract_primary_disk(root)
            network_source_type, network_name, vswitch_name, vswitch_portgroup = _extract_vm_network_details(root)
            cdrom_image = _extract_cdrom_image(root)
            extra_disks = _extract_additional_disks(root, pool_paths)
            storage_volume = None
            storage_pool = None
            disk_gb = None
            if disk_path:
                storage_volume = os.path.basename(disk_path)
                storage_pool = _resolve_storage_pool_by_path(disk_path, pool_paths)
                disk_gb = _get_disk_size_gb(disk_path)
        except Exception:
            cpu_cores = None
            memory_mb = None
            disk_gb = None
            disk_path = None
            disk_format = None
            storage_pool = None
            storage_volume = None
            network_source_type = None
            network_name = None
            vswitch_name = None
            vswitch_portgroup = None
            cdrom_image = None
            extra_disks = []

        items.append(
            VMItem(
                id=name,
                name=name,
                status=status,
                cpu_cores=cpu_cores,
                memory_mb=memory_mb,
                disk_gb=disk_gb,
                cluster_id=None,
                storage_pool=storage_pool,
                storage_volume=storage_volume,
                disk_path=disk_path,
                disk_format=disk_format,
                network_source_type=network_source_type,
                network_name=network_name,
                vswitch_name=vswitch_name,
                vswitch_portgroup=vswitch_portgroup,
                cdrom_image=cdrom_image,
                extra_disks=extra_disks,
            )
        )

    print(f"[DEBUG] VM list from libvirt: {vm_names}")
    return items


@router.post("/vms/{vm_id}/start")
async def start_vm(vm_id: str) -> dict:
    conn = _get_libvirt_conn()
    try:
        dom = conn.lookupByName(vm_id)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{vm_id}' не найдена")

    if _vm_status_from_domain(dom) == "running":
        raise HTTPException(status_code=400, detail="ВМ уже запущена")

    try:
        dom.create()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка запуска ВМ: {exc}")

    return {"status": "ok"}


@router.delete("/vms/{vm_id}")
async def delete_vm(vm_id: str, delete_disk: bool = False) -> dict:
    conn = _get_libvirt_conn()
    try:
        dom = conn.lookupByName(vm_id)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{vm_id}' не найдена")

    disk = None
    try:
        root = ET.fromstring(dom.XMLDesc())  # type: ignore[no-untyped-call]
        disk_path, _ = _extract_primary_disk(root)
        if disk_path:
            disk = VMDiskLocation(
                disk_path=disk_path,
                storage_pool=_resolve_storage_pool_by_path(disk_path, _get_storage_pool_paths(conn)),
                storage_volume=os.path.basename(disk_path),
                owns_disk=delete_disk,
                disk_format=_detect_disk_format(disk_path),
            )
    except Exception:
        disk = None

    try:
        if dom.isActive() == 1:  # type: ignore[no-untyped-call]
            dom.destroy()  # type: ignore[no-untyped-call]
        dom.undefineFlags(  # type: ignore[no-untyped-call]
            libvirt.VIR_DOMAIN_UNDEFINE_MANAGED_SAVE
            | libvirt.VIR_DOMAIN_UNDEFINE_SNAPSHOTS_METADATA
            | libvirt.VIR_DOMAIN_UNDEFINE_NVRAM
            | libvirt.VIR_DOMAIN_UNDEFINE_CHECKPOINTS_METADATA
        )
    except AttributeError:
        try:
            dom.undefine()  # type: ignore[no-untyped-call]
        except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
            raise HTTPException(status_code=500, detail=f"Ошибка удаления ВМ: {exc}")
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка удаления ВМ: {exc}")

    if delete_disk and disk is not None:
        _delete_disk_artifact(conn, disk)

    return {
        "status": "ok",
        "message": f"ВМ '{vm_id}' удалена",
        "disk_deleted": bool(delete_disk),
    }


@router.post("/vms/{vm_id}/stop")
async def stop_vm(vm_id: str) -> dict:
    conn = _get_libvirt_conn()
    try:
        dom = conn.lookupByName(vm_id)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{vm_id}' не найдена")

    if _vm_status_from_domain(dom) == "stopped":
        raise HTTPException(status_code=400, detail="ВМ уже остановлена")

    try:
        dom.shutdown()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка остановки ВМ: {exc}")

    return {"status": "ok"}


@router.post("/vms/{vm_id}/cdrom")
async def attach_vm_cdrom(vm_id: str, payload: VMCdromAttachRequest) -> dict:
    image_name = payload.image_name.strip()
    if not image_name:
        raise HTTPException(status_code=400, detail="Имя ISO-образа обязательно")

    conn = _get_libvirt_conn()
    dom = _get_domain_or_404(conn, vm_id)
    source_ext = os.path.splitext(image_name)[1].lower()
    if source_ext != ISO_EXTENSION:
        raise HTTPException(status_code=400, detail="Для CD-ROM поддерживаются только ISO-образы")

    iso_path = _resolve_boot_iso(VMCreate(name=vm_id, cpu_cores=1, memory_mb=128, disk_gb=1, cdrom_image=image_name))
    if iso_path is None:
        raise HTTPException(status_code=400, detail="Не удалось подготовить ISO-образ для CD-ROM")

    flags = _get_domain_affect_flags(dom)
    existing_cdrom_xml = _find_cdrom_disk_xml(dom)
    try:
        if existing_cdrom_xml:
            dom.detachDeviceFlags(existing_cdrom_xml, flags)  # type: ignore[no-untyped-call]
        dom.attachDeviceFlags(_build_cdrom_xml(iso_path), flags)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка подключения ISO к ВМ: {exc}")

    return {"status": "ok", "message": f"ISO '{image_name}' подключен к ВМ '{vm_id}'"}


@router.delete("/vms/{vm_id}/cdrom")
async def detach_vm_cdrom(vm_id: str) -> dict:
    conn = _get_libvirt_conn()
    dom = _get_domain_or_404(conn, vm_id)
    existing_cdrom_xml = _find_cdrom_disk_xml(dom)
    if not existing_cdrom_xml:
        raise HTTPException(status_code=400, detail=f"У ВМ '{vm_id}' нет подключенного ISO/CD-ROM")

    try:
        dom.detachDeviceFlags(existing_cdrom_xml, _get_domain_affect_flags(dom))  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка отключения ISO от ВМ: {exc}")

    return {"status": "ok", "message": f"ISO/CD-ROM отключен от ВМ '{vm_id}'"}


@router.post("/vms/{vm_id}/restart")
async def restart_vm(vm_id: str) -> dict:
    conn = _get_libvirt_conn()
    try:
        dom = conn.lookupByName(vm_id)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"ВМ '{vm_id}' не найдена")

    try:
        dom.reboot(0)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка перезапуска ВМ: {exc}")

    return {"status": "ok"}
