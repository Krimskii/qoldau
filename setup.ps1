# Qoldau AI — Setup script (PowerShell / Windows)
# Запускать из корня проекта после `git clone -b v0.7.5-stage1-demo`
# Usage: .\setup.ps1

$ErrorActionPreference = 'Stop'

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Qoldau AI — Setup (v0.7.5 stage1-demo)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# Проверки prerequisites
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
$git = Get-Command git -ErrorAction SilentlyContinue

if (-not $node) { Write-Host "❌ Node.js не найден. Установи https://nodejs.org" -ForegroundColor Red; exit 1 }
if (-not $npm)  { Write-Host "❌ npm не найден" -ForegroundColor Red; exit 1 }
if (-not $git)  { Write-Host "❌ git не найден" -ForegroundColor Red; exit 1 }

$nodeVersion = [int](node -v).Split('.')[0].TrimStart('v')
if ($nodeVersion -lt 20) {
  Write-Host "⚠️  Node.js >= 20 рекомендуется (у тебя $(node -v))" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✓ Node $(node -v), npm $(npm -v), git $(git --version)" -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Backend (apps/api)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Push-Location apps/api

if (-not (Test-Path package-lock.json)) {
  Write-Host "❌ package-lock.json не найден. Проверь что ты на ветке v0.7.5-stage1-demo" -ForegroundColor Red
  exit 1
}

Write-Host "→ npm install (это займёт 1-3 минуты)" -ForegroundColor Yellow
npm install --no-audit --no-fund

Write-Host "→ Prisma migrate deploy (создаст dev.db)" -ForegroundColor Yellow
npx prisma migrate deploy

Write-Host "→ Prisma generate" -ForegroundColor Yellow
npx prisma generate

if (-not (Test-Path .env)) {
  Write-Host "→ Копирую .env.example → .env" -ForegroundColor Yellow
  Copy-Item .env.example .env
  Write-Host "  ⚠️  Отредактируй apps/api/.env для своих ключей (опционально)" -ForegroundColor Yellow
}

Write-Host "✓ Backend готов" -ForegroundColor Green
Write-Host ""

# Frontend
Pop-Location
Push-Location apps/prototype
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Frontend (apps/prototype)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "→ npm install (1-3 минуты)" -ForegroundColor Yellow
npm install --no-audit --no-fund

if (-not (Test-Path .env)) {
  Write-Host "→ Копирую .env.example → .env" -ForegroundColor Yellow
  Copy-Item .env.example .env
}

Write-Host "✓ Frontend готов" -ForegroundColor Green
Write-Host ""

Pop-Location

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✓ Setup complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Запусти в 2 терминалах:"
Write-Host ""
Write-Host "  Terminal 1:  cd apps/api && npm run dev     # http://localhost:4000" -ForegroundColor White
Write-Host "  Terminal 2:  cd apps/prototype && npm run dev  # http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Проверь: http://localhost:4000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Подробнее: см. SETUP.md" -ForegroundColor White