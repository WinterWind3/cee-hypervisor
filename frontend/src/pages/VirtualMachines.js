import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Play, Square, RotateCcw, Plus, Settings, Monitor } from 'lucide-react';
import { apiService } from '../services/api';
import ActionButton from '../components/ActionButton';
import AppDialog from '../components/AppDialog';
import EmptyState from '../components/EmptyState';
import FormModal from '../components/FormModal';
import LoadingState from '../components/LoadingState';
import AppToast from '../components/AppToast';
import PageActions from '../components/PageActions';
import RefreshButton from '../components/RefreshButton';
import StatusMessage from '../components/StatusMessage';
import { useDialog } from '../hooks/useDialog';
import { useTimedMessage } from '../hooks/useTimedMessage';

const VirtualMachines = () => {
  const [vms, setVms] = useState([]);
  const [storagePools, setStoragePools] = useState([]);
  const [storageVolumes, setStorageVolumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createAttempted, setCreateAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [pendingVmAction, setPendingVmAction] = useState(null);
  const { dialog, openDialog, closeDialog } = useDialog();
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();

  const loadVMs = useCallback(async (showMessage = true) => {
    try {
      setLoading(true);
      setError(null);
      const [vmResponse, storageResponse] = await Promise.all([
        apiService.getVMs(),
        apiService.getStorage(),
      ]);
      setVms(vmResponse.data || []);
      setStoragePools(Array.isArray(storageResponse.data?.pools) ? storageResponse.data.pools : []);
      setStorageVolumes(Array.isArray(storageResponse.data?.volumes) ? storageResponse.data.volumes : []);
      if (showMessage) {
        showUpdateMessage('Обновление выполнено');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Ошибка загрузки списка виртуальных машин'
      );
      setStoragePools([]);
      setStorageVolumes([]);
    } finally {
      setLoading(false);
    }
  }, [showUpdateMessage]);

  useEffect(() => {
    loadVMs(false);
  }, [loadVMs]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'запущена':
        return 'bg-green-500';
      case 'stopped':
      case 'остановлена':
        return 'bg-red-500';
      case 'paused':
      case 'приостановлена':
        return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    const normalized = (status || '').toString().toLowerCase();
    if (normalized === 'running') return 'Работает';
    if (normalized === 'stopped') return 'Остановлена';
    if (normalized === 'paused') return 'Приостановлена';
    return status || 'Неизвестно';
  };

  const runVmAction = async (id, action, request, failureTitle) => {
    if (pendingVmAction?.id === id) {
      return;
    }

    try {
      setPendingVmAction({ id, action });
      await request(id);
      await loadVMs();
    } catch (err) {
      openDialog({
        title: failureTitle,
        message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
        variant: 'danger',
      });
    } finally {
      setPendingVmAction(null);
    }
  };

  const handleStart = async (id) => {
    await runVmAction(id, 'start', apiService.startVM, 'Не удалось запустить ВМ');
  };

  const handleStop = async (id) => {
    await runVmAction(id, 'stop', apiService.stopVM, 'Не удалось остановить ВМ');
  };

  const handleRestart = async (id) => {
    await runVmAction(id, 'restart', apiService.restartVM, 'Не удалось перезапустить ВМ');
  };

  const activeStoragePools = useMemo(
    () => storagePools.filter((pool) => pool.status === 'online' || pool.status === 'degraded' || pool.status === 'building'),
    [storagePools]
  );

  const [showCreate, setShowCreate] = useState(false);
  const [newVm, setNewVm] = useState({ name: '', cpu_cores: 1, memory_mb: 1024, disk_gb: 10, disk_mode: 'create', storage_pool: '', existing_volume: '' });

  const usedStorageVolumeKeys = useMemo(
    () => new Set(
      vms
        .filter((vm) => vm.storage_pool && vm.storage_volume)
        .map((vm) => `${vm.storage_pool}::${vm.storage_volume}`)
    ),
    [vms]
  );

  const availableExistingVolumes = useMemo(() => {
    if (!newVm.storage_pool) {
      return [];
    }
    return storageVolumes.filter(
      (volume) => volume.pool === newVm.storage_pool && !usedStorageVolumeKeys.has(`${volume.pool}::${volume.name}`)
    );
  }, [newVm.storage_pool, storageVolumes, usedStorageVolumeKeys]);

  const handleCreate = () => {
    setCreateAttempted(false);
    setTouchedFields({});
    setNewVm((current) => ({
      ...current,
      storage_pool: current.storage_pool || activeStoragePools[0]?.name || '',
      existing_volume: '',
    }));
    setShowCreate(true);
  };

  const handleCreateChange = (field) => (e) => {
    const value = e.target.value;
    setNewVm((s) => ({
      ...s,
      existing_volume: field === 'disk_mode' || field === 'storage_pool' ? '' : s.existing_volume,
      [field]: field === 'name' || field === 'storage_pool' || field === 'disk_mode' || field === 'existing_volume' ? value : Number(value),
    }));
  };

  const createErrors = {
    name: !newVm.name.trim() ? 'Введите имя виртуальной машины.' : '',
    cpu_cores: Number(newVm.cpu_cores) < 1 ? 'Укажите хотя бы 1 ядро CPU.' : '',
    memory_mb: Number(newVm.memory_mb) < 128 ? 'Укажите не меньше 128 MB ОЗУ.' : '',
    disk_gb: newVm.disk_mode === 'create' && Number(newVm.disk_gb) < 1 ? 'Укажите размер диска не меньше 1 GB.' : '',
    storage_pool: newVm.disk_mode === 'existing' && !newVm.storage_pool ? 'Выберите пул хранения для существующего тома.' : '',
    existing_volume: newVm.disk_mode === 'existing' && !newVm.existing_volume ? 'Выберите существующий том.' : '',
  };

  const hasCreateErrors = Boolean(createErrors.name || createErrors.cpu_cores || createErrors.memory_mb || createErrors.disk_gb || createErrors.storage_pool || createErrors.existing_volume);

  const isFieldInvalid = (field) => Boolean((createAttempted || touchedFields[field]) && createErrors[field]);

  const getFieldClassName = (field) => `input w-full${isFieldInvalid(field) ? ' input-error' : ''}`;

  const markFieldTouched = (field) => () => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const resetCreateValidation = () => {
    setCreateAttempted(false);
    setTouchedFields({});
  };

  const closeCreateModal = () => {
    if (isCreating) {
      return;
    }
    resetCreateValidation();
    setShowCreate(false);
  };

  const isCreateDisabled = hasCreateErrors;

  const submitCreate = async () => {
    if (isCreating) {
      return;
    }

    setCreateAttempted(true);

    if (hasCreateErrors) {
      return;
    }
    try {
      setIsCreating(true);
      await apiService.createVM(newVm);
      resetCreateValidation();
      setShowCreate(false);
      setNewVm({ name: '', cpu_cores: 1, memory_mb: 1024, disk_gb: 10, disk_mode: 'create', storage_pool: activeStoragePools[0]?.name || '', existing_volume: '' });
      await loadVMs(false);
      openDialog({
        title: 'ВМ создана',
        message: `Виртуальная машина "${newVm.name}" успешно создана.`,
        variant: 'success',
      });
    } catch (err) {
      openDialog({
        title: 'Не удалось создать ВМ',
        message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
        variant: 'danger',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSettings = (vm) => {
    openDialog({
      title: `Параметры ВМ "${vm.name}"`,
      message:
        `Ядра CPU: ${vm.cpu_cores ?? vm.cpu}\n` +
        `ОЗУ: ${vm.memory_mb ?? vm.memory} MB\n` +
        `Диск: ${vm.disk_gb ?? vm.disk ?? '-'} GB\n` +
        `Хранилище: ${vm.storage_pool || 'Системный путь'}\n` +
        `Том: ${vm.storage_volume || '-'}\n` +
        `Путь: ${vm.disk_path || '-'}\n` +
        `Кластер: ${vm.cluster_id ?? vm.cluster ?? '-'}`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <AppToast message={updateMsg} />
      <PageActions>
        <RefreshButton onClick={() => loadVMs(true)} loading={loading} />
        <ActionButton icon={Plus} label="Создать ВМ" onClick={handleCreate} />
      </PageActions>

      <FormModal
        isOpen={showCreate}
        title="Создать ВМ"
        subtitle="Задайте базовые параметры виртуальной машины."
        confirmLabel="Создать"
        confirmBusyLabel="Создание..."
        isSubmitting={isCreating}
        confirmDisabled={isCreateDisabled}
        onClose={closeCreateModal}
        onConfirm={submitCreate}
      >
        <div className="modal-field">
          <label className="modal-label">Имя</label>
          <input className={getFieldClassName('name')} value={newVm.name} onChange={handleCreateChange('name')} onBlur={markFieldTouched('name')} />
          {isFieldInvalid('name') && <p className="text-xs text-red-400">{createErrors.name}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Ядра CPU</label>
          <input type="number" min="1" className={getFieldClassName('cpu_cores')} value={newVm.cpu_cores} onChange={handleCreateChange('cpu_cores')} onBlur={markFieldTouched('cpu_cores')} />
          {isFieldInvalid('cpu_cores') && <p className="text-xs text-red-400">{createErrors.cpu_cores}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">ОЗУ (MB)</label>
          <input type="number" min="128" className={getFieldClassName('memory_mb')} value={newVm.memory_mb} onChange={handleCreateChange('memory_mb')} onBlur={markFieldTouched('memory_mb')} />
          {isFieldInvalid('memory_mb') && <p className="text-xs text-red-400">{createErrors.memory_mb}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Режим диска</label>
          <select className="input w-full" value={newVm.disk_mode} onChange={handleCreateChange('disk_mode')}>
            <option value="create">Создать новый том</option>
            <option value="existing">Использовать существующий том</option>
          </select>
        </div>
        <div className="modal-field">
          <label className="modal-label">Диск (GB)</label>
          <input type="number" min="1" className={getFieldClassName('disk_gb')} value={newVm.disk_gb} onChange={handleCreateChange('disk_gb')} onBlur={markFieldTouched('disk_gb')} disabled={newVm.disk_mode !== 'create'} />
          {isFieldInvalid('disk_gb') && <p className="text-xs text-red-400">{createErrors.disk_gb}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Хранилище</label>
          <select className={getFieldClassName('storage_pool')} value={newVm.storage_pool} onChange={handleCreateChange('storage_pool')} onBlur={markFieldTouched('storage_pool')}>
            <option value="">Системный путь (/var/lib/libvirt/images)</option>
            {activeStoragePools.map((pool) => (
              <option key={pool.id} value={pool.name}>{pool.name}</option>
            ))}
          </select>
          {isFieldInvalid('storage_pool') && <p className="text-xs text-red-400">{createErrors.storage_pool}</p>}
          <p className="text-xs text-dark-400">Если выбран пул хранения, диск ВМ будет создан как том qcow2 внутри этого пула.</p>
        </div>
        {newVm.disk_mode === 'existing' && (
          <div className="modal-field">
            <label className="modal-label">Существующий том</label>
            <select className={getFieldClassName('existing_volume')} value={newVm.existing_volume} onChange={handleCreateChange('existing_volume')} onBlur={markFieldTouched('existing_volume')}>
              <option value="">Выберите том</option>
              {availableExistingVolumes.map((volume) => (
                <option key={volume.id} value={volume.name}>{volume.name}</option>
              ))}
            </select>
            {isFieldInvalid('existing_volume') && <p className="text-xs text-red-400">{createErrors.existing_volume}</p>}
            {newVm.storage_pool && availableExistingVolumes.length === 0 && <p className="text-xs text-amber-300">В выбранном пуле пока нет доступных томов.</p>}
          </div>
        )}
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

      <div className="card">
        <StatusMessage message={error} className="mb-4" />
        <LoadingState message={loading ? 'Загрузка списка ВМ...' : ''} className="mb-4" />
        {vms.length === 0 && !loading ? (
          <EmptyState
            icon={Monitor}
            title="ВМ не найдены"
            description="Создайте ВМ, чтобы она появилась здесь."
          />
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 font-medium text-dark-300">Имя</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Статус</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Ядра CPU</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">ОЗУ</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Диск</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Хранилище</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Том</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Действия</th>
              </tr>
            </thead>
            <tbody>
              {vms.map((vm) => (
                <tr key={vm.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="py-3 px-4 text-white font-medium">{vm.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(vm.status)}`}></div>
                      <span className="text-dark-300 capitalize">
                        {getStatusLabel(vm.status)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-dark-300">{vm.cpu_cores ?? vm.cpu} ядро</td>
                  <td className="py-3 px-4 text-dark-300">{vm.memory_mb ?? vm.memory} MB</td>
                  <td className="py-3 px-4 text-dark-300">{vm.disk_gb ?? vm.disk} GB</td>
                  <td className="py-3 px-4 text-dark-300">{vm.storage_pool || 'Системный путь'}</td>
                  <td className="py-3 px-4 text-dark-300">{vm.storage_volume || '-'}</td>
                  <td className="py-3 px-4">
                    {(() => {
                      const isRowPending = pendingVmAction?.id === vm.id;
                      const pendingAction = pendingVmAction?.action;

                      return (
                    <div className="flex items-center space-x-2">
                      <button
                        className={`p-1 transition-colors ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-green-400 hover:text-green-300'}`}
                        title={isRowPending && pendingAction === 'start' ? 'Запуск...' : 'Запустить'}
                        onClick={() => handleStart(vm.id)}
                        disabled={isRowPending}
                      >
                        <Play className={`w-4 h-4 ${isRowPending && pendingAction === 'start' ? 'animate-pulse' : ''}`} />
                      </button>
                      <button
                        className={`p-1 transition-colors ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                        title={isRowPending && pendingAction === 'stop' ? 'Остановка...' : 'Остановить'}
                        onClick={() => handleStop(vm.id)}
                        disabled={isRowPending}
                      >
                        <Square className={`w-4 h-4 ${isRowPending && pendingAction === 'stop' ? 'animate-pulse' : ''}`} />
                      </button>
                      <button
                        className={`p-1 transition-colors ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-yellow-400 hover:text-yellow-300'}`}
                        title={isRowPending && pendingAction === 'restart' ? 'Перезапуск...' : 'Перезапустить'}
                        onClick={() => handleRestart(vm.id)}
                        disabled={isRowPending}
                      >
                        <RotateCcw className={`w-4 h-4 ${isRowPending && pendingAction === 'restart' ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        className={`p-1 transition-colors ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-white'}`}
                        title="Настройки"
                        onClick={() => handleSettings(vm)}
                        disabled={isRowPending}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {isRowPending && (
                        <span className="ml-2 text-xs text-dark-400">
                          {pendingAction === 'start' ? 'Запуск...' : pendingAction === 'stop' ? 'Остановка...' : 'Перезапуск...'}
                        </span>
                      )}
                    </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default VirtualMachines;