import os
import xml.etree.ElementTree as ET
from pathlib import PureWindowsPath
from urllib.parse import unquote, urlparse
from urllib.request import url2pathname

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter()


class StorageVolumeItem(BaseModel):
  id: str
  name: str
  size_bytes: int
  status: str
  pool: str
  path: str
  format: str
  attached_vm: str | None = None


class StoragePoolItem(BaseModel):
  id: str
  name: str
  type: str
  path: str
  status: str
  autostart: bool
  capacity_bytes: int
  allocation_bytes: int
  available_bytes: int
  volumes_count: int


class StorageOverview(BaseModel):
  pools_count: int
  active_pools_count: int
  volumes_count: int
  backups_status: str


class StorageResponse(BaseModel):
  overview: StorageOverview
  pools: list[StoragePoolItem]
  volumes: list[StorageVolumeItem]


class StorageVolumeCreate(BaseModel):
  pool: str
  name: str
  size_gb: int


class StoragePoolCreate(BaseModel):
  name: str
  path: str
  autostart: bool = True


class StorageActionResponse(BaseModel):
  name: str
  status: str
  message: str


def _get_libvirt_conn() -> libvirt.virConnect:  # type: ignore[name-defined]
  uri = os.getenv("LIBVIRT_URI", "qemu:///system")
  try:
    conn = libvirt.open(uri)  # type: ignore[no-untyped-call]
    if conn is None:
      raise HTTPException(status_code=500, detail="Не удалось подключиться к libvirt")
    return conn
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка подключения к libvirt: {exc}")


def _normalize_windows_path_for_host(path: str) -> str:
  windows_path = path.replace('\\', '/').strip()

  if os.name == 'nt':
    return os.path.abspath(str(PureWindowsPath(path)))

  if len(windows_path) >= 3 and windows_path[1] == ':' and windows_path[2] == '/':
    drive_letter = windows_path[0].lower()
    remainder = windows_path[3:]
    return os.path.abspath(f"/mnt/{drive_letter}/{remainder}")

  return os.path.abspath(windows_path)


def _normalize_host_path(path: str) -> str:
  normalized_path = path.strip()

  if not normalized_path:
    return os.path.abspath(normalized_path)

  parsed = urlparse(normalized_path)
  if parsed.scheme == 'file':
    file_path = unquote(url2pathname(parsed.path))
    if len(file_path) >= 3 and file_path[0] == '/' and file_path[2] == ':':
      file_path = file_path[1:]
    return _normalize_windows_path_for_host(file_path)

  if (
    normalized_path.startswith('\\\\')
    or (len(normalized_path) >= 3 and normalized_path[1] == ':' and normalized_path[2] in {'\\', '/'})
  ):
    return _normalize_windows_path_for_host(normalized_path)

  if normalized_path.startswith('~/'):
    return os.path.abspath(os.path.expanduser(normalized_path))

  return os.path.abspath(normalized_path)


def _get_pool_status(state: int) -> str:
  running = getattr(libvirt, 'VIR_STORAGE_POOL_RUNNING', 2)
  building = getattr(libvirt, 'VIR_STORAGE_POOL_BUILDING', 1)
  degraded = getattr(libvirt, 'VIR_STORAGE_POOL_DEGRADED', 3)
  inaccessible = getattr(libvirt, 'VIR_STORAGE_POOL_INACCESSIBLE', 4)

  if state == running:
    return 'online'
  if state == building:
    return 'building'
  if state == degraded:
    return 'degraded'
  if state == inaccessible:
    return 'inaccessible'
  return 'offline'


def _get_pool_info(pool: libvirt.virStoragePool) -> tuple[int, int, int, int]:  # type: ignore[name-defined]
  try:
    info = pool.info()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError:
    return (0, 0, 0, 0)

  state = int(info[0]) if len(info) > 0 else 0
  capacity = int(info[1]) if len(info) > 1 else 0
  allocation = int(info[2]) if len(info) > 2 else 0
  available = int(info[3]) if len(info) > 3 else 0
  return (state, capacity, allocation, available)


def _get_pool_xml_root(pool: libvirt.virStoragePool) -> ET.Element | None:  # type: ignore[name-defined]
  try:
    return ET.fromstring(pool.XMLDesc(0))  # type: ignore[no-untyped-call]
  except Exception:
    return None


