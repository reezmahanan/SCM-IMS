@echo off
REM Download Maven to Downloads
cd /d "%USERPROFILE%\Downloads"
echo Downloading Maven 3.9.6...
powershell -Command "Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip' -OutFile 'maven.zip' -UseBasicParsing"

echo Extracting Maven...
powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('maven.zip', '.')"

REM Set Maven path
set MAVEN_BIN=%USERPROFILE%\Downloads\apache-maven-3.9.6\bin

REM Go to project
cd /d "c:\Users\ACER\.gemini\antigravity\scratch\SCM-IMS"

REM Build
echo Building project...
"%MAVEN_BIN%\mvn.cmd" clean install -DskipTests

echo.
echo Build complete! To run the backend:
echo "%MAVEN_BIN%\mvn.cmd" spring-boot:run
echo.
pause
