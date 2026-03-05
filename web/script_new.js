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
                    <h3 class="text-lg font-semibold text-white mb-4">Недавняя активность</h3>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z"></path>
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
                        <span class="text-gray-400">5 машин • 3 запущено</span>
                        <button class="btn-secondary flex items-center space-x-2">
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
                            <tbody>
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-4 px-6 text-gray-300">1</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span class="text-white font-medium">ci-test-vm-clone</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span class="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded border border-red-600">Stopped</span>
                                    </td>
                                    <td class="py-4 px-6 text-gray-300">2 vCPU</td>
                                    <td class="py-4 px-6 text-gray-300">2048 MB</td>
                                    <td class="py-4 px-6 text-gray-300">0 GB</td>
                                    <td class="py-4 px-6 text-gray-300">linux</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-1">
                                            ${generateVmButtons('ci-test-vm-clone', 'Stopped')}
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-4 px-6 text-gray-300">2</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span class="text-white font-medium">ci-test-vm</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span class="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded border border-red-600">Stopped</span>
                                    </td>
                                    <td class="py-4 px-6 text-gray-300">2 vCPU</td>
                                    <td class="py-4 px-6 text-gray-300">4096 MB</td>
                                    <td class="py-4 px-6 text-gray-300">0 GB</td>
                                    <td class="py-4 px-6 text-gray-300">linux</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-1">
                                            ${generateVmButtons('ci-test-vm', 'Stopped')}
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-4 px-6 text-gray-300">3</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span class="text-white font-medium">aaaaa</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Running</span>
                                    </td>
                                    <td class="py-4 px-6 text-gray-300">2 vCPU</td>
                                    <td class="py-4 px-6 text-gray-300">2048 MB</td>
                                    <td class="py-4 px-6 text-gray-300">6 GB</td>
                                    <td class="py-4 px-6 text-gray-300">linux</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-1">
                                            ${generateVmButtons('aaaaa', 'Running')}
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-4 px-6 text-gray-300">4</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span class="text-white font-medium">вввввв</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Running</span>
                                    </td>
                                    <td class="py-4 px-6 text-gray-300">2 vCPU</td>
                                    <td class="py-4 px-6 text-gray-300">2048 MB</td>
                                    <td class="py-4 px-6 text-gray-300">0 GB</td>
                                    <td class="py-4 px-6 text-gray-300">linux</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-1">
                                            ${generateVmButtons('вввввв', 'Running')}
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td class="py-4 px-6 text-gray-300">5</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span class="text-white font-medium">ывавыа3</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span class="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-600">Running</span>
                                    </td>
                                    <td class="py-4 px-6 text-gray-300">2 vCPU</td>
                                    <td class="py-4 px-6 text-gray-300">2048 MB</td>
                                    <td class="py-4 px-6 text-gray-300">0 GB</td>
                                    <td class="py-4 px-6 text-gray-300">linux</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center space-x-1">
                                            ${generateVmButtons('ывавыа3', 'Running')}
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
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">Снапшоты</h2>
                <button class="btn-primary">Создать снапшот</button>
            </div>
            <div class="card">
                <p class="text-gray-300">Управление снапшотами виртуальных машин</p>
            </div>
        </div>
    `;
}

// Function to generate network content
function generateNetworkContent() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">Сетевая конфигурация</h2>
                <button class="btn-primary">Создать сеть</button>
            </div>
            <div class="card">
                <p class="text-gray-300">Настройки сети и виртуальных интерфейсов</p>
            </div>
        </div>
    `;
}

// Function to generate storage content
function generateStorageContent() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white">Хранилище</h2>
                <button class="btn-primary">Добавить том</button>
            </div>
            <div class="card">
                <p class="text-gray-300">Управление дисковыми томами и хранилищем</p>
            </div>
        </div>
    `;
}

// Navigation function
function showPage(pageId) {
    const page = pages[pageId];
    if (!page) return;
    
    try {
        document.getElementById('content').innerHTML = page.content();
        
        // Update active tab
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('border-blue-500', 'text-blue-400', 'bg-blue-500/10');
            link.classList.add('text-gray-300');
        });
        
        const activeLink = document.querySelector(`[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-gray-300');
            activeLink.classList.add('border-blue-500', 'text-blue-400', 'bg-blue-500/10');
        }
        
        // Save current page
        localStorage.setItem('currentPage', pageId);
        
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = '<div class="card text-red-400">Ошибка загрузки страницы</div>';
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
    const userInfo = document.querySelector('.user-info');
    
    if (isAuth && username) {
        userInfo.innerHTML = `
            <span class="text-gray-300">Пользователь: ${username}</span>
            <button onclick="logout()" class="text-red-400 hover:text-red-300 ml-2">
                Выход
            </button>
        `;
    } else {
        userInfo.innerHTML = `
            <button onclick="toggleAuthModal()" class="text-blue-400 hover:text-blue-300">
                Вход
            </button>
        `;
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

function saveSettings() {
    showNotification('Настройки сохранены', 'success');
    toggleSettingsModal();
}

// VM management functions
function startVm(vmName) {
    showNotification(`Запуск ВМ "${vmName}"`, 'success');
}

function stopVm(vmName) {
    showNotification(`Остановка ВМ "${vmName}"`, 'warning');
}

function restartVm(vmName) {
    showNotification(`Перезапуск ВМ "${vmName}"`, 'info');
}

function pauseVm(vmName) {
    showNotification(`Пауза ВМ "${vmName}"`, 'warning');
}

function openVmConsole(vmName) {
    showNotification(`Открытие консоли ВМ "${vmName}"`, 'info');
}

function openVmSettings(vmName) {
    showNotification(`Настройки ВМ "${vmName}"`, 'info');
}

function createVmSnapshot(vmName) {
    showNotification(`Создание снапшота для ВМ "${vmName}"`, 'success');
}

function deleteVm(vmName) {
    if (confirm(`Вы уверены, что хотите удалить ВМ "${vmName}"?`)) {
        showNotification(`Удаление ВМ "${vmName}"`, 'error');
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