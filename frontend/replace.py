import re

with open(r'c:\Users\Alexey\Desktop\min\vNE\cee-hypervisor\frontend\src\pages\Servers.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">.*?</div>\n      \)}'

replacement = """<div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="table-header-cell text-left">Имя</th>
                <th className="table-header-cell text-left">Hostname / IP</th>
                <th className="table-header-cell text-left">Статус</th>
                <th className="table-header-cell text-left">Ядра CPU</th>
                <th className="table-header-cell text-left">ОЗУ</th>
                <th className="table-header-cell text-left">Кластер</th>
                <th className="table-header-cell-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server, index) => (
                <tr key={server.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="table-cell-strong font-medium">{server.name || \server-\}</td>
                  <td className="table-cell-muted font-mono text-xs">{server.hostname || server.host || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <div className={\w-2 h-2 rounded-full \} />
                      <span className="text-dark-300 capitalize">{getStatusLabel(server.status)}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{server.cpu_cores ?? 0} ядро</td>
                  <td className="table-cell-muted">{formatMemoryGb(server.memory_total || server.memory_mb || 0)}</td>
                  <td className="table-cell-muted">{server.cluster || server.cluster_name || '-'}</td>
                  <td className="table-cell-actions">
                    <div className="inline-flex items-center justify-end space-x-2">
                      <button
                        className="table-action-icon-button text-red-400 hover:text-red-300"
                        title="Удалить сервер"
                        onClick={() => handleDelete(server.id)}
                      >
                        <Trash2 className="table-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}"""

new_text = re.sub(pattern, replacement, text, flags=re.DOTALL)

with open(r'c:\Users\Alexey\Desktop\min\vNE\cee-hypervisor\frontend\src\pages\Servers.js', 'w', encoding='utf-8') as f:
    f.write(new_text)
