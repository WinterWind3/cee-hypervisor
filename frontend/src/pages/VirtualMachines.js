import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Square, RotateCcw, Plus, Settings, Monitor, TerminalSquare, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import ActionButton from '../components/ActionButton';
import AppDialog from '../components/AppDialog';
import EmptyState from '../components/EmptyState';
import FormInlineHelp from '../components/FormInlineHelp';
import FormModal from '../components/FormModal';
import LoadingState from '../components/LoadingState';
import AppToast from '../components/AppToast';
import PageActions from '../components/PageActions';
import QueryStateActions from '../components/QueryStateActions';
import RefreshButton from '../components/RefreshButton';
import StatusMessage from '../components/StatusMessage';
import VmReadinessIndicator from '../components/VmReadinessIndicator';
import { useDialog } from '../hooks/useDialog';
import useQueryStateUrl from '../hooks/useQueryStateUrl';
import { useTimedMessage } from '../hooks/useTimedMessage';
import {
  buildQueryStateIndicators,
  createQueryStateIndicator,
  createQueryStateResetConfig,
} from '../utils/queryState';

const getNextPresetName = (baseName, existingNames) => {
  const normalizedNames = new Set(existingNames.map((name) => String(name || '').toLowerCase()));
  if (!normalizedNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  let suffix = 2;
  while (normalizedNames.has(`${baseName}-${suffix}`.toLowerCase())) {
    suffix += 1;
  }

  return `${baseName}-${suffix}`;
};

const VM_PRESET_CONFIG = {
  mini: {
    name: 'vm-mini',
    cpu_cores: 1,
    memory_mb: 1024,
    disk_gb: 10,
  },
  service: {
    name: 'vm-service',
    cpu_cores: 2,
    memory_mb: 2048,
    disk_gb: 20,
  },
  database: {
    name: 'vm-db',
    cpu_cores: 4,
    memory_mb: 4096,
    disk_gb: 40,
  },
};

const NUMERIC_VM_FIELDS = ['cpu_cores', 'memory_mb', 'disk_gb'];

const getRequiredNumberError = (value, emptyMessage, minValue, minMessage) => {
  if (String(value ?? '').trim() === '') {
    return emptyMessage;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 'Введите корректное число.';
  }

  if (numericValue < minValue) {
    return minMessage;
  }

  return '';
};

const stringToNumericId = (str) => {
  if (!str) return '-';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 1000;
};

const VirtualMachines = () => {
  const [vms, setVms] = useState([]);
  const [images, setImages] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [vSwitches, setVSwitches] = useState([]);
  const [storagePools, setStoragePools] = useState([]);
  const [storageVolumes, setStorageVolumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVmPreset, setSelectedVmPreset] = useState('mini');
  const [createAttempted, setCreateAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [pendingVmAction, setPendingVmAction] = useState(null);
  const [mediaVm, setMediaVm] = useState(null);
  const [selectedCdromImage, setSelectedCdromImage] = useState('');
  const [isUpdatingCdrom, setIsUpdatingCdrom] = useState(false);
  const { dialog, openDialog, closeDialog } = useDialog();
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();
  const { searchParams, removeQueryIndicator, resetAllQueryIndicators, copyCurrentLink } = useQueryStateUrl({
    onCopySuccess: showUpdateMessage,
    onCopyError: () => showUpdateMessage('Не удалось скопировать ссылку'),
  });
  const rowRefs = useRef({});

  const loadVMs = useCallback(async (showMessage = true) => {
    try {
      setLoading(true);
      setError(null);
      const [vmResult, storageResult, imagesResult, networksResult, vSwitchesResult] = await Promise.allSettled([
        apiService.getVMs(),
        apiService.getStorage(),
        apiService.getImages(),
        apiService.getNetworks(),
        apiService.getVSwitches(),
      ]);

      if (vmResult.status === 'fulfilled') {
        setVms(vmResult.value.data || []);
      } else {
        throw vmResult.reason;
      }

      if (storageResult.status === 'fulfilled') {
        setStoragePools(Array.isArray(storageResult.value.data?.pools) ? storageResult.value.data.pools : []);
        setStorageVolumes(Array.isArray(storageResult.value.data?.volumes) ? storageResult.value.data.volumes : []);
      } else {
        setStoragePools([]);
        setStorageVolumes([]);
      }

      if (imagesResult.status === 'fulfilled') {
        setImages(Array.isArray(imagesResult.value.data) ? imagesResult.value.data : []);
      } else {
        setImages([]);
      }

      if (networksResult.status === 'fulfilled') {
        setNetworks(Array.isArray(networksResult.value.data) ? networksResult.value.data : []);
      } else {
        setNetworks([]);
      }

      if (vSwitchesResult.status === 'fulfilled') {
        setVSwitches(Array.isArray(vSwitchesResult.value.data) ? vSwitchesResult.value.data : []);
      } else {
        setVSwitches([]);
      }

      if (showMessage) {
        showUpdateMessage('Данные обновлены');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Ошибка загрузки списка виртуальных машин'
      );
      setImages([]);
      setNetworks([]);
      setVSwitches([]);
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

  const selectedVmName = searchParams.get('vm') || '';
  const isCreateAction = searchParams.get('action') === 'create';
  const selectedPoolName = searchParams.get('pool') || '';
  const selectedVolumeName = searchParams.get('volume') || '';
  const activeQueryIndicators = useMemo(() => {
    return buildQueryStateIndicators([
      createQueryStateIndicator('vm', selectedVmName),
      createQueryStateIndicator('pool', selectedPoolName),
      createQueryStateIndicator('volume', selectedVolumeName),
    ]);
  }, [selectedPoolName, selectedVmName, selectedVolumeName]);

  useEffect(() => {
    const targetNode = rowRefs.current[selectedVmName];
    if (selectedVmName && targetNode) {
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedVmName, vms]);

  const [showCreate, setShowCreate] = useState(isCreateAction);
  const createAdditionalDiskDraft = useCallback(
    () => ({
      size_gb: '',
      storage_pool: activeStoragePools[0]?.name || '',
    }),
    [activeStoragePools]
  );

  const createDefaultVmForm = useCallback(
    (overrides = {}) => ({
      name: '',
      cpu_cores: '1',
      memory_mb: '1024',
      disk_gb: '10',
      disk_source_mode: 'create',
      disk_mode: 'create',
      storage_pool: activeStoragePools[0]?.name || '',
      existing_volume: '',
      boot_source_image: '',
      cdrom_image: '',
      additional_disks: [],
      network_source_type: 'libvirt',
      network_name: 'default',
      vswitch_name: '',
      vswitch_portgroup: '',
      ...overrides,
    }),
    [activeStoragePools]
  );

  const [newVm, setNewVm] = useState(() => createDefaultVmForm());

  const availableExistingVolumes = useMemo(() => {
    if (!newVm.storage_pool) {
      return [];
    }
    return storageVolumes.filter(
      (volume) => volume.pool === newVm.storage_pool && !volume.attached_vm
    );
  }, [newVm.storage_pool, storageVolumes]);

  const availableDiskImages = useMemo(
    () => images.filter((image) => ['qcow2', 'img', 'vmdk', 'vdi'].includes((image.type || '').toLowerCase())),
    [images]
  );

  const availableIsoImages = useMemo(
    () => images.filter((image) => (image.type || '').toLowerCase() === 'iso'),
    [images]
  );

  const selectedVSwitchPortgroups = useMemo(() => {
    const selected = vSwitches.find((sw) => sw.name === newVm.vswitch_name);
    return Array.isArray(selected?.portgroups) ? selected.portgroups : [];
  }, [newVm.vswitch_name, vSwitches]);

  const buildVmPresetForm = useCallback((presetId, currentForm = newVm) => {
    const preset = VM_PRESET_CONFIG[presetId] || VM_PRESET_CONFIG.mini;
    return {
      ...currentForm,
      name: getNextPresetName(preset.name, vms.map((vm) => vm.name)),
      cpu_cores: String(preset.cpu_cores),
      memory_mb: String(preset.memory_mb),
      disk_gb: String(preset.disk_gb),
      disk_source_mode: 'create',
      disk_mode: 'create',
      storage_pool: currentForm.storage_pool || activeStoragePools[0]?.name || '',
      existing_volume: '',
      boot_source_image: '',
      cdrom_image: currentForm.cdrom_image || '',
      additional_disks: currentForm.additional_disks || [],
      network_source_type: currentForm.network_source_type || 'libvirt',
      network_name: currentForm.network_name || 'default',
      vswitch_name: currentForm.vswitch_name || '',
      vswitch_portgroup: '',
    };
  }, [activeStoragePools, newVm, vms]);

  const handleCreate = () => {
    setCreateAttempted(false);
    setTouchedFields({});
    setSelectedVmPreset('mini');
    setNewVm(buildVmPresetForm('mini', createDefaultVmForm()));
    setShowCreate(true);
  };

  const handleCreateChange = (field) => (e) => {
    const value = e.target.value;
    setSelectedVmPreset('');
    setNewVm((s) => {
      if (field === 'disk_source_mode') {
        const nextDiskMode = value === 'existing' ? 'existing' : 'create';
        return {
          ...s,
          disk_source_mode: value,
          disk_mode: nextDiskMode,
          existing_volume: '',
          boot_source_image: '',
          storage_pool: value === 'image' ? '' : s.storage_pool,
        };
      }

      if (field === 'storage_pool') {
        return {
          ...s,
          storage_pool: value,
          existing_volume: '',
        };
      }

      if (field === 'network_source_type') {
        return {
          ...s,
          network_source_type: value,
          network_name: value === 'libvirt' ? (s.network_name || 'default') : '',
          vswitch_name: value === 'vswitch' ? s.vswitch_name : '',
          vswitch_portgroup: '',
        };
      }

      if (field === 'vswitch_name') {
        return {
          ...s,
          vswitch_name: value,
          vswitch_portgroup: '',
        };
      }

      if (NUMERIC_VM_FIELDS.includes(field)) {
        return {
          ...s,
          [field]: value,
        };
      }

      return {
        ...s,
        [field]: value,
      };
    });
  };

  const handleAdditionalDiskChange = (index, field) => (event) => {
    const value = event.target.value;
    setNewVm((current) => ({
      ...current,
      additional_disks: current.additional_disks.map((disk, diskIndex) => (
        diskIndex === index ? { ...disk, [field]: value } : disk
      )),
    }));
  };

  const addAdditionalDisk = () => {
    setNewVm((current) => ({
      ...current,
      additional_disks: [...current.additional_disks, createAdditionalDiskDraft()],
    }));
  };

  const removeAdditionalDisk = (index) => {
    setNewVm((current) => ({
      ...current,
      additional_disks: current.additional_disks.filter((_, diskIndex) => diskIndex !== index),
    }));
  };

  const applyVmPreset = (presetId) => {
    resetCreateValidation();
    setSelectedVmPreset(presetId);
    setNewVm((current) => buildVmPresetForm(presetId, current));
  };

  const createErrors = {
    name: !newVm.name.trim() ? 'Введите имя виртуальной машины.' : '',
    cpu_cores: getRequiredNumberError(newVm.cpu_cores, 'Поле CPU не должно быть пустым.', 1, 'Укажите хотя бы 1 ядро CPU.'),
    memory_mb: getRequiredNumberError(newVm.memory_mb, 'Поле ОЗУ не должно быть пустым.', 128, 'Укажите не меньше 128 MB ОЗУ.'),
    disk_gb: newVm.disk_source_mode === 'create'
      ? getRequiredNumberError(newVm.disk_gb, 'Поле размера диска не должно быть пустым.', 1, 'Укажите размер диска не меньше 1 GB.')
      : '',
    storage_pool: newVm.disk_source_mode === 'existing' && !newVm.storage_pool ? 'Выберите пул хранения для существующего тома.' : '',
    existing_volume: newVm.disk_source_mode === 'existing' && !newVm.existing_volume ? 'Выберите существующий том.' : '',
    boot_source_image: newVm.disk_source_mode === 'image' && !newVm.boot_source_image ? 'Выберите загруженный образ диска.' : '',
    network_name: newVm.network_source_type === 'libvirt' && !newVm.network_name ? 'Выберите libvirt-сеть.' : '',
    vswitch_name: newVm.network_source_type === 'vswitch' && !newVm.vswitch_name ? 'Выберите vSwitch.' : '',
  };

  const additionalDiskErrors = newVm.additional_disks.map((disk) => ({
    size_gb: getRequiredNumberError(disk.size_gb, 'Поле размера дополнительного диска не должно быть пустым.', 1, 'Укажите размер диска не меньше 1 GB.'),
  }));

  const hasCreateErrors = Boolean(
    createErrors.name
    || createErrors.cpu_cores
    || createErrors.memory_mb
    || createErrors.disk_gb
    || createErrors.storage_pool
    || createErrors.existing_volume
    || createErrors.boot_source_image
    || createErrors.network_name
    || createErrors.vswitch_name
    || additionalDiskErrors.some((disk) => disk.size_gb)
  );

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
      const payload = {
        ...newVm,
        cpu_cores: Number(newVm.cpu_cores),
        memory_mb: Number(newVm.memory_mb),
        disk_gb: Number(newVm.disk_gb),
        disk_mode: newVm.disk_source_mode === 'existing' ? 'existing' : 'create',
        boot_source_image: newVm.disk_source_mode === 'image' ? newVm.boot_source_image : null,
        cdrom_image: newVm.cdrom_image || null,
        storage_pool: newVm.disk_source_mode === 'image' ? null : (newVm.storage_pool || null),
        existing_volume: newVm.disk_source_mode === 'existing' ? newVm.existing_volume : null,
        additional_disks: newVm.additional_disks.map((disk) => ({
          size_gb: Number(disk.size_gb),
          storage_pool: disk.storage_pool || null,
        })),
        network_name: newVm.network_source_type === 'libvirt' ? (newVm.network_name || 'default') : null,
        vswitch_name: newVm.network_source_type === 'vswitch' ? newVm.vswitch_name : null,
        vswitch_portgroup: newVm.network_source_type === 'vswitch' ? (newVm.vswitch_portgroup || null) : null,
      };

      await apiService.createVM(payload);
      resetCreateValidation();
      setSelectedVmPreset('mini');
      setShowCreate(false);
      setNewVm(createDefaultVmForm());
      await loadVMs(false);
      openDialog({
        title: `ВМ ${newVm.name} создана`,
        message: `Виртуальная машина ${newVm.name} добавлена в список.`,
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

  const closeMediaModal = () => {
    setMediaVm(null);
    setSelectedCdromImage('');
  };

  const handleSettings = (vm) => {
    setMediaVm(vm);
    setSelectedCdromImage(vm.cdrom_image || '');
  };

  const handleAttachCdrom = async () => {
    if (!mediaVm || !selectedCdromImage) {
      return;
    }

    try {
      setIsUpdatingCdrom(true);
      await apiService.attachVMCdrom(mediaVm.name, selectedCdromImage);
      await loadVMs(false);
      closeMediaModal();
      showUpdateMessage(`ISO подключен к ${mediaVm.name}`);
    } catch (err) {
      openDialog({
        title: 'Не удалось подключить ISO',
        message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
        variant: 'danger',
      });
    } finally {
      setIsUpdatingCdrom(false);
    }
  };

  const handleDetachCdrom = async () => {
    if (!mediaVm || !mediaVm.cdrom_image) {
      return;
    }

    try {
      setIsUpdatingCdrom(true);
      await apiService.detachVMCdrom(mediaVm.name);
      await loadVMs(false);
      closeMediaModal();
      showUpdateMessage(`ISO отключен от ${mediaVm.name}`);
    } catch (err) {
      openDialog({
        title: 'Не удалось отключить ISO',
        message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
        variant: 'danger',
      });
    } finally {
      setIsUpdatingCdrom(false);
    }
  };

  const handleConsole = async (vm) => {
    try {
      const response = await apiService.getVMConsole(vm.name);
      const url = response?.data?.url;
      if (!url) {
        throw new Error('URL консоли не получен');
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      openDialog({
        title: 'Не удалось открыть консоль',
        message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
        variant: 'danger',
      });
    }
  };

  const handleDelete = (vm) => {
    openDialog({
      title: `Удалить ВМ ${vm.name}?`,
      message: 'Виртуальная машина и ее системный диск будут удалены.',
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: async () => {
        try {
          await apiService.deleteVMWithOptions(vm.name, { delete_disk: true });
          closeDialog();
          await loadVMs(false);
          showUpdateMessage(`ВМ ${vm.name} удалена`);
        } catch (err) {
          openDialog({
            title: 'Не удалось удалить ВМ',
            message: err.response?.data?.detail || err.message || 'Неизвестная ошибка',
            variant: 'danger',
          });
        }
      },
    });
  };

  const handleResetQueryState = () => {
    resetAllQueryIndicators(queryStateConfig);
  };

  const queryStateConfig = useMemo(() => ({
    vm: createQueryStateResetConfig({
      resetKeys: ['vm'],
    }),
    pool: createQueryStateResetConfig({
      resetKeys: ['pool', 'volume'],
    }),
    volume: createQueryStateResetConfig({
      resetKeys: ['volume'],
    }),
  }), []);

  const handleRemoveIndicator = useCallback(
    (indicatorId) => {
      removeQueryIndicator(indicatorId, queryStateConfig);
    },
    [queryStateConfig, removeQueryIndicator]
  );

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
        <FormInlineHelp
          title="Быстрые пресеты ВМ"
          description="Используйте готовые стартовые профили, а затем при необходимости уточните параметры вручную."
          selectedPreset={selectedVmPreset}
          presets={[
            { id: 'mini', label: 'Мини', description: 'vm-mini, 1 CPU / 1 GB / 10 GB', onClick: () => applyVmPreset('mini') },
            { id: 'service', label: 'Сервис', description: 'vm-service, 2 CPU / 2 GB / 20 GB', onClick: () => applyVmPreset('service') },
            { id: 'database', label: 'База', description: 'vm-db, 4 CPU / 4 GB / 40 GB', onClick: () => applyVmPreset('database') },
          ]}
          tips={[
            'Режим существующего тома подходит, если диск уже подготовлен в пуле хранения.',
            'ISO теперь подключается отдельно как CD-ROM и может быть отключен позже.',
          ]}
        />
        <div className="modal-field">
          <label className="modal-label">Имя ВМ</label>
          <input className={getFieldClassName('name')} value={newVm.name} onChange={handleCreateChange('name')} onBlur={markFieldTouched('name')} placeholder="Например: vm-app-01" />
          {isFieldInvalid('name') && <p className="modal-error">{createErrors.name}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">CPU, ядер</label>
          <input type="number" min="1" className={getFieldClassName('cpu_cores')} value={newVm.cpu_cores} onChange={handleCreateChange('cpu_cores')} onBlur={markFieldTouched('cpu_cores')} placeholder="Например: 2" />
          {isFieldInvalid('cpu_cores') && <p className="modal-error">{createErrors.cpu_cores}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">ОЗУ, MB</label>
          <input type="number" min="128" className={getFieldClassName('memory_mb')} value={newVm.memory_mb} onChange={handleCreateChange('memory_mb')} onBlur={markFieldTouched('memory_mb')} placeholder="Например: 2048" />
          {isFieldInvalid('memory_mb') && <p className="modal-error">{createErrors.memory_mb}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Источник системного диска</label>
          <select className="input w-full" value={newVm.disk_source_mode} onChange={handleCreateChange('disk_source_mode')}>
            <option value="create">Создать новый диск</option>
            <option value="existing">Использовать существующий том</option>
            <option value="image">Копировать из загруженного образа</option>
          </select>
        </div>
        <div className="modal-field">
          <label className="modal-label">Размер диска, GB</label>
          <input type="number" min="1" className={getFieldClassName('disk_gb')} value={newVm.disk_gb} onChange={handleCreateChange('disk_gb')} onBlur={markFieldTouched('disk_gb')} disabled={newVm.disk_source_mode !== 'create'} placeholder="Например: 20" />
          {isFieldInvalid('disk_gb') && <p className="modal-error">{createErrors.disk_gb}</p>}
        </div>
        {newVm.disk_source_mode === 'image' && (
          <div className="modal-field">
            <label className="modal-label">Базовый образ системного диска</label>
            <select className={getFieldClassName('boot_source_image')} value={newVm.boot_source_image} onChange={handleCreateChange('boot_source_image')} onBlur={markFieldTouched('boot_source_image')}>
              <option value="">Выберите образ</option>
              {availableDiskImages.map((image) => (
                <option key={image.name} value={image.name}>{image.name}</option>
              ))}
            </select>
            {isFieldInvalid('boot_source_image') && <p className="modal-error">{createErrors.boot_source_image}</p>}
            <p className="modal-hint">Для qcow2/img/vmdk/vdi будет создана копия системного диска.</p>
          </div>
        )}
        <div className="modal-field">
          <label className="modal-label">ISO-образ для CD-ROM (опционально)</label>
          <select className="input w-full" value={newVm.cdrom_image} onChange={handleCreateChange('cdrom_image')}>
            <option value="">Без ISO</option>
            {availableIsoImages.map((image) => (
              <option key={image.name} value={image.name}>{image.name}</option>
            ))}
          </select>
          <p className="modal-hint">ISO будет подключен как CD-ROM. Его можно будет отключить позже из параметров ВМ.</p>
        </div>
        {newVm.disk_source_mode !== 'image' && (
        <div className="modal-field">
          <label className="modal-label">Пул хранения</label>
          <select className={getFieldClassName('storage_pool')} value={newVm.storage_pool} onChange={handleCreateChange('storage_pool')} onBlur={markFieldTouched('storage_pool')}>
            <option value="">Системный путь (/var/lib/libvirt/images)</option>
            {activeStoragePools.map((pool) => (
              <option key={pool.id} value={pool.name}>{pool.name}</option>
            ))}
          </select>
          {isFieldInvalid('storage_pool') && <p className="modal-error">{createErrors.storage_pool}</p>}
          <p className="modal-hint">Если выбран пул хранения, диск ВМ будет создан как том qcow2 внутри этого пула.</p>
        </div>
        )}
        {newVm.disk_source_mode === 'existing' && (
          <div className="modal-field">
            <label className="modal-label">Существующий том</label>
            <select className={getFieldClassName('existing_volume')} value={newVm.existing_volume} onChange={handleCreateChange('existing_volume')} onBlur={markFieldTouched('existing_volume')}>
              <option value="">Выберите том</option>
              {availableExistingVolumes.map((volume) => (
                <option key={volume.id} value={volume.name}>{volume.name}</option>
              ))}
            </select>
            {isFieldInvalid('existing_volume') && <p className="modal-error">{createErrors.existing_volume}</p>}
            {newVm.storage_pool && availableExistingVolumes.length === 0 && <p className="modal-hint text-amber-300">В выбранном пуле пока нет доступных томов.</p>}
          </div>
        )}
        <div className="modal-field">
          <div className="flex items-center justify-between gap-4">
            <label className="modal-label mb-0">Дополнительные диски</label>
            <button type="button" className="btn page-toolbar-button" onClick={addAdditionalDisk}>Добавить диск</button>
          </div>
          {newVm.additional_disks.length === 0 ? (
            <p className="modal-hint">Необязательно. Здесь можно сразу создать дополнительные data-диски для ВМ.</p>
          ) : (
            <div className="space-y-3">
              {newVm.additional_disks.map((disk, index) => {
                const sizeFieldKey = `additional_disk_${index}_size_gb`;
                const sizeInvalid = Boolean((createAttempted || touchedFields[sizeFieldKey]) && additionalDiskErrors[index]?.size_gb);
                return (
                  <div key={sizeFieldKey} className="rounded-xl border border-dark-700 p-3 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-white">Дополнительный диск #{index + 1}</p>
                      <button type="button" className="table-action-icon-button text-dark-400 hover:text-red-400" onClick={() => removeAdditionalDisk(index)}>
                        <Trash2 className="table-action-icon" />
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="modal-label">Размер, GB</label>
                        <input
                          type="number"
                          min="1"
                          className={`input w-full${sizeInvalid ? ' input-error' : ''}`}
                          value={disk.size_gb}
                          onChange={handleAdditionalDiskChange(index, 'size_gb')}
                          onBlur={markFieldTouched(sizeFieldKey)}
                          placeholder="Например: 50"
                        />
                        {sizeInvalid && <p className="modal-error">{additionalDiskErrors[index]?.size_gb}</p>}
                      </div>
                      <div>
                        <label className="modal-label">Пул хранения</label>
                        <select className="input w-full" value={disk.storage_pool} onChange={handleAdditionalDiskChange(index, 'storage_pool')}>
                          <option value="">Системный путь (/var/lib/libvirt/images)</option>
                          {activeStoragePools.map((pool) => (
                            <option key={`${pool.id}-${index}`} value={pool.name}>{pool.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-field">
          <label className="modal-label">Сетевое подключение</label>
          <select className="input w-full" value={newVm.network_source_type} onChange={handleCreateChange('network_source_type')}>
            <option value="libvirt">Libvirt network</option>
            <option value="vswitch">vSwitch / Port Group</option>
          </select>
        </div>
        {newVm.network_source_type === 'libvirt' && (
          <div className="modal-field">
            <label className="modal-label">Libvirt сеть</label>
            <select className={getFieldClassName('network_name')} value={newVm.network_name} onChange={handleCreateChange('network_name')} onBlur={markFieldTouched('network_name')}>
              <option value="">Выберите сеть</option>
              {networks.map((network) => (
                <option key={network.id} value={network.name}>{network.name}</option>
              ))}
            </select>
            {isFieldInvalid('network_name') && <p className="modal-error">{createErrors.network_name}</p>}
          </div>
        )}
        {newVm.network_source_type === 'vswitch' && (
          <>
            <div className="modal-field">
              <label className="modal-label">vSwitch</label>
              <select className={getFieldClassName('vswitch_name')} value={newVm.vswitch_name} onChange={handleCreateChange('vswitch_name')} onBlur={markFieldTouched('vswitch_name')}>
                <option value="">Выберите vSwitch</option>
                {vSwitches.map((sw) => (
                  <option key={sw.name} value={sw.name}>{sw.name}</option>
                ))}
              </select>
              {isFieldInvalid('vswitch_name') && <p className="modal-error">{createErrors.vswitch_name}</p>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Port Group (опционально)</label>
              <select className="input w-full" value={newVm.vswitch_portgroup} onChange={handleCreateChange('vswitch_portgroup')}>
                <option value="">Без Port Group</option>
                {selectedVSwitchPortgroups.map((pg) => (
                  <option key={pg.name} value={pg.name}>{pg.name}</option>
                ))}
              </select>
            </div>
          </>
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

      <AppDialog
        isOpen={Boolean(mediaVm)}
        title={mediaVm ? `Параметры ВМ ${mediaVm.name}` : ''}
        variant="info"
        confirmLabel="Закрыть"
        onClose={closeMediaModal}
        content={mediaVm ? (
          <div className="space-y-4 whitespace-pre-line text-sm text-dark-300">
            <div className="rounded-xl border border-dark-700 p-4">
              {`ID: ${mediaVm.id ? stringToNumericId(mediaVm.id) : '-'}\nЯдра CPU: ${mediaVm.cpu_cores ?? mediaVm.cpu}\nОЗУ: ${mediaVm.memory_mb ?? mediaVm.memory} MB\nОсновной диск: ${mediaVm.disk_gb ?? mediaVm.disk ?? '-'} GB\nХранилище: ${mediaVm.storage_pool || 'Системный путь'}\nТом: ${mediaVm.storage_volume || '-'}\nCD-ROM: ${mediaVm.cdrom_image || 'Не подключен'}\nДополнительных дисков: ${mediaVm.extra_disks?.length || 0}`}
            </div>
            {Array.isArray(mediaVm.extra_disks) && mediaVm.extra_disks.length > 0 && (
              <div className="rounded-xl border border-dark-700 p-4">
                <p className="mb-2 text-sm font-medium text-white">Дополнительные диски</p>
                <div className="space-y-2 text-xs text-dark-300">
                  {mediaVm.extra_disks.map((disk) => (
                    <div key={`${mediaVm.name}-${disk.target_dev}`}>
                      {`${disk.target_dev}: ${disk.storage_volume || disk.disk_path} (${disk.disk_gb || '-'} GB)`}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-dark-700 p-4 space-y-3">
              <p className="text-sm font-medium text-white">ISO / CD-ROM</p>
              <select className="input w-full" value={selectedCdromImage} onChange={(event) => setSelectedCdromImage(event.target.value)} disabled={isUpdatingCdrom}>
                <option value="">Выберите ISO</option>
                {availableIsoImages.map((image) => (
                  <option key={`media-${image.name}`} value={image.name}>{image.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary page-toolbar-button" onClick={handleAttachCdrom} disabled={!selectedCdromImage || isUpdatingCdrom}>Подключить ISO</button>
                <button type="button" className="btn page-toolbar-button" onClick={handleDetachCdrom} disabled={!mediaVm.cdrom_image || isUpdatingCdrom}>Отключить ISO</button>
              </div>
            </div>
          </div>
        ) : null}
      />

      <div className="card">
        <StatusMessage message={error} className="mb-4" />
        <LoadingState message={loading ? 'Загрузка списка ВМ...' : ''} className="mb-4" />
        <QueryStateActions
          className="mb-4"
          activeIndicators={activeQueryIndicators}
          onCopyLink={() => copyCurrentLink(activeQueryIndicators)}
          onResetAll={activeQueryIndicators.length > 0 ? handleResetQueryState : undefined}
          onRemoveIndicator={handleRemoveIndicator}
        />
        {selectedVmName && !loading && (
          <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            Выделена ВМ <span className="font-medium">{selectedVmName}</span> из раздела Хранилище.
          </div>
        )}
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
                <th className="table-header-cell text-left">Имя</th>
                <th className="table-header-cell text-left">ID</th>
                <th className="table-header-cell text-left">Статус</th>
                <th className="table-header-cell text-left">Ядра CPU</th>
                <th className="table-header-cell text-left">ОЗУ</th>
                <th className="table-header-cell text-left">Диск</th>
                <th className="table-header-cell text-left">Хранилище</th>
                <th className="table-header-cell text-left">Том</th>
                <th className="table-header-cell text-left">Готовность</th>
                <th className="table-header-cell-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {vms.map((vm) => (
                <tr
                  key={vm.id}
                  ref={(node) => {
                    if (node) {
                      rowRefs.current[vm.name] = node;
                    }
                  }}
                  className={`border-b border-dark-700 hover:bg-dark-700/50 ${selectedVmName === vm.name ? 'bg-cyan-500/10' : ''}`}
                >
                  <td className="table-cell-strong font-medium">{vm.name}</td>
                  <td className="table-cell-muted font-mono text-xs" title={vm.id}>
                    {vm.id ? stringToNumericId(vm.id) : '-'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(vm.status)}`}></div>
                      <span className="text-dark-300 capitalize">
                        {getStatusLabel(vm.status)}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{vm.cpu_cores ?? vm.cpu} ядро</td>
                  <td className="table-cell-muted">{vm.memory_mb ?? vm.memory} MB</td>
                  <td className="table-cell-muted">{vm.disk_gb ?? vm.disk} GB</td>
                  <td className="table-cell-muted">
                    {vm.storage_pool ? (
                      <Link
                        to={`/storage?pool=${encodeURIComponent(vm.storage_pool)}`}
                        className={`underline decoration-cyan-500/50 underline-offset-2 hover:text-white ${selectedPoolName === vm.storage_pool && !selectedVolumeName ? 'text-cyan-200' : 'text-dark-300'}`}
                      >
                        {vm.storage_pool}
                      </Link>
                    ) : 'Системный путь'}
                  </td>
                  <td className="table-cell-muted">
                    {vm.storage_pool && vm.storage_volume ? (
                      <Link
                        to={`/storage?pool=${encodeURIComponent(vm.storage_pool)}&volume=${encodeURIComponent(vm.storage_volume)}`}
                        className={`underline decoration-cyan-500/50 underline-offset-2 hover:text-white ${selectedPoolName === vm.storage_pool && selectedVolumeName === vm.storage_volume ? 'text-cyan-200' : 'text-dark-300'}`}
                      >
                        {vm.storage_volume}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="table-cell min-w-[220px]">
                    <VmReadinessIndicator vm={vm} compact />
                  </td>
                  <td className="table-cell-actions">
                    {(() => {
                      const isRowPending = pendingVmAction?.id === vm.id;
                      const pendingAction = pendingVmAction?.action;

                      return (
                    <div className="inline-flex items-center justify-end space-x-2">
                      <button
                        className={`table-action-icon-button ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-green-400 hover:text-green-300'}`}
                        title={isRowPending && pendingAction === 'start' ? `Запуск ВМ ${vm.name}...` : `Запустить ВМ ${vm.name}`}
                        onClick={() => handleStart(vm.id)}
                        disabled={isRowPending}
                      >
                        <Play className={`table-action-icon ${isRowPending && pendingAction === 'start' ? 'animate-pulse' : ''}`} />
                      </button>
                      <button
                        className={`table-action-icon-button ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                        title={isRowPending && pendingAction === 'stop' ? `Остановка ВМ ${vm.name}...` : `Остановить ВМ ${vm.name}`}
                        onClick={() => handleStop(vm.id)}
                        disabled={isRowPending}
                      >
                        <Square className={`table-action-icon ${isRowPending && pendingAction === 'stop' ? 'animate-pulse' : ''}`} />
                      </button>
                      <button
                        className={`table-action-icon-button ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-yellow-400 hover:text-yellow-300'}`}
                        title={isRowPending && pendingAction === 'restart' ? `Перезапуск ВМ ${vm.name}...` : `Перезапустить ВМ ${vm.name}`}
                        onClick={() => handleRestart(vm.id)}
                        disabled={isRowPending}
                      >
                        <RotateCcw className={`table-action-icon ${isRowPending && pendingAction === 'restart' ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        className={`table-action-icon-button ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-white'}`}
                        title={`Открыть консоль ВМ ${vm.name}`}
                        onClick={() => handleConsole(vm)}
                        disabled={isRowPending}
                      >
                        <TerminalSquare className="table-action-icon" />
                      </button>
                      <button
                        className={`table-action-icon-button ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-red-400'}`}
                        title={`Удалить ВМ ${vm.name}`}
                        onClick={() => handleDelete(vm)}
                        disabled={isRowPending}
                      >
                        <Trash2 className="table-action-icon" />
                      </button>
                      <button
                        className={`table-action-icon-button ${isRowPending ? 'text-dark-500 cursor-not-allowed' : 'text-dark-400 hover:text-white'}`}
                        title={`Параметры ВМ ${vm.name}`}
                        onClick={() => handleSettings(vm)}
                        disabled={isRowPending}
                      >
                        <Settings className="table-action-icon" />
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
