@echo off
title Kill Port 5001
color 0A

echo ========================================
echo    KILL PORT 5001 - Nutrition Assistant
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Not running as Administrator!
    echo Some processes may not be killed.
    echo.
)

echo [INFO] Searching for process on port 5001...
echo.

:: Find and kill the process
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do (
    echo [FOUND] Process using port 5001 - PID: %%a
    echo [ACTION] Killing process...
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo [SUCCESS] Process killed successfully!
    ) else (
        echo [ERROR] Failed to kill process. Try running as Administrator.
    )
    echo.
)

:: Verify if port is free
netstat -aon | findstr :5001 >nul
if %errorLevel% equ 0 (
    echo [ERROR] Port 5001 is still in use!
    echo Try running this script as Administrator.
) else (
    echo [SUCCESS] Port 5001 is now free! 
)

echo.
echo ========================================
echo Press any key to exit...
pause >nul