def _get_pool_path(pool: libvirt.virStoragePool) -> str:  # type: ignore[name-defined]
  root = _get_pool_xml_root(pool)
  if root is None:
    return '-'

  path = root.findtext('./target/path')
  return path or '-'


def _get_pool_type(pool: libvirt.virStoragePool) -> str:  # type: ignore[name-defined]
  root = _get_pool_xml_root(pool)
  if root is None:
    return 'unknown'
  return root.get('type') or 'unknown'


def _get_volume_format(volume: libvirt.virStorageVol) -> str:  # type: ignore[name-defined]
  try:
    root = ET.fromstring(volume.XMLDesc(0))  # type: ignore[no-untyped-call]
    format_node = root.find('./target/format')
    if format_node is not None and format_node.get('type'):
      return format_node.get('type') or 'raw'
  except Exception:
    pass
  return 'raw'


def _get_volume_path(volume: libvirt.virStorageVol) -> str:  # type: ignore[name-defined]
  try:
    return volume.path()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError:
    return '-'


def _get_attached_vm_names_by_disk_path(conn: libvirt.virConnect) -> dict[str, str]:  # type: ignore[name-defined]
  try:
    domains = conn.listAllDomains()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError:
    return {}

  attached: dict[str, str] = {}
  for dom in domains:
    try:
      vm_name = dom.name()  # type: ignore[no-untyped-call]
      root = ET.fromstring(dom.XMLDesc())  # type: ignore[no-untyped-call]
    except Exception:
      continue

    for disk_node in root.findall("./devices/disk[@device='disk']/source"):
      disk_path = disk_node.get('file') or disk_node.get('dev') or disk_node.get('name')
      if not disk_path:
        continue

      try:
        normalized_disk_path = os.path.abspath(disk_path)
      except OSError:
        continue

      attached.setdefault(normalized_disk_path, vm_name)

  return attached


def _list_pool_volumes(
  pool: libvirt.virStoragePool,
  pool_name: str,
  attached_vm_by_disk_path: dict[str, str],
) -> list[StorageVolumeItem]:  # type: ignore[name-defined]
  volumes: list[StorageVolumeItem] = []

  try:
    if pool.isActive() == 1:  # type: ignore[no-untyped-call]
      pool.refresh(0)  # type: ignore[no-untyped-call]
    raw_volumes = pool.listAllVolumes()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError:
    return volumes

  for volume in raw_volumes:
    try:
      volume_name = volume.name()  # type: ignore[no-untyped-call]
      info = volume.info()  # type: ignore[no-untyped-call]
      size_bytes = int(info[1]) if len(info) > 1 else 0
      volume_path = _get_volume_path(volume)
      attached_vm = None
      if volume_path and volume_path != '-':
        attached_vm = attached_vm_by_disk_path.get(os.path.abspath(volume_path))
      volumes.append(
        StorageVolumeItem(
          id=f"{pool_name}:{volume_name}",
          name=volume_name,
          size_bytes=size_bytes,
          status='Подключен' if attached_vm else 'Доступен',
          pool=pool_name,
          path=volume_path,
          format=_get_volume_format(volume),
          attached_vm=attached_vm,
        )
      )
    except libvirt.libvirtError:
      continue

  return volumes


def _collect_storage_state(conn: libvirt.virConnect) -> StorageResponse:  # type: ignore[name-defined]
  try:
    raw_pools = conn.listAllStoragePools()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка получения хранилищ: {exc}")

  pools: list[StoragePoolItem] = []
  volumes: list[StorageVolumeItem] = []
  attached_vm_by_disk_path = _get_attached_vm_names_by_disk_path(conn)

  for pool in raw_pools:
    try:
      pool_name = pool.name()  # type: ignore[no-untyped-call]
      state, capacity, allocation, available = _get_pool_info(pool)
      pool_volumes = _list_pool_volumes(pool, pool_name, attached_vm_by_disk_path)
      autostart = False
      try:
        autostart = bool(pool.autostart())  # type: ignore[no-untyped-call]
      except libvirt.libvirtError:
        autostart = False

      pools.append(
        StoragePoolItem(
          id=pool_name,
          name=pool_name,
          type=_get_pool_type(pool),
          path=_get_pool_path(pool),
          status=_get_pool_status(state),
          autostart=autostart,
          capacity_bytes=capacity,
          allocation_bytes=allocation,
          available_bytes=available,
          volumes_count=len(pool_volumes),
        )
      )
      volumes.extend(pool_volumes)
    except libvirt.libvirtError:
      continue

  overview = StorageOverview(
    pools_count=len(pools),
    active_pools_count=sum(1 for pool in pools if pool.status == 'online'),
    volumes_count=len(volumes),
    backups_status='Недоступно',
  )

  pools.sort(key=lambda pool: pool.name.lower())
  volumes.sort(key=lambda volume: (volume.pool.lower(), volume.name.lower()))
  return StorageResponse(overview=overview, pools=pools, volumes=volumes)


