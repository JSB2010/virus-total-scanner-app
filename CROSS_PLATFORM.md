# 🌍 Cross-Platform Compatibility Guide

This document outlines the cross-platform features and compatibility of Sentinel Guard across Windows, macOS, and Linux.

## 🖥️ Supported Platforms

### Windows 🪟
- **Versions**: Windows 10, Windows 11
- **Architectures**: x64, ARM64
- **Setup Script**: `scripts/setup-dev.ps1`

### macOS 🍎
- **Versions**: macOS 10.15 (Catalina) and later
- **Architectures**: Intel x64, Apple Silicon ARM64
- **Setup Script**: `scripts/setup-dev.sh`

### Linux 🐧
- **Distributions**: Ubuntu, Debian, CentOS, RHEL, Arch, and more
- **Architectures**: x64, ARM64
- **Setup Script**: `scripts/setup-dev.sh`

## 📁 Platform-Specific Paths

### Downloads Monitoring
- **Windows**: `%USERPROFILE%\Downloads`
- **macOS**: `~/Downloads`
- **Linux**: `~/Downloads`

### Quarantine Storage
- **Windows**: `%LOCALAPPDATA%\SentinelGuard\quarantine`
- **macOS**: `~/Library/Application Support/SentinelGuard/quarantine`
- **Linux**: `~/.local/share/SentinelGuard/quarantine` (XDG compliant)

## 🔍 File Type Detection

### High-Risk Files
- **Windows**: `.exe`, `.msi`, `.bat`, `.cmd`, `.scr`, `.pif`, `.com`, `.vbs`, `.ps1`, `.reg`, `.hta`
- **macOS**: `.app`, `.command`, `.workflow`
- **Linux**: `.sh`, `.run`, `.bin`
- **Cross-Platform**: `.jar`, `.py`, `.rb`, `.pl`, `.php`

### Medium-Risk Files
- **Archives**: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.bz2`, `.xz`, `.cab`, `.iso`
- **Installers**: `.dmg`, `.pkg` (macOS), `.deb`, `.rpm`, `.appimage`, `.snap`, `.flatpak` (Linux)
- **Documents with Macros**: `.docm`, `.xlsm`, `.pptm`

## 🚀 Quick Setup

### Automated Setup
```bash
# macOS/Linux
./scripts/setup-dev.sh

# Windows (PowerShell)
.\scripts\setup-dev.ps1
```

### Manual Setup
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your VirusTotal API key
npm run dev
npm run electron-dev
```

## 🏗️ Building

### Current Platform
```bash
npm run electron-pack
```

### Cross-Platform Builds
```bash
# Windows (from any platform)
npm run electron-pack -- --win

# macOS (from macOS only)
npm run electron-pack -- --mac

# Linux (from Linux/macOS)
npm run electron-pack -- --linux
```

## 🔧 Technical Implementation

### Path Resolution
- Uses Node.js `path` module for cross-platform path handling
- Platform detection via `process.platform`
- XDG Base Directory Specification compliance on Linux

### File System Operations
- Graceful fallbacks for missing directories
- Platform-appropriate permission handling
- Robust error handling across all platforms

### Security Features
- macOS: Full sandboxing and notarization support
- Windows: Code signing compatibility
- Linux: Standard Unix permissions

## 🧪 Testing

Run the cross-platform compatibility test:
```bash
node -e "
const os = require('os');
const path = require('path');
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Home:', os.homedir());
console.log('Downloads:', path.join(os.homedir(), 'Downloads'));
"
```

## 📝 Notes

- All file paths use forward slashes internally and are converted appropriately
- Environment variables are handled consistently across platforms
- Native notifications work on all supported platforms
- System tray integration is fully cross-platform compatible

For more detailed information, see the main [README.md](README.md) file.
