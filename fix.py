
import re
file_path = r'c:\Users\Alexey\Desktop\min\vNE\cee-hypervisor\frontend\src\pages\VirtualMachines.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'ID:[^\]+?\\n \+', 'ID: \\n +', content)
content = content.replace('{vm.id.length > 8 ? ${vm.id.substring(0, 8)}... : vm.id}', '{stringToNumericId(vm.id)}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

