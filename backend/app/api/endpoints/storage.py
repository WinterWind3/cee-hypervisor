import os
import xml.etree.ElementTree as ET
from pathlib import PureWindowsPath
from urllib.parse import unquote, urlparse
from urllib.request import url2pathname

import libvirt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.backups import summarize_backups_status


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
  target_dev: str | None = None
  is_primary_disk: bool = False


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


class StorageVolumeAttachRequest(BaseModel):
  vm_name: str


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


def _get_attached_disk_metadata_by_path(conn: libvirt.virConnect) -> dict[str, dict[str, str | bool | None]]:  # type: ignore[name-defined]
  try:
    domains = conn.listAllDomains()  # type: ignore[no-untyped-call]
  except libvirt.libvirtError:
    return {}

  attached: dict[str, dict[str, str | bool | None]] = {}
  for dom in domains:
    try:
      vm_name = dom.name()  # type: ignore[no-untyped-call]
      root = ET.fromstring(dom.XMLDesc())  # type: ignore[no-untyped-call]
    except Exception:
      continue

    for disk_node in root.findall("./devices/disk[@device='disk']"):
      source_node = disk_node.find('./source')
      disk_path = source_node.get('file') or source_node.get('dev') or source_node.get('name') if source_node is not None else None
      if not disk_path:
        continue

      try:
        normalized_disk_path = os.path.abspath(disk_path)
      except OSError:
        continue

      target_node = disk_node.find('./target')
      target_dev = target_node.get('dev') if target_node is not None else None
      attached.setdefault(normalized_disk_path, {
        'vm_name': vm_name,
        'target_dev': target_dev,
        'is_primary_disk': target_dev == 'vda',
      })

  return attached


def _get_attached_vm_names_by_disk_path(conn: libvirt.virConnect) -> dict[str, str]:  # type: ignore[name-defined]
  attached_disk_metadata = _get_attached_disk_metadata_by_path(conn)
  return {
    disk_path: str(metadata['vm_name'])
    for disk_path, metadata in attached_disk_metadata.items()
    if metadata.get('vm_name')
  }


def _list_pool_volumes(
  pool: libvirt.virStoragePool,
  pool_name: str,
  attached_disk_metadata_by_path: dict[str, dict[str, str | bool | None]],
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
      target_dev = None
      is_primary_disk = False
      if volume_path and volume_path != '-':
        attachment_metadata = attached_disk_metadata_by_path.get(os.path.abspath(volume_path)) or {}
        attached_vm_value = attachment_metadata.get('vm_name')
        target_dev_value = attachment_metadata.get('target_dev')
        attached_vm = str(attached_vm_value) if attached_vm_value else None
        target_dev = str(target_dev_value) if target_dev_value else None
        is_primary_disk = bool(attachment_metadata.get('is_primary_disk'))
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
          target_dev=target_dev,
          is_primary_disk=is_primary_disk,
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
  attached_disk_metadata_by_path = _get_attached_disk_metadata_by_path(conn)

  for pool in raw_pools:
    try:
      pool_name = pool.name()  # type: ignore[no-untyped-call]
      state, capacity, allocation, available = _get_pool_info(pool)
      pool_volumes = _list_pool_volumes(pool, pool_name, attached_disk_metadata_by_path)
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
    backups_status=summarize_backups_status(),
  )

  pools.sort(key=lambda pool: pool.name.lower())
  volumes.sort(key=lambda volume: (volume.pool.lower(), volume.name.lower()))
  return StorageResponse(overview=overview, pools=pools, volumes=volumes)


def _get_volume_attached_vm_name(conn: libvirt.virConnect, volume: libvirt.virStorageVol) -> str | None:  # type: ignore[name-defined]
  volume_path = _get_volume_path(volume)
  if not volume_path or volume_path == '-':
    return None

  attached_disk_metadata = _get_attached_disk_metadata_by_path(conn)
  attachment_metadata = attached_disk_metadata.get(os.path.abspath(volume_path)) or {}
  attached_vm_name = attachment_metadata.get('vm_name')
  return str(attached_vm_name) if attached_vm_name else None


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


def _get_domain_or_404(conn: libvirt.virConnect, vm_name: str) -> libvirt.virDomain:  # type: ignore[name-defined]
  try:
    return conn.lookupByName(vm_name)  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=404, detail=f"ВМ '{vm_name}' не найдена: {exc}")


def _get_domain_disk_nodes(dom: libvirt.virDomain) -> list[ET.Element]:  # type: ignore[name-defined]
  try:
    root = ET.fromstring(dom.XMLDesc())  # type: ignore[no-untyped-call]
  except Exception as exc:
    raise HTTPException(status_code=500, detail=f"Не удалось прочитать XML виртуальной машины: {exc}")

  return root.findall("./devices/disk[@device='disk']")


def _get_disk_source_path(disk_node: ET.Element) -> str | None:
  source_node = disk_node.find('./source')
  if source_node is None:
    return None

  disk_path = source_node.get('file') or source_node.get('dev') or source_node.get('name')
  if not disk_path:
    return None

  try:
    return os.path.abspath(disk_path)
  except OSError:
    return None


def _next_virtio_disk_target(dom: libvirt.virDomain) -> str:  # type: ignore[name-defined]
  used_targets: set[str] = set()
  for disk_node in _get_domain_disk_nodes(dom):
    target_node = disk_node.find('./target')
    target_dev = target_node.get('dev') if target_node is not None else None
    if target_dev:
      used_targets.add(target_dev)

  for code in range(ord('b'), ord('z') + 1):
    candidate = f"vd{chr(code)}"
    if candidate not in used_targets:
      return candidate

  raise HTTPException(status_code=400, detail='У ВМ больше нет свободных virtio-слотов для подключения диска')


