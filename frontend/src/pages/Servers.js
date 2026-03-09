import React, { useCallback, useEffect, useState } from 'react';
import { Server, Plus, Activity, HardDrive, Wifi, Trash2, Play, Square, Settings } from 'lucide-react';
import { apiService } from '../services/api';
import ActionButton from '../components/ActionButton';
import AppToast from '../components/AppToast';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageActions from '../components/PageActions';
import RefreshButton from '../components/RefreshButton';
import StatusMessage from '../components/StatusMessage';
import FormModal from '../components/FormModal';
import FormInlineHelp from '../components/FormInlineHelp';
import { useTimedMessage } from '../hooks/useTimedMessage';

const formatMemoryGb = (memoryMb) => {
  const memoryGb = Number(memoryMb || 0) / 1024;
  if (memoryGb === 0) {
    return '0 GB';
  }
  if (memoryGb >= 100) {
    return `${memoryGb.toFixed(0)} GB`;
  }
  return `${memoryGb.toFixed(1)} GB`;
};

const SERVER_PRESETS = [
  {
    id: 'compute_node',
    label: 'Compute Node',
    data: { name: 'compute-node', hostname: 'host.local', cluster: 'local', description: 'Узел для ВМ' },
    tips: [
      'Стандартный вычислительный узел',
      'Высокая доля ресурсов CPU/RAM',
      'Интеграция с локальным кластером'
    ]
  },
  {
    id: 'storage_node',
    label: 'Storage Node',
    data: { name: 'storage-node', hostname: 'storage.local', cluster: 'storage-cluster', description: 'СХД-узел' },
    tips: [
      'Оптимизирован для дисковых операций',
      'Используется для распределенных СХД',
      'Рекомендуется выделенная сеть'
    ]
  }
];

