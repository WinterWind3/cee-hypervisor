import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Database,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Play,
  Plus,
  RotateCw,
  Server,
  Square,
  Trash2,
} from 'lucide-react';
import { apiService } from '../services/api';
import ActionButton from '../components/ActionButton';
import AppDialog from '../components/AppDialog';
import EmptyState from '../components/EmptyState';
import FormModal from '../components/FormModal';
import LoadingState from '../components/LoadingState';
import AppToast from '../components/AppToast';
import PageActions from '../components/PageActions';
import RefreshButton from '../components/RefreshButton';
import StatCard from '../components/StatCard';
import StatusMessage from '../components/StatusMessage';
import { useDialog } from '../hooks/useDialog';
import { useTimedMessage } from '../hooks/useTimedMessage';

const EMPTY_OVERVIEW = {
  pools_count: 0,
  active_pools_count: 0,
  volumes_count: 0,
  backups_status: 'Недоступно',
};

const formatSize = (sizeBytes) => {
  const size = Number(sizeBytes || 0);
  if (size >= 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${size} B`;
};

const getPoolStatusLabel = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'online':
      return 'Онлайн';
    case 'building':
      return 'Инициализация';
    case 'degraded':
      return 'С ошибками';
    case 'inaccessible':
      return 'Недоступен';
    default:
      return 'Офлайн';
  }
};

const getPoolStatusClassName = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'online':
      return 'bg-emerald-400';
    case 'building':
      return 'bg-sky-400';
    case 'degraded':
      return 'bg-amber-400';
    case 'inaccessible':
      return 'bg-red-400';
    default:
      return 'bg-dark-500';
  }
};

const Storage = () => {
  const [volumes, setVolumes] = useState([]);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateVolume, setShowCreateVolume] = useState(false);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [isCreatingVolume, setIsCreatingVolume] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [pendingPoolAction, setPendingPoolAction] = useState(null);
  const [pendingPoolDelete, setPendingPoolDelete] = useState('');
  const [pendingVolumeDelete, setPendingVolumeDelete] = useState('');
  const [createVolumeAttempted, setCreateVolumeAttempted] = useState(false);
  const [createPoolAttempted, setCreatePoolAttempted] = useState(false);
  const [touchedVolumeFields, setTouchedVolumeFields] = useState({});
  const [touchedPoolFields, setTouchedPoolFields] = useState({});
  const { dialog, openDialog, closeDialog } = useDialog();
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();
  const [newVolume, setNewVolume] = useState({ pool: '', name: '', size_gb: 10 });
  const [newPool, setNewPool] = useState({
    name: '',
    path: '/var/lib/libvirt/images/custom',
    autostart: true,
  });

  const loadStorage = useCallback(async (showMessage = true) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getStorage();
      setOverview(response.data?.overview || EMPTY_OVERVIEW);
      setPools(Array.isArray(response.data?.pools) ? response.data.pools : []);
      setVolumes(Array.isArray(response.data?.volumes) ? response.data.volumes : []);
      if (showMessage) {
        showUpdateMessage('Обновление выполнено');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки хранилищ');
      setOverview(EMPTY_OVERVIEW);
      setPools([]);
      setVolumes([]);
    } finally {
      setLoading(false);
    }
  }, [showUpdateMessage]);

  useEffect(() => {
    loadStorage(false);
  }, [loadStorage]);

  const activePools = useMemo(
    () => pools.filter((pool) => pool.status === 'online' || pool.status === 'degraded' || pool.status === 'building'),
    [pools]
  );

  const volumeErrors = {
    pool: !newVolume.pool ? 'Выберите запущенный пул хранения.' : '',
    name: !newVolume.name.trim() ? 'Укажите имя тома.' : '',
    size_gb: !newVolume.size_gb || Number(newVolume.size_gb) < 1 ? 'Укажите размер не меньше 1 GB.' : '',
  };

  const poolErrors = {
    name: !newPool.name.trim() ? 'Укажите имя пула хранения.' : '',
    path: !newPool.path.trim() ? 'Укажите путь к каталогу пула.' : '',
  };

  const hasVolumeErrors = Boolean(volumeErrors.pool || volumeErrors.name || volumeErrors.size_gb);
  const hasPoolErrors = Boolean(poolErrors.name || poolErrors.path);

  const isVolumeFieldInvalid = (field) => Boolean((createVolumeAttempted || touchedVolumeFields[field]) && volumeErrors[field]);
  const isPoolFieldInvalid = (field) => Boolean((createPoolAttempted || touchedPoolFields[field]) && poolErrors[field]);

  const getFieldClassName = (hasError) => `input w-full${hasError ? ' input-error' : ''}`;

  const resetVolumeValidation = () => {
    setCreateVolumeAttempted(false);
    setTouchedVolumeFields({});
  };

  const resetPoolValidation = () => {
    setCreatePoolAttempted(false);
    setTouchedPoolFields({});
  };

  const openCreateVolumeModal = () => {
    resetVolumeValidation();
    setNewVolume((current) => ({
      ...current,
      pool: activePools[0]?.name || pools[0]?.name || '',
    }));
    setShowCreateVolume(true);
  };

  const openCreatePoolModal = () => {
    resetPoolValidation();
    setShowCreatePool(true);
  };

  const closeCreateVolumeModal = () => {
    if (isCreatingVolume) {
      return;
    }
    resetVolumeValidation();
    setShowCreateVolume(false);
  };

  const closeCreatePoolModal = () => {
    if (isCreatingPool) {
      return;
    }
    resetPoolValidation();
    setShowCreatePool(false);
  };

  const handleVolumeChange = (field) => (event) => {
    const value = field === 'size_gb' ? Number(event.target.value) : event.target.value;
    setNewVolume((current) => ({ ...current, [field]: value }));
  };

  const handlePoolChange = (field) => (event) => {
    const value = field === 'autostart' ? event.target.checked : event.target.value;
    setNewPool((current) => ({ ...current, [field]: value }));
  };

  const markVolumeFieldTouched = (field) => () => {
    setTouchedVolumeFields((current) => ({ ...current, [field]: true }));
  };

  const markPoolFieldTouched = (field) => () => {
    setTouchedPoolFields((current) => ({ ...current, [field]: true }));
  };

  const submitCreateVolume = async () => {
    if (isCreatingVolume) {
      return;
    }

    setCreateVolumeAttempted(true);
    if (hasVolumeErrors) {
      return;
    }

    try {
      setIsCreatingVolume(true);
      await apiService.createStorageVolume(newVolume);
      resetVolumeValidation();
      setShowCreateVolume(false);
      setNewVolume({ pool: activePools[0]?.name || '', name: '', size_gb: 10 });
      await loadStorage(true);
    } catch (err) {
      openDialog({
        title: 'Не удалось создать том',
        message: err.response?.data?.detail || err.message || 'Ошибка создания тома',
        variant: 'danger',
      });
    } finally {
      setIsCreatingVolume(false);
    }
  };

  const submitCreatePool = async () => {
    if (isCreatingPool) {
      return;
    }

    setCreatePoolAttempted(true);
    if (hasPoolErrors) {
      return;
    }

    try {
      setIsCreatingPool(true);
      await apiService.createStoragePool(newPool);
      resetPoolValidation();
      setShowCreatePool(false);
      setNewPool({
        name: '',
        path: '/var/lib/libvirt/images/custom',
        autostart: true,
      });
      await loadStorage(true);
    } catch (err) {
      openDialog({
        title: 'Не удалось создать пул хранения',
        message: err.response?.data?.detail || err.message || 'Ошибка создания пула хранения',
        variant: 'danger',
      });
    } finally {
      setIsCreatingPool(false);
    }
  };

  const runPoolAction = async (poolName, actionKey, request, failureTitle) => {
    if (pendingPoolAction === `${poolName}:${actionKey}`) {
      return;
    }

    try {
      setPendingPoolAction(`${poolName}:${actionKey}`);
      await request(poolName);
      await loadStorage(true);
    } catch (err) {
      openDialog({
        title: failureTitle,
        message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
        variant: 'danger',
      });
    } finally {
      setPendingPoolAction(null);
    }
  };

  const handleDeleteVolume = (volume) => {
    openDialog({
      title: `Удалить том ${volume.name}?`,
      message: `Том будет удален из пула ${volume.pool}. Это действие нельзя отменить.`,
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: async () => {
        try {
          setPendingVolumeDelete(volume.id);
          await apiService.deleteStorageVolume(volume.pool, volume.name);
          closeDialog();
          await loadStorage(true);
        } catch (err) {
          openDialog({
            title: 'Не удалось удалить том',
            message: err.response?.data?.detail || err.message || 'Ошибка удаления тома',
            variant: 'danger',
          });
        } finally {
          setPendingVolumeDelete('');
        }
      },
    });
  };

  const handleDeletePool = (pool) => {
    openDialog({
      title: `Удалить пул ${pool.name}?`,
      message: 'Будет удалено только определение пула в libvirt. Каталог на диске не удаляется. Пул должен быть пустым.',
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: async () => {
        try {
          setPendingPoolDelete(pool.name);
          await apiService.deleteStoragePool(pool.name);
          closeDialog();
          await loadStorage(true);
        } catch (err) {
          openDialog({
            title: 'Не удалось удалить пул хранения',
            message: err.response?.data?.detail || err.message || 'Ошибка удаления пула хранения',
            variant: 'danger',
          });
        } finally {
          setPendingPoolDelete('');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <AppToast message={updateMsg} />
      <PageActions>
        <RefreshButton onClick={() => loadStorage(true)} loading={loading} />
        <ActionButton icon={FolderPlus} label="Создать пул" onClick={openCreatePoolModal} />
        <ActionButton icon={Plus} label="Создать том" onClick={openCreateVolumeModal} disabled={pools.length === 0} />
      </PageActions>

      <FormModal
        isOpen={showCreatePool}
        title="Создать пул хранения"
        subtitle="Укажите имя и каталог для dir-пула libvirt. Каталог будет создан автоматически, если его нет."
        confirmLabel="Создать"
        confirmBusyLabel="Создание..."
        isSubmitting={isCreatingPool}
        confirmDisabled={hasPoolErrors}
        onClose={closeCreatePoolModal}
        onConfirm={submitCreatePool}
      >
        <div className="modal-field">
          <label className="modal-label">Имя пула</label>
          <input
            className={getFieldClassName(isPoolFieldInvalid('name'))}
            value={newPool.name}
            onChange={handlePoolChange('name')}
            onBlur={markPoolFieldTouched('name')}
            placeholder="vm-images"
          />
          {isPoolFieldInvalid('name') && <p className="text-xs text-red-400">{poolErrors.name}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Каталог</label>
          <input
            className={getFieldClassName(isPoolFieldInvalid('path'))}
            value={newPool.path}
            onChange={handlePoolChange('path')}
            onBlur={markPoolFieldTouched('path')}
            placeholder="/var/lib/libvirt/images/custom"
          />
          {isPoolFieldInvalid('path') && <p className="text-xs text-red-400">{poolErrors.path}</p>}
          <p className="text-xs text-dark-400">Поддерживаются Linux/WSL-пути и Windows-пути вида C:\\folder\\images.</p>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-dark-700 bg-dark-900/60 px-3 py-3 text-sm text-dark-200">
          <input type="checkbox" checked={newPool.autostart} onChange={handlePoolChange('autostart')} />
          <span>Автозапуск пула при старте libvirt</span>
        </label>
      </FormModal>

      <FormModal
        isOpen={showCreateVolume}
        title="Создать том"
        subtitle="Выберите активный пул хранения и задайте параметры нового qcow2-тома."
        confirmLabel="Создать"
        confirmBusyLabel="Создание..."
        isSubmitting={isCreatingVolume}
        confirmDisabled={hasVolumeErrors}
        onClose={closeCreateVolumeModal}
        onConfirm={submitCreateVolume}
      >
        <div className="modal-field">
          <label className="modal-label">Пул хранения</label>
          <select
            className={getFieldClassName(isVolumeFieldInvalid('pool'))}
            value={newVolume.pool}
            onChange={handleVolumeChange('pool')}
            onBlur={markVolumeFieldTouched('pool')}
          >
            <option value="">Выберите пул</option>
            {activePools.map((pool) => (
              <option key={pool.id} value={pool.name}>{pool.name}</option>
            ))}
          </select>
          {isVolumeFieldInvalid('pool') && <p className="text-xs text-red-400">{volumeErrors.pool}</p>}
          {activePools.length === 0 && <p className="text-xs text-amber-300">Нет активных пулов. Сначала запустите или создайте пул хранения.</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Имя тома</label>
          <input
            className={getFieldClassName(isVolumeFieldInvalid('name'))}
            value={newVolume.name}
            onChange={handleVolumeChange('name')}
            onBlur={markVolumeFieldTouched('name')}
            placeholder="vm-disk.qcow2"
          />
          {isVolumeFieldInvalid('name') && <p className="text-xs text-red-400">{volumeErrors.name}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Размер (GB)</label>
          <input
            type="number"
            min="1"
            className={getFieldClassName(isVolumeFieldInvalid('size_gb'))}
            value={newVolume.size_gb}
            onChange={handleVolumeChange('size_gb')}
            onBlur={markVolumeFieldTouched('size_gb')}
          />
          {isVolumeFieldInvalid('size_gb') && <p className="text-xs text-red-400">{volumeErrors.size_gb}</p>}
        </div>
      </FormModal>

      <AppDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        onConfirm={dialog.onConfirm}
        onClose={closeDialog}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Тома"
          value={overview.volumes_count}
          subtitle="Все найденные тома"
          icon={HardDrive}
          color="text-cyan-400"
        />
        <StatCard
          title="Пулы хранения"
          value={overview.pools_count}
          subtitle="Все доступные пулы"
          icon={FolderOpen}
          color="text-yellow-400"
        />
        <StatCard
          title="Активные пулы"
          value={overview.active_pools_count}
          subtitle="Пулы, готовые к работе"
          icon={Server}
          color="text-emerald-400"
        />
      </div>

      <StatusMessage message={error} />
      <LoadingState message={loading ? 'Загрузка хранилищ...' : ''} />

      <div className="card">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-white">Пулы хранения</h3>
          </div>
        </div>

        {pools.length === 0 && !loading ? (
          <EmptyState
            icon={FolderOpen}
            title="Пулы хранения не найдены"
            description="Создайте первый пул хранения, чтобы размещать в нем диски виртуальных машин."
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {pools.map((pool) => {
              const isBusy = pendingPoolAction && pendingPoolAction.startsWith(`${pool.name}:`);
              const isDeleting = pendingPoolDelete === pool.name;
              const isOnline = pool.status === 'online' || pool.status === 'degraded' || pool.status === 'building';
              const attachedVolume = volumes.find((volume) => volume.pool === pool.name && volume.attached_vm);
              const hasAttachedVolume = Boolean(attachedVolume);
              return (
                <div key={pool.id} className="rounded-xl border border-dark-700 bg-dark-900/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-white font-semibold text-base">{pool.name}</h4>
                      <p className="text-sm text-dark-400 mt-1 break-all">{pool.path || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${getPoolStatusClassName(pool.status)}`}></span>
                      <span className="text-sm text-dark-200">{getPoolStatusLabel(pool.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                    <div className="rounded-lg border border-dark-700 bg-dark-800/80 px-3 py-2">
                      <div className="text-dark-400">Тип</div>
                      <div className="text-white mt-1">{pool.type || 'dir'}</div>
                    </div>
                    <div className="rounded-lg border border-dark-700 bg-dark-800/80 px-3 py-2">
                      <div className="text-dark-400">Томов</div>
                      <div className="text-white mt-1">{pool.volumes_count}</div>
                    </div>
                    <div className="rounded-lg border border-dark-700 bg-dark-800/80 px-3 py-2">
                      <div className="text-dark-400">Использовано</div>
                      <div className="text-white mt-1">{formatSize(pool.allocation_bytes)}</div>
                    </div>
                    <div className="rounded-lg border border-dark-700 bg-dark-800/80 px-3 py-2">
                      <div className="text-dark-400">Свободно</div>
                      <div className="text-white mt-1">{formatSize(pool.available_bytes)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-5">
                    <button
                      className="btn flex items-center gap-2"
                      onClick={() => runPoolAction(pool.name, 'refresh', apiService.refreshStoragePool, 'Не удалось обновить пул хранения')}
                      disabled={!isOnline || isBusy}
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>{isBusy && pendingPoolAction === `${pool.name}:refresh` ? 'Обновление...' : 'Обновить'}</span>
                    </button>
                    {isOnline ? (
                      <button
                        className="btn flex items-center gap-2 text-red-200 hover:text-white"
                        onClick={() => runPoolAction(pool.name, 'stop', apiService.stopStoragePool, 'Не удалось остановить пул хранения')}
                        disabled={isBusy}
                      >
                        <Square className="w-4 h-4" />
                        <span>{isBusy && pendingPoolAction === `${pool.name}:stop` ? 'Остановка...' : 'Остановить'}</span>
                      </button>
                    ) : (
                      <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => runPoolAction(pool.name, 'start', apiService.startStoragePool, 'Не удалось запустить пул хранения')}
                        disabled={isBusy}
                      >
                        <Play className="w-4 h-4" />
                        <span>{isBusy && pendingPoolAction === `${pool.name}:start` ? 'Запуск...' : 'Запустить'}</span>
                      </button>
                    )}
                    <button
                      className="btn flex items-center gap-2 text-red-200 hover:text-white"
                      onClick={() => handleDeletePool(pool)}
                      disabled={isBusy || isDeleting || hasAttachedVolume}
                      title={hasAttachedVolume ? `Пул содержит подключенный том ${attachedVolume.name} (ВМ ${attachedVolume.attached_vm})` : 'Удалить пул'}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Удаление...' : hasAttachedVolume ? 'Пул занят' : 'Удалить пул'}</span>
                    </button>
                    {pool.autostart && <span className="text-xs text-emerald-300">Автозапуск включен</span>}
                  </div>
                  {hasAttachedVolume && (
                    <p className="mt-3 text-xs text-amber-300">
                      Том {attachedVolume.name} подключен к ВМ {attachedVolume.attached_vm}. Сначала отключите его, затем удаляйте пул.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-white">Список томов</h3>
            <p className="text-sm text-dark-400 mt-1">Тома доступны для подключения к виртуальным машинам.</p>
          </div>
        </div>

        {volumes.length === 0 && !loading ? (
          <EmptyState
            icon={Database}
            title="Тома не найдены"
            description="Создайте том в активном пуле хранения, чтобы он появился здесь."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Имя</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Пул</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Формат</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Размер</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Используется ВМ</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Путь</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {volumes.map((volume) => {
                  const isDeleting = pendingVolumeDelete === volume.id;
                  const isAttached = Boolean(volume.attached_vm);
                  return (
                    <tr key={volume.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                      <td className="py-3 px-4 text-white">{volume.name}</td>
                      <td className="py-3 px-4 text-dark-300">{volume.pool}</td>
                      <td className="py-3 px-4 text-dark-300 uppercase">{volume.format || 'raw'}</td>
                      <td className="py-3 px-4 text-dark-300">{formatSize(volume.size_bytes)}</td>
                      <td className="py-3 px-4 text-dark-300">
                        {isAttached ? (
                          <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                            {volume.attached_vm}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-dark-400 break-all">{volume.path || '-'}</td>
                      <td className="py-3 px-4">
                        <button
                          className={`btn flex items-center gap-2 ${isAttached ? 'text-dark-500 cursor-not-allowed' : 'text-red-200 hover:text-white'}`}
                          onClick={() => handleDeleteVolume(volume)}
                          disabled={isDeleting || isAttached}
                          title={isAttached ? `Том используется ВМ ${volume.attached_vm}` : 'Удалить'}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{isDeleting ? 'Удаление...' : isAttached ? 'Используется' : 'Удалить'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Storage;
