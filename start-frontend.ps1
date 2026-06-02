# Frontend Startup Script for Windows PowerShell
# This script will install dependencies and start the React development server

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  SCM-IMS Frontend Startup" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to frontend directory
Write-Host "`nNavigating to frontend directory..." -ForegroundColor Gray
Set-Location frontend

if (-Not (Test-Path ".")) {
    Write-Host "ERROR: frontend directory not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing React dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "`nDependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Start React development server
Write-Host "Starting React development server..." -ForegroundColor Cyan
Write-Host "Frontend will open at: http://localhost:3000`n" -ForegroundColor Gray

npm start

Write-Host "`nFrontend stopped." -ForegroundColor Yellow
