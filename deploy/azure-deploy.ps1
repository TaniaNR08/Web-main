# Despliegue SchoolWebPro en Azure (VM + Docker MySQL + nginx)
# Uso: desde la raíz del repo, después de: az login
param(
  [string]$ResourceGroup = "rg-schoolwebpro",
  [string]$VmName = "vm-schoolweb",
  [string]$Location = "eastus",
  [string]$Branch = "devops",
  [string]$RepoUrl = "https://github.com/TaniaNR08/Web-main.git"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$KeyDir = Join-Path $Root "deploy\.azure-keys"
$KeyPath = Join-Path $KeyDir "schoolweb_rsa"

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Write-Error "Azure CLI no encontrado. Cierra y abre PowerShell, o instala: winget install Microsoft.AzureCLI"
}

Write-Host "Comprobando sesión Azure..."
az account show 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Inicia sesión: az login"
  az login
}

if (-not (Test-Path $KeyPath)) {
  New-Item -ItemType Directory -Force -Path $KeyDir | Out-Null
  ssh-keygen -t rsa -b 4096 -f $KeyPath -N '""' -q
}

Write-Host "Creando VM $VmName en $Location (puede tardar varios minutos)..."
az vm create `
  --resource-group $ResourceGroup `
  --name $VmName `
  --image Ubuntu2204 `
  --size Standard_B1s `
  --admin-username azureuser `
  --public-ip-sku Standard `
  --ssh-key-values "$(Get-Content "$KeyPath.pub" -Raw)" `
  --location $Location `
  --ports 22 80 443 `
  --output none

if ($LASTEXITCODE -ne 0) {
  Write-Error "No se pudo crear la VM (revisa policy de la suscripción)."
}

az vm open-port --resource-group $ResourceGroup --name $VmName --port 80 --priority 1010 --output none
az vm open-port --resource-group $ResourceGroup --name $VmName --port 443 --priority 1020 --output none

$ip = az vm show -d --resource-group $ResourceGroup --name $VmName --query publicIps -o tsv
Write-Host "IP pública: $ip"

$setupScript = (Get-Content (Join-Path $Root "deploy\vm-setup.sh") -Raw) -replace "`r`n", "`n"
$setupB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($setupScript))

Write-Host "Configurando la VM (Docker, backend, frontend, nginx)..."
az vm run-command invoke `
  --resource-group $ResourceGroup `
  --name $VmName `
  --command-id RunShellScript `
  --scripts @(
    "export REPO_URL='$RepoUrl' BRANCH='$Branch'",
    "echo $setupB64 | base64 -d > /tmp/vm-setup.sh",
    "chmod +x /tmp/vm-setup.sh",
    "sudo -u azureuser bash /tmp/vm-setup.sh"
  ) `
  --output none

Write-Host ""
Write-Host "========================================"
Write-Host " URL: http://$ip"
Write-Host " SSH: ssh -i `"$KeyPath`" azureuser@$ip"
Write-Host "========================================"
