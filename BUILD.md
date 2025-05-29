# DropSentinel Build System

This document describes the comprehensive build system for DropSentinel, which creates optimized installers for multiple platforms and formats.

## 🎯 Supported Platforms & Formats

### macOS
- **`.app`** - Application bundle (directory format)
- **`.dmg`** - Disk image installer with custom background
- **`.pkg`** - macOS installer package with pre/post install scripts
- **`.zip`** - Compressed application bundle

### Windows
- **`.exe` (NSIS)** - Advanced installer with custom UI and options
- **`.msi`** - Windows Installer package
- **`.exe` (Portable)** - Standalone executable (no installation required)
- **`.zip`** - Compressed application

### Linux
- **`.AppImage`** - Universal Linux application format
- **`.deb`** - Debian/Ubuntu package
- **`.rpm`** - Red Hat/Fedora package
- **`.tar.gz`** - Compressed archive

## 🚀 Quick Start

### Build All Platforms (Recommended)
```bash
npm run build:all
```

### Build Specific Platform
```bash
# macOS (requires macOS)
npm run dist:mac

# Windows (cross-platform)
npm run dist:win

# Linux (requires macOS or Linux)
npm run dist:linux
```

### Build Specific Installer Type
```bash
# macOS
npm run dist:mac:dmg    # DMG only
npm run dist:mac:pkg    # PKG only

# Windows
npm run dist:win:nsis   # NSIS installer only
npm run dist:win:msi    # MSI installer only
npm run dist:win:portable # Portable exe only
```

## 🛠️ Advanced Build Options

### Comprehensive Build Script
The main build script provides advanced options:

```bash
# Clean build with verbose output
scripts/build-comprehensive.sh --clean --verbose all

# Build specific platform with custom targets
scripts/build-comprehensive.sh mac dmg pkg

# Skip dependency installation
scripts/build-comprehensive.sh --no-deps win

# Skip tests
scripts/build-comprehensive.sh --no-test linux
```

### Platform-Specific Scripts

#### macOS Build Script
```bash
scripts/build-mac.sh [--target TARGET]

# Examples
scripts/build-mac.sh --target dmg
scripts/build-mac.sh --target all
```

#### Windows Build Script
```powershell
scripts/build-win.ps1 [-Target TARGET]

# Examples
scripts/build-win.ps1 -Target nsis
scripts/build-win.ps1 -Target all
```

## 📁 Build Output Structure

```
dist/
├── mac/
│   ├── DropSentinel-1.0.0-arm64.dmg
│   ├── DropSentinel-1.0.0-x64.dmg
│   ├── DropSentinel-1.0.0-arm64.pkg
│   ├── DropSentinel-1.0.0-x64.pkg
│   └── DropSentinel-1.0.0-mac.zip
├── win/
│   ├── DropSentinel-Setup-1.0.0-x64.exe
│   ├── DropSentinel-Setup-1.0.0-arm64.exe
│   ├── DropSentinel-Setup-1.0.0-x64.msi
│   ├── DropSentinel-Portable-1.0.0-x64.exe
│   └── DropSentinel-1.0.0-win.zip
├── linux/
│   ├── DropSentinel-1.0.0-x86_64.AppImage
│   ├── DropSentinel_1.0.0_amd64.deb
│   ├── DropSentinel-1.0.0.x86_64.rpm
│   └── DropSentinel-1.0.0.tar.gz
├── checksums.txt
└── build-report-TIMESTAMP.json
```

## ⚙️ Build Configuration

### Electron Builder Configuration
The build configuration is defined in `package.json` under the `build` section:

- **Compression**: Maximum compression for smaller file sizes
- **Code Signing**: Configured for both macOS and Windows (disabled by default)
- **Notarization**: macOS notarization support (requires Apple Developer account)
- **File Associations**: Custom file type associations
- **Auto-updater**: Ready for future update mechanisms

### Platform-Specific Features

