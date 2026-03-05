import React from 'react';
import { Activity, Server, Monitor, HardDrive } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'text-primary-500' }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-dark-400">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-sm text-dark-400 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Общие коры CPU"
          value="96"
          subtitle="На 3 кластерах"
          icon={Activity}
          color="text-blue-500"
        />
        <StatCard
          title="Общая RAM"
          value="393 GB"
          subtitle="На 9 серверах"
          icon={Server}
          color="text-green-500"
        />
        <StatCard
          title="Виртуальные машины"
          value="2"
          subtitle="1 запущена, 1 остановлена"
          icon={Monitor}
          color="text-purple-500"
        />
        <StatCard
          title="Образы"
          value="0"
          subtitle="ISO, QCOW2, IMG"
          icon={HardDrive}
          color="text-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary">Создать ВМ</button>
          <button className="btn-secondary">Загрузить образ</button>
          <button className="btn-secondary">Добавить сервер</button>
          <button className="btn-secondary">Создать кластер</button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Последняя активность</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-dark-300">ВМ "вм1" остановлена</span>
            <span className="text-sm text-dark-400">2 минуты назад</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-dark-300">Кластер "ci-cluster" подключен</span>
            <span className="text-sm text-dark-400">1 час назад</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-dark-300">Сервер "node2" в сети</span>
            <span className="text-sm text-dark-400">3 часа назад</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;