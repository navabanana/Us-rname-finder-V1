@echo off
setlocal enabledelayedexpansion
title Discord 3-4L Checker - Creation Automatique de l'Installeur Windows .EXE
color 0b

:: Forcer Windows a se positionner dans le dossier exact du script (evite le bug C:\Windows\System32)
cd /d "%~dp0"

echo ==============================================================================
echo   CREATION DE L'INSTALLATEUR WINDOWS (.EXE) - DISCORD 3-4L CHECKER
echo ==============================================================================
echo.
echo Repertoire du projet : %cd%
echo.

:: Verifier la presence de package.json
if not exist "package.json" (
    color 0c
    echo ==============================================================================
    echo [ERREUR] Fichier 'package.json' introuvable dans : %cd%
    echo ==============================================================================
    echo.
    echo Ce script a ete lance en dehors du dossier du projet.
    echo.
    echo COMMENT RESOUDRE CELA EN 30 SECONDES :
    echo 1. Exportez le projet en ZIP (via le menu ⋮ en haut a droite -> Export to ZIP)
    echo 2. Decompressez le ZIP dans un dossier sur votre PC (ex: Bureau)
    echo 3. Lancez ce fichier .bat DANS le dossier decompresse avec tous les fichiers.
    echo.
    echo ==============================================================================
    pause
    exit /b 1
)

echo [1/3] Verification des outils de compilation (npm)...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    color 0e
    echo [ATTENTION] 'npm' n'a pas ete detecte sur ce PC Windows.
    echo Pour compiler l'installeur .exe sur votre PC, installez Node.js depuis https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo Node.js / npm detectes avec succes.
echo.
:: [2/3] Verification et installation des dependances
echo [2/4] Verification et telechargement des modules...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    color 0c
    echo [ERREUR] Echec lors de 'npm install'.
    pause
    exit /b %errorlevel%
)

:: [3/4] Compilation du bundle client
echo.
echo [3/4] Compilation des assets de l'application...
call npx --no-install vite build
if %errorlevel% neq 0 (
    echo [INFO] Tentative alternative avec npx vite...
    call npx vite build
    if %errorlevel% neq 0 (
        color 0c
        echo [ERREUR] Impossible de compiler les fichiers du site avec Vite.
        pause
        exit /b %errorlevel%
    )
)

:: [4/4] Creation de l'installeur Windows autonome (.exe)
echo.
echo [4/4] Creation de l'installeur Windows .EXE (Setup.exe autonome)...
call npx --no-install electron-builder --win
if %errorlevel% neq 0 (
    echo [INFO] Tentative avec npx electron-builder...
    call npx electron-builder --win
    if %errorlevel% neq 0 (
        color 0c
        echo.
        echo [ERREUR] Un probleme est survenu lors de l'assemblage electron-builder.
        pause
        exit /b %errorlevel%
    )
)
echo.
color 0a
echo ==============================================================================
echo   SUCCES TOTAL ! Votre installeur Windows autonome est pret :
echo   Dossier : dist-electron\
echo   Fichier : Discord 3-4 Letter Checker Setup.exe
echo.
echo   Ce fichier Setup.exe est pret a etre distribue a vos utilisateurs !
echo   Ils n'auront RIEN a installer, juste a double-cliquer dessus.
echo ==============================================================================
echo.
pause
explorer dist-electron
