// Global data storage
let networkData = {
    virtualNetworks: [
        {
            id: 1,
            name: 'vmbr0',
            status: 'active',
            type: 'Bridge',
            vlan: '-',
            subnet: '192.168.1.0/24',
            active: 8
        },
        {
            id: 2,
            name: 'vmbr1',
            status: 'active',
            type: 'Bridge',
            vlan: '100',
            subnet: '10.0.0.0/16',
            active: 3
        }
    ],
    bridges: [
        {
            id: 1,
            name: 'br0',
            status: 'up',
            interfaces: 'eth0, eth1',
            stp: true,
            ip: '192.168.1.10',
            mask: '255.255.255.0'
        },
        {
            id: 2,
            name: 'br1',
            status: 'up',
            interfaces: 'eth2',
            stp: false,
            ip: '10.0.1.1',
            mask: '255.255.0.0'
        }
    ],
    interfaces: [
        {
            id: 1,
            name: 'eth0',
            status: 'up',
            type: 'Physical',
            ip: '192.168.1.100',
            mac: '00:50:56:aa:bb:cc',
            speed: '1 Gbps'
        },
        {
            id: 2,
            name: 'eth1',
            status: 'up',
            type: 'Physical',
            ip: '192.168.2.100',
            mac: '00:50:56:aa:bb:dd',
            speed: '1 Gbps'
        },
        {
            id: 3,
            name: 'eth2',
            status: 'down',
            type: 'Physical',
            ip: '-',
            mac: '00:50:56:aa:bb:ee',
            speed: '-'
        }
    ]
};

let storageData = {
    volumes: [
        {
            id: 1,
            name: 'vm-data-volume',
            status: 'available',
            size: '100 GB',
            type: 'SSD',
            pool: 'main-pool',
            attachedTo: 'vm-web-01'
        },
        {
            id: 2,
            name: 'backup-volume',
            status: 'available',
            size: '500 GB',
            type: 'HDD',
            pool: 'backup-pool',
            attachedTo: '-'
        }
    ],
    storagePools: [
        {
            id: 1,
            name: 'main-pool',
            status: 'online',
            type: 'ZFS',
            totalSize: '2 TB',
            usedSize: '800 GB',
            freeSize: '1.2 TB'
        },
        {
            id: 2,
            name: 'backup-pool',
            status: 'online',
            type: 'EXT4',
            totalSize: '4 TB',
            usedSize: '1.5 TB',
            freeSize: '2.5 TB'
        }
    ],
    disks: [
        {
            id: 1,
            name: '/dev/sda',
            status: 'active',
            type: 'SSD',
            size: '1 TB',
            health: 'Good',
            pool: 'main-pool'
        },
        {
            id: 2,
            name: '/dev/sdb',
            status: 'active',
            type: 'SSD',
            size: '1 TB',
            health: 'Good',
            pool: 'main-pool'
        },
        {
            id: 3,
            name: '/dev/sdc',
            status: 'active',
            type: 'HDD',
            size: '4 TB',
            health: 'Good',
            pool: 'backup-pool'
        }
    ]
};

let snapshotsData = {
    snapshots: [
        {
            id: 1,
            name: 'vm-web-01-initial',
            vmName: 'vm-web-01',
            description: 'Начальная конфигурация веб-сервера',
            size: '2.5 GB',
            createdDate: '2024-03-15 10:30:00',
            status: 'active',
            type: 'manual'
        },
        {
            id: 2,
            name: 'vm-db-01-backup',
            vmName: 'vm-db-01',
            description: 'Снапшот перед обновлением БД',
            size: '5.8 GB',
            createdDate: '2024-03-14 22:15:00',
            status: 'active',
            type: 'scheduled'
        },
        {
            id: 3,
            name: 'vm-app-01-stable',
            vmName: 'vm-app-01',
            description: 'Стабильная версия приложения',
            size: '3.2 GB',
            createdDate: '2024-03-13 14:45:00',
            status: 'archived',
            type: 'manual'
        }
    ]
};

let imagesData = {
    images: []
};

// Load data from localStorage on page load
function loadNetworkData() {
    const savedData = localStorage.getItem('networkData');
    if (savedData) {
        try {
            networkData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading network data:', e);
        }
    }
}

function loadStorageData() {
    const savedData = localStorage.getItem('storageData');
    if (savedData) {
        try {
            storageData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading storage data:', e);
        }
    }
}

function loadSnapshotsData() {
    const savedData = localStorage.getItem('snapshotsData');
    if (savedData) {
        try {
            snapshotsData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading snapshots data:', e);
        }
    }
}

function loadImagesData() {
    const savedData = localStorage.getItem('imagesData');
    if (savedData) {
        try {
            imagesData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading images data:', e);
        }
    }
}

// Save data to localStorage
function saveNetworkData() {
    localStorage.setItem('networkData', JSON.stringify(networkData));
}

function saveStorageData() {
    localStorage.setItem('storageData', JSON.stringify(storageData));
}

function saveSnapshotsData() {
    localStorage.setItem('snapshotsData', JSON.stringify(snapshotsData));
}

function saveImagesData() {
    localStorage.setItem('imagesData', JSON.stringify(imagesData));
}

