import os
import json
import uuid

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

SERVERS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "servers.json")

class ServerCreate(BaseModel):
  name: str
  hostname: str
  cluster: str | None = None

class ServerItem(BaseModel):
  id: str
  name: str
  hostname: str
  status: str
  cpu_cores: int
  memory_total: int
  cluster: str | None = None

def load_custom_servers():
  if not os.path.exists(SERVERS_FILE):
    return []
  try:
    with open(SERVERS_FILE, "r", encoding="utf-8") as f:
      return json.load(f)
  except Exception:
    return []

def save_custom_servers(data):
  with open(SERVERS_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

def _get_libvirt_conn() -> libvirt.virConnect:  # type: ignore[name-defined]
  uri = os.getenv("LIBVIRT_URI", "qemu:///system")
  try:
    conn = libvirt.open(uri)  # type: ignore[no-untyped-call]
    if conn is None:
      raise HTTPException(status_code=500, detail="Не удалось подключиться к libvirt")
    return conn
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка подключения к libvirt: {exc}")


@router.get("/servers", response_model=list[ServerItem])
async def list_servers() -> list[ServerItem]:
  custom_servers_data = load_custom_servers()
  custom_servers = []
  for cs in custom_servers_data:
    custom_servers.append(
      ServerItem(
        id=str(cs.get("id")),
        name=cs.get("name", "Unknown"),
        hostname=cs.get("hostname", "Unknown"),
        status=cs.get("status", "offline"),
        cpu_cores=cs.get("cpu_cores", 0),
        memory_total=cs.get("memory_total", 0),
        cluster=cs.get("cluster"),
      )
    )

  return custom_servers

@router.post("/servers", response_model=ServerItem)
async def create_server(server: ServerCreate) -> ServerItem:
    new_id = str(uuid.uuid4())
    new_server = {
        "id": new_id,
        "name": server.name,
        "hostname": server.hostname,
        "cluster": server.cluster,
        "status": "offline",
        "cpu_cores": 0,
        "memory_total": 0
    }
    
    servers = load_custom_servers()
    servers.append(new_server)
    save_custom_servers(servers)
    
    return ServerItem(**new_server)

@router.delete("/servers/{server_id}")
async def delete_server(server_id: str):
    servers = load_custom_servers()
    new_servers = [s for s in servers if str(s.get("id")) != server_id]
    
    if len(servers) == len(new_servers):
        raise HTTPException(status_code=404, detail="Сервер не найден или не может быть удален (возможно это системный сервер)")
        
    save_custom_servers(new_servers)
    return {"status": "success", "message": "Сервер удален"}

@router.get("/servers/{server_id}", response_model=ServerItem)
async def get_server(server_id: str) -> ServerItem:
  servers = await list_servers()
  for server in servers:
    if server.id == server_id:
      return server
  raise HTTPException(status_code=404, detail=f"Сервер '{server_id}' не найден")

@router.post("/servers/{server_id}/start")
async def start_server(server_id: str):
    servers = load_custom_servers()
    found = False
    for s in servers:
        if str(s.get("id")) == server_id:
            s["status"] = "online"
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Сервер не найден или это системный сервер")
    save_custom_servers(servers)
    return {"status": "success", "message": "Сервер запущен"}

@router.post("/servers/{server_id}/stop")
async def stop_server(server_id: str):
    servers = load_custom_servers()
    found = False
    for s in servers:
        if str(s.get("id")) == server_id:
            s["status"] = "offline"
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Сервер не найден или это системный сервер")
    save_custom_servers(servers)
    return {"status": "success", "message": "Сервер остановлен"}

