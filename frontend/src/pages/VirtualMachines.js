import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Plus, Settings } from 'lucide-react';
import { apiService } from '../services/api';

const VirtualMachines = () => {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadVMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getVMs();
      setVms(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Ошибка загрузки списка виртуальных машин'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVMs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status) => {
    const normalized = (status || '').toString().toLowerCase();
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

  const handleStart = async (id) => {
    try {
      await apiService.startVM(id);
      await loadVMs();
    } catch (err) {
      alert(
        `Ошибка запуска ВМ: ${
          err.response?.data?.detail || err.message || 'неизвестная ошибка'
        }`
      );
    }
  };

  const handleStop = async (id) => {
    try {
      await apiService.stopVM(id);
      await loadVMs();
    } catch (err) {
      alert(
        `Ошибка остановки ВМ: ${
          err.response?.data?.detail || err.message || 'неизвестная ошибка'
        }`
      );
    }
  };

  const handleRestart = async (id) => {
    try {
      await apiService.restartVM(id);
      await loadVMs();
    } catch (err) {
      alert(
        `Ошибка перезапуска ВМ: ${
          err.response?.data?.detail || err.message || 'неизвестная ошибка'
        }`
      );
    }
  };

  const [showCreate, setShowCreate] = useState(false);
  const [newVm, setNewVm] = useState({ name: '', cpu_cores: 1, memory_mb: 1024, disk_gb: 10 });

  const handleCreate = () => {
    setShowCreate(true);
  };

  const handleCreateChange = (field) => (e) => {
    const value = e.target.value;
    setNewVm((s) => ({ ...s, [field]: field === 'name' ? value : Number(value) }));
  };

  const submitCreate = async () => {
    if (!newVm.name) {
      alert('Введите имя ВМ');
      return;
    }
    try {
      await apiService.createVM(newVm);
      setShowCreate(false);
      setNewVm({ name: '', cpu_cores: 1, memory_mb: 1024, disk_gb: 10 });
      await loadVMs();
      alert('ВМ создана');
    } catch (err) {
      alert(
        `Ошибка создания ВМ: ${err.response?.data?.detail || err.message || 'неизвестная ошибка'}`
      );
    }
  };

  const handleSettings = (vm) => {
    // Пока просто показываем базовую информацию; позже можно сделать модалку
    alert(
      `Настройки ВМ "${vm.name}":\n\n` +
        `- CPU: ${vm.cpu} ядро(а)\n` +
        `- Память: ${vm.memory} MB\n` +
        `- Диск: ${vm.disk} GB\n` +
        `- Кластер: ${vm.cluster}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Виртуальные машины</h2>
        <button onClick={handleCreate} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Создать ВМ</span>
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowCreate(false)}></div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Создать ВМ</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Имя</label>
                <input className="input w-full" value={newVm.name} onChange={handleCreateChange('name')} />
              </div>
              <div>
                <label className="block text-sm mb-1">CPU (ядра)</label>
                <input type="number" min="1" className="input w-full" value={newVm.cpu_cores} onChange={handleCreateChange('cpu_cores')} />
              </div>
              <div>
                <label className="block text-sm mb-1">Память (MB)</label>
                <input type="number" min="128" className="input w-full" value={newVm.memory_mb} onChange={handleCreateChange('memory_mb')} />
              </div>
              <div>
                <label className="block text-sm mb-1">Диск (GB)</label>
                <input type="number" min="1" className="input w-full" value={newVm.disk_gb} onChange={handleCreateChange('disk_gb')} />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button className="btn" onClick={() => setShowCreate(false)}>Отмена</button>
                <button className="btn-primary" onClick={submitCreate}>Создать</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {error && (
          <div className="mb-4 text-sm text-red-400">
            Ошибка: {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 text-sm text-dark-300">Загрузка списка ВМ...</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 font-medium text-dark-300">Имя</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Статус</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">CPU</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">ОПеративная память</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Диск</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Кластер</th>
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
                  <td className="py-3 px-4 text-dark-300">{vm.cluster_id ?? vm.cluster ?? '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        title="Запустить"
                        onClick={() => handleStart(vm.id)}
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Остановить"
                        onClick={() => handleStop(vm.id)}
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Перезапустить"
                        onClick={() => handleRestart(vm.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-dark-400 hover:text-white transition-colors"
                        title="Настройки"
                        onClick={() => handleSettings(vm)}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VirtualMachines;