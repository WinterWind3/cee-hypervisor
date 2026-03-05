import React, { useState } from 'react';
import { Network as NetworkIcon, Plus, Wifi, Globe } from 'lucide-react';

const Network = () => {
  const [networks] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Сеть</h2>
        <button className="btn-primary flex items-center space-x-2" disabled>
          <Plus className="w-4 h-4" />
          <span>Создать сеть</span>
        </button>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <NetworkIcon className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Виртуальные сети</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">0</p>
          <p className="text-sm text-dark-400">Сети не настроены</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Wifi className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">DHCP</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">Отключен</p>
          <p className="text-sm text-dark-400">Встроенный DHCP сервер</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Маршрутизация</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">Недоступно</p>
          <p className="text-sm text-dark-400">Виртуальные маршрутизаторы</p>
        </div>
      </div>

      {/* Networks Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Список сетей</h3>
        </div>

        {networks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center text-dark-400">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
                <NetworkIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Сети не настроены</h3>
              <p>Настройка сетей будет доступна в версии 2.2.0</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Имя</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Тип</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Подсеть</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Подключено ВМ</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {/* Networks will be displayed here */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;