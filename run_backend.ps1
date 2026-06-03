# SCM-IMS Backend Launcher Script
# 1. Detect Java Home
$jdkPath = ""
if ($env:JAVA_HOME -and (Test-Path $env:JAVA_HOME)) {
    $jdkPath = $env:JAVA_HOME
} else {
    # Try Eclipse Adoptium (Temurin JDK)
    if (Test-Path "C:\Program Files\Eclipse Adoptium") {
        $jdks = Get-ChildItem -Path "C:\Program Files\Eclipse Adoptium" -Filter "jdk-*"
        if ($jdks.Count -gt 0) {
            $jdkPath = $jdks[0].FullName
        }
    }
    # Try standard C:\Program Files\Java
    if ($jdkPath -eq "" -and (Test-Path "C:\Program Files\Java")) {
        $jdks = Get-ChildItem -Path "C:\Program Files\Java" -Filter "jdk-*"
        if ($jdks.Count -gt 0) {
            $jdkPath = $jdks[0].FullName
        }
    }
}
if ($jdkPath -eq "") {
    Write-Error "No JDK installation found. Please install Java 17+ or set JAVA_HOME."
    Read-Host "Press Enter to exit..."
    exit
}
Write-Host "Using JDK path: $jdkPath"
$env:JAVA_HOME = $jdkPath
# 2. Path to Maven (using local portable Maven in workspace)
$mvnPath = Join-Path $PSScriptRoot "maven\apache-maven-3.9.6\bin\mvn.cmd"
if (-not (Test-Path $mvnPath)) {
    Write-Error "Local Maven installation not found at '$mvnPath'."
    Read-Host "Press Enter to exit..."
    exit
}
Write-Host "Starting Spring Boot backend..."
& $mvnPath spring-boot:run