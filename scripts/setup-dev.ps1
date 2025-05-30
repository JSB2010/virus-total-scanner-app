#!/usr/bin/env pwsh

# DropSentinel Development Setup Script
# This script sets up the development environment for DropSentinel

Write-Host "🛡️  Setting up DropSentinel Development Environment for Windows..." -ForegroundColor Green

# Windows-specific setup information
Write-Host "🪟 Detected platform: Windows" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green

    # Check if version is >= 18
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])

    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js version $nodeVersion is too old. Please install Node.js 18 or higher." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "   Or install via Chocolatey: choco install nodejs" -ForegroundColor Cyan
    Write-Host "   Or install via Winget: winget install OpenJS.NodeJS" -ForegroundColor Cyan
    exit 1
}

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Cyan
    Write-Host "   Or install via Chocolatey: choco install git" -ForegroundColor Cyan
    Write-Host "   Or install via Winget: winget install Git.Git" -ForegroundColor Cyan
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env.local from .env.example if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ .env.local created from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env.local and add your VirusTotal API key" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Create necessary directories
Write-Host "Creating necessary directories..." -ForegroundColor Yellow
$directories = @("public\assets", "build", "dist", "src\types")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Directory already exists: $dir" -ForegroundColor Green
    }
}

# Windows-specific configuration
Write-Host "🪟 Windows Configuration:" -ForegroundColor Blue
Write-Host "   • Downloads monitoring: $env:USERPROFILE\Downloads" -ForegroundColor Cyan
Write-Host "   • Quarantine storage: $env:LOCALAPPDATA\DropSentinel\quarantine" -ForegroundColor Cyan
Write-Host "   • App will request necessary permissions on first run" -ForegroundColor Cyan

# Check if VirusTotal API key is configured
Write-Host "Checking VirusTotal API key configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "VIRUSTOTAL_API_KEY=your_virustotal_api_key_here" -or $envContent -notmatch "VIRUSTOTAL_API_KEY=\w+") {
    Write-Host "⚠️  VirusTotal API key not configured. Please:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://www.virustotal.com/gui/join-us" -ForegroundColor Cyan
    Write-Host "   2. Create a free account and get your API key" -ForegroundColor Cyan
    Write-Host "   3. Edit .env.local and replace 'your_virustotal_api_key_here' with your actual API key" -ForegroundColor Cyan
} else {
    Write-Host "✅ VirusTotal API key appears to be configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Windows setup complete! You can now:" -ForegroundColor Green
Write-Host "   • Run 'npm run dev' to start the Next.js development server" -ForegroundColor Cyan
Write-Host "   • Run 'npm run electron-dev' to start the Electron app in development mode" -ForegroundColor Cyan
Write-Host "   • Run 'npm run build' to build for production" -ForegroundColor Cyan
Write-Host "   • Run 'npm run electron-pack' to package the app for Windows" -ForegroundColor Cyan
Write-Host "   • Run 'npm run lint' to check code quality" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For more information, check the README.md file" -ForegroundColor Blue
Write-Host "🔧 Platform: Windows" -ForegroundColor Blue
