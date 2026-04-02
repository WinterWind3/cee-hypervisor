// VM Management Platform

// Data structure for pages
const pages = {
    dashboard: {
        title: 'Дашборд',
        content: () => generateDashboardContent()
    },
    vms: {
        title: 'Виртуальные машины',
        content: () => generateVmsContent()
    },
    monitoring: {
        title: 'Мониторинг',
        content: () => generateMonitoringContent()
    },
    clusters: {
        title: 'Кластеры',
        content: () => generateClustersContent()
    },
    servers: {
        title: 'Серверы', 
        content: () => generateServersContent()
    },
    snapshots: {
        title: 'Снапшоты',
        content: () => generateSnapshotsContent()
    },
    network: {
        title: 'Сеть',
        content: () => generateNetworkContent()
    },
    storage: {
        title: 'Хранилище',
        content: () => generateStorageContent()
    },
    images: {
        title: 'Образы',
        content: () => generateImagesContent()
    }
};

// Function to generate dashboard content
function generateDashboardContent() {
    return `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-200 text-sm font-medium">Всего ВМ</p>
                            <p class="text-3xl font-bold">24</p>
                        </div>
                        <svg class="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                        </svg>
                    </div>
                    <div class="mt-4">
                        <span class="text-blue-200 text-sm">+2 за сегодня</span>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-200 text-sm font-medium">Активные</p>
                            <p class="text-3xl font-bold">18</p>
                        </div>
                        <svg class="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <div class="mt-4">
                        <span class="text-green-200 text-sm">75% загрузка</span>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-200 text-sm font-medium">CPU</p>
                            <p class="text-3xl font-bold">64</p>
                        </div>
                        <svg class="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                    <div class="mt-4">
                        <span class="text-yellow-200 text-sm">45% использование</span>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-200 text-sm font-medium">RAM</p>
                            <p class="text-3xl font-bold">256GB</p>
                        </div>
                        <svg class="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div class="mt-4">
                        <span class="text-purple-200 text-sm">72% использование</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white">Недавняя активность</h3>
                        <button onclick="showVmStats()" class="text-blue-400 hover:text-blue-300 text-sm">
                            📊 Статистика
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-white text-sm">ВМ "web-server-01" запущена</p>
                                <p class="text-gray-400 text-xs">5 минут назад</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-white text-sm">Создан снапшот "backup-2024-01"</p>
                                <p class="text-gray-400 text-xs">15 минут назад</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-white text-sm">ВМ "db-server" перезапущена</p>
                                <p class="text-gray-400 text-xs">1 час назад</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="text-lg font-semibold text-white mb-4">Использование ресурсов</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-gray-300 text-sm">CPU</span>
                                <span class="text-white text-sm">45%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style="width: 45%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-gray-300 text-sm">RAM</span>
                                <span class="text-white text-sm">72%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style="width: 72%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-gray-300 text-sm">Диск</span>
                                <span class="text-white text-sm">58%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style="width: 58%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to generate monitoring content
function generateMonitoringContent() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">Мониторинг и логирование</h2>
                <button class="btn-secondary flex items-center space-x-2" onclick="showNotification('Обновление метрик выполнено', 'info')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Обновить метрики</span>
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card">
                    <h3 class="text-sm font-medium text-gray-300 mb-2">CPU кластеров</h3>
                    <p class="text-3xl font-bold text-white mb-1">42%</p>
                    <p class="text-xs text-gray-400">Средняя загрузка по всем серверам</p>
                    <div class="mt-4 w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full" style="width: 42%"></div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="text-sm font-medium text-gray-300 mb-2">Память</h3>
                    <p class="text-3xl font-bold text-white mb-1">68%</p>
                    <p class="text-xs text-gray-400">Использование ОЗУ по датацентру</p>
                    <div class="mt-4 w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-gradient-to-r from-sky-400 to-sky-600 h-2 rounded-full" style="width: 68%"></div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="text-sm font-medium text-gray-300 mb-2">Диск</h3>
                    <p class="text-3xl font-bold text-white mb-1">55%</p>
                    <p class="text-xs text-gray-400">Занятое пространство хранилищ</p>
                    <div class="mt-4 w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style="width: 55%"></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card p-0">
                    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-700">
                        <h3 class="text-sm font-semibold text-white">Журнал событий</h3>
                        <span class="text-xs text-gray-400">последние 20 записей</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-700 text-gray-300">
                                    <th class="text-left py-3 px-6">Время</th>
                                    <th class="text-left py-3 px-6">Уровень</th>
                                    <th class="text-left py-3 px-6">Сообщение</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-3 px-6 text-gray-300">04.03.2026 15:21:03</td>
                                    <td class="py-3 px-6"><span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">INFO</span></td>
                                    <td class="py-3 px-6 text-gray-200">ВМ "ci-test-vm" успешно запущена</td>
                                </tr>
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-3 px-6 text-gray-300">04.03.2026 15:18:47</td>
                                    <td class="py-3 px-6"><span class="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded border border-yellow-600">WARN</span></td>
                                    <td class="py-3 px-6 text-gray-200">Высокая загрузка CPU на сервере "node-01"</td>
                                </tr>
                                <tr class="hover:bg-gray-700/30">
                                    <td class="py-3 px-6 text-gray-300">04.03.2026 15:10:12</td>
                                    <td class="py-3 px-6"><span class="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded border border-red-600">ERROR</span></td>
                                    <td class="py-3 px-6 text-gray-200">Неудачная попытка подключения к кластеру "lab-proxmox"</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-sm font-semibold text-white">Активность ВМ</h3>
                        <label class="flex items-center space-x-2 text-xs text-gray-400">
                            <input type="checkbox" onchange="showNotification('Автообновление пока эмулируется на фронтенде', 'info')" />
                            <span>Автообновление</span>
                        </label>
                    </div>
                    <div class="space-y-3 text-sm text-gray-300">
                        <div class="flex justify-between">
                            <span>Запущено ВМ</span>
                            <span class="font-semibold text-emerald-400">${vmList.filter(vm => vm.status === 'Running').length}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Остановлено ВМ</span>
                            <span class="font-semibold text-red-400">${vmList.filter(vm => vm.status === 'Stopped').length}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Приостановлено ВМ</span>
                            <span class="font-semibold text-yellow-400">${vmList.filter(vm => vm.status === 'Paused').length}</span>
                        </div>
                        <div class="mt-4 text-xs text-gray-400">
                            Данные являются демонстрационными. В реальной системе здесь будут живые метрики из backend API.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to generate VM action buttons
function generateVmButtons(vmName, status) {
    if (status === 'Running') {
        return `
            <button onclick="stopVm('${vmName}')" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                </svg>
            </button>
            <button onclick="restartVm('${vmName}')" class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>
            <button onclick="openVmConsole('${vmName}')" class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            </button>
            <button onclick="pauseVm('${vmName}')" class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </button>
            <button onclick="openVmSettings('${vmName}')" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                </svg>
            </button>
            <button onclick="createVmSnapshot('${vmName}')" class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                </svg>
            </button>
            <button onclick="deleteVm('${vmName}')" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
    } else {
        return `
            <button onclick="startVm('${vmName}')" class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Запустить">
                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                </svg>
            </button>
            <button onclick="openVmConsole('${vmName}')" class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            </button>
            <button onclick="openVmSettings('${vmName}')" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                </svg>
            </button>
            <button onclick="createVmSnapshot('${vmName}')" class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                </svg>
            </button>
            <button onclick="deleteVm('${vmName}')" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
    }
}

// In-memory VM list to keep UI state in sync with actions
const vmList = [
    { name: 'ci-test-vm-clone', status: 'Stopped', cpu: '2 vCPU', ram: '2048 MB', disk: '0 GB', os: 'linux' },
    { name: 'ci-test-vm',       status: 'Stopped', cpu: '2 vCPU', ram: '4096 MB', disk: '0 GB', os: 'linux' },
    { name: 'aaaaa',            status: 'Running', cpu: '2 vCPU', ram: '2048 MB', disk: '6 GB',   os: 'linux' },
    { name: 'вввввв',           status: 'Running', cpu: '2 vCPU', ram: '2048 MB', disk: '0 GB',   os: 'linux' },
    { name: 'ывавыа3',          status: 'Running', cpu: '2 vCPU', ram: '2048 MB', disk: '0 GB',   os: 'linux' }
];

function getVmStatusClasses(status) {
    if (status === 'Running') {
        return {
            dot: 'bg-green-500',
            badgeBg: 'bg-green-900/50',
            badgeText: 'text-green-300',
            badgeBorder: 'border-green-600'
        };
    }
    if (status === 'Paused') {
        return {
            dot: 'bg-yellow-400',
            badgeBg: 'bg-yellow-900/50',
            badgeText: 'text-yellow-300',
            badgeBorder: 'border-yellow-600'
        };
    }
    // Stopped or unknown
    return {
        dot: 'bg-red-500',
        badgeBg: 'bg-red-900/50',
        badgeText: 'text-red-300',
        badgeBorder: 'border-red-600'
    };
}

function generateVmTableBody() {
    return vmList.map((vm, index) => {
        const classes = getVmStatusClasses(vm.status);
        return `
            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                <td class="py-4 px-6 text-gray-300">${index + 1}</td>
                <td class="py-4 px-6">
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 rounded-full ${classes.dot}"></div>
                        <span class="text-white font-medium">${vm.name}</span>
                    </div>
                </td>
                <td class="py-4 px-6">
                    <span class="px-2 py-1 ${classes.badgeBg} ${classes.badgeText} text-xs rounded border ${classes.badgeBorder}">${vm.status}</span>
                </td>
                <td class="py-4 px-6 text-gray-300">${vm.cpu}</td>
                <td class="py-4 px-6 text-gray-300">${vm.ram}</td>
                <td class="py-4 px-6 text-gray-300">${vm.disk}</td>
                <td class="py-4 px-6 text-gray-300">${vm.os}</td>
                <td class="py-4 px-6">
                    <div class="flex items-center space-x-1">
                        ${generateVmButtons(vm.name, vm.status)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getVmSummaryText() {
    const total = vmList.length;
    const running = vmList.filter(vm => vm.status === 'Running').length;
    return `${total} машин • ${running} запущено`;
}

// Function to generate VMs content WITH WORKING BUTTONS!
function generateVmsContent() {
    return `
            <div class="space-y-6">
                <!-- Action Buttons -->
                <div class="flex justify-between items-center">
                    <div class="flex space-x-3">
                        <button class="btn-primary flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Создать ВМ</span>
                        </button>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="vm-summary" class="text-gray-400">${getVmSummaryText()}</span>
                        <button class="btn-secondary flex items-center space-x-2" onclick="renderVmTable()">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <span>Обновить</span>
                        </button>
                    </div>
                </div>

                <!-- VM Table -->
                <div class="card p-0">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-700">
                                    <th class="text-left py-4 px-6 font-medium text-gray-300 w-12">#</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">Имя</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">Статус</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">CPU</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">RAM</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">Диск</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">ОС</th>
                                    <th class="text-left py-4 px-6 font-medium text-gray-300">Действия</th>
                                </tr>
                            </thead>
                            <tbody id="vm-table-body">
                                ${generateVmTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
}

// Function to generate clusters content
function generateClustersContent() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">Кластеры</h2>
                <button class="btn-primary">Создать кластер</button>
            </div>
            <div class="card">
                <p class="text-gray-300">Управление кластерами виртуальных машин</p>
            </div>
        </div>
    `;
}

// Function to generate servers content
function generateServersContent() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">Серверы</h2>
                <button class="btn-primary">Добавить сервер</button>
            </div>
            <div class="card">
                <p class="text-gray-300">Список серверов и их метрики</p>
            </div>
        </div>
    `;
}

// Function to generate snapshots content  
function generateSnapshotsContent() {
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Создать снэпшот</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">8 снапшотов • 2.1 GB</span>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Snapshots Table -->
            <div class="card p-0">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-4 px-6 font-medium text-gray-300 w-12">#</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Имя</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">ВМ</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Дата создания</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Размер</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Описание</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">1</td>
                                <td class="py-4 px-6 text-white font-medium">snapshot-vm1-2024-03-04</td>
                                <td class="py-4 px-6 text-gray-300">aaaaa</td>
                                <td class="py-4 px-6 text-gray-300">04.03.2024 15:30</td>
                                <td class="py-4 px-6 text-gray-300">512 MB</td>
                                <td class="py-4 px-6 text-gray-300">Перед обновлением</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Восстановить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">2</td>
                                <td class="py-4 px-6 text-white font-medium">backup-vm2-2024-03-03</td>
                                <td class="py-4 px-6 text-gray-300">вввввв</td>
                                <td class="py-4 px-6 text-gray-300">03.03.2024 10:15</td>
                                <td class="py-4 px-6 text-gray-300">768 MB</td>
                                <td class="py-4 px-6 text-gray-300">Автоматический бэкап</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Восстановить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Function to generate network content
function generateNetworkContent() {
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Создать сеть</span>
                    </button>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <span>Добавить мост</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">3 сети • 5 интерфейсов</span>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Network Table -->
            <div class="card p-0">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-4 px-6 font-medium text-gray-300 w-12">#</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Имя</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Тип</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Подсеть</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Статус</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Подключено ВМ</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">1</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span class="text-white font-medium">virbr0</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">Bridge</td>
                                <td class="py-4 px-6 text-gray-300">192.168.1.0/24</td>
                                <td class="py-4 px-6">
                                    <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Active</span>
                                </td>
                                <td class="py-4 px-6 text-gray-300">3 ВМ</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">2</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span class="text-white font-medium">virbr1</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">NAT</td>
                                <td class="py-4 px-6 text-gray-300">192.168.2.0/24</td>
                                <td class="py-4 px-6">
                                    <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Active</span>
                                </td>
                                <td class="py-4 px-6 text-gray-300">2 ВМ</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Function to generate storage content
function generateStorageContent() {
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m-6 0H6"></path>
                        </svg>
                        <span>Добавить том</span>
                    </button>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        <span>Импорт</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">4 тома • 850 GB использовано</span>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Storage Table -->
            <div class="card p-0">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-4 px-6 font-medium text-gray-300 w-12">#</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Имя</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Тип</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Размер</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Исполмзовано</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Путь</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Статус</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">1</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span class="text-white font-medium">storage-pool-01</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">ZFS</td>
                                <td class="py-4 px-6 text-gray-300">500 GB</td>
                                <td class="py-4 px-6 text-gray-300">320 GB (64%)</td>
                                <td class="py-4 px-6 text-gray-300">/var/lib/libvirt/images</td>
                                <td class="py-4 px-6">
                                    <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Online</span>
                                </td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Расширить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a1 1 0 011-1h4m10 0h4a1 1 0 011 1v4m0 10v4a1 1 0 01-1 1h-4m-10 0H4a1 1 0 01-1-1v-4"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">2</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span class="text-white font-medium">backup-storage</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">EXT4</td>
                                <td class="py-4 px-6 text-gray-300">1 TB</td>
                                <td class="py-4 px-6 text-gray-300">530 GB (53%)</td>
                                <td class="py-4 px-6 text-gray-300">/backup</td>
                                <td class="py-4 px-6">
                                    <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Online</span>
                                </td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Расширить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4a1 1 0 011-1h4m10 0h4a1 1 0 011 1v4m0 10v4a1 1 0 01-1 1h-4m-10 0H4a1 1 0 01-1-1v-4"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Function to generate images content
function generateImagesContent() {
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        <span>Загрузить образ</span>
                    </button>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Создать образ</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">6 образов • 45.2 GB</span>
                    <button class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Images Table -->
            <div class="card p-0">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-700">
                                <th class="text-left py-4 px-6 font-medium text-gray-300 w-12">#</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Имя</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">ОПЕРационная система</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Версия</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Размер</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Дата создания</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Используется</th>
                                <th class="text-left py-4 px-6 font-medium text-gray-300">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">1</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-3">
                                        <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E94D36'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/></svg>" alt="Ubuntu" class="w-6 h-6">
                                        <span class="text-white font-medium">ubuntu-20.04-server</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">Ubuntu Linux</td>
                                <td class="py-4 px-6 text-gray-300">20.04 LTS</td>
                                <td class="py-4 px-6 text-gray-300">2.5 GB</td>
                                <td class="py-4 px-6 text-gray-300">15.03.2024</td>
                                <td class="py-4 px-6 text-gray-300">3 ВМ</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Создать ВМ">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Клонировать">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">2</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-3">
                                        <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230078D4'><path d='M0 0h11.5v23H0zm12.5 0H24v11.5H12.5z'/></svg>" alt="Windows" class="w-6 h-6">
                                        <span class="text-white font-medium">windows-server-2022</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">Windows Server</td>
                                <td class="py-4 px-6 text-gray-300">2022</td>
                                <td class="py-4 px-6 text-gray-300">15.8 GB</td>
                                <td class="py-4 px-6 text-gray-300">10.03.2024</td>
                                <td class="py-4 px-6 text-gray-300">1 ВМ</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Создать ВМ">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Клонировать">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                <td class="py-4 px-6 text-gray-300">3</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-3">
                                        <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23DD0031'><circle cx='12' cy='12' r='10'/></svg>" alt="CentOS" class="w-6 h-6">
                                        <span class="text-white font-medium">centos-8-stream</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-gray-300">CentOS Stream</td>
                                <td class="py-4 px-6 text-gray-300">8</td>
                                <td class="py-4 px-6 text-gray-300">1.9 GB</td>
                                <td class="py-4 px-6 text-gray-300">08.03.2024</td>
                                <td class="py-4 px-6 text-gray-300">1 ВМ</td>
                                <td class="py-4 px-6">
                                    <div class="flex items-center space-x-1">
                                        <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Создать ВМ">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Клонировать">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                                            </svg>
                                        </button>
                                        <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                                            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Navigation function
function showPage(pageId) {
    const page = pages[pageId];
    if (!page) {
        console.error('Page not found:', pageId);
        return;
    }
    
    try {
        document.getElementById('page-content').innerHTML = page.content();
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = page.title;
        }
        
        // Update active tab
        document.querySelectorAll('.sidebar-item').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Save current page
        localStorage.setItem('currentPage', pageId);
        
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('page-content').innerHTML = '<div class="card text-red-400">Ошибка загрузки страницы</div>';
    }
}

// Authentication functions
function toggleAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
}

function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        // Simple auth check - in real app would use proper authentication
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', username);
            showNotification('Успешная авторизация', 'success');
            toggleAuthModal();
            updateUserInfo();
        } else {
            showNotification('Неверные учетные данные', 'error');
        }
    } else {
        showNotification('Заполните все поля', 'warning');
    }
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    showNotification('Вы вышли из системы', 'info');
    updateUserInfo();
}

function updateUserInfo() {
    const isAuth = localStorage.getItem('isAuthenticated');
    const username = localStorage.getItem('username');
    const authStatus = document.getElementById('auth-status');
    const authIndicator = document.getElementById('auth-indicator');
    
    if (authStatus) {
        if (isAuth && username) {
            authStatus.textContent = username;
            if (authIndicator) {
                authIndicator.className = 'w-2 h-2 bg-green-500 rounded-full';
            }
        } else {
            authStatus.textContent = 'Гостевой доступ';
            if (authIndicator) {
                authIndicator.className = 'w-2 h-2 bg-gray-500 rounded-full';
            }
        }
    }
}

// Settings modal functions
function toggleSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
}

// Generic modal helpers for existing modals in index.html
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.alignItems = 'flex-start';
        modal.style.overflowY = 'auto';
        modal.style.paddingTop = '1rem';
        modal.style.paddingBottom = '1rem';

        const panel = modal.firstElementChild;
        if (panel) {
            panel.style.maxHeight = 'calc(100vh - 2rem)';
            panel.style.overflowY = 'auto';
            panel.style.margin = '0 auto';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

function saveSettings() {
    showNotification('Настройки сохранены', 'success');
    toggleSettingsModal();
}

// VM action statistics
let vmActionStats = {
    started: 0,
    stopped: 0,
    restarted: 0,
    paused: 0,
    snapshotted: 0,
    deleted: 0
};

// Function to get VM stats
function getVmStats() {
    return vmActionStats;
}

// Function to reset VM stats  
function resetVmStats() {
    vmActionStats = {
        started: 0,
        stopped: 0,
        restarted: 0,
        paused: 0,
        snapshotted: 0,
        deleted: 0
    };
    showNotification('Статистика действий с ВМ сброшена', 'info');
}

// Function to show VM stats
function showVmStats() {
    const stats = getVmStats();
    const statsText = `Статистика действий с ВМ:\n\n` +
        `Запущено: ${stats.started}\n` +
        `Остановлено: ${stats.stopped}\n` +
        `Перезапущено: ${stats.restarted}\n` +
        `Приостановлено: ${stats.paused}\n` +
        `Снимков создано: ${stats.snapshotted}\n` +
        `Удалено: ${stats.deleted}\n\n` +
        `Всего действий: ${Object.values(stats).reduce((a, b) => a + b, 0)}`;
    
    // Показываем статистику через красивое модальное окно, а не alert
    const modal = document.getElementById('vmActionModal');
    const title = document.getElementById('vmActionTitle');
    const message = document.getElementById('vmActionMessage');
    const confirmBtn = document.getElementById('vmActionConfirm');

    if (modal && title && message && confirmBtn) {
        title.textContent = 'Статистика действий с ВМ';
        message.textContent = statsText.replace(/\n/g, '\n');
        confirmBtn.textContent = 'Закрыть';
        confirmBtn.onclick = function() {
            closeModal('vmActionModal');
        };
        openModal('vmActionModal');
    } else {
        // Запасной вариант, если модальное окно недоступно
        alert(statsText);
    }
}

// Re-render VM table and summary based on current vmList state
function renderVmTable() {
    const tbody = document.getElementById('vm-table-body');
    if (!tbody) return;
    tbody.innerHTML = generateVmTableBody();

    const summary = document.getElementById('vm-summary');
    if (summary) {
        summary.textContent = getVmSummaryText();
    }
}

// VM management functions
function startVm(vmName) {
    vmActionStats.started++;
    showNotification(`Начинаем запуск ВМ "${vmName}"...`, 'info');
    
    // Симуляция запуска
    setTimeout(() => {
        showNotification(`ВМ "${vmName}" успешно запущена`, 'success');
        const vm = vmList.find(v => v.name === vmName);
        if (vm) {
            vm.status = 'Running';
            renderVmTable();
        }
    }, 2000);
}

function stopVm(vmName) {
    if (confirm(`Подтвердите остановку ВМ "${vmName}"`)) {
        vmActionStats.stopped++;
        showNotification(`Останавливаем ВМ "${vmName}"...`, 'warning');
        
        setTimeout(() => {
            showNotification(`ВМ "${vmName}" остановлена`, 'success');
            const vm = vmList.find(v => v.name === vmName);
            if (vm) {
                vm.status = 'Stopped';
                renderVmTable();
            }
        }, 1500);
    }
}

function restartVm(vmName) {
    if (confirm(`Подтвердите перезапуск ВМ "${vmName}"`)) {
        vmActionStats.restarted++;
        showNotification(`Перезапускаем ВМ "${vmName}"...`, 'info');
        
        setTimeout(() => {
            showNotification(`ВМ "${vmName}" успешно перезапущена`, 'success');
            const vm = vmList.find(v => v.name === vmName);
            if (vm) {
                vm.status = 'Running';
                renderVmTable();
            }
        }, 3000);
    }
}

function pauseVm(vmName) {
    vmActionStats.paused++;
    showNotification(`Приостанавливаем ВМ "${vmName}"...`, 'warning');
    
    setTimeout(() => {
        showNotification(`ВМ "${vmName}" приостановлена`, 'success');
        const vm = vmList.find(v => v.name === vmName);
        if (vm) {
            vm.status = 'Paused';
            renderVmTable();
        }
    }, 1000);
}

async function openVmConsole(vmName) {
    showNotification(`Открываем консоль ВМ "${vmName}" через backend API`, 'info');

    const apiUrl = `http://localhost:8000/api/vms/${encodeURIComponent(vmName)}/console`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.error('VM console API error:', response.status, text);
            showNotification(`Ошибка API консоли ВМ (${response.status})`, 'error');
            return;
        }

        const data = await response.json();
        if (!data.url) {
            showNotification('API не вернул URL консоли ВМ', 'error');
            return;
        }

        const newWindow = window.open(data.url, '_blank');
        if (!newWindow) {
            showNotification('Браузер заблокировал всплывающее окно с консолью. Разрешите поп-апы для этой страницы.', 'error');
        } else {
            showNotification('Открываем консоль ВМ во второй вкладке/окне', 'success');
        }
    } catch (e) {
        console.error('VM console API request failed:', e);
        showNotification('Не удалось обратиться к API консоли ВМ', 'error');
    }
}

