import React, { useCallback, useEffect, useState } from 'react';
import { Layers, Plus, Server, Activity, Trash2, Play, Square, Settings } from 'lucide-react';
import { apiService } from '../services/api';
import ActionButton from '../components/ActionButton';
import AppToast from '../components/AppToast';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageActions from '../components/PageActions';
import RefreshButton from '../components/RefreshButton';
import StatusMessage from '../components/StatusMessage';
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

const Clusters = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();

  const loadClusters = useCallback(async (showMessage = true) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getClusters();
      setClusters(Array.isArray(response.data) ? response.data : []);
      if (showMessage) {
        showUpdateMessage('Обновление выполнено');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки кластеров');
      setClusters([]);
    } finally {
      setLoading(false);
    }
  }, [showUpdateMessage]);

  useEffect(() => {
    loadClusters(false);
  }, [loadClusters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этот кластер? Связанные с ним узлы могут остаться без кластера.')) {
      return;
    }
    try {
      setLoading(true);
      await apiService.deleteCluster(id);
      showUpdateMessage('Кластер успешно удален');
      loadClusters(false);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 501 || err.response?.status === 405) {
        showUpdateMessage('Удаление кластера пока не поддерживается бэкендом (Mock)');
      } else {
        alert(err.response?.data?.detail || 'Ошибка удаления кластера');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      setLoading(true);
      await apiService.startCluster(id);
      showUpdateMessage('Кластер запущен');
      loadClusters(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка запуска кластера');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (id) => {
    if (!window.confirm('Вы действительно хотите остановить кластер?')) return;
    try {
      setLoading(true);
      await apiService.stopCluster(id);
      showUpdateMessage('Кластер остановлен');
      loadClusters(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка остановки кластера');
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = (cluster) => {
    const message = `ID: ${cluster.id || '-'}\nИмя: ${cluster.name || '-'}\nСтатус: ${getStatusLabel(cluster.status)}\nЯдра CPU: ${cluster.cpu_cores ?? 0}\nОЗУ: ${formatMemoryGb(cluster.memory || cluster.memory_mb || 0)}\nСерверы: ${cluster.hosts ?? 0}`;
    alert(`Настройки кластера:\n\n${message}\n\n(Функционал редактирования в разработке)`);
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
        <RefreshButton onClick={() => loadClusters(true)} loading={loading} />  
        <ActionButton icon={Plus} label="Добавить кластер" />
      </PageActions>

      <StatusMessage message={error} />
      <LoadingState message={loading ? 'Загрузка кластеров...' : ''} />

      {clusters.length === 0 && !loading ? (
        <div className="card">
          <EmptyState
            icon={Layers}
            title="Кластеры не найдены"
            description="Добавьте кластер, чтобы он появился здесь."
          />
        </div>
      ) : (
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="table-header-cell text-left">Имя</th>
                <th className="table-header-cell text-left">Тип</th>
                <th className="table-header-cell text-left">Статус</th>
                <th className="table-header-cell text-left">Ядра CPU</th>
                <th className="table-header-cell text-left">ОЗУ</th>
                <th className="table-header-cell text-left">Серверы</th>
                <th className="table-header-cell-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((cluster, index) => (
                <tr key={cluster.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="table-cell-strong font-medium">{cluster.name || `cluster-${index + 1}`}</td>
                  <td className="table-cell-muted capitalize">{cluster.type || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(cluster.status)}`} />
                      <span className="text-dark-300 capitalize">{getStatusLabel(cluster.status)}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{cluster.cpu_cores ?? 0} ядер</td>
                  <td className="table-cell-muted">{formatMemoryGb(cluster.memory || cluster.memory_mb || 0)}</td>
                  <td className="table-cell-muted">{cluster.hosts ?? 0} серверов</td>
                  <td className="table-cell-actions">
                    <div className="inline-flex items-center justify-end space-x-2">
                      <button
                        className="table-action-icon-button text-green-400 hover:text-green-300"
                        title="Запустить кластер"
                        onClick={() => handleStart(cluster.id)}
                        disabled={cluster.status === 'online'}
                      >
                        <Play className="table-action-icon" />
                      </button>
                      <button
                        className="table-action-icon-button text-yellow-400 hover:text-yellow-300"
                        title="Остановить кластер"
                        onClick={() => handleStop(cluster.id)}
                        disabled={cluster.status === 'offline'}
                      >
                        <Square className="table-action-icon" />
                      </button>
                      <button
                        className="table-action-icon-button text-blue-400 hover:text-blue-300"
                        title="Параметры кластера"
                        onClick={() => handleSettings(cluster)}
                      >
                        <Settings className="table-action-icon" />
                      </button>
                      <button
                        className="table-action-icon-button text-red-400 hover:text-red-300"
                        title="Удалить кластер"
                        onClick={() => handleDelete(cluster.id || cluster.name)}
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
    </div>
  );
};

export default Clusters;