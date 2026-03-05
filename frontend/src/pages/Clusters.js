import React, { useState } from 'react';
import { Layers, Plus, Server, Activity } from 'lucide-react';

const Clusters = () => {
  const [clusters] = useState([
    {
      id: 1,
      name: 'cl1',
      type: 'proxmox',
      status: 'online',
      cpu_cores: 32,
      memory: 131072,
      hosts: 3
    },
    {
      id: 2,
      name: 'cl2', 
      type: 'proxmox',
      status: 'online',
      cpu_cores: 32,
      memory: 131072,
      hosts: 3
    },
    {
      id: 3,
      name: 'ci-cluster',
      type: 'proxmox', 
      status: 'online',
      cpu_cores: 32,
      memory: 131072,
      hosts: 3
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Кластеры</h2>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить кластер</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="card hover:bg-dark-700/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{cluster.name}</h3>
                  <p className="text-sm text-dark-400 capitalize">{cluster.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(cluster.status)}`}></div>
                <span className="text-sm text-dark-300 capitalize">
                  {cluster.status === 'online' ? 'Онлайн' : cluster.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="block text-sm text-dark-400">CPU</span>
                  <span className="text-white font-medium">{cluster.cpu_cores} ядер</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-green-400" />
                <div>
                  <span className="block text-sm text-dark-400">ОП</span>
                  <span className="text-white font-medium">{Math.round(cluster.memory / 1024)} GB</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-dark-700">
              <span className="text-sm text-dark-400">
                {cluster.hosts} серверов в кластере
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clusters;