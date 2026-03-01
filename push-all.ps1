param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$CommitMessage
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Iniciando subida de cambios..." -ForegroundColor Cyan
Write-Host "Mensaje de commit: '$CommitMessage'" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# Función auxiliar para manejar el proceso de Git en una carpeta
function Push-Changes ($folderName, $path) {
    if (Test-Path "$path\.git") {
        Write-Host "`n---> Procesando [$folderName]" -ForegroundColor Magenta
        Set-Location $path
        
        Write-Host "  > Añadiendo cambios (git add .)"
        git add .
        
        Write-Host "  > Creando commit (git commit)"
        # Ignorar error de commit si no hay cambios
        $commitResult = git commit -m "$CommitMessage" 2>&1
        if ($commitResult -match "nothing to commit" -or $commitResult -match "nada para hacer commit") {
            Write-Host "  ! No hay cambios nuevos en $folderName para hacer commit." -ForegroundColor Yellow
        } else {
            Write-Host "  > Subiendo cambios (git push origin main)"
            git push origin main
            Write-Host "  + ¡$folderName subido exitosamente!" -ForegroundColor Green
        }
    } else {
        Write-Host "`n---> Saltando [$folderName]: No se encontró repositorio Git (.git)" -ForegroundColor DarkGray
    }
}

$rootDir = "D:\EduC\apps"

# Procesar raíz (o backend si la raíz es el backend en EduCrm.git)
Push-Changes "Raíz/Backend" $rootDir

# Procesar frontend
Push-Changes "Frontend" "$rootDir\frontend"

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "¡Proceso finalizado!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Set-Location $rootDir
