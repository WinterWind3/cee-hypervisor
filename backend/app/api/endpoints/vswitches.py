"""
Virtual Switch (vSwitch) management via Open vSwitch (OVS).

Architecture mirrors VMware ESXi vSS:
  - vSwitch  = OVS bridge (ovs-vsctl add-br)
  - Uplink   = physical NIC attached to the bridge (ovs-vsctl add-port)
  - PortGroup = named VLAN policy stored in portgroups.json

Port group VLAN types:
  access  – untagged to VM; OVS applies tag on uplink side  (tag=N)
  tagged  – single VLAN, 802.1q toward VM                    (trunks=N)
  trunk   – multiple VLANs, 802.1q toward VM                 (trunks=N1,N2,…)

Port group records are persisted in PORTGROUPS_FILE (JSON).
OVS state is authoritative for bridge/uplink existence.
"""

import json
import os
import re
import subprocess
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

PORTGROUPS_FILE = os.getenv("PORTGROUPS_FILE", "/app/backend/portgroups.json")

# ── Validation helpers ─────────────────────────────────────────────────────────

_NAME_RE = re.compile(r'^[a-zA-Z0-9_-]{1,15}$')
_TRUNK_RE = re.compile(r'^(\d{1,4}(-\d{1,4})?)(\s*,\s*(\d{1,4}(-\d{1,4})?))*$')
_UPLINK_EXCLUDE = re.compile(r'^(lo$|vnet|tap|tun|docker|virbr|br-|ovs-)')


def _valid_name(name: str) -> bool:
    return bool(_NAME_RE.match(name))


def _valid_vlan_id(vlan_id: Optional[int]) -> bool:
    return vlan_id is not None and 1 <= vlan_id <= 4094


def _valid_trunk(trunk: Optional[str]) -> bool:
    return bool(trunk and _TRUNK_RE.match(trunk.strip()))


# ── Models ─────────────────────────────────────────────────────────────────────

class PortGroupCreate(BaseModel):
    name: str
    vlan_type: str            # access | tagged | trunk
    vlan_id: Optional[int] = None
    vlan_trunk: Optional[str] = None   # "100,200-210,300"


class PortGroupItem(BaseModel):
    name: str
    vlan_type: str
    vlan_id: Optional[int] = None
    vlan_trunk: Optional[str] = None


class VSwitchCreate(BaseModel):
    name: str
    uplink: Optional[str] = None


class VSwitchItem(BaseModel):
    name: str
    uplink: Optional[str] = None
    portgroups: list[PortGroupItem] = []
    status: str


class UplinkUpdate(BaseModel):
    uplink: str


# ── OVS subprocess wrappers ────────────────────────────────────────────────────

