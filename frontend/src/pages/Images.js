import React, { useState } from 'react';
import { Upload, Link as LinkIcon, RefreshCw, Download, Trash2 } from 'lucide-react';

const Images = () => {
  const [images, setImages] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Загрузка файла:', file.name);
      // TODO: реализовать загрузку
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('Загрузка по URL:', urlInput);
      // TODO: реализовать API запрос
      setUrlInput('');
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Образы</h2>
        <span className="text-dark-400">{images.length} образов</span>
      </div>

      {/* Update Button */}
      <div className="flex justify-end">
        <button className="btn-primary flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Обновить</span>
        </button>
      </div>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload */}
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Загрузить файл</h3>
            <p className="text-dark-400 text-center mb-6">ISO, QCOW2, IMG</p>
            
            <label className="btn-primary cursor-pointer">
              Выбрать файл
              <input 
                type="file" 
                className="hidden" 
                accept=".iso,.qcow2,.img,.vmdk,.vdi"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* URL Upload */}
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Загрузить по URL</h3>
            <p className="text-dark-400 text-center mb-6">Прямая ссылка на образ</p>
            
            <div className="w-full space-y-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.iso"
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
              />
              <button 
                onClick={handleUrlUpload}
                disabled={isLoading || !urlInput.trim()}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Загрузить</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Images Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 font-medium text-dark-300">#</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Имя файла</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Размер</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Тип</th>
                <th className="text-left py-3 px-4 font-medium text-dark-300">Действия</th>
              </tr>
            </thead>
            <tbody>
              {images.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-dark-400">
                      <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Нет образов</h3>
                      <p>Загрузите ISO или QCOW2 образ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                images.map((image, index) => (
                  <tr key={image.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-3 px-4 text-dark-300">{index + 1}</td>
                    <td className="py-3 px-4 text-white">{image.name}</td>
                    <td className="py-3 px-4 text-dark-300">{image.size}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded">
                        {image.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        onClick={() => console.log('Удалить образ:', image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Images;