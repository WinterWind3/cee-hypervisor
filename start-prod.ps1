$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$DriveLetter = $RepoRoot.Substring(0, 1).ToLower()
$WslPath = "/mnt/$DriveLetter" + $RepoRoot.Substring(2).Replace("\", "/")

$BuildArg = if ($args -contains '--build') { ' --build' } else { '' }

wsl.exe -e sh -lc "cd '$WslPath' && chmod +x ./start-prod.sh && ./start-prod.sh$BuildArg"