#### macOS
- **Hardened Runtime**: Enhanced security
- **Entitlements**: Proper permissions for file access
- **Gatekeeper**: Compatible with macOS security requirements
- **Universal Binaries**: Support for both Intel and Apple Silicon

#### Windows
- **NSIS Installer**: Custom installer with options
- **MSI Package**: Enterprise-friendly installer
- **Code Signing**: Ready for certificate-based signing
- **Registry Integration**: Proper Windows integration

#### Linux
- **AppImage**: Universal compatibility
- **Package Managers**: Native package formats
- **Desktop Integration**: Proper Linux desktop integration

## 🔧 Build Environment Setup

### Prerequisites
- **Node.js** 18+ with npm
- **Git** for version control
- **Platform-specific tools**:
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools (optional)
  - Linux: Standard build tools

### Dependencies Installation
```bash
npm install
```

### Asset Requirements
Ensure these assets exist before building:
- `public/assets/app-icon.ico` (Windows)
- `public/assets/app-icon.icns` (macOS)
- `public/assets/app-icon.png` (Linux/fallback)
- `build/entitlements.mac.plist` (macOS)

## 📊 Build Optimization

### Size Optimization
- **Tree Shaking**: Removes unused code
- **Compression**: Maximum compression settings
- **Asset Optimization**: Optimized images and resources
- **Dependency Pruning**: Excludes development dependencies

### Performance Features
- **Parallel Builds**: Multiple architectures built simultaneously
- **Incremental Builds**: Faster subsequent builds
- **Caching**: Electron and dependency caching
- **Build Reports**: Detailed build analytics

## 🔍 Troubleshooting

### Common Issues

#### Build Fails on macOS
```bash
# Check Xcode Command Line Tools
xcode-select --install

# Verify code signing setup
codesign --version
```

#### Build Fails on Windows
```powershell
# Check Visual Studio Build Tools
npm config get msvs_version

# Install Windows Build Tools if needed
npm install --global windows-build-tools
```

#### Permission Errors
```bash
# Fix script permissions
chmod +x scripts/*.sh
chmod +x build/pkg-scripts/*
```

### Build Logs
Build logs are automatically generated in the `logs/` directory:
- `logs/build-TIMESTAMP.log` - Comprehensive build log
- `dist/build-report-TIMESTAMP.json` - Build report with artifacts

### Debug Mode
Enable verbose output for debugging:
```bash
npm run build:verbose
```

## 🚀 CI/CD Integration

### GitHub Actions
The repository includes GitHub Actions workflows:
- `.github/workflows/build-packages.yml` - Automated builds
- `.github/workflows/release.yml` - Release automation

### Environment Variables
For automated builds, set these environment variables:
- `CSC_LINK` - macOS code signing certificate
- `CSC_KEY_PASSWORD` - Certificate password
- `APPLE_API_KEY_ID` - Apple API key for notarization
- `WIN_CSC_LINK` - Windows code signing certificate

## 📝 Build Scripts Reference

| Script | Description | Platform |
|--------|-------------|----------|
| `build:all` | Build all platforms | Cross-platform |
| `build:clean` | Clean build artifacts | Cross-platform |
| `dist:mac` | Build all macOS formats | macOS only |
| `dist:win` | Build all Windows formats | Cross-platform |
| `dist:linux` | Build all Linux formats | macOS/Linux |
| `build:comprehensive` | Advanced build script | Cross-platform |
| `build:verbose` | Verbose build output | Cross-platform |
| `build:clean-all` | Clean build with all platforms | Cross-platform |

## 🎯 Best Practices

1. **Always clean build** for releases: `npm run build:clean-all`
2. **Test on target platforms** before distribution
3. **Verify checksums** for integrity
4. **Use proper code signing** for production releases
5. **Monitor build logs** for warnings and errors
6. **Keep dependencies updated** for security

## 📞 Support

For build-related issues:
1. Check the build logs in `logs/`
2. Review the build report in `dist/`
3. Consult the troubleshooting section above
4. Open an issue on GitHub with build logs attached
