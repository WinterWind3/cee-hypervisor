import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, User } from 'lucide-react';

const getPageTitle = (pathname) => {
  const titles = {
    '/': 'Панель управления',
    '/dashboard': 'Панель управления',
    '/clusters': 'Кластеры',
    '/servers': 'Серверы',
    '/vms': 'Виртуальные машины',
    '/images': 'Образы',
    '/snapshots': 'Резервные копии',
    '/network': 'Сети',
    '/storage': 'Хранилища',
    '/settings': 'Настройки системы'
  };
  return titles[pathname] || 'Панель управления';
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">{pageTitle}</h1>

        <div className="flex items-center space-x-4">
          <button
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            onClick={() => navigate('/settings')}
            title="Настройки"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div
            className="flex items-center space-x-2 bg-dark-700 rounded-lg px-3 py-2 cursor-pointer hover:bg-dark-600 transition-colors"
            onClick={() => navigate('/security')}
            title="Профиль и безопасность"
          >
            <User className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-medium text-white">Admin</span>
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;