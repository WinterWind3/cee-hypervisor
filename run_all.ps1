$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$StartProdScript = Join-Path $ScriptDir 'start-prod.ps1'

if (-not (Test-Path $StartProdScript)) {
    Write-Error "Не найден start-prod.ps1"
    exit 1
}

& $StartProdScript @args
