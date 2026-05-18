# Despliegue en Azure Container Apps (MySQL + app en contenedores)
# Requisito: az login
# Nota: suscripcion estudiante = max 1 Container Apps Environment por region (se reutiliza si existe).
param(
  [string]$ResourceGroup = "rg-schoolwebpro",
  [string]$Location = "canadacentral",
  [string]$EnvironmentName = "env-schoolweb",
  [string]$ComposeName = "schoolweb-app",
  [string]$RegistryName = "schoolwebproacr",
  [string]$EnvironmentId = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Write-Error "Instala Azure CLI y ejecuta: az login"
}

az account show 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { az login }

function Test-AzResource {
  param([scriptblock]$Command)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $Command 2>&1 | Out-Null
  $ok = ($LASTEXITCODE -eq 0)
  $ErrorActionPreference = $prev
  return $ok
}

Write-Host "1/5 Entorno Container Apps..."
$environmentRef = $EnvironmentId
if (-not $environmentRef) {
  if (Test-AzResource { az containerapp env show -g $ResourceGroup -n $EnvironmentName -o none }) {
    $environmentRef = az containerapp env show -g $ResourceGroup -n $EnvironmentName --query id -o tsv
  } else {
    $prevEa = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    az containerapp env create -g $ResourceGroup -n $EnvironmentName -l $Location -o none 2>&1 | Out-Null
    $created = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $prevEa
    if ($created) {
      $environmentRef = az containerapp env show -g $ResourceGroup -n $EnvironmentName --query id -o tsv
    } else {
      $envJson = az containerapp env list --query "[?location=='Canada Central' || location=='canadacentral'] | [0]" -o json 2>$null
      if ($envJson -and $envJson -ne "null") {
        $parsed = $envJson | ConvertFrom-Json
        $environmentRef = $parsed.id
        $EnvironmentName = $parsed.name
        Write-Host "   Reutilizando entorno existente: $EnvironmentName ($($parsed.resourceGroup))"
      } else {
        Write-Error "No se pudo crear el entorno y no hay otro en $Location. Elimina un entorno viejo o pasa -EnvironmentId."
      }
    }
  }
}

Write-Host "2/5 Azure Container Registry..."
if (-not (Test-AzResource { az acr show -g $ResourceGroup -n $RegistryName -o none })) {
  az acr create -g $ResourceGroup -n $RegistryName --sku Basic --admin-enabled true -o none
  if ($LASTEXITCODE -ne 0) { Write-Error "No se pudo crear ACR (nombre global unico: prueba otro RegistryName)." }
}

$loginServer = az acr show -g $ResourceGroup -n $RegistryName --query loginServer -o tsv
$registryUser = az acr credential show -g $ResourceGroup -n $RegistryName --query username -o tsv
$registryPass = az acr credential show -g $ResourceGroup -n $RegistryName --query "passwords[0].value" -o tsv

Write-Host "3/5 Construyendo imagenes localmente y subiendo a ACR (10-20 min)..."
# ACR Tasks no esta disponible en suscripciones Student → build local + push
Write-Host "   Iniciando sesion en ACR..."
docker login $loginServer -u $registryUser -p $registryPass
if ($LASTEXITCODE -ne 0) { Write-Error "No se pudo autenticar en ACR. Verifica que Docker este corriendo." }

Push-Location $Root

Write-Host "   [1/2] Build imagen MySQL..."
docker build -t "${loginServer}/schoolweb-mysql:latest" -f deploy/docker/Dockerfile.mysql .
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Fallo build MySQL" }
docker push "${loginServer}/schoolweb-mysql:latest"
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Fallo push MySQL" }

Write-Host "   [2/2] Build imagen App (Angular + Backend)..."
docker build -t "${loginServer}/schoolweb-app:latest" -f deploy/docker/Dockerfile.app .
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Fallo build App" }
docker push "${loginServer}/schoolweb-app:latest"
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Fallo push App" }

Pop-Location

Write-Host "4/5 Desplegando Container Apps..."

# ── MySQL (ingress interno en puerto 3306) ─────────────────────────────────
Write-Host "   [1/2] MySQL..."
$mysqlExists = Test-AzResource { az containerapp show -g $ResourceGroup -n schoolweb-mysql -o none }
if ($mysqlExists) {
  az containerapp update -g $ResourceGroup -n schoolweb-mysql `
    --image "${loginServer}/schoolweb-mysql:latest" -o none
} else {
  az containerapp create -g $ResourceGroup -n schoolweb-mysql `
    --environment $environmentRef `
    --image "${loginServer}/schoolweb-mysql:latest" `
    --registry-server $loginServer --registry-username $registryUser --registry-password $registryPass `
    --cpu 0.5 --memory 1.0Gi `
    --min-replicas 1 --max-replicas 1 `
    --env-vars "MYSQL_ROOT_PASSWORD=170522iris." "MYSQL_DATABASE=auth_db" `
    --ingress internal --target-port 3306 --transport tcp `
    -o none
}
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo deploy MySQL" }

# Nombre corto del contenedor MySQL (funciona dentro del mismo ambiente de Container Apps)
$mysqlHost = "schoolweb-mysql"

# ── App principal (nginx + backend, ingress externo en puerto 80) ──────────
Write-Host "   [2/2] App (nginx + backend)..."
$appExists = Test-AzResource { az containerapp show -g $ResourceGroup -n schoolweb -o none }
if ($appExists) {
  az containerapp update -g $ResourceGroup -n schoolweb `
    --image "${loginServer}/schoolweb-app:latest" -o none
} else {
  az containerapp create -g $ResourceGroup -n schoolweb `
    --environment $environmentRef `
    --image "${loginServer}/schoolweb-app:latest" `
    --registry-server $loginServer --registry-username $registryUser --registry-password $registryPass `
    --cpu 0.75 --memory 1.5Gi `
    --min-replicas 1 --max-replicas 1 `
    --env-vars "MYSQL_HOST=${mysqlHost}" "MYSQL_USER=root" "MYSQL_PASSWORD=170522iris." `
    --ingress external --target-port 80 `
    -o none
}
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo deploy App" }

Write-Host "5/5 URL publica y CORS..."
$fqdn = az containerapp show -g $ResourceGroup -n schoolweb `
  --query "properties.configuration.ingress.fqdn" -o tsv 2>$null

# Agregar la URL de produccion a los origenes CORS permitidos
if ($fqdn) {
  Write-Host "   Configurando CORS para https://$fqdn ..."
  az containerapp update -g $ResourceGroup -n schoolweb `
    --set-env-vars "ALLOWED_ORIGINS=https://$fqdn" -o none
}

Write-Host ""
Write-Host "========================================"
if ($fqdn) {
  Write-Host " App: https://$fqdn"
} else {
  Write-Host " Revisa el portal: Container Apps -> schoolweb"
}
Write-Host "========================================"
