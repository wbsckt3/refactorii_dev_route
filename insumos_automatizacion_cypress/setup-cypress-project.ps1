# setup-cypress-project.ps1 Crear carpetas necesarias
# ejecutar: C:\ruta\de\tu\proyecto $ .\setup-cypress-project.ps1
$folders = @(
  "cypress/e2e",
  "cypress/support",
  "cypress/reports",
  "config",
  "monitoring",
  ".github/workflows"
)

foreach ($folder in $folders) {
  if (!(Test-Path -Path $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "Carpeta creada: $folder"
  }
}

# Crear archivos vacíos
$files = @(
  "cypress/e2e/system-health-check.cy.js",
  "cypress/support/commands.js",
  "config/dev.env.js",
  "monitoring/dashboard-config.js",
  "package.json",
  ".github/workflows/system-health-check.yml"
)

foreach ($file in $files) {
  if (!(Test-Path -Path $file)) {
    New-Item -ItemType File -Path $file -Force | Out-Null
    Write-Host "Archivo creado: $file"
  }
}

Write-Host "✅ Estructura de proyecto Cypress creada exitosamente."
