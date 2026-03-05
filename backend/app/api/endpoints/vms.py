import os
from typing import List, Literal, TypedDict
from typing_extensions import TypedDict

import libvirt
from fastapi import APIRouter, HTTPException

router = APIRouter()


class VMItem(TypedDict, total=False):
    id: str
    name: str
    status: str
    cpu_cores: int | None
    memory_mb: int | None
    disk_gb: int | None
    cluster_id: int | None


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
        # isActive() возвращает 1 если домен запущен
        return "running" if dom.isActive() == 1 else "stopped"  # type: ignore[no-untyped-call]
    except libvirt.libvirtError:  # type: ignore[attr-defined]
        return "unknown"


@router.get("/vms", response_model=list[VMItem])
async def list_vms() -> List[VMItem]:
    """Вернуть список ВМ из libvirt.

    Для простоты используем имя ВМ как её идентификатор (id).
    """
    conn = _get_libvirt_conn()

    try:
        domains = conn.listAllDomains()  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка получения списка ВМ: {exc}")

    items: List[VMItem] = []
    for dom in domains:
        try:
            name = dom.name()  # type: ignore[no-untyped-call]
        except libvirt.libvirtError:
            # Пропускаем проблемные домены
            continue

        status = _vm_status_from_domain(dom)
        items.append(
            VMItem(
                id=name,
                name=name,
                status=status,
                cpu_cores=None,
                memory_mb=None,
                disk_gb=None,
                cluster_id=None,
            )
        )

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
        # Попробуем мягкий рестарт, при ошибке можно будет использовать reset
        dom.reboot(0)  # type: ignore[no-untyped-call]
    except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=500, detail=f"Ошибка перезапуска ВМ: {exc}")

    return {"status": "ok"}
