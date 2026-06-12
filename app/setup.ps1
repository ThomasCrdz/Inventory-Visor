# Fleet Inventory — Setup Script (PowerShell)
# Ejecutar desde la terminal integrada de VS Code o Windows Terminal
# Clic derecho en el archivo > "Run with PowerShell"

$ErrorActionPreference = "Stop"
$ProjectDir = $PSScriptRoot

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Fleet Inventory — Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Verificar Node.js ─────────────────────────────────────────────────────
Write-Host "[ 1/4 ] Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>&1
    Write-Host "        Node.js $nodeVersion encontrado." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "  Node.js no encontrado. Instalando via winget..." -ForegroundColor Yellow
    try {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        # Reload PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
        $nodeVersion = node --version 2>&1
        Write-Host "        Node.js $nodeVersion instalado correctamente." -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "  ERROR: No se pudo instalar Node.js automaticamente." -ForegroundColor Red
        Write-Host "  Instala Node.js LTS manualmente desde: https://nodejs.org" -ForegroundColor Red
        Write-Host "  Luego ejecuta este script de nuevo." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# ── 2. Instalar pnpm ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 2/4 ] Verificando pnpm..." -ForegroundColor Yellow

$pnpmFound = $false
try {
    $pnpmVersion = pnpm --version 2>&1
    Write-Host "        pnpm $pnpmVersion encontrado." -ForegroundColor Green
    $pnpmFound = $true
} catch {
    $pnpmFound = $false
}

if (-not $pnpmFound) {
    Write-Host "        Instalando pnpm via corepack..." -ForegroundColor Yellow
    try {
        corepack enable
        corepack prepare pnpm@latest --activate
        $pnpmVersion = pnpm --version 2>&1
        Write-Host "        pnpm $pnpmVersion instalado." -ForegroundColor Green
    } catch {
        Write-Host "        Intentando instalacion standalone de pnpm..." -ForegroundColor Yellow
        try {
            Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
            # Reload PATH
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
            $pnpmVersion = pnpm --version 2>&1
            Write-Host "        pnpm $pnpmVersion instalado." -ForegroundColor Green
        } catch {
            Write-Host "  ERROR: No se pudo instalar pnpm." -ForegroundColor Red
            Write-Host "  Instala manualmente: npm install -g pnpm" -ForegroundColor Red
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    }
}

# ── 3. Instalar dependencias ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 3/4 ] Instalando dependencias (pnpm install)..." -ForegroundColor Yellow
Set-Location $ProjectDir
pnpm install
Write-Host "        Dependencias instaladas." -ForegroundColor Green

# ── 4. Lanzar dev server ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 4/4 ] Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "        Abre: http://localhost:5173" -ForegroundColor Cyan
Write-Host "        Para detener: Ctrl+C" -ForegroundColor Gray
Write-Host ""
pnpm dev
