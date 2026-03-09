import React, { useState } from 'react';
import { Save, Shield, Network } from 'lucide-react';
import PageActions from '../components/PageActions';
import AppToast from '../components/AppToast';
import ActionButton from '../components/ActionButton';
import { useTimedMessage } from '../hooks/useTimedMessage';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();

  const [settings, setSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('appSettings')) || {
      api_url: 'http://localhost:8080',
      refresh_interval: 30,
      theme: 'dark',
      default_storage_pool: 'default'
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('appSettings', JSON.stringify(settings));
    showUpdateMessage('Настройки успешно сохранены');
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Интервал обновления (секунды)
              </label>
              <input
                type="number"
                className="input w-full md:w-1/2 lg:w-1/3"
                value={settings.refresh_interval}
                onChange={e => setSettings({...settings, refresh_interval: e.target.value})}
              />
              <p className="text-xs text-dark-400 mt-2">
                Как часто данные (статистика, метрики) обновляются с сервера.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Пул хранилища по умолчанию
              </label>
              <input
                type="text"
                className="input w-full md:w-1/2 lg:w-1/3"
                value={settings.default_storage_pool}
                onChange={e => setSettings({...settings, default_storage_pool: e.target.value})}
              />
              <p className="text-xs text-dark-400 mt-2">
                Название пула для новых дисков, если не указано иное (например, default).
              </p>
            </div>
          </div>
        );
      case 'network':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                API URL
              </label>
              <input
                type="url"
                className="input w-full md:w-1/2 lg:w-1/3"
                value={settings.api_url}
                onChange={e => setSettings({...settings, api_url: e.target.value})}
              />
              <p className="text-xs text-dark-400 mt-2">
                Базовый адрес для подключения к серверной части (backend).
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <AppToast message={updateMsg} />
      
      <PageActions meta="Управление конфигурацией веб-интерфейса и приложения.">
        <ActionButton 
          icon={Save} 
          label="Сохранить настройки" 
          onClick={handleSave} 
        />
      </PageActions>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2">
          <button 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${activeTab === 'general' ? 'bg-dark-700 border-primary-500 text-white' : 'bg-transparent border-transparent text-dark-300 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('general')}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Общие</span>
          </button>
          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${activeTab === 'network' ? 'bg-dark-700 border-primary-500 text-white' : 'bg-transparent border-transparent text-dark-300 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('network')}
          >
            <Network className="w-5 h-5" />
            <span className="font-medium">Сеть и API</span>
          </button>
        </div>

        <div className="flex-1">
          <div className="card min-h-[400px]">
            <h3 className="text-xl font-medium text-white mb-6 border-b border-dark-700 pb-4">
              {activeTab === 'general' && 'Общие настройки'}
              {activeTab === 'network' && 'Сетевые настройки'}
            </h3>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
