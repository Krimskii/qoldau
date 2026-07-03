param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^https://')]
  [string]$PROD_API_URL,

  [ValidateSet('debug', 'release')]
  [string]$Variant = 'release'
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$prototypeDir = Join-Path $repoRoot 'apps/prototype'
$androidDir = Join-Path $prototypeDir 'android'

Write-Host "Qoldau AI Android build"
Write-Host "Variant: $Variant"
Write-Host "API: $PROD_API_URL"
Write-Host "Note: AI/STT/LLM keys must stay server-side; this script only sets VITE_API_BASE_URL."

Push-Location $prototypeDir
try {
  $env:VITE_API_BASE_URL = $PROD_API_URL
  npm run build
  npx cap sync android
}
finally {
  Pop-Location
}

Push-Location $androidDir
try {
  if ($Variant -eq 'release') {
    .\gradlew.bat assembleRelease
    .\gradlew.bat bundleRelease
    Write-Host "Release APK: $androidDir\app\build\outputs\apk\release\app-release.apk"
    Write-Host "Release AAB: $androidDir\app\build\outputs\bundle\release\app-release.aab"
  }
  else {
    .\gradlew.bat assembleDebug
    Write-Host "Debug APK: $androidDir\app\build\outputs\apk\debug\app-debug.apk"
  }
}
finally {
  Pop-Location
  Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue
}

Write-Host "Do not commit APK/AAB/keystore outputs."
