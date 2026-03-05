import React, { useState } from 'react';
import { Server, Plus, Activity, HardDrive, Wifi } from 'lucide-react';

const Servers = () => {
  const [servers] = useState([
    {
      id: 1,
      name: 'node1',
      hostname: '192.168.1.101',
      status: 'online',
      cpu_cores: 16,
      memory_total: 65536,
      cluster: 'cl1'
    },
    {
      id: 2,
      name: 'node2', 
      hostname: '192.168.1.102',
      status: 'online',
      cpu_cores: 16,
      memory_total: 65536,
      cluster: 'cl1'
    },
    {
      id: 3,
      name: 'node1',
      hostname: '192.168.1.101',
      status: 'online', 
      cpu_cores: 16,
      memory_total: 65536,
      cluster: 'cl2'
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
        <h2 className="text-xl font-semibold text-white">Серверы</h2>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить сервер</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {servers.map((server) => (
          <div key={server.id} className="card hover:bg-dark-700/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                  <p className="text-sm text-dark-400">{server.hostname}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`}></div>
                <span className="text-sm text-dark-300 capitalize">
                  {server.status === 'online' ? 'Онлайн' : server.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="block text-sm text-dark-400">CPU</span>
                  <span className="text-white font-medium">{server.cpu_cores} ядер</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-green-400" />
                <div>
                  <span className="block text-sm text-dark-400">ОП</span>
                  <span className="text-white font-medium">{Math.round(server.memory_total / 1024)} GB</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <span className="text-sm text-dark-400">
                Кластер: {server.cluster}
              </span>
              <Wifi className="w-4 h-4 text-green-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servers;