function openVmSettings(vmName) {
    showNotification(`Открываем настройки ВМ "${vmName}"`, 'info');

    // Ищем реальные параметры ВМ из текущего списка
    const vm = vmList.find(v => v.name === vmName);
    const cpu = vm ? vm.cpu : 'неизвестно';
    const ram = vm ? vm.ram : 'неизвестно';
    const disk = vm ? vm.disk : 'неизвестно';
    const os = vm ? vm.os : 'неизвестно';
    const network = 'virbr0';

    alert(
        `Настройки ВМ "${vmName}":\n\n` +
        `- CPU: ${cpu}\n` +
        `- RAM: ${ram}\n` +
        `- Диск: ${disk}\n` +
        `- ОС: ${os}\n` +
        `- Сеть: ${network}\n\n` +
        `(Модальное окно редактирования будет добавлено позже)`
    );
}

function createVmSnapshot(vmName) {
    const snapshotName = prompt(`Введите имя для снапшота ВМ "${vmName}":`, `snapshot-${vmName}-${new Date().toISOString().slice(0,10)}`);
    
    if (snapshotName) {
        vmActionStats.snapshotted++;
        showNotification(`Создаем снапшот "${snapshotName}" для ВМ "${vmName}"...`, 'info');
        
        setTimeout(() => {
            showNotification(`Снапшот "${snapshotName}" создан успешно`, 'success');
        }, 2500);
    }
}

