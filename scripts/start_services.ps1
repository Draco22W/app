# Game Platform Service Startup Script (PowerShell Version)
Write-Host "========================================" -ForegroundColor Green
Write-Host "           Game Platform Startup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Python installation
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python Version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python not detected, please install Python 3.7+" -ForegroundColor Red
    Read-Host "Press any key to continue"
    exit 1
}

# Check MySQL service status
Write-Host "Checking MySQL service status..." -ForegroundColor Yellow
$mysqlServices = Get-Service | Where-Object {$_.Name -like "*MySQL*"}
if ($mysqlServices) {
    $runningService = $mysqlServices | Where-Object {$_.Status -eq "Running"}
    if ($runningService) {
        Write-Host "MySQL service is running: $($runningService.Name)" -ForegroundColor Green
    } else {
        Write-Host "MySQL service is not running, trying to start..." -ForegroundColor Yellow
        $started = $false
        foreach ($service in $mysqlServices) {
            try {
                Start-Service $service.Name -ErrorAction Stop
                Write-Host "MySQL service started successfully: $($service.Name)" -ForegroundColor Green
                $started = $true
                break
            } catch {
                Write-Host "Failed to start service: $($service.Name)" -ForegroundColor Red
            }
        }
        if (-not $started) {
            Write-Host "Failed to start MySQL service, please start manually" -ForegroundColor Red
            Write-Host "Please run this script as Administrator" -ForegroundColor Red
            Read-Host "Press any key to continue"
            exit 1
        }
    }
} else {
    Write-Host "MySQL service not found, please check MySQL installation" -ForegroundColor Red
    Read-Host "Press any key to continue"
    exit 1
}

# Check and install Python dependencies
Write-Host ""
Write-Host "Checking Python dependencies..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "..\projects\back-end-api"
Set-Location $backendPath

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency installation failed, please check network connection" -ForegroundColor Red
    Read-Host "Press any key to continue"
    exit 1
}
Write-Host "Dependencies installed successfully" -ForegroundColor Green

# Start backend API service
Write-Host ""
Write-Host "Starting backend API service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; .\venv\Scripts\Activate.ps1; python api.py" -WindowStyle Normal

# Wait for service to start
Write-Host "Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if service started successfully
Write-Host "Checking API service status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/games" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "API service started successfully" -ForegroundColor Green
    } else {
        Write-Host "API service may still be starting, please wait..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "API service may still be starting, please wait..." -ForegroundColor Yellow
}

# Start frontend page
Write-Host ""
Write-Host "Starting frontend page..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "..\projects\home\index.html"
Start-Process $frontendPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           Service Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "   MySQL Database Service" -ForegroundColor Green
Write-Host "   Backend API Service (http://localhost:5000)" -ForegroundColor Green
Write-Host "   Frontend Page Opened" -ForegroundColor Green
Write-Host ""
Write-Host "Tips:" -ForegroundColor Cyan
Write-Host "   - If frontend shows network error, wait a few seconds and refresh" -ForegroundColor Yellow
Write-Host "   - Backend service runs on http://localhost:5000" -ForegroundColor Yellow
Write-Host "   - Press Ctrl+C to stop backend service" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now start using the game platform!" -ForegroundColor Green
Write-Host ""
Read-Host "Press any key to continue" 