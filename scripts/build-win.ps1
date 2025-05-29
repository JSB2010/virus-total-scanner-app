# DropSentinel Windows Build Script
# Builds .exe (installer), .msi, and .exe (portable) for Windows

param(
    [string]$Target = "all",
    [switch]$Help
)

# Configuration
$ProductName = "DropSentinel"
$Version = (Get-Content "package.json" | ConvertFrom-Json).version
$DistDir = "dist"
$BuildDir = "build"
$Architectures = @("x64", "arm64")
$Targets = @("nsis", "msi", "portable", "zip")

# Colors for output (Windows PowerShell)
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
    White = "White"
}

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n▶ $Message" -ForegroundColor Magenta
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Show-Help {
    Write-Host "DropSentinel Windows Build Script" -ForegroundColor White
    Write-Host "=================================" -ForegroundColor White
    Write-Host ""
    Write-Host "Usage: .\build-win.ps1 [-Target <target>] [-Help]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor Yellow
    Write-Host "  -Target    Specify build target (nsis, msi, portable, zip, all)" -ForegroundColor White
    Write-Host "  -Help      Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\build-win.ps1                    # Build all targets" -ForegroundColor White
    Write-Host "  .\build-win.ps1 -Target nsis       # Build NSIS installer only" -ForegroundColor White
    Write-Host "  .\build-win.ps1 -Target msi        # Build MSI installer only" -ForegroundColor White
    exit 0
}

function Test-Dependencies {
    Write-Step "Checking dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Log "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Log "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed or not in PATH"
        exit 1
    }
    
    # Check electron-builder
    try {
        npm list electron-builder | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "electron-builder not found"
        }
    }
    catch {
        Write-Error "electron-builder is not installed"
        exit 1
    }
    
    Write-Success "All dependencies are available"
}

function Test-Assets {
    Write-Step "Checking required assets..."
    
    $requiredAssets = @(
        "public\assets\app-icon.ico",
        "public\assets\app-icon.png"
    )
    
    $missingAssets = @()
    
    foreach ($asset in $requiredAssets) {
        if (-not (Test-Path $asset)) {
            $missingAssets += $asset
        }
    }
    
    if ($missingAssets.Count -gt 0) {
        Write-Warning "Missing assets:"
        foreach ($asset in $missingAssets) {
            Write-Host "  - $asset" -ForegroundColor Yellow
        }
        Write-Warning "Some features may not work correctly"
    }
    else {
        Write-Success "All required assets are present"
    }
}

function Clear-BuildDirectories {
    Write-Step "Cleaning previous builds..."
    
    # Remove previous builds
    if (Test-Path $DistDir) {
        Remove-Item -Recurse -Force $DistDir
        Write-Log "Removed $DistDir"
    }
    
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next"
        Write-Log "Removed .next"
    }
    
    # Create output directories
    New-Item -ItemType Directory -Force -Path $DistDir | Out-Null
    New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null
    
    Write-Success "Build directories cleaned"
}

function Build-NextApp {
    Write-Step "Building Next.js application..."
    
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Next.js build failed"
        }
        Write-Success "Next.js build completed"
    }
    catch {
        Write-Error "Next.js build failed: $_"
        exit 1
    }
}

function Build-ElectronApp {
    param(
        [string]$BuildTarget,
        [string]$Architecture = ""
    )
    
    Write-Step "Building Electron app for Windows ($BuildTarget$(if($Architecture) { ", $Architecture" }))..."
    
    # Set environment variables for Windows builds
    $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
    $env:WIN_CSC_LINK = ""
    $env:WIN_CSC_KEY_PASSWORD = ""
    $env:ELECTRON_BUILDER_COMPRESSION_LEVEL = "9"
    $env:DEBUG = "electron-builder"
    
    # Build command
    $cmd = "electron-builder --win $BuildTarget"
    
    if ($Architecture) {
        $cmd += " --$Architecture"
    }
    
    Write-Log "Executing: $cmd"
    
    try {
        Invoke-Expression $cmd
        if ($LASTEXITCODE -ne 0) {
            throw "Build command failed"
        }
        Write-Success "Windows $BuildTarget build completed successfully"
        return $true
    }
    catch {
        Write-Error "Windows $BuildTarget build failed: $_"
        return $false
    }
}

