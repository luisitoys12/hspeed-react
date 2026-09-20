@echo off
echo ====================================================
echo        Despliegue de AzuraCast para HabboSpeed
echo ====================================================
echo.
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker no esta en ejecucion.
    echo Por favor inicia Docker Desktop primero y vuelve a ejecutar este script.
    pause
    exit /b 1
)

echo [OK] Docker detectado. Iniciando contenedores de AzuraCast...
cd /d "%~dp0"
docker compose up -d

echo.
echo ====================================================
echo   AzuraCast iniciado correctamente!
echo   Accede a la interfaz web en: http://localhost:8080
echo ====================================================
pause
