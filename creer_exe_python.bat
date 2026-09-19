@echo off
setlocal enabledelayedexpansion
title Discord 3-4L Checker - Compilation Python vers .EXE (PyInstaller)
color 0b

:: Se positionner dans le repertoire exact du script
cd /d "%~dp0"

echo ==============================================================================
echo   CREATION DE L'EXECUTABLE .EXE WINDOWS (PYTHON + PYINSTALLER)
echo ==============================================================================
echo.
echo Repertoire actuel : %cd%
echo.

:: 1. Verification de Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo [ERREUR] Python n'a pas ete detecte sur ce PC !
    echo.
    echo Comment l'installer en 1 minute :
    echo 1. Rendez-vous sur https://www.python.org/downloads/
    echo 2. Lancez l'installeur et COCHEZ BIEN la case "Add Python to PATH" !
    echo 3. Relancez ensuite ce fichier .bat.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PY_VER=%%i
echo Python detecte : %PY_VER%
echo.

:: 2. Installation des dependances (requirements.txt)
echo [1/2] Installation des modules Python (customtkinter, requests, pyinstaller)...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    color 0c
    echo [ERREUR] Echec de l'installation des dependances pip.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Compilation en un seul fichier .EXE autonome sans console...
python -m PyInstaller --onefile --noconsole --clean --name "final" final.py
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo [ERREUR] PyInstaller a rencontre une erreur lors de la compilation.
    pause
    exit /b %errorlevel%
)

echo.
color 0a
echo ==============================================================================
echo   SUCCES TOTAL ! Votre fichier .EXE autonome a ete cree :
echo   Dossier : dist\
echo   Fichier : final.exe
echo.
echo   Ce fichier est 100%% autonome : double-cliquez sur final.exe
echo   et l'application vibecodee se lance directement !
echo ==============================================================================
echo.
pause
explorer dist
