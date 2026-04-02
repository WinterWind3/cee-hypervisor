import os
import xml.etree.ElementTree as ET
from typing import List, Literal

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter()
DEFAULT_VM_IMAGES_DIR = "/var/lib/libvirt/images"


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


class VMCreate(BaseModel):
    name: str
    cpu_cores: int
    memory_mb: int
    disk_gb: int
    disk_mode: Literal["create", "existing"] = "create"
    storage_pool: str | None = None
    existing_volume: str | None = None


class VMDiskLocation(BaseModel):
    disk_path: str
    storage_pool: str | None
    storage_volume: str
    owns_disk: bool = True


def _build_volume_xml(volume_name: str, disk_gb: int) -> str:
        capacity_bytes = disk_gb * 1024 * 1024 * 1024
        return f"""
        <volume>
            <name>{volume_name}</name>
            <capacity unit='bytes'>{capacity_bytes}</capacity>
            <allocation unit='bytes'>0</allocation>
            <target>
                <format type='qcow2'/>
            </target>
        </volume>
        """.strip()


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


def _build_vm_xml(vm: VMCreate, disk_path: str) -> str:
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
        <disk type='file' device='disk'>
          <driver name='qemu' type='qcow2'/>
          <source file='{disk_path}'/>
          <target dev='vda' bus='virtio'/>
        </disk>
        <interface type='network'>
          <source network='default'/>
        </interface>
        <graphics type='vnc' port='-1'/>
      </devices>
    </domain>
    """.strip()


def _create_default_disk(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    volume_name = f"{vm.name}.qcow2"
    disk_path = os.path.join(DEFAULT_VM_IMAGES_DIR, volume_name)
    if os.path.exists(disk_path):
        raise HTTPException(status_code=400, detail=f"Диск '{os.path.basename(disk_path)}' уже существует")

    pool, pool_name = _ensure_default_images_pool(conn)

    try:
        volume = pool.createXML(_build_volume_xml(volume_name, vm.disk_gb), 0)  # type: ignore[no-untyped-call]
        pool.refresh(0)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка создания системного диска для ВМ: {exc}")

    return VMDiskLocation(
        disk_path=volume.path(),  # type: ignore[no-untyped-call]
        storage_pool=pool_name,
        storage_volume=volume_name,
        owns_disk=True,
    )


def _create_pool_volume(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    pool_name = (vm.storage_pool or "").strip()
    if not pool_name:
        return _create_default_disk(conn, vm)

    try:
        pool = conn.storagePoolLookupByName(pool_name)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=404, detail=f"Пул хранения '{pool_name}' не найден: {exc}")

    try:
        if pool.isActive() != 1:  # type: ignore[no-untyped-call]
            raise HTTPException(status_code=400, detail=f"Пул хранения '{pool_name}' не запущен")
        volume_name = f"{vm.name}.qcow2"
        pool.storageVolLookupByName(volume_name)  # type: ignore[no-untyped-call]
        raise HTTPException(status_code=400, detail=f"Том '{volume_name}' уже существует в пуле '{pool_name}'")
    except HTTPException:
        raise
    except libvirt.libvirtError:
        pass

    volume_xml = _build_volume_xml(f"{vm.name}.qcow2", vm.disk_gb)

    try:
        volume = pool.createXML(volume_xml, 0)  # type: ignore[no-untyped-call]
        pool.refresh(0)  # type: ignore[no-untyped-call]
        disk_path = volume.path()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка создания тома для ВМ: {exc}")

    return VMDiskLocation(
        disk_path=disk_path,
        storage_pool=pool_name,
        storage_volume=f"{vm.name}.qcow2",
        owns_disk=True,
    )


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
    )


def _resolve_vm_disk(conn: libvirt.virConnect, vm: VMCreate) -> VMDiskLocation:  # type: ignore[name-defined]
    if vm.disk_mode == "existing":
        return _use_existing_pool_volume(conn, vm)
    return _create_pool_volume(conn, vm)


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

    disk = _resolve_vm_disk(conn, vm)
    vm_xml = _build_vm_xml(vm, disk.disk_path)

    disk_gb = vm.disk_gb if vm.disk_mode == "create" else _get_disk_size_gb(disk.disk_path)

    try:
        dom = conn.defineXML(vm_xml)  # type: ignore[no-untyped-call]
        if dom is None:
            _delete_disk_artifact(conn, disk)
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
        )
    except HTTPException:
        raise
    except libvirt.libvirtError as exc:
        _delete_disk_artifact(conn, disk)
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
            disk_node = root.find("./devices/disk[@device='disk']/source")
            disk_path = None
            storage_volume = None
            storage_pool = None
            disk_gb = None
            if disk_node is not None:
                disk_path = disk_node.get('file') or disk_node.get('dev') or disk_node.get('name')
                if disk_path:
                    storage_volume = os.path.basename(disk_path)
                    storage_pool = _resolve_storage_pool_by_path(disk_path, pool_paths)
                    disk_gb = _get_disk_size_gb(disk_path)
        except Exception:
            cpu_cores = None
            memory_mb = None
            disk_gb = None
            disk_path = None
            storage_pool = None
            storage_volume = None

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