def _get_volume_attached_vm_name(conn: libvirt.virConnect, volume: libvirt.virStorageVol) -> str | None:  # type: ignore[name-defined]
  volume_path = _get_volume_path(volume)
  if not volume_path or volume_path == '-':
    return None

  return _get_attached_vm_names_by_disk_path(conn).get(os.path.abspath(volume_path))


def _get_pool_or_404(conn: libvirt.virConnect, pool_name: str) -> libvirt.virStoragePool:  # type: ignore[name-defined]
  try:
    return conn.storagePoolLookupByName(pool_name)  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=404, detail=f"Пул хранения '{pool_name}' не найден: {exc}")


def _get_volume_or_404(pool: libvirt.virStoragePool, volume_name: str) -> libvirt.virStorageVol:  # type: ignore[name-defined]
  try:
    return pool.storageVolLookupByName(volume_name)  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=404, detail=f"Том '{volume_name}' не найден: {exc}")


@router.get('/storage', response_model=StorageResponse)
async def get_storage() -> StorageResponse:
  conn = _get_libvirt_conn()
  return _collect_storage_state(conn)


@router.post('/storage/pools', response_model=StoragePoolItem)
async def create_storage_pool(payload: StoragePoolCreate) -> StoragePoolItem:
  pool_name = payload.name.strip()
  if not pool_name:
    raise HTTPException(status_code=400, detail='Имя пула хранения обязательно')

  pool_path = _normalize_host_path(payload.path)
  if not pool_path:
    raise HTTPException(status_code=400, detail='Путь к пулу хранения обязателен')

  conn = _get_libvirt_conn()

  try:
    existing = conn.storagePoolLookupByName(pool_name)  # type: ignore[no-untyped-call]
    if existing is not None:
      raise HTTPException(status_code=400, detail=f"Пул хранения '{pool_name}' уже существует")
  except libvirt.libvirtError:
    pass

  os.makedirs(pool_path, exist_ok=True)
  pool_xml = f"""
  <pool type='dir'>
    <name>{pool_name}</name>
    <target>
      <path>{pool_path}</path>
    </target>
  </pool>
  """.strip()

  try:
    pool = conn.storagePoolDefineXML(pool_xml, 0)  # type: ignore[no-untyped-call]
    if pool is None:
      raise HTTPException(status_code=500, detail='Не удалось определить пул хранения')
    pool.setAutostart(1 if payload.autostart else 0)  # type: ignore[no-untyped-call]
    pool.build(0)  # type: ignore[no-untyped-call]
    pool.create(0)  # type: ignore[no-untyped-call]
    pool.refresh(0)  # type: ignore[no-untyped-call]
  except HTTPException:
    raise
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка создания пула хранения: {exc}")

  pool_state = _collect_storage_state(conn)
  for item in pool_state.pools:
    if item.name == pool_name:
      return item

  raise HTTPException(status_code=500, detail='Пул хранения создан, но не найден в обновленном списке')


@router.post('/storage/pools/{pool_name}/refresh', response_model=StorageActionResponse)
async def refresh_storage_pool(pool_name: str) -> StorageActionResponse:
  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)

  try:
    if pool.isActive() != 1:  # type: ignore[no-untyped-call]
      raise HTTPException(status_code=400, detail=f"Пул хранения '{pool_name}' не запущен")
    pool.refresh(0)  # type: ignore[no-untyped-call]
  except HTTPException:
    raise
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка обновления пула хранения: {exc}")

  return StorageActionResponse(name=pool_name, status='online', message='Пул хранения обновлен')


@router.post('/storage/pools/{pool_name}/start', response_model=StorageActionResponse)
async def start_storage_pool(pool_name: str) -> StorageActionResponse:
  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)

  try:
    if pool.isActive() != 1:  # type: ignore[no-untyped-call]
      pool.create(0)  # type: ignore[no-untyped-call]
    pool.refresh(0)  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка запуска пула хранения: {exc}")

  return StorageActionResponse(name=pool_name, status='online', message='Пул хранения запущен')


