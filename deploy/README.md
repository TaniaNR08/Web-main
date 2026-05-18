# Despliegue Azure

## Container Apps (recomendado)

MySQL y la app van en **dos contenedores** (imágenes en ACR). En suscripción *Azure for Students* solo hay **un** Container Apps Environment por región; el script reutiliza el existente (p. ej. del lab de microservicios).

```powershell
az login
cd C:\Users\juans\Desktop\www\Web-main
.\deploy\container-deploy.ps1
```

Tarda ~15 min (build en ACR). Al terminar muestra la URL `https://...azurecontainerapps.io`.

## VM + Docker (alternativa)

Este flujo usa **MySQL en Docker** en la VM (igual que en local).

## Requisitos

1. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli-windows) instalado.
2. Sesión iniciada: `az login`
3. Grupo de recursos `rg-schoolwebpro` creado en el portal.

## Un solo comando (PowerShell)

Desde la raíz del repo:

```powershell
cd C:\Users\juans\Desktop\www\Web-main
.\deploy\azure-deploy.ps1
```

Crea la VM, clona la rama `devops`, levanta Docker MySQL, PM2 para el API y nginx con el frontend.

## Manual

1. `az login`
2. Crear VM Ubuntu 22.04 (East US, B1s, puertos 22/80/443).
3. Copiar y ejecutar `deploy/vm-setup.sh` en la VM.
4. Abrir `http://IP_PUBLICA`.

## Variables

| Variable | Default |
|----------|---------|
| `ResourceGroup` | rg-schoolwebpro |
| `Location` | eastus |
| `Branch` | devops |

```powershell
.\deploy\azure-deploy.ps1 -Location "centralus" -Branch "devops"
```
