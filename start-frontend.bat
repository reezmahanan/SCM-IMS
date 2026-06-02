@echo off
REM Frontend Startup Script for React
REM This script will install dependencies and start the React development server

setlocal enabledelayedexpansion

echo.
echo ================================================
echo   SCM-IMS Frontend Startup
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Navigate to frontend directory
cd frontend
if errorlevel 1 (
    echo ERROR: frontend directory not found!
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing React dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Start React development server
echo Starting React development server...
echo Frontend will open at: http://localhost:3000
echo.

call npm start

echo.
echo Frontend stopped.
pause
