import React, { useState } from 'react';
import { Save, Shield, Key, Lock, Users, UserPlus, Edit2, Trash2 } from 'lucide-react';
import PageActions from '../components/PageActions';
import AppToast from '../components/AppToast';
import ActionButton from '../components/ActionButton';
import { useTimedMessage } from '../hooks/useTimedMessage';

const Security = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { message: updateMsg, showMessage: showUpdateMessage } = useTimedMessage();
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 15,
    mfaEnabled: false,
    requireStrongPasswords: true
  });

  const [usersList, setUsersList] = useState([
    { id: 1, username: 'admin', role: 'admin', lastLogin: 'Сегодня, 10:42', isSuperAdmin: true },
    { id: 2, username: 'operator1', role: 'user', lastLogin: 'Вчера, 14:15', isSuperAdmin: false },
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });

  const [showChangePassword, setShowChangePassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    showUpdateMessage('Настройки безопасности сохранены');
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    setUsersList([...usersList, {
      id: Date.now(),
      username: newUser.username,
      role: newUser.role,
      lastLogin: 'Никогда',
      isSuperAdmin: false
    }]);
    setNewUser({ username: '', password: '', role: 'user' });
    setShowAddUser(false);
    showUpdateMessage(`Пользователь ${newUser.username} добавлен`);
  };

  const handleDeleteUser = (id) => {
    const u = usersList.find(x => x.id === id);
    if(u?.isSuperAdmin) {
      showUpdateMessage('Нельзя удалить главного администратора!');
      return;
    }
    setUsersList(usersList.filter(x => x.id !== id));
    showUpdateMessage('Пользователь удален');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if(!newPassword) return;
    setShowChangePassword(null);
    setNewPassword('');
    showUpdateMessage('Пароль успешно изменен');
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            {showAddUser && (
              <div className="card mb-6 bg-dark-800 border border-dark-600 p-4 rounded-xl">
                <h4 className="text-lg font-medium text-white mb-4">Добавить пользователя</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-dark-300 mb-1">Имя пользователя</label>
                    <input type="text" className="input w-full" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="username" />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-300 mb-1">Пароль</label>
                    <input type="password" className="input w-full" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="******" />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-300 mb-1">Роль</label>
                    <select className="input w-full" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="user">Пользователь (User)</option>
                      <option value="admin">Администратор (Admin)</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="btn-primary" onClick={handleAddUser}>Добавить</button>
                  <button className="btn-secondary" onClick={() => setShowAddUser(false)}>Отмена</button>
                </div>
              </div>
            )}

            {showChangePassword && (
              <div className="card mb-6 bg-dark-800 border border-dark-600 p-4 rounded-xl">
                <h4 className="text-lg font-medium text-white mb-4">Смена пароля для: {showChangePassword.username}</h4>
                <div className="flex items-end space-x-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm text-dark-300 mb-1">Новый пароль</label>
                    <input type="password" className="input w-full" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="******" />
                  </div>
                  <button className="btn-primary" onClick={handleChangePassword}>Сохранить пароль</button>
                  <button className="btn-secondary" onClick={() => {setShowChangePassword(null); setNewPassword('');}}>Отмена</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-700 text-sm text-dark-400">
                    <th className="pb-3 px-4 font-medium">Пользователь</th>
                    <th className="pb-3 px-4 font-medium">Роль</th>
                    <th className="pb-3 px-4 font-medium">Последний вход</th>
                    <th className="pb-3 px-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${u.isSuperAdmin ? 'text-primary-400' : 'text-white'}`}>{u.username}</span>
                          {u.isSuperAdmin && <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-0.5 rounded-full">Супер-Админ</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-dark-700 text-dark-300 border border-dark-600'}`}>
                          {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-300">{u.lastLogin}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-600 rounded transition-colors" title="Сменить пароль" onClick={() => setShowChangePassword(u)}>
                            <Key className="w-4 h-4" />
                          </button>
                          {!u.isSuperAdmin && (
                            <button className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-600 rounded transition-colors" title="Удалить" onClick={() => handleDeleteUser(u.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'passwords':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Сложные пароли
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                  checked={securitySettings.requireStrongPasswords}
                  onChange={e => setSecuritySettings({...securitySettings, requireStrongPasswords: e.target.checked})}
                />
                <span className="text-sm text-dark-200">Требовать использование спецсимволов и цифр</span>
              </div>
            </div>
            <button className="btn-primary mt-4" onClick={handleSaveSettings}>Сохранить политики</button>
          </div>
        );
      case 'sessions':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Таймаут сессии (минут)
              </label>
              <input
                type="number"
                className="input w-full md:w-1/2 lg:w-1/3"
                value={securitySettings.sessionTimeout}
                onChange={e => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
              />
              <p className="text-xs text-dark-400 mt-2">
                Время неактивности до автоматического выхода.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Двухфакторная аутентификация
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                  checked={securitySettings.mfaEnabled}
                  onChange={e => setSecuritySettings({...securitySettings, mfaEnabled: e.target.checked})}
                />
                <span className="text-sm text-dark-200">Включить 2FA для администраторов</span>
              </div>
            </div>
            <button className="btn-primary mt-4" onClick={handleSaveSettings}>Сохранить сессии</button>
          </div>
        );
      case 'audit':
        return (
          <div className="space-y-6">
            <p className="text-sm text-dark-300">
              Журнал аудита системы. Данные загружаются...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <AppToast message={updateMsg} />

      <PageActions meta="Управление безопасностью, доступами и аутентификацией.">
        {activeTab === 'users' && (
          <ActionButton
            icon={UserPlus}
            label="Добавить"
            onClick={() => setShowAddUser(true)}
            primary={true}
          />
        )}
      </PageActions>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2">
          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${activeTab === 'users' ? 'bg-dark-700 border-primary-500 text-white' : 'bg-transparent border-transparent text-dark-300 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Пользователи</span>
          </button>
          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${activeTab === 'passwords' ? 'bg-dark-700 border-primary-500 text-white' : 'bg-transparent border-transparent text-dark-300 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('passwords')}
          >
            <Key className="w-5 h-5" />
            <span className="font-medium">Пароли</span>
          </button>
          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${activeTab === 'sessions' ? 'bg-dark-700 border-primary-500 text-white' : 'bg-transparent border-transparent text-dark-300 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('sessions')}
          >
            <Lock className="w-5 h-5" />
            <span className="font-medium">Сессии</span>
          </button>
          <button
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${activeTab === 'audit' ? 'bg-dark-700 border-primary-500 text-white' : 'bg-transparent border-transparent text-dark-300 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('audit')}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Аудит</span>
          </button>
        </div>

        <div className="flex-1">
          <div className="card min-h-[400px]">
            <h3 className="text-xl font-medium text-white mb-6 border-b border-dark-700 pb-4">
              {activeTab === 'users' && 'Пользователи и роли'}
              {activeTab === 'passwords' && 'Политики паролей'}
              {activeTab === 'sessions' && 'Сессии и доступ'}
              {activeTab === 'audit' && 'Журнал безопасности'}
            </h3>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
