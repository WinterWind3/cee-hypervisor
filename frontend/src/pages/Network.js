import React, { useCallback, useEffect, useState } from 'react';
import { Network as NetworkIcon, Plus, Wifi, Globe, GitBranch, Layers, ChevronDown, ChevronRight, Link2, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import ActionButton from '../components/ActionButton';
import AppDialog from '../components/AppDialog';
import EmptyState from '../components/EmptyState';
import FormInlineHelp from '../components/FormInlineHelp';
import FormModal from '../components/FormModal';
import LoadingState from '../components/LoadingState';
import AppToast from '../components/AppToast';
import PageActions from '../components/PageActions';
import RefreshButton from '../components/RefreshButton';
import StatCard from '../components/StatCard';
import StatusMessage from '../components/StatusMessage';
import { useDialog } from '../hooks/useDialog';
import { useTimedMessage } from '../hooks/useTimedMessage';

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

const NETWORK_PRESET_CONFIG = {
  isolated: {
    name: 'net-isolated',
    subnet: '192.168.100.0/24',
    mode: 'isolated',
    dhcp_enabled: true,
  },
  nat: {
    name: 'net-nat',
    subnet: '192.168.122.0/24',
    mode: 'nat',
    dhcp_enabled: true,
  },
  route: {
    name: 'net-route',
    subnet: '10.10.10.0/24',
    mode: 'route',
    dhcp_enabled: false,
  },
};

const VLAN_TYPE_LABELS = {
  access: 'Access (нетегированный)',
  tagged: 'VLAN Tagged',
  trunk:  'VLAN Trunk',
};
const isValidVlanId = (v) => { const n = parseInt(v, 10); return !isNaN(n) && n >= 1 && n <= 4094; };
const isValidTrunk  = (s) => Boolean(s && /^(\d{1,4}(-\d{1,4})?)(\s*,\s*(\d{1,4}(-\d{1,4})?))*$/.test(s.trim()));

const Network = () => {
  const [activeTab, setActiveTab] = useState('vswitches');

  // ── vSwitch state ──────────────────────────────────────────────────────────
  const [vswitches, setVSwitches]       = useState([]);
  const [vsLoading, setVsLoading]       = useState(false);
  const [vsError,   setVsError]         = useState('');
  const [expandedSwitch, setExpanded]   = useState(null);

  const [showCreateVS, setShowCreateVS] = useState(false);
  const [isCreatingVS, setIsCreatingVS] = useState(false);
  const [interfaces,   setInterfaces]   = useState([]);
  const [newVSwitch,   setNewVSwitch]   = useState({ name: '', uplink: '' });
  const [vsAttempted,  setVsAttempted]  = useState(false);

  const [showAddPG,  setShowAddPG]  = useState(false);
  const [pgTarget,   setPgTarget]   = useState('');
  const [isAddingPG, setIsAddingPG] = useState(false);
  const [newPG, setNewPG] = useState({ name: '', vlan_type: 'access', vlan_id: '', vlan_trunk: '' });
  const [pgAttempted, setPgAttempted] = useState(false);

  const [showSetUplink,   setShowSetUplink]   = useState(false);
  const [uplinkTarget,    setUplinkTarget]    = useState('');
  const [isSettingUplink, setIsSettingUplink] = useState(false);
  const [uplinkIfaces,    setUplinkIfaces]    = useState([]);
  const [selectedUplink,  setSelectedUplink]  = useState('');

  // ── Libvirt network state ──────────────────────────────────────────────────
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNetworkPreset, setSelectedNetworkPreset] = useState('isolated');
  const [createAttempted, setCreateAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const { dialog, openDialog, closeDialog } = useDialog();
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    subnet: '192.168.100.0/24',
    mode: 'isolated',
    dhcp_enabled: true,
  });

  // ── Data loaders ───────────────────────────────────────────────────────────

  const loadVSwitches = useCallback(async (showMsg = true) => {
    try {
      setVsLoading(true); setVsError('');
      const res = await apiService.getVSwitches();
      setVSwitches(Array.isArray(res.data) ? res.data : []);
      if (showMsg) showUpdateMessage('Обновление выполнено');
    } catch (err) {
      setVsError(err.response?.data?.detail || err.message || 'Ошибка загрузки vSwitch');
      setVSwitches([]);
    } finally {
      setVsLoading(false);
    }
  }, [showUpdateMessage]);

  const fetchIfacesInto = async (setter) => {
    try {
      const res = await apiService.getInterfaces();
      setter(Array.isArray(res.data) ? res.data : []);
    } catch { setter([]); }
  };

  const loadNetworks = useCallback(async (showMessage = true) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getNetworks();
      setNetworks(Array.isArray(response.data) ? response.data : []);
      if (showMessage) {
        showUpdateMessage('Обновление выполнено');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки сетей');
      setNetworks([]);
    } finally {
      setLoading(false);
    }
  }, [showUpdateMessage]);

  useEffect(() => {
    loadNetworks(false);
    loadVSwitches(false);
  }, [loadNetworks, loadVSwitches]);

  // ── vSwitch handlers ───────────────────────────────────────────────────────

  const openCreateVS = async () => {
    await fetchIfacesInto(setInterfaces);
    setNewVSwitch({ name: '', uplink: '' });
    setVsAttempted(false);
    setShowCreateVS(true);
  };

  const vsNameError = vsAttempted && !newVSwitch.name.trim() ? 'Укажите имя коммутатора.' : '';

  const submitCreateVS = async () => {
    setVsAttempted(true);
    if (!newVSwitch.name.trim()) return;
    try {
      setIsCreatingVS(true);
      await apiService.createVSwitch({ name: newVSwitch.name.trim(), uplink: newVSwitch.uplink || null });
      setShowCreateVS(false);
      await loadVSwitches(true);
    } catch (err) {
      openDialog({ title: 'Не удалось создать vSwitch', message: err.response?.data?.detail || err.message, variant: 'danger' });
    } finally {
      setIsCreatingVS(false);
    }
  };

  const handleDeleteVSwitch = (name) => {
    openDialog({
      title: `Удалить vSwitch "${name}"?`,
      message: 'Все порт-группы этого коммутатора будут удалены. OVS bridge будет уничтожен.',
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: async () => {
        try {
          await apiService.deleteVSwitch(name);
          closeDialog();
          if (expandedSwitch === name) setExpanded(null);
          await loadVSwitches(true);
        } catch (err) {
          openDialog({ title: 'Ошибка', message: err.response?.data?.detail || err.message, variant: 'danger' });
        }
      },
    });
  };

  // ── Port group handlers ────────────────────────────────────────────────────

  const openAddPG = (switchName) => {
    setPgTarget(switchName);
    setNewPG({ name: '', vlan_type: 'access', vlan_id: '', vlan_trunk: '' });
    setPgAttempted(false);
    setShowAddPG(true);
  };

  const pgErrors = {
    name: !newPG.name.trim() ? 'Укажите имя порт-группы.' : '',
    vlan_id:
      (newPG.vlan_type === 'access' || newPG.vlan_type === 'tagged') && !isValidVlanId(newPG.vlan_id)
        ? 'VLAN ID: от 1 до 4094.' : '',
    vlan_trunk:
      newPG.vlan_type === 'trunk' && !isValidTrunk(newPG.vlan_trunk)
        ? 'Формат: 100,200-210,300' : '',
  };

  const submitAddPG = async () => {
    setPgAttempted(true);
    if (pgErrors.name || pgErrors.vlan_id || pgErrors.vlan_trunk) return;
    try {
      setIsAddingPG(true);
      await apiService.createPortGroup(pgTarget, {
        name: newPG.name.trim(),
        vlan_type: newPG.vlan_type,
        vlan_id: newPG.vlan_type !== 'trunk' ? parseInt(newPG.vlan_id, 10) : null,
        vlan_trunk: newPG.vlan_type === 'trunk' ? newPG.vlan_trunk.trim() : null,
      });
      setShowAddPG(false);
      setExpanded(pgTarget);
      await loadVSwitches(true);
    } catch (err) {
      openDialog({ title: 'Не удалось создать порт-группу', message: err.response?.data?.detail || err.message, variant: 'danger' });
    } finally {
      setIsAddingPG(false);
    }
  };

  const handleDeletePG = (switchName, pgName) => {
    openDialog({
      title: `Удалить порт-группу "${pgName}"?`,
      message: '',
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: async () => {
        try {
          await apiService.deletePortGroup(switchName, pgName);
          closeDialog();
          await loadVSwitches(true);
        } catch (err) {
          openDialog({ title: 'Ошибка', message: err.response?.data?.detail || err.message, variant: 'danger' });
        }
      },
    });
  };

  // ── Uplink handlers ────────────────────────────────────────────────────────

  const openSetUplink = async (switchName) => {
    await fetchIfacesInto(setUplinkIfaces);
    setUplinkTarget(switchName);
    setSelectedUplink('');
    setShowSetUplink(true);
  };

  const submitSetUplink = async () => {
    if (!selectedUplink) return;
    try {
      setIsSettingUplink(true);
      await apiService.setVSwitchUplink(uplinkTarget, { uplink: selectedUplink });
      setShowSetUplink(false);
      await loadVSwitches(true);
    } catch (err) {
      openDialog({ title: 'Ошибка назначения аплинка', message: err.response?.data?.detail || err.message, variant: 'danger' });
    } finally {
      setIsSettingUplink(false);
    }
  };

  // ── Libvirt-derived values ─────────────────────────────────────────────────

  const dhcpEnabledCount = networks.filter((network) => network.dhcp_enabled).length;
  const routedNetworksCount = networks.filter((network) => network.type === 'nat' || network.type === 'route').length;

  const createErrors = {
    name: !newNetwork.name.trim() ? 'Укажите имя сети.' : '',
    subnet: !newNetwork.subnet.trim() ? 'Укажите подсеть.' : '',
  };

  const hasCreateErrors = Boolean(createErrors.name || createErrors.subnet);

  const isFieldInvalid = (field) => Boolean((createAttempted || touchedFields[field]) && createErrors[field]);

  const getFieldClassName = (field) => `input w-full${isFieldInvalid(field) ? ' input-error' : ''}`;

  const markFieldTouched = (field) => () => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const resetCreateValidation = () => {
    setCreateAttempted(false);
    setTouchedFields({});
  };

  const buildNetworkPresetForm = useCallback((presetId) => {
    const preset = NETWORK_PRESET_CONFIG[presetId] || NETWORK_PRESET_CONFIG.isolated;
    return {
      ...preset,
      name: getNextPresetName(preset.name, networks.map((network) => network.name)),
    };
  }, [networks]);

  const openCreateModal = () => {
    resetCreateValidation();
    setSelectedNetworkPreset('isolated');
    setNewNetwork(buildNetworkPresetForm('isolated'));
    setShowCreate(true);
  };

  const closeCreateModal = () => {
    if (isCreating) {
      return;
    }
    resetCreateValidation();
    setShowCreate(false);
  };

  const getTypeLabel = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'nat':
        return 'NAT';
      case 'route':
        return 'Маршрутизируемая';
      case 'bridge':
        return 'Мост';
      case 'open':
        return 'Открытая';
      default:
        return 'Изолированная';
    }
  };

  const handleCreateChange = (field) => (event) => {
    const value = field === 'dhcp_enabled' ? event.target.checked : event.target.value;
    setSelectedNetworkPreset('');
    setNewNetwork((current) => ({ ...current, [field]: value }));
  };

  const applyNetworkPreset = (presetId) => {
    resetCreateValidation();
    setSelectedNetworkPreset(presetId);
    setNewNetwork(buildNetworkPresetForm(presetId));
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
      await apiService.createNetwork(newNetwork);
      resetCreateValidation();
      setSelectedNetworkPreset('isolated');
      setShowCreate(false);
      setNewNetwork({
        name: '',
        subnet: '192.168.100.0/24',
        mode: 'isolated',
        dhcp_enabled: true,
      });
      await loadNetworks(true);
    } catch (err) {
      openDialog({
        title: 'Не удалось создать сеть',
        message: err.response?.data?.detail || err.message || 'Ошибка создания сети',
        variant: 'danger',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <AppToast message={updateMsg} />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-dark-700">
        <nav className="flex space-x-1">
          {[
            { id: 'vswitches', label: 'Виртуальные коммутаторы' },
            { id: 'networks',  label: 'Libvirt сети' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500 bg-dark-800'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Shared dialog */}
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

      {/* ══ Tab: vSwitches ════════════════════════════════════════════════════ */}
      {activeTab === 'vswitches' && (
        <div className="space-y-6">
          <PageActions>
            <RefreshButton onClick={() => loadVSwitches(true)} loading={vsLoading} />
            <ActionButton icon={Plus} label="Создать vSwitch" onClick={openCreateVS} />
          </PageActions>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Коммутаторы" value={vswitches.length} subtitle="OVS виртуальных коммутаторов" icon={GitBranch} color="text-blue-400" />
            <StatCard title="Порт-группы" value={vswitches.reduce((s, vs) => s + vs.portgroups.length, 0)} subtitle="Всего порт-групп" icon={Layers} color="text-purple-400" />
          </div>

          <StatusMessage message={vsError} />
          <LoadingState message={vsLoading ? 'Загрузка коммутаторов...' : ''} />

          <div className="card">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Список vSwitch</h3>
              <p className="text-sm text-gray-500 mt-1">Каждый vSwitch — это OVS bridge. Нажмите ▶ для просмотра порт-групп.</p>
            </div>
            {vswitches.length === 0 && !vsLoading ? (
              <EmptyState icon={GitBranch} title="Коммутаторы не найдены" description="Создайте vSwitch для управления VLAN-трафиком ВМ." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="table-header-cell w-8" />
                      <th className="table-header-cell text-left">Имя</th>
                      <th className="table-header-cell text-left">Аплинк</th>
                      <th className="table-header-cell text-left">Порт-группы</th>
                      <th className="table-header-cell text-left">Статус</th>
                      <th className="table-header-cell text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vswitches.map((vs) => (
                      <React.Fragment key={vs.name}>
                        <tr className="border-b border-dark-700 hover:bg-dark-700/50">
                          <td className="table-cell">
                            <button
                              onClick={() => setExpanded(expandedSwitch === vs.name ? null : vs.name)}
                              className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                            >
                              {expandedSwitch === vs.name ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            </button>
                          </td>
                          <td className="table-cell-strong font-mono">{vs.name}</td>
                          <td className="table-cell-muted">{vs.uplink || <span className="text-gray-600">—</span>}</td>
                          <td className="table-cell-muted">{vs.portgroups.length}</td>
                          <td className="table-cell-muted">
                            <span className={vs.status === 'up' ? 'text-green-400' : 'text-gray-500'}>
                              {vs.status === 'up' ? 'Активен' : vs.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openAddPG(vs.name)} className="p-1.5 rounded hover:bg-dark-600 text-blue-400 hover:text-blue-300 transition-colors" title="Добавить порт-группу"><Plus size={14} /></button>
                              <button onClick={() => openSetUplink(vs.name)} className="p-1.5 rounded hover:bg-dark-600 text-amber-400 hover:text-amber-300 transition-colors" title="Назначить аплинк"><Link2 size={14} /></button>
                              <button onClick={() => handleDeleteVSwitch(vs.name)} className="p-1.5 rounded hover:bg-dark-600 text-red-400 hover:text-red-300 transition-colors" title="Удалить vSwitch"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                        {expandedSwitch === vs.name && (
                          <tr className="bg-dark-800/60">
                            <td colSpan={6} className="px-10 py-4">
                              {vs.portgroups.length === 0 ? (
                                <p className="text-sm text-gray-500">Нет порт-групп. Нажмите <strong>+</strong> в строке коммутатора.</p>
                              ) : (
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-dark-700">
                                      <th className="table-header-cell text-left">Порт-группа</th>
                                      <th className="table-header-cell text-left">Тип VLAN</th>
                                      <th className="table-header-cell text-left">VLAN</th>
                                      <th className="table-header-cell w-10" />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {vs.portgroups.map((pg) => (
                                      <tr key={pg.name} className="border-b border-dark-700/50">
                                        <td className="table-cell-strong font-mono">{pg.name}</td>
                                        <td className="table-cell-muted">{VLAN_TYPE_LABELS[pg.vlan_type] || pg.vlan_type}</td>
                                        <td className="table-cell-muted font-mono">{pg.vlan_type === 'trunk' ? pg.vlan_trunk : pg.vlan_id}</td>
                                        <td className="table-cell">
                                          <button onClick={() => handleDeletePG(vs.name, pg.name)} className="p-1.5 rounded hover:bg-dark-600 text-red-400 hover:text-red-300 transition-colors" title="Удалить порт-группу"><Trash2 size={13} /></button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Tab: Libvirt networks ════════════════════════════════════════════ */}
      {activeTab === 'networks' && (
        <div className="space-y-6">
          <PageActions>
            <RefreshButton onClick={() => loadNetworks(true)} loading={loading} />
            <ActionButton icon={Plus} label="Создать сеть" onClick={openCreateModal} />
          </PageActions>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Виртуальные сети" value={networks.length} subtitle="Доступные виртуальные сети" icon={NetworkIcon} color="text-emerald-400" />
            <StatCard title="DHCP" value={dhcpEnabledCount} subtitle="Сетей с включенным DHCP" icon={Wifi} color="text-blue-400" />
            <StatCard title="Маршрутизация" value={routedNetworksCount} subtitle="Маршрутизируемые сети" icon={Globe} color="text-purple-400" />
          </div>

          <StatusMessage message={error} />
          <LoadingState message={loading ? 'Загрузка сетей...' : ''} />

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Список сетей</h3>
            </div>
            {networks.length === 0 && !loading ? (
              <EmptyState icon={NetworkIcon} title="Сети не найдены" description="Создайте сеть, чтобы она появилась здесь." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="table-header-cell text-left">Имя</th>
                      <th className="table-header-cell text-left">Тип</th>
                      <th className="table-header-cell text-left">Подсеть</th>
                      <th className="table-header-cell text-left">Подключенные ВМ</th>
                      <th className="table-header-cell text-left">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networks.map((network) => (
                      <tr key={network.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                        <td className="table-cell-strong">{network.name}</td>
                        <td className="table-cell-muted">{getTypeLabel(network.type)}</td>
                        <td className="table-cell-muted">{network.subnet}</td>
                        <td className="table-cell-muted">{network.connected_vms}</td>
                        <td className="table-cell-muted">{network.status === 'online' ? 'Онлайн' : 'Офлайн'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <FormModal
            isOpen={showCreate}
            title="Создать сеть"
            subtitle="Укажите параметры виртуальной сети для libvirt."
            confirmLabel="Создать"
            confirmBusyLabel="Создание..."
            isSubmitting={isCreating}
            confirmDisabled={isCreateDisabled}
            onClose={closeCreateModal}
            onConfirm={submitCreate}
          >
            <FormInlineHelp
              title="Быстрые пресеты сети"
              description="Выберите типовую схему, чтобы сразу заполнить режим, подсеть и DHCP."
              selectedPreset={selectedNetworkPreset}
              presets={[
                { id: 'isolated', label: 'Изолированная', description: 'net-isolated, 192.168.100.0/24', onClick: () => applyNetworkPreset('isolated') },
                { id: 'nat', label: 'NAT', description: 'net-nat, 192.168.122.0/24', onClick: () => applyNetworkPreset('nat') },
                { id: 'route', label: 'Route', description: 'net-route, 10.10.10.0/24', onClick: () => applyNetworkPreset('route') },
              ]}
              tips={[
                'NAT подходит для быстрого выхода ВМ наружу без ручной маршрутизации.',
                'Изолированная сеть удобна для внутренних стендов и тестов.',
              ]}
            />
            <div className="modal-field">
              <label className="modal-label">Имя сети</label>
              <input className={getFieldClassName('name')} value={newNetwork.name} onChange={handleCreateChange('name')} onBlur={markFieldTouched('name')} placeholder="Например: net-private" />
              {isFieldInvalid('name') && <p className="modal-error">{createErrors.name}</p>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Подсеть</label>
              <input className={getFieldClassName('subnet')} value={newNetwork.subnet} onChange={handleCreateChange('subnet')} onBlur={markFieldTouched('subnet')} placeholder="Например: 192.168.100.0/24" />
              {isFieldInvalid('subnet') && <p className="modal-error">{createErrors.subnet}</p>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Тип сети</label>
              <select className="input w-full" value={newNetwork.mode} onChange={handleCreateChange('mode')}>
                <option value="isolated">Изолированная</option>
                <option value="nat">NAT</option>
                <option value="route">Маршрутизируемая</option>
              </select>
            </div>
            <label className="modal-checkbox">
              <input type="checkbox" checked={newNetwork.dhcp_enabled} onChange={handleCreateChange('dhcp_enabled')} />
              <span>Включить DHCP для этой сети</span>
            </label>
          </FormModal>
        </div>
      )}

      {/* ══ Modal: Create vSwitch ═════════════════════════════════════════════ */}
      <FormModal
        isOpen={showCreateVS}
        title="Создать виртуальный коммутатор"
        subtitle="Создаёт OVS bridge. Аплинк можно добавить позже."
        confirmLabel="Создать"
        confirmBusyLabel="Создание..."
        isSubmitting={isCreatingVS}
        confirmDisabled={vsAttempted && Boolean(vsNameError)}
        onClose={() => !isCreatingVS && setShowCreateVS(false)}
        onConfirm={submitCreateVS}
      >
        <div className="modal-field">
          <label className="modal-label">Имя коммутатора</label>
          <input
            className={`input w-full${vsAttempted && vsNameError ? ' input-error' : ''}`}
            value={newVSwitch.name}
            onChange={(e) => setNewVSwitch((s) => ({ ...s, name: e.target.value }))}
            placeholder="Например: vswitch-vm"
          />
          {vsAttempted && vsNameError && <p className="modal-error">{vsNameError}</p>}
          <p className="text-xs text-gray-500 mt-1">Только буквы, цифры, дефис и underscore, до 15 символов.</p>
        </div>
        <div className="modal-field">
          <label className="modal-label">Аплинк (необязательно)</label>
          {interfaces.length === 0 ? (
            <p className="text-sm text-gray-400">Нет свободных физических интерфейсов.</p>
          ) : (
            <select className="input w-full" value={newVSwitch.uplink} onChange={(e) => setNewVSwitch((s) => ({ ...s, uplink: e.target.value }))}>
              <option value="">— без аплинка —</option>
              {interfaces.map((iface) => <option key={iface} value={iface}>{iface}</option>)}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-1">Физический NIC для выхода трафика наружу.</p>
        </div>
      </FormModal>

      {/* ══ Modal: Add port group ═════════════════════════════════════════════ */}
      <FormModal
        isOpen={showAddPG}
        title={`Добавить порт-группу — ${pgTarget}`}
        subtitle="Порт-группа задаёт VLAN-политику для ВМ, подключённых к этому коммутатору."
        confirmLabel="Добавить"
        confirmBusyLabel="Добавление..."
        isSubmitting={isAddingPG}
        confirmDisabled={pgAttempted && (Boolean(pgErrors.name) || Boolean(pgErrors.vlan_id) || Boolean(pgErrors.vlan_trunk))}
        onClose={() => !isAddingPG && setShowAddPG(false)}
        onConfirm={submitAddPG}
      >
        <div className="modal-field">
          <label className="modal-label">Имя порт-группы</label>
          <input
            className={`input w-full${pgAttempted && pgErrors.name ? ' input-error' : ''}`}
            value={newPG.name}
            onChange={(e) => setNewPG((s) => ({ ...s, name: e.target.value }))}
            placeholder="Например: VM-Network"
          />
          {pgAttempted && pgErrors.name && <p className="modal-error">{pgErrors.name}</p>}
        </div>
        <div className="modal-field">
          <label className="modal-label">Тип VLAN</label>
          <select className="input w-full" value={newPG.vlan_type} onChange={(e) => setNewPG((s) => ({ ...s, vlan_type: e.target.value, vlan_id: '', vlan_trunk: '' }))}>
            <option value="access">Access — нетегированный (ВМ не видит VLAN тег)</option>
            <option value="tagged">VLAN Tagged — один VLAN, 802.1q к ВМ</option>
            <option value="trunk">VLAN Trunk — несколько VLAN, 802.1q к ВМ</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {newPG.vlan_type === 'access' && 'ВМ получает нетегированный трафик, OVS добавляет тег к аплинку.'}
            {newPG.vlan_type === 'tagged' && 'ВМ получает 802.1q тегированные кадры с указанным VLAN.'}
            {newPG.vlan_type === 'trunk' && 'ВМ получает 802.1q тегированные кадры для всех указанных VLAN.'}
          </p>
        </div>
        {(newPG.vlan_type === 'access' || newPG.vlan_type === 'tagged') && (
          <div className="modal-field">
            <label className="modal-label">VLAN ID (1–4094)</label>
            <input
              type="number" min="1" max="4094"
              className={`input w-full${pgAttempted && pgErrors.vlan_id ? ' input-error' : ''}`}
              value={newPG.vlan_id}
              onChange={(e) => setNewPG((s) => ({ ...s, vlan_id: e.target.value }))}
              placeholder="Например: 100"
            />
            {pgAttempted && pgErrors.vlan_id && <p className="modal-error">{pgErrors.vlan_id}</p>}
          </div>
        )}
        {newPG.vlan_type === 'trunk' && (
          <div className="modal-field">
            <label className="modal-label">VLAN список (Trunk)</label>
            <input
              className={`input w-full${pgAttempted && pgErrors.vlan_trunk ? ' input-error' : ''}`}
              value={newPG.vlan_trunk}
              onChange={(e) => setNewPG((s) => ({ ...s, vlan_trunk: e.target.value }))}
              placeholder="Например: 100,200-210,300"
            />
            {pgAttempted && pgErrors.vlan_trunk && <p className="modal-error">{pgErrors.vlan_trunk}</p>}
            <p className="text-xs text-gray-500 mt-1">VLAN через запятую, допустимы диапазоны: 100,200-210,400</p>
          </div>
        )}
      </FormModal>

      {/* ══ Modal: Set uplink ═════════════════════════════════════════════════ */}
      <FormModal
        isOpen={showSetUplink}
        title={`Назначить аплинк — ${uplinkTarget}`}
        subtitle="Физический интерфейс для подключения коммутатора к сети. Заменит существующий аплинк."
        confirmLabel="Применить"
        confirmBusyLabel="Применение..."
        isSubmitting={isSettingUplink}
        confirmDisabled={!selectedUplink}
        onClose={() => !isSettingUplink && setShowSetUplink(false)}
        onConfirm={submitSetUplink}
      >
        <div className="modal-field">
          <label className="modal-label">Физический интерфейс</label>
          {uplinkIfaces.length === 0 ? (
            <p className="text-sm text-gray-400">Нет доступных интерфейсов. Все уже назначены или не обнаружены.</p>
          ) : (
            <select className="input w-full" value={selectedUplink} onChange={(e) => setSelectedUplink(e.target.value)}>
              <option value="">— выберите интерфейс —</option>
              {uplinkIfaces.map((iface) => <option key={iface} value={iface}>{iface}</option>)}
            </select>
          )}
        </div>
      </FormModal>
    </div>
  );
};

export default Network;