const buildServerPresetForm = (baseData, existingServers) => {
  let counter = 1;
  while (true) {
    const suffix = counter === 1 ? '' : `-${counter}`;
    const candidateName = `${baseData.name}${suffix}`;
    if (!existingServers.some(s => s.name === candidateName)) {
      return { ...baseData, name: candidateName, hostname: `${candidateName}.local` };
    }
    counter++;
  }
};

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    cluster: 'local',
    description: ''
  });

  const loadServers = useCallback(async (showMessage = true) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getServers();
      setServers(Array.isArray(response.data) ? response.data : []);
      
      try {
        const clustersRes = await apiService.getClusters();
        setClusters(Array.isArray(clustersRes.data) ? clustersRes.data : []);
      } catch (e) {
        console.error('Failed to load clusters for dropdown', e);
      }

      if (showMessage) {
        showUpdateMessage('Обновление выполнено');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки серверов');
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, [showUpdateMessage]);

  useEffect(() => {
    loadServers(false);
  }, [loadServers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSelectedPreset(null);
  };

  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setFormData(buildServerPresetForm(preset.data, servers));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await apiService.addServer(formData);
      showUpdateMessage('Сервер успешно добавлен');
      setIsCreateModalOpen(false);
      setFormData({ name: '', hostname: '', cluster: 'local', description: '' });
      setSelectedPreset(null);
      loadServers(false);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 501 || err.response?.status === 405) {
        showUpdateMessage('Добавление сервера пока не поддерживается бэкендом (Mock)');
        setIsCreateModalOpen(false);
      } else {
        alert(err.response?.data?.detail || 'Ошибка добавления сервера');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этот сервер?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteServer(id);
      showUpdateMessage('Сервер успешно удален');
      loadServers(false);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 501 || err.response?.status === 405) {
        showUpdateMessage('Удаление сервера пока не поддерживается бэкендом (Mock)');
      } else {
        alert(err.response?.data?.detail || 'Ошибка удаления сервера');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      setLoading(true);
      await apiService.startServer(id);
      showUpdateMessage('Сервер запущен');
      loadServers(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка запуска сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (id) => {
    if (!window.confirm('Вы действительно хотите остановить сервер?')) return;
    try {
      setLoading(true);
      await apiService.stopServer(id);
      showUpdateMessage('Сервер остановлен');
      loadServers(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка остановки сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = (server) => {
    const message = `ID: ${server.id || '-'}\nИмя: ${server.name || '-'}\nHostname: ${server.hostname || server.host || '-'}\nСтатус: ${getStatusLabel(server.status)}\nЯдра CPU: ${server.cpu_cores ?? 0}\nОЗУ: ${formatMemoryGb(server.memory_total || server.memory_mb || 0)}\nКластер: ${server.cluster || server.cluster_name || '-'}`;
    alert(`Настройки сервера:\n\n${message}\n\n(Функционал редактирования в разработке)`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch ((status || '').toString().toLowerCase()) {
      case 'online':
        return 'Онлайн';
      case 'offline':
        return 'Офлайн';
      case 'maintenance':
        return 'Обслуживание';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      <AppToast message={updateMsg} />
      <PageActions>
        <RefreshButton onClick={() => loadServers(true)} loading={loading} />   
        <ActionButton
          icon={Plus}
          label="Добавить сервер"
          onClick={() => setIsCreateModalOpen(true)}
        />
      </PageActions>

      <StatusMessage message={error} />
      <LoadingState message={loading ? 'Загрузка серверов...' : ''} />

      {servers.length === 0 && !loading ? (
        <div className="card">
          <EmptyState
            icon={Server}
            title="Серверы не найдены"
            description="Подключите сервер, чтобы он появился здесь."
            action={{ label: 'Добавить', onClick: () => setIsCreateModalOpen(true) }}
          />
        </div>
      ) : (
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="table-header-cell text-left">Имя</th>
                <th className="table-header-cell text-left">Hostname / IP</th>
                <th className="table-header-cell text-left">Статус</th>
                <th className="table-header-cell text-left">Ядра CPU</th>
                <th className="table-header-cell text-left">ОЗУ</th>
                <th className="table-header-cell text-left">Кластер</th>
                <th className="table-header-cell-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server, index) => (
                <tr key={server.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="table-cell-strong font-medium">{server.name || `server-${index + 1}`}</td>
                  <td className="table-cell-muted font-mono text-xs">{server.hostname || server.host || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
                      <span className="text-dark-300 capitalize">{getStatusLabel(server.status)}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{server.cpu_cores ?? 0} ядро</td>
                  <td className="table-cell-muted">{formatMemoryGb(server.memory_total || server.memory_mb || 0)}</td>
                  <td className="table-cell-muted">{server.cluster || server.cluster_name || '-'}</td>
                  <td className="table-cell-actions">
                    <div className="inline-flex items-center justify-end space-x-2">
                      <button
                        className="table-action-icon-button text-green-400 hover:text-green-300"
                        title="Запустить сервер"
                        onClick={() => handleStart(server.id)}
                        disabled={server.status === 'online'}
                      >
                        <Play className="table-action-icon" />
                      </button>
                      <button
                        className="table-action-icon-button text-yellow-400 hover:text-yellow-300"
                        title="Остановить сервер"
                        onClick={() => handleStop(server.id)}
                        disabled={server.status === 'offline'}
                      >
                        <Square className="table-action-icon" />
                      </button>
                      <button
                        className="table-action-icon-button text-blue-400 hover:text-blue-300"
                        title="Параметры сервера"
                        onClick={() => handleSettings(server)}
                      >
                        <Settings className="table-action-icon" />
                      </button>
                      <button
                        className="table-action-icon-button text-red-400 hover:text-red-300"
                        title="Удалить сервер"
                        onClick={() => handleDelete(server.id)}
                      >
                        <Trash2 className="table-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Модальное окно добавления сервера */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Добавить сервер"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInlineHelp
            presets={SERVER_PRESETS}
            activePresetId={selectedPreset}
            onSelectPreset={applyPreset}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Имя сервера <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Системное имя..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hostname / IP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hostname"
              required
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              value={formData.hostname}
              onChange={handleInputChange}
              placeholder="FQDN или IP-адрес"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Кластер
            </label>
            <select
              name="cluster"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              value={formData.cluster}
              onChange={handleInputChange}
            >
              <option value="local">local (По умолчанию)</option>
              {clusters.map((c, i) => (
                c.name !== 'local' && (
                  <option key={c.id || i} value={c.name}>
                    {c.name}
                  </option>
                )
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              name="description"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Необязательно..."
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              disabled={creating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
              disabled={creating || !formData.name || !formData.hostname}
            >
              {creating ? 'Добавление...' : 'Добавить сервер'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default Servers;
