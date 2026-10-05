@echo off
setlocal enabledelayedexpansion
title Dungeons ^& Dragons Notebook
cd /d "%~dp0"

echo ===================================================
echo     Dungeons ^& Dragons Notebook - Launcher
echo ===================================================
echo.

:: Check Node.js installation
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not found in your PATH.
    echo Please install Node.js (v18+) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exist
if not exist "node_modules\" (
    echo [INFO] Dependencies not detected. Running npm install...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
)

echo [INFO] Launching D&D Notebook application...
echo [INFO] Press Ctrl+C in this console window to terminate the application.
echo.

call npm start

pause
