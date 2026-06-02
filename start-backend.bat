@echo off
REM Backend Startup Script for Windows Command Prompt
REM This script will download Maven (if needed) and start the Spring Boot server

setlocal enabledelayedexpansion

set "MAVEN_DIR=%USERPROFILE%\apache-maven-3.9.6"
set "MAVEN_BIN=%MAVEN_DIR%\bin\mvn.cmd"
set "MAVEN_URL=https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
set "DOWNLOAD_PATH=%USERPROFILE%\Downloads\maven-3.9.6-bin.zip"

REM Auto-detect Java installation
for /f "tokens=*" %%i in ('where java') do (
    set "JAVA_EXE=%%i"
)

if defined JAVA_EXE (
    for %%A in ("!JAVA_EXE!") do (
        set "JAVA_DIR=%%~dpA"
    )
    set "JAVA_HOME=!JAVA_DIR!.."
) else (
    echo ERROR: Java not found in PATH!
    echo Please install Java 21 or later
    pause
    exit /b 1
)

echo.
echo ================================================
echo   SCM-IMS Backend Startup
echo ================================================
echo   Java Home: !JAVA_HOME!
echo   Maven Dir: !MAVEN_DIR!
echo ================================================
echo.

REM Check if Maven exists
if not exist "%MAVEN_BIN%" (
    echo Maven not found. Downloading...
    echo.
    
    REM Create Downloads dir if it doesn't exist
    if not exist "%USERPROFILE%\Downloads" mkdir "%USERPROFILE%\Downloads"
    
    REM Download Maven using PowerShell
    echo Downloading Maven from Apache...
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%DOWNLOAD_PATH%' -UseBasicParsing"
    
    if errorlevel 1 (
        echo Failed to download Maven.
        echo Please install Maven manually from: https://maven.apache.org/download.cgi
        pause
        exit /b 1
    )
    
    echo Extracting Maven...
    powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%DOWNLOAD_PATH%', '%USERPROFILE%')"
    
    echo Cleaning up...
    del "%DOWNLOAD_PATH%"
    
    echo Maven installed successfully at: %MAVEN_DIR%
    echo.
)

echo Starting Spring Boot backend server...
echo.

REM Build and run with JAVA_HOME set
set "JAVA_HOME=!JAVA_HOME!"
"%MAVEN_BIN%" spring-boot:run

echo.
echo Backend stopped.
pause
