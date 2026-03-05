import React, { useState } from 'react';
import { Camera, RotateCw, Trash2, Plus } from 'lucide-react';

const Snapshots = () => {
  const [snapshots] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Снапшоты</h2>
        <button className="btn-primary flex items-center space-x-2" disabled>
          <Plus className="w-4 h-4" />
          <span>Создать снапшот</span>
        </button>
      </div>

      <div className="card">
        {snapshots.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center text-dark-400">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Нет снапшотов</h3>
              <p>Снапшоты позволяют сохранять состояние ВМ</p>
              <p className="text-sm mt-1">Сначала создайте виртуальную машину</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Имя</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">ВМ</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Дата создания</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Размер</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-3 px-4 text-white">{snapshot.name}</td>
                    <td className="py-3 px-4 text-dark-300">{snapshot.vm}</td>
                    <td className="py-3 px-4 text-dark-300">{snapshot.created}</td>
                    <td className="py-3 px-4 text-dark-300">{snapshot.size}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors" title="Восстановить">
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-300 transition-colors" title="Удалить">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Snapshots;