@router.post('/storage/pools/{pool_name}/stop', response_model=StorageActionResponse)
async def stop_storage_pool(pool_name: str) -> StorageActionResponse:
  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)

  try:
    if pool.isActive() == 1:  # type: ignore[no-untyped-call]
      pool.destroy()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка остановки пула хранения: {exc}")

  return StorageActionResponse(name=pool_name, status='offline', message='Пул хранения остановлен')


@router.delete('/storage/pools/{pool_name}', response_model=StorageActionResponse)
async def delete_storage_pool(pool_name: str) -> StorageActionResponse:
  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)

  attached_vm_by_disk_path = _get_attached_vm_names_by_disk_path(conn)
  pool_volumes = _list_pool_volumes(pool, pool_name, attached_vm_by_disk_path)
  attached_volume = next((volume for volume in pool_volumes if volume.attached_vm), None)

  if attached_volume is not None:
    raise HTTPException(
      status_code=400,
      detail=(
        f"Пул хранения '{pool_name}' нельзя удалить: том '{attached_volume.name}' "
        f"подключен к виртуальной машине '{attached_volume.attached_vm}'"
      ),
    )

  if pool_volumes:
    raise HTTPException(
      status_code=400,
      detail=f"Пул хранения '{pool_name}' не пуст. Сначала удалите все тома из пула.",
    )

  try:
    if pool.isActive() == 1:  # type: ignore[no-untyped-call]
      pool.destroy()  # type: ignore[no-untyped-call]
    pool.undefine()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка удаления пула хранения: {exc}")

  return StorageActionResponse(
    name=pool_name,
    status='deleted',
    message='Пул хранения удален. Каталог с файлами на диске не удалялся.',
  )


@router.post('/storage/volumes', response_model=StorageVolumeItem)
async def create_storage_volume(payload: StorageVolumeCreate) -> StorageVolumeItem:
  if payload.size_gb <= 0:
    raise HTTPException(status_code=400, detail='Размер тома должен быть больше нуля')

  volume_name = payload.name.strip()
  if not volume_name:
    raise HTTPException(status_code=400, detail='Имя тома обязательно')

  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, payload.pool)

  try:
    if pool.isActive() != 1:  # type: ignore[no-untyped-call]
      raise HTTPException(status_code=400, detail=f"Пул хранения '{payload.pool}' не запущен")
    pool.storageVolLookupByName(volume_name)  # type: ignore[no-untyped-call]
    raise HTTPException(status_code=400, detail=f"Том '{volume_name}' уже существует")
  except HTTPException:
    raise
  except libvirt.libvirtError:
    pass

  capacity_bytes = payload.size_gb * 1024 * 1024 * 1024
  volume_xml = f"""
  <volume>
    <name>{volume_name}</name>
    <capacity unit='bytes'>{capacity_bytes}</capacity>
    <allocation unit='bytes'>0</allocation>
    <target>
      <format type='qcow2'/>
    </target>
  </volume>
  """.strip()

  try:
    volume = pool.createXML(volume_xml, 0)  # type: ignore[no-untyped-call]
    info = volume.info()  # type: ignore[no-untyped-call]
    size_bytes = int(info[1]) if len(info) > 1 else capacity_bytes
    pool.refresh(0)  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка создания тома: {exc}")

  return StorageVolumeItem(
    id=f"{payload.pool}:{volume_name}",
    name=volume_name,
    size_bytes=size_bytes,
    status='Доступен',
    pool=payload.pool,
    path=_get_volume_path(volume),
    format=_get_volume_format(volume),
    attached_vm=None,
  )


@router.delete('/storage/volumes/{pool_name}/{volume_name:path}', response_model=StorageActionResponse)
async def delete_storage_volume(pool_name: str, volume_name: str) -> StorageActionResponse:
  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)
  volume = _get_volume_or_404(pool, volume_name)

  attached_vm_name = _get_volume_attached_vm_name(conn, volume)
  if attached_vm_name:
    raise HTTPException(
      status_code=400,
      detail=f"Том '{volume_name}' подключен к виртуальной машине '{attached_vm_name}' и не может быть удален",
    )

  try:
    volume.delete(0)  # type: ignore[no-untyped-call]
    if pool.isActive() == 1:  # type: ignore[no-untyped-call]
      pool.refresh(0)  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка удаления тома: {exc}")

  return StorageActionResponse(name=volume_name, status='deleted', message='Том удален')
