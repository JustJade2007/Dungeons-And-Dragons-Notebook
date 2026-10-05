@echo off
setlocal enabledelayedexpansion
title Dungeons & Dragons Notebook - Build Executable
cd /d "%~dp0"

echo ===================================================
echo     D&D Notebook - Building Standalone EXE
echo ===================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is required to package the executable.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] Installing required dependencies...
    call npm install
)

echo [INFO] Packaging standalone Windows executable into dist/dnd-notebook.exe...
node scripts/build-exe.js

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Executable built successfully:
    echo %~dp0dist\dnd-notebook.exe
) else (
    echo.
    echo [ERROR] Build failed with exit code %ERRORLEVEL%.
)

echo.
pause