// Function to generate dashboard content
function generateDashboardContent() {
    const imageCount = imagesData.images.length;
    
    return `
            <div class="space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-medium text-gray-400">Общие коры CPU</h3>
                                <p class="text-2xl font-bold text-white mt-1">96</p>
                                <p class="text-sm text-gray-400 mt-1">На 3 кластерах</p>
                            </div>
                            <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-medium text-gray-400">Общая RAM</h3>
                                <p class="text-2xl font-bold text-white mt-1">393 GB</p>
                                <p class="text-sm text-gray-400 mt-1">На 9 серверах</p>
                            </div>
                            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-medium text-gray-400">Виртуальные машины</h3>
                                <p class="text-2xl font-bold text-white mt-1">2</p>
                                <p class="text-sm text-gray-400 mt-1">Остановлены</p>
                            </div>
                            <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-medium text-gray-400">Образы</h3>
                                <p class="text-2xl font-bold text-white mt-1">${imageCount}</p>
                                <p class="text-sm text-gray-400 mt-1">ISO, QCOW2, IMG</p>
                            </div>
                            <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <h2 class="text-xl font-semibold text-white mb-4">Быстрые действия</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button class="btn-primary flex items-center justify-center space-x-2" onclick="showPage('vms')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Создать ВМ</span>
                        </button>
                        <button class="btn-secondary flex items-center justify-center space-x-2" onclick="showPage('images')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span>Загрузить образ</span>
                        </button>
                        <button class="btn-secondary flex items-center justify-center space-x-2" onclick="showPage('servers')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Добавить сервер</span>
                        </button>
                        <button class="btn-secondary flex items-center justify-center space-x-2" onclick="showPage('clusters')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Создать кластер</span>
                        </button>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="card">
                    <h2 class="text-xl font-semibold text-white mb-4">Последняя активность</h2>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between py-2">
                            <span class="text-gray-300">ВМ "вм1" остановлена</span>
                            <span class="text-sm text-gray-400">2 минуты назад</span>
                        </div>
                        <div class="flex items-center justify-between py-2">
                            <span class="text-gray-300">Кластер "ci-cluster" подключен</span>
                            <span class="text-sm text-gray-400">1 час назад</span>
                        </div>
                        <div class="flex items-center justify-between py-2">
                            <span class="text-gray-300">Сервер "node2" в сети</span>
                            <span class="text-sm text-gray-400">3 часа назад</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
}

// Page data and state
const pages = {
    dashboard: {
        title: 'Панель индикаторов',
        content: () => generateDashboardContent()
    },
    vms: {
        title: 'Виртуальные машины',
        content: () => generateVmsContent()
    },
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
                                            <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Запустить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Запустить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
        `
    },
    clusters: {
        title: 'Кластеры',
        content: () => generateClustersContent()
    },
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-semibold text-white">Кластеры</h2>
                    <button class="btn-primary">Добавить кластер</button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div class="card hover:bg-gray-700 transition-colors cursor-pointer">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-white">cl1</h3>
                                    <p class="text-sm text-gray-400">proxmox</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                <span class="text-sm text-gray-300">Онлайн</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <span class="block text-sm text-gray-400">CPU</span>
                                <span class="text-white font-medium">32 ядер</span>
                            </div>
                            <div>
                                <span class="block text-sm text-gray-400">ОП</span>
                                <span class="text-white font-medium">128 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    servers: {
        title: 'Серверы',
        content: () => generateServersContent()
    },
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-semibold text-white">Серверы</h2>
                    <button class="btn-primary">Добавить сервер</button>
                </div>
                <div class="card">
                    <p class="text-gray-300">Список серверов и их метрики</p>
                </div>
            </div>
        `
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

// Function to generate network page content
function generateNetworkContent() {
    const totalCount = networkData.networks.length + networkData.bridges.length + networkData.interfaces.length;
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button onclick="openModal('networkModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Виртуальная сеть</span>
                    </button>
                    <button onclick="openModal('bridgeModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <span>Мост</span>
                    </button>
                    <button onclick="openModal('interfaceModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                        </svg>
                        <span>Интерфейс</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">${totalCount} ${totalCount === 1 ? 'элемент' : totalCount < 5 ? 'элемента' : 'элементов'}</span>
                    <button onclick="loadNetworkData(); showPage('network')" class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Virtual Networks -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Виртуальные сети</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">VLAN</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Подсеть</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Активные</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="virtualNetworksTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bridges -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Мосты</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Интерфейсы</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">STP</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Маска</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="bridgesTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Network Interfaces -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Сетевые интерфейсы</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">MAC</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Скорость</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="interfacesTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Function to generate snapshots page content
function generateSnapshotsContent() {
    const snapshotCount = snapshotsData.snapshots.length;
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button onclick="openModal('snapshotModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        </svg>
                        <span>Создать снапшот</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">${snapshotCount} ${snapshotCount === 1 ? 'снапшот' : snapshotCount < 5 ? 'снапшота' : 'снапшотов'}</span>
                    <button onclick="loadSnapshotsData(); showPage('snapshots')" class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Snapshots Table -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Снапшоты</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">№</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ВМ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Описание</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Размер</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата создания</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="snapshotsTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Function to generate images page content
function generateImagesContent() {
    const imageCount = imagesData.images.length;
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button onclick="openModal('fileUploadModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span>Загрузить файл</span>
                    </button>
                    <button onclick="openModal('urlUploadModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        <span>Загрузить по URL</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">${imageCount} ${imageCount === 1 ? 'образ' : imageCount < 5 ? 'образа' : 'образов'}</span>
                    <button onclick="refreshImages()" class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Images Table -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Образы</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">№</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя файла</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Размер</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата загрузки</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Источник</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="imagesTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
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
    }
}

// Function to generate VMs content
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
                                            <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Запустить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Запустить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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
                                            <button class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Остановить">
                                                <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors" title="Перезапуск">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors" title="Консоль">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Заморозить">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                            </button>
                                            <button class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Снимок">
                                                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
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

// Function to generate clusters content
function generateClustersContent() {
    return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex space-x-3">
                        <button class="btn-primary">Добавить кластер</button>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-400">1 кластер</span>
                        <button class="btn-secondary flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <span>Обновить</span>
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div class="card hover:bg-gray-700 transition-colors cursor-pointer">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-white">cl1</h3>
                                    <p class="text-sm text-gray-400">proxmox</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                <span class="text-sm text-gray-300">Онлайн</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <span class="block text-sm text-gray-400">CPU</span>
                                <span class="text-white font-medium">32 ядер</span>
                            </div>
                            <div>
                                <span class="block text-sm text-gray-400">ОП</span>
                                <span class="text-white font-medium">128 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
}

// Function to generate servers content
function generateServersContent() {
    return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex space-x-3">
                        <button class="btn-primary">Добавить сервер</button>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-400">0 серверов</span>
                        <button class="btn-secondary flex items-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <span>Обновить</span>
                        </button>
                    </div>
                </div>
                <div class="card">
                    <p class="text-gray-300">Список серверов и их метрики</p>
                </div>
            </div>
        `;
}