def _build_volume_disk_xml(volume_path: str, target_dev: str, format_type: str) -> str:
  return (
    "<disk type='file' device='disk'>"
    f"<driver name='qemu' type='{format_type}'/>"
    f"<source file='{volume_path}'/>"
    f"<target dev='{target_dev}' bus='virtio'/>"
    "</disk>"
  )


def _get_domain_affect_flags(dom: libvirt.virDomain) -> int:  # type: ignore[name-defined]
  config_flag = int(getattr(libvirt, 'VIR_DOMAIN_AFFECT_CONFIG', 2))
  live_flag = int(getattr(libvirt, 'VIR_DOMAIN_AFFECT_LIVE', 1))

  try:
    is_active = dom.isActive() == 1  # type: ignore[no-untyped-call]
  except libvirt.libvirtError:
    is_active = False

  return config_flag | (live_flag if is_active else 0)


def _find_volume_disk_xml(dom: libvirt.virDomain, volume_path: str) -> str | None:  # type: ignore[name-defined]
  normalized_volume_path = os.path.abspath(volume_path)
  for disk_node in _get_domain_disk_nodes(dom):
    disk_source_path = _get_disk_source_path(disk_node)
    if disk_source_path != normalized_volume_path:
      continue
    return ET.tostring(disk_node, encoding='unicode')
  return None


def _is_primary_domain_disk(dom: libvirt.virDomain, volume_path: str) -> bool:  # type: ignore[name-defined]
  normalized_volume_path = os.path.abspath(volume_path)
  for disk_node in _get_domain_disk_nodes(dom):
    disk_source_path = _get_disk_source_path(disk_node)
    if disk_source_path != normalized_volume_path:
      continue

    target_node = disk_node.find('./target')
    target_dev = target_node.get('dev') if target_node is not None else None
    return target_dev == 'vda'

  return False


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
    target_dev=None,
    is_primary_disk=False,
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


@router.post('/storage/volumes/{pool_name}/{volume_name:path}/attach', response_model=StorageActionResponse)
async def attach_storage_volume(pool_name: str, volume_name: str, payload: StorageVolumeAttachRequest) -> StorageActionResponse:
  vm_name = payload.vm_name.strip()
  if not vm_name:
    raise HTTPException(status_code=400, detail='Имя ВМ обязательно')

  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)
  volume = _get_volume_or_404(pool, volume_name)
  attached_vm_name = _get_volume_attached_vm_name(conn, volume)

  if attached_vm_name:
    raise HTTPException(
      status_code=400,
      detail=f"Том '{volume_name}' уже подключен к виртуальной машине '{attached_vm_name}'",
    )

  dom = _get_domain_or_404(conn, vm_name)
  volume_path = _get_volume_path(volume)
  if not volume_path or volume_path == '-':
    raise HTTPException(status_code=500, detail=f"Не удалось определить путь тома '{volume_name}'")

  disk_xml = _build_volume_disk_xml(volume_path, _next_virtio_disk_target(dom), _get_volume_format(volume))

  try:
    dom.attachDeviceFlags(disk_xml, _get_domain_affect_flags(dom))  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка подключения тома к ВМ: {exc}")

  return StorageActionResponse(
    name=volume_name,
    status='attached',
    message=f"Том '{volume_name}' подключен к ВМ '{vm_name}'",
  )


@router.post('/storage/volumes/{pool_name}/{volume_name:path}/detach', response_model=StorageActionResponse)
async def detach_storage_volume(pool_name: str, volume_name: str) -> StorageActionResponse:
  conn = _get_libvirt_conn()
  pool = _get_pool_or_404(conn, pool_name)
  volume = _get_volume_or_404(pool, volume_name)
  attached_vm_name = _get_volume_attached_vm_name(conn, volume)

  if not attached_vm_name:
    raise HTTPException(status_code=400, detail=f"Том '{volume_name}' сейчас не подключен ни к одной ВМ")

  dom = _get_domain_or_404(conn, attached_vm_name)
  volume_path = _get_volume_path(volume)
  if not volume_path or volume_path == '-':
    raise HTTPException(status_code=500, detail=f"Не удалось определить путь тома '{volume_name}'")

  disk_xml = _find_volume_disk_xml(dom, volume_path)
  if not disk_xml:
    raise HTTPException(
      status_code=400,
      detail=f"Не удалось найти подключение тома '{volume_name}' в конфигурации ВМ '{attached_vm_name}'",
    )

  if _is_primary_domain_disk(dom, volume_path):
    raise HTTPException(
      status_code=400,
      detail=(
        f"Том '{volume_name}' является основным диском виртуальной машины '{attached_vm_name}' "
        "и не может быть отключен со страницы хранилища"
      ),
    )

  try:
    dom.detachDeviceFlags(disk_xml, _get_domain_affect_flags(dom))  # type: ignore[no-untyped-call]
  except libvirt.libvirtError as exc:  # type: ignore[attr-defined]
    raise HTTPException(status_code=500, detail=f"Ошибка отключения тома от ВМ: {exc}")

  return StorageActionResponse(
    name=volume_name,
    status='detached',
    message=f"Том '{volume_name}' отключен от ВМ '{attached_vm_name}'",
  )