function deleteVm(vmName) {
    const confirmDelete = confirm(`ВНИМАНИЕ! Это действие необратимо.\n\nВы уверены, что хотите полностью удалить ВМ "${vmName}" со всеми данными?`);
    
    if (confirmDelete) {
        const doubleConfirm = confirm(`Последнее предупреждение!\n\nНажмите OK, чтобы окончательно удалить ВМ "${vmName}"`);
        
        if (doubleConfirm) {
            vmActionStats.deleted++;
            showNotification(`Удаляем ВМ "${vmName}" и все связанные данные...`, 'error');
            
            setTimeout(() => {
                showNotification(`ВМ "${vmName}" успешно удалена`, 'success');
                const index = vmList.findIndex(v => v.name === vmName);
                if (index !== -1) {
                    vmList.splice(index, 1);
                    renderVmTable();
                }
            }, 3000);
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-600 border-green-500',
        error: 'bg-red-600 border-red-500',
        warning: 'bg-yellow-600 border-yellow-500',
        info: 'bg-blue-600 border-blue-500'
    };
    
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg border-l-4 text-white z-50 transform transition-transform duration-300 ${colors[type]}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('main-content');
    
    sidebar.classList.toggle('-translate-x-full');
    content.classList.toggle('ml-64');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateUserInfo();
    
    // Load saved page or default to dashboard
    const currentPage = localStorage.getItem('currentPage') || 'dashboard';
    showPage(currentPage);
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        const authModal = document.getElementById('authModal');
        const settingsModal = document.getElementById('settingsModal');
        
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
        
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
});