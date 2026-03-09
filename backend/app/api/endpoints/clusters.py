import os

import json
import uuid

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

CLUSTERS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "clusters.json")

class ClusterCreate(BaseModel):
  name: str
  type: str
  description: str = ""

class ClusterItem(BaseModel):
  id: str
  name: str
  type: str
  status: str
  cpu_cores: int
  memory: int
  hosts: int
  description: str = ""

def load_custom_clusters():
  if not os.path.exists(CLUSTERS_FILE):
    return []
  try:
    with open(CLUSTERS_FILE, "r", encoding="utf-8") as f:
      return json.load(f)
  except Exception:
    return []

def save_custom_clusters(data):
  with open(CLUSTERS_FILE, "w", encoding="utf-8") as f:
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


@router.get("/clusters", response_model=list[ClusterItem])
async def list_clusters() -> list[ClusterItem]:
  conn = _get_libvirt_conn()

  try:
    info = conn.getInfo()  # type: ignore[no-untyped-call]
    hostname = conn.getHostname()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка получения данных кластера: {exc}")

  cluster_name = f"{(hostname or 'local').split('.')[0]}-cluster"
  cpu_cores = int(info[2]) if len(info) > 2 else 0
  memory = int(info[1]) if len(info) > 1 else 0

  clusters = [
    ClusterItem(
      id=cluster_name,
      name=cluster_name,
      type="libvirt",
      status="online",
      cpu_cores=cpu_cores,
      memory=memory,
      hosts=1,
      description="Local Hypervisor Node"
    )
  ]
  
  custom_clusters = load_custom_clusters()
  for c in custom_clusters:
    # Just merge existing ones
    clusters.append(
      ClusterItem(
        id=c.get("id", str(uuid.uuid4())),
        name=c.get("name", "Unknown"),
        type=c.get("type", "unknown"),
        status=c.get("status", "offline"),
        cpu_cores=c.get("cpu_cores", 0),
        memory=c.get("memory", 0),
        hosts=c.get("hosts", 0),
        description=c.get("description", "")
      )
    )

  return clusters

@router.post("/clusters", response_model=ClusterItem)
async def create_cluster(data: ClusterCreate) -> ClusterItem:
  custom_clusters = load_custom_clusters()
  new_id = str(uuid.uuid4())
  new_cluster = {
      "id": new_id,
      "name": data.name,
      "type": data.type,
      "status": "online",
      "cpu_cores": 0,
      "memory": 0,
      "hosts": 0,
      "description": data.description
  }
  custom_clusters.append(new_cluster)
  save_custom_clusters(custom_clusters)
  
  return ClusterItem(**new_cluster)

@router.get("/clusters/{cluster_id}", response_model=ClusterItem)
async def get_cluster(cluster_id: str) -> ClusterItem:
  clusters = await list_clusters()
  for cluster in clusters:
    if cluster.id == cluster_id:
      return cluster
  raise HTTPException(status_code=404, detail=f"Кластер '{cluster_id}' не найден")

@router.delete("/clusters/{cluster_id}")
async def delete_cluster(cluster_id: str):
    custom_clusters = load_custom_clusters()
    new_clusters = [c for c in custom_clusters if str(c.get("id")) != cluster_id]

    if len(custom_clusters) == len(new_clusters):
        raise HTTPException(status_code=404, detail="Кластер не найден или это системный кластер")
    
    save_custom_clusters(new_clusters)
    return {"status": "success", "message": "Кластер удален"}

@router.post("/clusters/{cluster_id}/start")
async def start_cluster(cluster_id: str):
    clusters = load_custom_clusters()
    found = False
    for c in clusters:
        if str(c.get("id")) == cluster_id:
            c["status"] = "online"
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Кластер не найден или это системный кластер")
    save_custom_clusters(clusters)
    return {"status": "success", "message": "Кластер запущен"}

@router.post("/clusters/{cluster_id}/stop")
async def stop_cluster(cluster_id: str):
    clusters = load_custom_clusters()
    found = False
    for c in clusters:
        if str(c.get("id")) == cluster_id:
            c["status"] = "offline"
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Кластер не найден или это системный кластер")
    save_custom_clusters(clusters)
    return {"status": "success", "message": "Кластер остановлен"}

