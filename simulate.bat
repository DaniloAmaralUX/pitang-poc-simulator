@echo off
echo ===================================================
echo   PITANG LABS · SIMULADOR DE POC EM HTML
echo ===================================================
echo Iniciando simulador de requisitos...
python scripts\simulate.py %*
if errorlevel 1 (
    echo [ERRO] Python nao foi encontrado ou falhou ao executar.
    pause
    exit /b 1
)
echo.
echo Abrindo servidor com Hot-Reload...
python scripts\serve.py
pause
