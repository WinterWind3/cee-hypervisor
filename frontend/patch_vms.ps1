$content = Get-Content -Raw "src/pages/VirtualMachines.js"

if ($content -match "const selectedVmName = searchParams.get\('vm'\) \|\| '';") {
    $newContent = $content -replace "const selectedVmName = searchParams.get\('vm'\) \|\| '';", "const selectedVmName = searchParams.get('vm') || '';
  const openCreateModalAction = searchParams.get('action') === 'create';"
    
    $newContent = $newContent -replace "  const \[showCreate, setShowCreate\] = useState\(false\);", "  const [showCreate, setShowCreate] = useState(openCreateModalAction);"

    Set-Content -Path "src/pages/VirtualMachines.js" -Value $newContent
    echo "SUCCESS"
} else {
    echo "FAILED"
}