// Function to generate storage page content
function generateStorageContent() {
    const totalCount = storageData.volumes.length + storageData.pools.length + storageData.disks.length;
    return `
        <div class="space-y-6">
            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
                <div class="flex space-x-3">
                    <button onclick="openModal('volumeModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span>Создать том</span>
                    </button>
                    <button onclick="openModal('poolModal')" class="btn-primary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                        </svg>
                        <span>Создать пул</span>
                    </button>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-400">${totalCount} ${totalCount === 1 ? 'элемент' : totalCount < 5 ? 'элемента' : 'элементов'}</span>
                    <button onclick="loadStorageData(); showPage('storage')" class="btn-secondary flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            <!-- Volumes -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Тома</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Размер</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Пул</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Подключен к</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="volumesTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Storage Pools -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Пулы хранения</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Общий размер</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Использовано</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Свободно</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="poolsTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Physical Disks -->
            <div class="card">
                <h3 class="text-lg font-semibold text-white mb-4">Физические диски</h3>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Устройство</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Размер</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Здоровье</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Пул</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="disksTable" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById(modalId).classList.add('flex');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById(modalId).classList.remove('flex');
}

// Network creation functions
function createNetwork(event) {
    event.preventDefault();
    
    const name = document.getElementById('networkName').value;
    const type = document.getElementById('networkType').value;
    const vlan = document.getElementById('networkVlan').value || '-';
    const subnet = document.getElementById('networkSubnet').value;
    
    // Get next available ID
    const nextId = Math.max(...networkData.virtualNetworks.map(n => n.id), 0) + 1;
    
    // Create new network object
    const newNetwork = {
        id: nextId,
        name: name,
        status: 'active',
        type: type,
        vlan: vlan,
        subnet: subnet,
        active: 0
    };
    
    // Add to network data
    networkData.virtualNetworks.push(newNetwork);
    saveNetworkData();
    
    // Refresh table
    renderVirtualNetworksTable();
    
    // Show success notification
    showNotification(`Виртуальная сеть "${name}" создана`, 'success');
    
    // Close modal and reset form
    closeModal('networkModal');
    event.target.reset();
}

function createBridge(event) {
    event.preventDefault();
    
    const name = document.getElementById('bridgeName').value;
    const interfaces = document.getElementById('bridgeInterfaces').value || '-';
    const stp = document.getElementById('bridgeStp').checked;
    const ip = document.getElementById('bridgeIp').value || '-';
    const mask = document.getElementById('bridgeMask').value || '-';
    
    // Get next available ID
    const nextId = Math.max(...networkData.bridges.map(b => b.id), 0) + 1;
    
    // Create new bridge object
    const newBridge = {
        id: nextId,
        name: name,
        status: 'up',
        interfaces: interfaces,
        stp: stp,
        ip: ip,
        mask: mask
    };
    
    // Add to bridge data
    networkData.bridges.push(newBridge);
    saveNetworkData();
    
    // Refresh table
    renderBridgesTable();
    
    // Show success message
    showNotification(`Мост "${name}" создан`, 'success');
    
    // Close modal and reset form
    closeModal('bridgeModal');
    event.target.reset();
}

function createInterface(event) {
    event.preventDefault();
    
    const name = document.getElementById('interfaceName').value;
    const type = document.getElementById('interfaceType').value;
    const ip = document.getElementById('interfaceIp').value || '-';
    const mac = document.getElementById('interfaceMac').value;
    const speedValue = document.getElementById('interfaceSpeed').value || '1000';
    
    // Convert speed value to display format
    let speedDisplay;
    switch(speedValue) {
        case '100':
            speedDisplay = '100 Mbps';
            break;
        case '1000':
            speedDisplay = '1 Gbps';
            break;
        case '10000':
            speedDisplay = '10 Gbps';
            break;
        default:
            speedDisplay = '1 Gbps';
    }
    
    // Get next available ID
    const nextId = Math.max(...networkData.interfaces.map(i => i.id), 0) + 1;
    
    // Create new interface object
    const newInterface = {
        id: nextId,
        name: name,
        status: 'up',
        type: type,
        ip: ip,
        mac: mac,
        speed: speedDisplay
    };
    
    // Add to interface data
    networkData.interfaces.push(newInterface);
    saveNetworkData();
    
    // Refresh table
    renderInterfacesTable();
    
    // Show success message
    showNotification(`Интерфейс "${name}" создан`, 'success');
    
    // Close modal and reset form
    closeModal('interfaceModal');
    event.target.reset();
}

// Storage creation functions
function createVolume(event) {
    event.preventDefault();
    
    const name = document.getElementById('volumeName').value;
    const size = document.getElementById('volumeSize').value;
    const type = document.getElementById('volumeType').value;
    const pool = document.getElementById('volumePool').value;
    
    // Get next available ID
    const nextId = Math.max(...storageData.volumes.map(v => v.id), 0) + 1;
    
    // Create new volume object
    const newVolume = {
        id: nextId,
        name: name,
        status: 'active',
        size: size,
        type: type,
        pool: pool,
        attachedTo: '-'
    };
    
    // Add to storage data
    storageData.volumes.push(newVolume);
    saveStorageData();
    
    // Refresh table
    renderVolumesTable();
    
    // Show success message
    showNotification(`Том "${name}" создан`, 'success');
    
    // Close modal and reset form
    closeModal('volumeModal');
    event.target.reset();
}

function createPool(event) {
    event.preventDefault();
    
    const name = document.getElementById('poolName').value;
    const type = document.getElementById('poolType').value;
    const totalSize = document.getElementById('poolSize').value;
    const devices = document.getElementById('poolDevices').value || '-';
    
    // Calculate usage (default to some initial values)
    const usedSize = '0 GB';
    const freeSize = totalSize;
    
    // Get next available ID
    const nextId = Math.max(...storageData.storagePools.map(p => p.id), 0) + 1;
    
    // Create new pool object
    const newPool = {
        id: nextId,
        name: name,
        status: 'active',
        type: type,
        totalSize: totalSize,
        usedSize: usedSize,
        freeSize: freeSize,
        devices: devices
    };
    
    // Add to storage data
    storageData.storagePools.push(newPool);
    saveStorageData();
    
    // Refresh table
    renderPoolsTable();
    
    // Show success message
    showNotification(`Пул "${name}" создан`, 'success');
    
    // Close modal and reset form
    closeModal('poolModal');
    event.target.reset();
}

function createSnapshot(event) {
    event.preventDefault();
    
    const name = document.getElementById('snapshotName').value;
    const vmName = document.getElementById('snapshotVmName').value;
    const description = document.getElementById('snapshotDescription').value || 'Пользовательский снапшот';
    const type = document.getElementById('snapshotType').value;
    
    // Generate current date
    const now = new Date();
    const createdDate = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Simulate size calculation (random for demo)
    const sizeGB = (Math.random() * 5 + 1).toFixed(1);
    const size = `${sizeGB} GB`;
    
    // Get next available ID
    const nextId = Math.max(...snapshotsData.snapshots.map(s => s.id), 0) + 1;
    
    // Create new snapshot object
    const newSnapshot = {
        id: nextId,
        name: name,
        vmName: vmName,
        description: description,
        size: size,
        createdDate: createdDate,
        status: 'active',
        type: type
    };
    
    // Add to snapshots data
    snapshotsData.snapshots.push(newSnapshot);
    saveSnapshotsData();
    
    // Refresh table
    renderSnapshotsTable();
    
    // Show success message
    showNotification(`Снапшот "${name}" создан для VM "${vmName}"`, 'success');
    
    // Close modal and reset form
    closeModal('snapshotModal');
    event.target.reset();
}

// Function to render dynamic storage tables
function renderStorageTables() {
    renderVolumesTable();
    renderPoolsTable();
    renderDisksTable();
}

// Generate Volumes table content
function renderVolumesTable() {
    const tableBody = document.querySelector('#volumesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = storageData.volumes.map((volume, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${volume.name}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    ${volume.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${volume.size}</td>
            <td class="px-6 py-3 text-left">${volume.type}</td>
            <td class="px-6 py-3 text-left">${volume.pool}</td>
            <td class="px-6 py-3 text-left">${volume.attachedTo}</td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="editVolume(${volume.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteVolume(${volume.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                    <button onclick="toggleVolumeAttach(${volume.id})" class="w-8 h-8 ${volume.attachedTo !== '-' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-xs transition-colors" title="${volume.attachedTo !== '-' ? 'Отключить' : 'Подключить'}">
                        ${volume.attachedTo !== '-' ? 
                            `<svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                            </svg>` : 
                            `<svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path>
                            </svg>`
                        }
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Generate Storage Pools table content
function renderPoolsTable() {
    const tableBody = document.querySelector('#poolsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = storageData.storagePools.map((pool, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${pool.name}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    ${pool.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${pool.type}</td>
            <td class="px-6 py-3 text-left">${pool.totalSize}</td>
            <td class="px-6 py-3 text-left">${pool.usedSize}</td>
            <td class="px-6 py-3 text-left">${pool.freeSize}</td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="editPool(${pool.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button onclick="deletePool(${pool.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Generate Disks table content
function renderDisksTable() {
    const tableBody = document.querySelector('#disksTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = storageData.disks.map((disk, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${disk.name}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    ${disk.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${disk.type}</td>
            <td class="px-6 py-3 text-left">${disk.size}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    ${disk.health}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${disk.pool}</td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="editDisk(${disk.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button onclick="viewDiskInfo(${disk.id})" class="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors" title="Информация">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Function to render dynamic snapshots tables
function renderSnapshotsTable() {
    const tableBody = document.querySelector('#snapshotsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = snapshotsData.snapshots.map((snapshot, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${snapshot.name}</td>
            <td class="px-6 py-3 text-left">${snapshot.vmName}</td>
            <td class="px-6 py-3 text-left">${snapshot.description}</td>
            <td class="px-6 py-3 text-left">${snapshot.size}</td>
            <td class="px-6 py-3 text-left">${snapshot.createdDate}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${snapshot.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}">
                    ${snapshot.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${snapshot.type === 'manual' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}">
                    ${snapshot.type}
                </span>
            </td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="restoreSnapshot(${snapshot.id})" class="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" title="Восстановить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </button>
                    <button onclick="cloneSnapshot(${snapshot.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Клонировать">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <button onclick="editSnapshot(${snapshot.id})" class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Редактировать">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteSnapshot(${snapshot.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Function to render images table
function renderImagesTable() {
    const tableBody = document.querySelector('#imagesTable');
    if (!tableBody) return;
    
    if (imagesData.images.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="py-12 text-center">
                    <div class="flex flex-col items-center justify-center text-gray-400">
                        <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium mb-2">Нет образов</h3>
                        <p>Загрузите ISO или QCOW2 образ</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = imagesData.images.map((image, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${image.name}</td>
            <td class="px-6 py-3 text-left">${image.size}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${image.type === 'ISO' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}">
                    ${image.type}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${image.uploadDate}</td>
            <td class="px-6 py-3 text-left">
                ${image.status === 'uploading' 
                    ? `<div class="flex items-center space-x-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">Загрузка</span>
                        <div class="w-20 bg-gray-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: ${Math.round(image.progress || 0)}%"></div>
                        </div>
                        <span class="text-xs text-gray-400">${Math.round(image.progress || 0)}%</span>
                       </div>`
                    : `<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">${image.status === 'ready' ? 'Готов' : image.status}</span>`
                }
            </td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${image.source && !image.source.startsWith('http') ? 'bg-gray-600 text-white' : 'bg-emerald-600 text-white'}" title="${image.source}">
                    ${getLastTwoFolders(image.source)}
                </span>
            </td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="downloadImage(${image.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Скачать">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </button>
                    <button onclick="editImage(${image.id})" class="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors" title="Редактировать">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteImage(${image.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

function renderNetworkTables() {
    renderVirtualNetworksTable();
    renderBridgesTable();
    renderInterfacesTable();
}

// Generate Virtual Networks table content
function renderVirtualNetworksTable() {
    const tableBody = document.querySelector('#virtualNetworksTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = networkData.virtualNetworks.map((network, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${network.name}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    ${network.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${network.type}</td>
            <td class="px-6 py-3 text-left">${network.vlan}</td>
            <td class="px-6 py-3 text-left">${network.subnet}</td>
            <td class="px-6 py-3 text-left">${network.active} VM</td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="editNetwork(${network.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteNetwork(${network.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                    <button onclick="toggleNetworkStatus(${network.id})" class="w-8 h-8 ${network.status === 'active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-xs transition-colors" title="${network.status === 'active' ? 'Деактивировать' : 'Активировать'}">
                        ${network.status === 'active' ? 
                            `<svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>` : 
                            `<svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                            </svg>`
                        }
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Generate Bridges table content
function renderBridgesTable() {
    const tableBody = document.querySelector('#bridgesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = networkData.bridges.map((bridge, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${bridge.name}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    ${bridge.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${bridge.interfaces}</td>
            <td class="px-6 py-3 text-left">${bridge.stp ? 'Включено' : 'Выключено'}</td>
            <td class="px-6 py-3 text-left">${bridge.ip}</td>
            <td class="px-6 py-3 text-left">${bridge.mask}</td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="editBridge(${bridge.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteBridge(${bridge.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                    <button onclick="toggleBridgeStatus(${bridge.id})" class="w-8 h-8 ${bridge.status === 'up' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-xs transition-colors" title="${bridge.status === 'up' ? 'Отключить' : 'Включить'}">
                        ${bridge.status === 'up' ? 
                            `<svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>` : 
                            `<svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                            </svg>`
                        }
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Generate Network Interfaces table content
function renderInterfacesTable() {
    const tableBody = document.querySelector('#interfacesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = networkData.interfaces.map((interface, index) => 
        `<tr class="border-b border-gray-700 hover:bg-gray-700/30">
            <td class="px-6 py-3 text-left">${index + 1}</td>
            <td class="px-6 py-3 text-left">${interface.name}</td>
            <td class="px-6 py-3 text-left">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${interface.status === 'up' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}">
                    ${interface.status}
                </span>
            </td>
            <td class="px-6 py-3 text-left">${interface.type}</td>
            <td class="px-6 py-3 text-left">${interface.ip}</td>
            <td class="px-6 py-3 text-left">${interface.mac}</td>
            <td class="px-6 py-3 text-left">${interface.speed}</td>
            <td class="px-6 py-3 text-left">
                <div class="flex items-center space-x-1">
                    <button onclick="editInterface(${interface.id})" class="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors" title="Настройки">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteInterface(${interface.id})" class="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors" title="Удалить">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                    <button onclick="toggleInterfaceStatus(${interface.id})" class="w-8 h-8 ${interface.status === 'up' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-xs transition-colors" title="${interface.status === 'up' ? 'Отключить' : 'Включить'}">
                        ${interface.status === 'up' ? 
                            `<svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>` : 
                            `<svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                            </svg>`
                        }
                    </button>
                </div>
            </td>
        </tr>`
    ).join('');
}

// Action button handlers for Virtual Networks
function editNetwork(id) {
    const network = networkData.virtualNetworks.find(n => n.id === id);
    if (network) {
        const newName = prompt(`Редактировать имя сети:`, network.name);
        if (newName && newName.trim() && newName !== network.name) {
            network.name = newName.trim();
            saveNetworkData();
            renderVirtualNetworksTable();
            showNotification(`Сеть переименована в "${newName}"`, 'success');
        }
    }
}

function deleteNetwork(id) {
    const network = networkData.virtualNetworks.find(n => n.id === id);
    if (network && confirm(`Удалить виртуальную сеть "${network.name}"?`)) {
        networkData.virtualNetworks = networkData.virtualNetworks.filter(n => n.id !== id);
        saveNetworkData();
        renderVirtualNetworksTable();
        showNotification('Виртуальная сеть удалена', 'success');
    }
}

function toggleNetworkStatus(id) {
    const network = networkData.virtualNetworks.find(n => n.id === id);
    if (network) {
        network.status = network.status === 'active' ? 'inactive' : 'active';
        saveNetworkData();
        renderVirtualNetworksTable();
        showNotification(`Сеть ${network.status === 'active' ? 'активирована' : 'деактивирована'}`, 'success');
    }
}

// Action button handlers for Bridges
function editBridge(id) {
    const bridge = networkData.bridges.find(b => b.id === id);
    if (bridge) {
        const newName = prompt(`Редактировать имя моста:`, bridge.name);
        if (newName && newName.trim() && newName !== bridge.name) {
            bridge.name = newName.trim();
            saveNetworkData();
            renderBridgesTable();
            showNotification(`Мост переименован в "${newName}"`, 'success');
        }
    }
}

function deleteBridge(id) {
    const bridge = networkData.bridges.find(b => b.id === id);
    if (bridge && confirm(`Удалить мост "${bridge.name}"?`)) {
        networkData.bridges = networkData.bridges.filter(b => b.id !== id);
        saveNetworkData();
        renderBridgesTable();
        showNotification('Мост удален', 'success');
    }
}

function toggleBridgeStatus(id) {
    const bridge = networkData.bridges.find(b => b.id === id);
    if (bridge) {
        bridge.status = bridge.status === 'up' ? 'down' : 'up';
        saveNetworkData();
        renderBridgesTable();
        showNotification(`Мост ${bridge.status === 'up' ? 'включен' : 'отключен'}`, 'success');
    }
}

// Action button handlers for Interfaces
function editInterface(id) {
    const interface = networkData.interfaces.find(i => i.id === id);
    if (interface) {
        const newName = prompt(`Редактировать имя интерфейса:`, interface.name);
        if (newName && newName.trim() && newName !== interface.name) {
            interface.name = newName.trim();
            saveNetworkData();
            renderInterfacesTable();
            showNotification(`Интерфейс переименован в "${newName}"`, 'success');
        }
    }
}

function deleteInterface(id) {
    const interface = networkData.interfaces.find(i => i.id === id);
    if (interface && confirm(`Удалить интерфейс "${interface.name}"?`)) {
        networkData.interfaces = networkData.interfaces.filter(i => i.id !== id);
        saveNetworkData();
        renderInterfacesTable();
        showNotification('Интерфейс удален', 'success');
    }
}

function toggleInterfaceStatus(id) {
    const interface = networkData.interfaces.find(i => i.id === id);
    if (interface) {
        interface.status = interface.status === 'up' ? 'down' : 'up';
        saveNetworkData();
        renderInterfacesTable();
        showNotification(`Интерфейс ${interface.status === 'up' ? 'включен' : 'отключен'}`, 'success');
    }
}

// Action button handlers for Storage - Volumes
function editVolume(id) {
    const volume = storageData.volumes.find(v => v.id === id);
    if (volume) {
        const newName = prompt(`Редактировать имя тома:`, volume.name);
        if (newName && newName.trim() && newName !== volume.name) {
            volume.name = newName.trim();
            saveStorageData();
            renderVolumesTable();
            showNotification(`Том переименован в "${newName}"`, 'success');
        }
    }
}

function deleteVolume(id) {
    const volume = storageData.volumes.find(v => v.id === id);
    if (volume && confirm(`Удалить том "${volume.name}"?`)) {
        storageData.volumes = storageData.volumes.filter(v => v.id !== id);
        saveStorageData();
        renderVolumesTable();
        showNotification('Том удален', 'success');
    }
}

function toggleVolumeAttach(id) {
    const volume = storageData.volumes.find(v => v.id === id);
    if (volume) {
        if (volume.attachedTo !== '-') {
            volume.attachedTo = '-';
            showNotification(`Том "${volume.name}" отключен`, 'success');
        } else {
            const vmName = prompt('Введите имя VM для подключения:');
            if (vmName && vmName.trim()) {
                volume.attachedTo = vmName.trim();
                showNotification(`Том "${volume.name}" подключен к ${vmName}`, 'success');
            }
        }
        saveStorageData();
        renderVolumesTable();
    }
}

// Action button handlers for Storage - Pools
function editPool(id) {
    const pool = storageData.storagePools.find(p => p.id === id);
    if (pool) {
        const newName = prompt(`Редактировать имя пула:`, pool.name);
        if (newName && newName.trim() && newName !== pool.name) {
            pool.name = newName.trim();
            saveStorageData();
            renderPoolsTable();
            showNotification(`Пул переименован в "${newName}"`, 'success');
        }
    }
}

function deletePool(id) {
    const pool = storageData.storagePools.find(p => p.id === id);
    if (pool && confirm(`Удалить пул "${pool.name}"?`)) {
        storageData.storagePools = storageData.storagePools.filter(p => p.id !== id);
        saveStorageData();
        renderPoolsTable();
        showNotification('Пул удален', 'success');
    }
}

// Action button handlers for Storage - Disks
function editDisk(id) {
    const disk = storageData.disks.find(d => d.id === id);
    if (disk) {
        const newName = prompt(`Редактировать имя диска:`, disk.name);
        if (newName && newName.trim() && newName !== disk.name) {
            disk.name = newName.trim();
            saveStorageData();
            renderDisksTable();
            showNotification(`Диск переименован в "${newName}"`, 'success');
        }
    }
}

function viewDiskInfo(id) {
    const disk = storageData.disks.find(d => d.id === id);
    if (disk) {
        alert(`Информация о диске:
Имя: ${disk.name}
Состояние: ${disk.status}
Тип: ${disk.type}
Размер: ${disk.size}
Здоровье: ${disk.health}
Пул: ${disk.pool}`);
    }
}

// Action button handlers for Snapshots
function restoreSnapshot(id) {
    const snapshot = snapshotsData.snapshots.find(s => s.id === id);
    if (snapshot && confirm(`Восстановить снапшот "${snapshot.name}" для VM "${snapshot.vmName}"?`)) {
        showNotification(`Снапшот "${snapshot.name}" восстанавливается для VM "${snapshot.vmName}"`, 'success');
    }
}

function cloneSnapshot(id) {
    const snapshot = snapshotsData.snapshots.find(s => s.id === id);
    if (snapshot) {
        const newVmName = prompt(`Введите имя для новой VM (склонированной из "${snapshot.name}"):`);
        if (newVmName && newVmName.trim()) {
            showNotification(`VM "${newVmName}" создается из снапшота "${snapshot.name}"`, 'success');
        }
    }
}

function editSnapshot(id) {
    const snapshot = snapshotsData.snapshots.find(s => s.id === id);
    if (snapshot) {
        const newDescription = prompt(`Редактировать описание снапшота:`, snapshot.description);
        if (newDescription !== null && newDescription.trim() !== snapshot.description) {
            snapshot.description = newDescription.trim();
            saveSnapshotsData();
            renderSnapshotsTable();
            showNotification(`Описание снапшота "${snapshot.name}" обновлено`, 'success');
        }
    }
}

function deleteSnapshot(id) {
    const snapshot = snapshotsData.snapshots.find(s => s.id === id);
    if (snapshot && confirm(`Удалить снапшот "${snapshot.name}"?`)) {
        snapshotsData.snapshots = snapshotsData.snapshots.filter(s => s.id !== id);
        saveSnapshotsData();
        renderSnapshotsTable();
        showNotification('Снапшот удален', 'success');
    }
}

// Function to extract last two folders from path
function getLastTwoFolders(fullPath) {
    if (!fullPath || fullPath === 'file' || fullPath === 'url') {
        return fullPath === 'file' ? 'Файл' : 'URL';
    }
    
    // Convert backslashes to forward slashes for consistency
    const normalizedPath = fullPath.replace(/\\/g, '/');
    
    // Split path by separator
    const pathParts = normalizedPath.split('/').filter(part => part.length > 0);
    
    // Return last two parts joined with separator
    if (pathParts.length >= 2) {
        return pathParts.slice(-2).join('\\');
    } else if (pathParts.length === 1) {
        return pathParts[0];
    }
    
    return 'Неизвестно';
}

// Action button handlers for Images
function downloadImage(id) {
    const image = imagesData.images.find(i => i.id === id);
    if (image) {
        // Create download link
        const downloadLink = document.createElement('a');
        
        if (image.source && image.source.startsWith('http')) {
            // For URL sources, redirect to the original URL
            downloadLink.href = image.source;
            downloadLink.target = '_blank';
        } else {
            // For file sources, create a text file with image information
            const imageInfo = `Образ: ${image.name}\nРазмер: ${image.size}\nТип: ${image.type}\nДата загрузки: ${image.uploadDate}\nИсточник: ${image.source}`;
            const blob = new Blob([imageInfo], { type: 'text/plain' });
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${image.name.replace(/\.[^.]+$/, '')}_info.txt`;
        }
        
        downloadLink.click();
        
        // Clean up URL object if created
        if (!image.source?.startsWith('http')) {
            setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);
        }
        
        showNotification(`Файл сохранён в Downloads. Переместите в C:\\Users\\Alexey\\Desktop\\min\\vNE\\Images`, 'info');
    }
}

function editImage(id) {
    const image = imagesData.images.find(i => i.id === id);
    if (image) {
        const newName = prompt(`Редактировать имя образа:`, image.name);
        if (newName && newName.trim() && newName !== image.name) {
            image.name = newName.trim();
            saveImagesData();
            renderImagesTable();
            showNotification(`Образ переименован в "${newName}"`, 'success');
        }
    }
}

function deleteImage(id) {
    const image = imagesData.images.find(i => i.id === id);
    if (image && confirm(`Удалить образ "${image.name}"? Это действие нельзя отменить.`)) {
        imagesData.images = imagesData.images.filter(i => i.id !== id);
        saveImagesData();
        renderImagesTable();
        showNotification('Образ удален', 'success');
    }
}

function refreshImages() {
    renderImagesTable();
    showNotification('Список образов обновлен', 'success');
}

function uploadFileImage(event) {
    event.preventDefault();
    
    const fileName = document.getElementById('imageFileName').value;
    const fileType = document.getElementById('imageFileType').value;
    const fileSize = document.getElementById('imageFileSize').value;
    const fileInput = document.querySelector('#fileUploadModal input[type="file"]');
    
    // Get file path and actual file size
    let filePath = 'file';
    let actualSize = fileSize;
    
    if (fileInput && fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];
        // Get actual file size
        const sizeInBytes = selectedFile.size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
        const sizeInGB = (sizeInBytes / (1024 * 1024 * 1024)).toFixed(1);
        
        // Format size appropriately
        actualSize = sizeInBytes > 1024 * 1024 * 1024 
            ? `${sizeInGB} GB` 
            : `${sizeInMB} MB`;
            
        // Simulate path based on file
        filePath = `C:\\Users\\Alexey\\Desktop\\min\\vNE\\Images\\${selectedFile.name}`;
    } else if (!actualSize) {
        // Only use random size if no file selected and no size specified
        actualSize = `${(Math.random() * 5 + 1).toFixed(1)} GB`;
        filePath = `C:\\Users\\Alexey\\Desktop\\min\\vNE\\Images\\${fileName}`;
    }
    
    // Get next available ID
    const nextId = Math.max(...imagesData.images.map(i => i.id), 0) + 1;
    
    // Generate current date
    const now = new Date();
    const uploadDate = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Create new image object with uploading status
    const newImage = {
        id: nextId,
        name: fileName,
        size: actualSize,
        type: fileType,
        format: fileType,
        uploadDate: uploadDate,
        status: 'uploading',
        source: filePath,
        progress: 0
    };
    
    // Add to images data
    imagesData.images.push(newImage);
    saveImagesData();
    
    // Refresh table
    renderImagesTable();
    
    // Simulate upload progress
    simulateDownloadProgress(nextId);
    
    // Show success message
    showNotification(`Загрузка образа "${fileName}" началась`, 'success');
    
    // Close modal and reset form
    closeModal('fileUploadModal');
    event.target.reset();
}

function uploadUrlImage(event) {
    event.preventDefault();
    
    const imageUrl = document.getElementById('imageUrl').value;
    const fileName = document.getElementById('urlFileName').value || imageUrl.split('/').pop();
    const fileType = document.getElementById('urlFileType').value;
    
    // Get next available ID
    const nextId = Math.max(...imagesData.images.map(i => i.id), 0) + 1;
    
    // Generate current date
    const now = new Date();
    const uploadDate = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Try to estimate file size from URL (this is approximate)
    let estimatedSize;
    try {
        // For demo purposes, we'll estimate based on file extension and common sizes
        const urlFileName = imageUrl.split('/').pop().toLowerCase();
        if (urlFileName.includes('ubuntu') || urlFileName.includes('debian')) {
            estimatedSize = '3.5 GB'; // Typical Linux ISO size
        } else if (urlFileName.includes('windows')) {
            estimatedSize = '5.2 GB'; // Typical Windows ISO size
        } else if (urlFileName.includes('centos') || urlFileName.includes('rhel')) {
            estimatedSize = '1.8 GB'; // Typical minimal Linux ISO
        } else {
            estimatedSize = `${(Math.random() * 8 + 1).toFixed(1)} GB`; // Fallback to random
        }
    } catch {
        estimatedSize = `${(Math.random() * 8 + 1).toFixed(1)} GB`;
    }
    
    // Create new image object with uploading status
    const newImage = {
        id: nextId,
        name: fileName,
        size: estimatedSize,
        type: fileType,
        format: fileType,
        uploadDate: uploadDate,
        status: 'uploading',
        source: imageUrl,
        progress: 0
    };
    
    // Add to images data
    imagesData.images.push(newImage);
    saveImagesData();
    
    // Refresh table
    renderImagesTable();
    
    // Simulate download progress
    simulateDownloadProgress(nextId);
    
    // Show success message
    showNotification(`Загрузка образа "${fileName}" началась`, 'success');
    
    // Close modal and reset form
    closeModal('urlUploadModal');
    event.target.reset();
}

function simulateDownloadProgress(imageId) {
    const image = imagesData.images.find(i => i.id === imageId);
    if (!image || image.status !== 'uploading') return;
    
    const interval = setInterval(() => {
        if (image.progress >= 100) {
            image.status = 'ready';
            delete image.progress;
            saveImagesData();
            renderImagesTable();
            showNotification(`Образ "${image.name}" загружен успешно`, 'success');
            clearInterval(interval);
            return;
        }
        
        image.progress += Math.random() * 15 + 5; // Increase by 5-20%
        if (image.progress > 100) image.progress = 100;
        
        saveImagesData();
        renderImagesTable();
    }, 1000);
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    }`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Show page function
function showPage(pageId) {
    const page = pages[pageId];
    if (page) {
        // Save current page to localStorage
        localStorage.setItem('currentPage', pageId);
        
        // Remove active class from all sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current page
        const currentItem = document.querySelector(`[onclick="showPage('${pageId}')"]`);
        if (currentItem) {
            currentItem.classList.add('active');
        }
        
        // Update page title
        document.getElementById('page-title').textContent = page.title;
        
        // Update page content
        const contentValue = typeof page.content === 'function' ? page.content() : page.content;
        document.getElementById('page-content').innerHTML = contentValue;
        
        // If it's dashboard page, ensure data is loaded
        if (pageId === 'dashboard') {
            loadImagesData(); // Load images data for dashboard stats
        }
        
        // If it's network page, render dynamic tables
        if (pageId === 'network') {
            loadNetworkData(); // Reload data from localStorage
            setTimeout(() => {
                renderNetworkTables();
            }, 100); // Small delay to ensure DOM is ready
        }
        
        // If it's storage page, render dynamic tables
        if (pageId === 'storage') {
            loadStorageData(); // Reload data from localStorage
            setTimeout(() => {
                renderStorageTables();
            }, 100); // Small delay to ensure DOM is ready
        }
        
        // If it's snapshots page, render dynamic tables
        if (pageId === 'snapshots') {
            loadSnapshotsData(); // Reload data from localStorage
            setTimeout(() => {
                renderSnapshotsTable();
            }, 100); // Small delay to ensure DOM is ready
        }
        
        // If it's images page, render dynamic tables
        if (pageId === 'images') {
            loadImagesData(); // Reload data from localStorage
            setTimeout(() => {
                // Refresh page content with updated data
                const updatedContent = generateImagesContent();
                document.getElementById('page-content').innerHTML = updatedContent;
                renderImagesTable();
            }, 50); // Reduced delay for faster response
        }
        
        // Update active menu item
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find the clicked menu item and make it active
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${pageId}'`)) {
                item.classList.add('active');
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load saved network, storage, and snapshots data first
    loadNetworkData();
    loadStorageData();
    loadSnapshotsData();
    
    // Restore saved page or load default page
    const savedPage = localStorage.getItem('currentPage');
    const pageToLoad = savedPage && pages[savedPage] ? savedPage : 'dashboard';
    
    showPage(pageToLoad);
    
    // Test API connection
    checkApiConnection();
});

// API connection test
async function checkApiConnection() {
    try {
        const response = await fetch('http://localhost:8000/api/health');
        if (response.ok) {
            const data = await response.json();
            console.log('Подключение к API:', data);
        }
    } catch (error) {
        console.log('Ошибка подключения к API:', error);
    }
}

// Sidebar toggle functionality
let sidebarCollapsed = false;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleText = document.getElementById('sidebar-toggle-text');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    const companyInfo = document.getElementById('company-info');
    const statusInfo = document.getElementById('status-info');
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        // Collapse sidebar
        sidebar.style.width = '64px';
        sidebar.style.minWidth = '64px';
        
        // Hide text in sidebar navigation items only
        sidebar.querySelectorAll('.sidebar-item span').forEach(span => {
            span.style.display = 'none';
        });
        
        // Hide logo text - find the span with 'CEE Hypervisor'
        const logoText = sidebar.querySelector('span.text-xl.font-bold.text-white');
        if (logoText) logoText.style.display = 'none';
        
        // Hide company info and status
        companyInfo.style.display = 'none';
        statusInfo.style.display = 'none';
        
        // Update toggle button - show only icon
        toggleText.style.display = 'none';
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>';
        
        // Adjust main content margin
        mainContent.style.marginLeft = '0';
        
    } else {
        // Expand sidebar
        sidebar.style.width = '256px'; // w-64 = 16rem = 256px
        sidebar.style.minWidth = '256px';
        
        // Show text in sidebar navigation items
        sidebar.querySelectorAll('.sidebar-item span').forEach(span => {
            span.style.display = '';
        });
        
        // Show logo text
        const logoText = sidebar.querySelector('span.text-xl.font-bold.text-white');
        if (logoText) logoText.style.display = '';
        
        // Show company info and status
        companyInfo.style.display = '';
        statusInfo.style.display = '';
        
        // Update toggle button - show icon and text
        toggleText.style.display = '';
        toggleText.textContent = 'Свернуть';
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>';
        
        // Reset main content margin
        mainContent.style.marginLeft = '';
    }
}

// Authentication and Settings functionality
let isLoggedIn = true; // Start as logged in

function toggleAuthModal() {
    if (isLoggedIn) {
        // Show logout confirmation
        document.getElementById('authModalTitle').textContent = 'Выход из системы';
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('logoutForm').classList.remove('hidden');
    } else {
        // Show login form
        document.getElementById('authModalTitle').textContent = 'Вход в систему';
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('logoutForm').classList.add('hidden');
    }
    openModal('authModal');
}

function handleAuth(event) {
    event.preventDefault();
    // Simple authentication - in real app would validate credentials
    isLoggedIn = true;
    updateAuthStatus();
    closeModal('authModal');
    showNotification('Успешный вход в систему', 'success');
}

function logout() {
    isLoggedIn = false;
    updateAuthStatus();
    closeModal('authModal');
    showNotification('Вы вышли из системы', 'info');
}

function updateAuthStatus() {
    const authStatus = document.getElementById('auth-status');
    const authIndicator = document.getElementById('auth-indicator');
    
    if (isLoggedIn) {
        authStatus.textContent = 'Admin';
        authIndicator.className = 'w-2 h-2 bg-green-500 rounded-full';
    } else {
        authStatus.textContent = 'Гость';
        authIndicator.className = 'w-2 h-2 bg-red-500 rounded-full';
    }
}

// VM Actions functionality
let currentVmAction = null;

function startVm(vmName) {
    currentVmAction = { action: 'start', vm: vmName };
    document.getElementById('vmActionTitle').textContent = 'Запуск ВМ';
    document.getElementById('vmActionMessage').textContent = `Запустить виртуальную машину "${vmName}"?`;
    document.getElementById('vmActionConfirm').textContent = 'Запустить';
    document.getElementById('vmActionConfirm').className = 'btn-primary bg-green-600 hover:bg-green-700';
    openModal('vmActionModal');
}

function stopVm(vmName) {
    currentVmAction = { action: 'stop', vm: vmName };
    document.getElementById('vmActionTitle').textContent = 'Остановка ВМ';
    document.getElementById('vmActionMessage').textContent = `Остановить виртуальную машину "${vmName}"?`;
    document.getElementById('vmActionConfirm').textContent = 'Остановить';
    document.getElementById('vmActionConfirm').className = 'btn-primary bg-red-600 hover:bg-red-700';
    openModal('vmActionModal');
}

function restartVm(vmName) {
    currentVmAction = { action: 'restart', vm: vmName };
    document.getElementById('vmActionTitle').textContent = 'Перезапуск ВМ';
    document.getElementById('vmActionMessage').textContent = `Перезапустить виртуальную машину "${vmName}"?`;
    document.getElementById('vmActionConfirm').textContent = 'Перезапустить';
    document.getElementById('vmActionConfirm').className = 'btn-primary bg-orange-600 hover:bg-orange-700';
    openModal('vmActionModal');
}

function pauseVm(vmName) {
    currentVmAction = { action: 'pause', vm: vmName };
    document.getElementById('vmActionTitle').textContent = 'Пауза ВМ';
    document.getElementById('vmActionMessage').textContent = `Приостановить виртуальную машину "${vmName}"?`;
    document.getElementById('vmActionConfirm').textContent = 'Приостановить';
    document.getElementById('vmActionConfirm').className = 'btn-primary bg-yellow-600 hover:bg-yellow-700';
    openModal('vmActionModal');
}

function openVmConsole(vmName) {
    showNotification(`Открытие консоли ВМ "${vmName}"`, 'info');
    // In real app, would open console interface
}

function openVmSettings(vmName) {
    showNotification(`Открытие настроек ВМ "${vmName}"`, 'info');
    // In real app, would open settings modal
}

function createVmSnapshot(vmName) {
    showNotification(`Создание снимка ВМ "${vmName}"`, 'info');
    // In real app, would create snapshot
}

function deleteVm(vmName) {
    currentVmAction = { action: 'delete', vm: vmName };
    document.getElementById('vmActionTitle').textContent = 'Удаление ВМ';
    document.getElementById('vmActionMessage').textContent = `ВНИМАНИЕ! Удалить виртуальную машину "${vmName}"? Это действие необратимо!`;
    document.getElementById('vmActionConfirm').textContent = 'Удалить';
    document.getElementById('vmActionConfirm').className = 'btn-primary bg-red-600 hover:bg-red-700';
    openModal('vmActionModal');
}

function executeVmAction() {
    if (currentVmAction) {
        const { action, vm } = currentVmAction;
        let message = '';
        
        switch(action) {
            case 'start':
                message = `ВМ "${vm}" запущена`;
                break;
            case 'stop':
                message = `ВМ "${vm}" остановлена`;
                break;
            case 'restart':
                message = `ВМ "${vm}" перезапущена`;
                break;
            case 'pause':
                message = `ВМ "${vm}" приостановлена`;
                break;
            case 'delete':
                message = `ВМ "${vm}" удалена`;
                break;
        }
        
        showNotification(message, 'success');
        closeModal('vmActionModal');
        currentVmAction = null;
        
        // In real app, would make API call to perform action
        // and refresh VM data
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateAuthStatus();
    
    // Load current page from localStorage or default to dashboard
    const currentPage = localStorage.getItem('currentPage') || 'dashboard';
    showPage(currentPage);
});