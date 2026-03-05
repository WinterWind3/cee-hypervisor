import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Server,
  HardDrive,
  Camera,
  Network,
  Database,
  LayoutDashboard,
  Layers,
  Monitor,
  Settings
} from 'lucide-react';

const menuItems = [
  {
    path: '/dashboard',
    name: 'Панель индикаторов',
    icon: LayoutDashboard,
    color: 'text-blue-400'
  },
  {
    path: '/clusters',
    name: 'Кластеры',
    icon: Layers,
    color: 'text-green-400'
  },
  {
    path: '/servers',
    name: 'Серверы',
    icon: Server,
    color: 'text-purple-400'
  },
  {
    path: '/vms',
    name: 'Виртуальные машины',
    icon: Monitor,
    color: 'text-red-400'
  },
  {
    path: '/images',
    name: 'Образы',
    icon: HardDrive,
    color: 'text-orange-400'
  },
  {
    path: '/snapshots',
    name: 'Снапшоты',
    icon: Camera,
    color: 'text-yellow-400'
  },
  {
    path: '/network',
    name: 'Сеть',
    icon: Network,
    color: 'text-emerald-400'
  },
  {
    path: '/storage',
    name: 'Хранилище',
    icon: Database,
    color: 'text-cyan-400'
  }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CEE Hypervisor</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${
                isActive ? 'active' : ''
              }`}
            >
              <IconComponent className={`w-5 h-5 mr-3 ${item.color}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-sm text-dark-400 text-center">
          <div>ООО "ЭрикссонСофт"</div>
          <div className="text-xs mt-1">ericssonsoftware.ru</div>
        </div>
        <div className="mt-2 flex items-center justify-center">
          <button className="text-dark-400 hover:text-white transition-colors">
            <span className="text-sm">Отключено</span>
          </button>
        </div>
        <div className="mt-2 text-center">
          <button className="text-dark-400 hover:text-white transition-colors text-sm">
            Свернуть
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;