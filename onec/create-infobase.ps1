param(
    [Parameter(Mandatory = $true)]
    [string]$PlatformPath,
    [Parameter(Mandatory = $true)]
    [string]$BasePath,
    [string]$DisplayName = "test Demo"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PlatformPath -PathType Leaf)) {
    throw "Platform executable not found: $PlatformPath"
}

$resolvedBasePath = [System.IO.Path]::GetFullPath($BasePath)
if (Test-Path -LiteralPath $resolvedBasePath) {
    throw "Infobase path already exists and will not be overwritten: $resolvedBasePath"
}

$logPath = "$resolvedBasePath.create.log"
& $PlatformPath CREATEINFOBASE $resolvedBasePath /File /AddInList $DisplayName /Out $logPath
if ($LASTEXITCODE -ne 0) {
    throw "1C failed to create the infobase. See log: $logPath"
}

Write-Output "Created infobase: $resolvedBasePath"
