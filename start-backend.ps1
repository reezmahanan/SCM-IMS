# Backend Startup Script for Windows PowerShell
# This script will download Maven (if needed) and start the Spring Boot server

$MavenDir = "$env:USERPROFILE\apache-maven-3.9.6"
$MavenBin = "$MavenDir\bin\mvn.cmd"
$ProjectRoot = Get-Location

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SCM-IMS Backend Startup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Check if Maven exists
if (-Not (Test-Path $MavenBin)) {
    Write-Host "`nMaven not found. Downloading..." -ForegroundColor Yellow
    
    $DownloadPath = "$env:DOWNLOADS\maven-3.9.6-bin.zip"
    $MavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
    
    try {
        Write-Host "Downloading Maven from Apache Archive..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $MavenUrl -OutFile $DownloadPath -UseBasicParsing
        
        Write-Host "Extracting Maven..."
        Expand-Archive -Path $DownloadPath -DestinationPath "$env:USERPROFILE" -Force
        
        Write-Host "Cleaning up..." 
        Remove-Item $DownloadPath -Force
        
        Write-Host "Maven installed successfully at: $MavenDir" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download Maven. Error: $_" -ForegroundColor Red
        Write-Host "Alternative: Install Maven manually from https://maven.apache.org/download.cgi" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`nStarting Spring Boot backend server..." -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor Gray

# Build and run
& $MavenBin spring-boot:run

Write-Host "`nBackend stopped." -ForegroundColor Yellow
