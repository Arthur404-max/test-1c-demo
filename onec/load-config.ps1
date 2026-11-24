param(
    [Parameter(Mandatory = $true)]
    [string]$PlatformPath,
    [Parameter(Mandatory = $true)]
    [string]$BasePath,
    [Parameter(Mandatory = $true)]
    [string]$ConfigDumpPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PlatformPath -PathType Leaf)) {
    throw "Platform executable not found: $PlatformPath"
}
if (-not (Test-Path -LiteralPath $BasePath -PathType Leaf)) {
    throw "Infobase not found: $BasePath"
}
if (-not (Test-Path -LiteralPath $ConfigDumpPath -PathType Container)) {
    throw "Configuration dump not found: $ConfigDumpPath"
}

$logPath = Join-Path (Split-Path -Parent $BasePath) "test.load-config.log"
& $PlatformPath DESIGNER /F $BasePath /LoadConfigFromFiles $ConfigDumpPath /UpdateDBCfg /Out $logPath
if ($LASTEXITCODE -ne 0) {
    throw "1C failed to load the configuration. See log: $logPath"
}

Write-Output "Configuration loaded into: $BasePath"