function Build-AllTargets {
    Write-Step "Building all Windows targets..."
    
    $failedBuilds = @()
    $successfulBuilds = @()
    
    foreach ($target in $Targets) {
        Write-Step "Building $target..."
        
        if (Build-ElectronApp $target) {
            $successfulBuilds += $target
        }
        else {
            $failedBuilds += $target
        }
    }
    
    # Report results
    Write-Host ""
    Write-Step "Build Summary"
    
    if ($successfulBuilds.Count -gt 0) {
        Write-Success "Successful builds:"
        foreach ($build in $successfulBuilds) {
            Write-Host "  ✅ $build" -ForegroundColor Green
        }
    }
    
    if ($failedBuilds.Count -gt 0) {
        Write-Error "Failed builds:"
        foreach ($build in $failedBuilds) {
            Write-Host "  ❌ $build" -ForegroundColor Red
        }
        return $false
    }
    
    return $true
}

function Get-Artifacts {
    Write-Step "Generated artifacts:"
    
    if (Test-Path $DistDir) {
        $artifacts = Get-ChildItem -Path $DistDir -Recurse -Include "*.exe", "*.msi", "*.zip" | Sort-Object Name
        
        if ($artifacts.Count -gt 0) {
            foreach ($artifact in $artifacts) {
                $size = [math]::Round($artifact.Length / 1MB, 2)
                Write-Host "  📦 $($artifact.Name) ($size MB)" -ForegroundColor Cyan
            }
        }
        else {
            Write-Warning "No artifacts found in $DistDir"
        }
    }
    else {
        Write-Warning "Distribution directory not found: $DistDir"
    }
}

function New-Checksums {
    Write-Step "Creating checksums..."
    
    if (Test-Path $DistDir) {
        Push-Location $DistDir
        
        try {
            $artifacts = Get-ChildItem -Recurse -Include "*.exe", "*.msi", "*.zip"
            
            if ($artifacts.Count -gt 0) {
                $checksums = @()
                
                foreach ($artifact in $artifacts) {
                    $hash = Get-FileHash -Path $artifact.FullName -Algorithm SHA256
                    $relativePath = $artifact.FullName.Replace((Get-Location).Path + "\", "")
                    $checksums += "$($hash.Hash.ToLower())  $relativePath"
                }
                
                $checksums | Out-File -FilePath "checksums.txt" -Encoding UTF8
                Write-Success "Checksums created: $DistDir\checksums.txt"
            }
        }
        finally {
            Pop-Location
        }
    }
}

function Optimize-Builds {
    Write-Step "Optimizing builds..."
    
    # Remove unnecessary files from unpacked directories
    $unpackedDirs = Get-ChildItem -Path $DistDir -Directory -Filter "*unpacked*"
    
    foreach ($dir in $unpackedDirs) {
        # Remove development files
        Get-ChildItem -Path $dir.FullName -Recurse -Include "*.map", "*.ts", "*.tsx" | Remove-Item -Force
        Write-Log "Optimized: $($dir.Name)"
    }
    
    Write-Success "Build optimization completed"
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
    }
    
    Write-Host "🪟 DropSentinel Windows Build Script" -ForegroundColor White
    Write-Host "====================================" -ForegroundColor White
    Write-Host ""
    
    # Pre-build checks
    Test-Dependencies
    Test-Assets
    
    # Build process
    Clear-BuildDirectories
    Build-NextApp
    
    # Build specific target or all targets
    if ($Target -ne "all" -and $Target -in $Targets) {
        if (Build-ElectronApp $Target) {
            Write-Success "Target $Target built successfully"
        }
        else {
            Write-Error "Target $Target build failed"
            exit 1
        }
    }
    elseif ($Target -eq "all") {
        if (-not (Build-AllTargets)) {
            Write-Error "Some builds failed"
            exit 1
        }
    }
    else {
        Write-Error "Invalid target: $Target. Valid targets are: $($Targets -join ', '), all"
        exit 1
    }
    
    # Post-build tasks
    Optimize-Builds
    New-Checksums
    Get-Artifacts
    
    Write-Host ""
    Write-Success "🎉 Windows build process completed successfully!"
    Write-Log "📁 Artifacts are available in: $DistDir" -Color Cyan
}

# Execute main function
Main