def _ovs(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    try:
        result = subprocess.run(
            ["ovs-vsctl"] + list(args),
            capture_output=True,
            text=True,
            timeout=10,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="ovs-vsctl не найден в контейнере. Убедитесь что openvswitch-common установлен.",
        )
    if check and result.returncode != 0:
        stderr = result.stderr.strip()
        if result.returncode == 127 or "not found" in stderr.lower():
            raise HTTPException(
                status_code=503,
                detail="ovs-vsctl не найден. Установите openvswitch-common на хост.",
            )
        raise HTTPException(
            status_code=500,
            detail=stderr or f"Ошибка OVS команды: ovs-vsctl {' '.join(args)}",
        )
    return result


def _list_bridges() -> list[str]:
    r = _ovs("list-br", check=False)
    if r.returncode != 0:
        return []
    return [b.strip() for b in r.stdout.splitlines() if b.strip()]


def _bridge_exists(name: str) -> bool:
    r = _ovs("br-exists", name, check=False)
    return r.returncode == 0


def _get_bridge_uplink(bridge: str) -> Optional[str]:
    """Return the physical uplink port of a bridge, or None."""
    r = _ovs("list-ports", bridge, check=False)
    if r.returncode != 0:
        return None
    for port in (p.strip() for p in r.stdout.splitlines() if p.strip()):
        tr = _ovs("get", "Interface", port, "type", check=False)
        iface_type = tr.stdout.strip().strip('"') if tr.returncode == 0 else "unknown"
        # Empty type = regular system interface (physical NIC / bond)
        if iface_type == "" and not _UPLINK_EXCLUDE.match(port):
            return port
    return None


def _bridge_status(bridge: str) -> str:
    r = subprocess.run(["ip", "link", "show", bridge], capture_output=True, text=True)
    if r.returncode != 0:
        return "unknown"
    return "up" if "UP" in r.stdout else "down"


# ── Port group persistence ─────────────────────────────────────────────────────

def _load_pg() -> dict[str, list[dict]]:
    if not os.path.exists(PORTGROUPS_FILE):
        return {}
    try:
        with open(PORTGROUPS_FILE) as f:
            return json.load(f)
    except Exception:
        return {}


def _save_pg(data: dict[str, list[dict]]) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(PORTGROUPS_FILE)), exist_ok=True)
    with open(PORTGROUPS_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ── Interface discovery ────────────────────────────────────────────────────────

def _available_interfaces() -> list[str]:
    """Physical interfaces not already used as uplinks or OVS bridges."""
    r = subprocess.run(["ip", "-o", "link", "show"], capture_output=True, text=True)
    ifaces: list[str] = []
    for line in r.stdout.splitlines():
        m = re.match(r'\d+:\s+(\S+?)[@:]', line)
        if m:
            name = m.group(1)
            if not _UPLINK_EXCLUDE.match(name):
                ifaces.append(name)

    bridges = _list_bridges()
    used: set[str] = set(bridges)
    for br in bridges:
        uplink = _get_bridge_uplink(br)
        if uplink:
            used.add(uplink)

    return [i for i in ifaces if i not in used]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/vswitches/interfaces", response_model=list[str])
async def list_interfaces() -> list[str]:
    """List physical interfaces available for use as uplinks."""
    return _available_interfaces()


@router.get("/vswitches", response_model=list[VSwitchItem])
async def list_vswitches() -> list[VSwitchItem]:
    pg_data = _load_pg()
    result: list[VSwitchItem] = []
    for bridge in _list_bridges():
        portgroups = [PortGroupItem(**pg) for pg in pg_data.get(bridge, [])]
        result.append(VSwitchItem(
            name=bridge,
            uplink=_get_bridge_uplink(bridge),
            portgroups=portgroups,
            status=_bridge_status(bridge),
        ))
    return result


@router.post("/vswitches", response_model=VSwitchItem, status_code=201)
async def create_vswitch(payload: VSwitchCreate) -> VSwitchItem:
    if not _valid_name(payload.name):
        raise HTTPException(
            status_code=400,
            detail="Имя может содержать только буквы, цифры, '-' и '_', до 15 символов.",
        )
    if _bridge_exists(payload.name):
        raise HTTPException(status_code=400, detail=f"vSwitch '{payload.name}' уже существует.")

    _ovs("add-br", payload.name)

    uplink: Optional[str] = None
    if payload.uplink:
        avail = _available_interfaces()
        if payload.uplink not in avail:
            _ovs("del-br", payload.name, check=False)
            raise HTTPException(
                status_code=400,
                detail=f"Интерфейс '{payload.uplink}' недоступен или уже используется.",
            )
        _ovs("add-port", payload.name, payload.uplink)
        uplink = payload.uplink

    pg_data = _load_pg()
    pg_data.setdefault(payload.name, [])
    _save_pg(pg_data)

    return VSwitchItem(
        name=payload.name,
        uplink=uplink,
        portgroups=[],
        status=_bridge_status(payload.name),
    )


@router.delete("/vswitches/{name}", status_code=204)
async def delete_vswitch(name: str) -> None:
    if not _bridge_exists(name):
        raise HTTPException(status_code=404, detail=f"vSwitch '{name}' не найден.")
    _ovs("del-br", name)
    pg_data = _load_pg()
    pg_data.pop(name, None)
    _save_pg(pg_data)


@router.put("/vswitches/{name}/uplink", response_model=VSwitchItem)
async def set_uplink(name: str, payload: UplinkUpdate) -> VSwitchItem:
    if not _bridge_exists(name):
        raise HTTPException(status_code=404, detail=f"vSwitch '{name}' не найден.")

    old = _get_bridge_uplink(name)
    if old:
        _ovs("del-port", name, old)

    _ovs("add-port", name, payload.uplink)

    pg_data = _load_pg()
    portgroups = [PortGroupItem(**pg) for pg in pg_data.get(name, [])]
    return VSwitchItem(
        name=name,
        uplink=payload.uplink,
        portgroups=portgroups,
        status=_bridge_status(name),
    )


@router.delete("/vswitches/{name}/uplink", status_code=204)
async def remove_uplink(name: str) -> None:
    if not _bridge_exists(name):
        raise HTTPException(status_code=404, detail=f"vSwitch '{name}' не найден.")
    uplink = _get_bridge_uplink(name)
    if not uplink:
        raise HTTPException(status_code=404, detail="Аплинк для этого коммутатора не назначен.")
    _ovs("del-port", name, uplink)


@router.post("/vswitches/{name}/portgroups", response_model=PortGroupItem, status_code=201)
async def create_portgroup(name: str, payload: PortGroupCreate) -> PortGroupItem:
    if not _bridge_exists(name):
        raise HTTPException(status_code=404, detail=f"vSwitch '{name}' не найден.")

    if payload.vlan_type not in ("access", "tagged", "trunk"):
        raise HTTPException(
            status_code=400,
            detail="vlan_type должен быть: access, tagged или trunk.",
        )

    if payload.vlan_type in ("access", "tagged"):
        if not _valid_vlan_id(payload.vlan_id):
            raise HTTPException(status_code=400, detail="VLAN ID должен быть от 1 до 4094.")

    if payload.vlan_type == "trunk":
        if not _valid_trunk(payload.vlan_trunk):
            raise HTTPException(
                status_code=400,
                detail="Некорректный формат trunk. Пример: 100,200-210,300",
            )

    if not _valid_name(payload.name):
        raise HTTPException(
            status_code=400,
            detail="Имя порт-группы: только буквы, цифры, '-' и '_', до 15 символов.",
        )

    pg_data = _load_pg()
    existing = pg_data.get(name, [])
    if any(pg["name"] == payload.name for pg in existing):
        raise HTTPException(
            status_code=400,
            detail=f"Порт-группа '{payload.name}' уже существует в vSwitch '{name}'.",
        )

    pg = {
        "name": payload.name,
        "vlan_type": payload.vlan_type,
        "vlan_id": payload.vlan_id,
        "vlan_trunk": payload.vlan_trunk if payload.vlan_type == "trunk" else None,
    }
    existing.append(pg)
    pg_data[name] = existing
    _save_pg(pg_data)

    return PortGroupItem(**pg)


@router.delete("/vswitches/{name}/portgroups/{pg_name}", status_code=204)
async def delete_portgroup(name: str, pg_name: str) -> None:
    if not _bridge_exists(name):
        raise HTTPException(status_code=404, detail=f"vSwitch '{name}' не найден.")
    pg_data = _load_pg()
    before = pg_data.get(name, [])
    after = [pg for pg in before if pg["name"] != pg_name]
    if len(before) == len(after):
        raise HTTPException(status_code=404, detail=f"Порт-группа '{pg_name}' не найдена.")
    pg_data[name] = after
    _save_pg(pg_data)
