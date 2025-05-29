# 📦 DropSentinel Installer Guide

## 🎯 Overview

DropSentinel provides comprehensive installer packages for all major platforms, each optimized for the best user experience and platform-specific conventions.

## 🪟 Windows Installers

### NSIS Installer (Recommended)
- **File**: `DropSentinel-Setup-1.0.0-x64.exe`
- **Features**: 
  - Professional installation wizard
  - Custom installation directory selection
  - Desktop and Start Menu shortcuts
  - Automatic uninstaller registration
  - Windows SmartScreen compatibility
  - Post-installation launch option

### MSI Installer (Enterprise)
- **File**: `DropSentinel-Setup-1.0.0-x64.msi`
- **Features**:
  - Windows Installer technology
  - Group Policy deployment support
  - Silent installation capabilities
  - Upgrade/downgrade management
  - Enterprise-friendly logging

### Portable Executable
- **File**: `DropSentinel-Portable-1.0.0-x64.exe`
- **Features**:
  - No installation required
  - Run from USB drives
  - Isolated configuration
  - Perfect for testing

### ZIP Archive
- **File**: `DropSentinel-Setup-1.0.0-x64.zip`
- **Features**:
  - Manual extraction
  - Full application bundle
  - Custom deployment scenarios

## 🍎 macOS Installers

### DMG Disk Image (Recommended)
- **File**: `DropSentinel-1.0.0-x64.dmg` / `DropSentinel-1.0.0-arm64.dmg`
- **Features**:
  - Professional drag-to-install interface
  - Custom background with installation instructions
  - Automatic mounting and verification
  - Gatekeeper compatibility
  - Universal Binary support (Intel + Apple Silicon)

### PKG Installer (System-wide)
- **File**: `DropSentinel-1.0.0-x64.pkg` / `DropSentinel-1.0.0-arm64.pkg`
- **Features**:
  - Native macOS installer experience
  - Welcome and conclusion screens
  - License agreement display
  - System-wide installation
  - Automatic permissions handling

### ZIP Archive
- **File**: `DropSentinel-1.0.0-x64.zip` / `DropSentinel-1.0.0-arm64.zip`
- **Features**:
  - Simple extraction
  - Manual installation
  - Developer-friendly

## 🐧 Linux Packages

### AppImage (Universal)
- **File**: `DropSentinel-1.0.0-x86_64.AppImage` / `DropSentinel-1.0.0-arm64.AppImage`
- **Features**:
  - Universal Linux compatibility
  - No installation required
  - Self-contained executable
  - Portable across distributions

### DEB Package (Debian/Ubuntu)
- **File**: `DropSentinel-1.0.0-amd64.deb`
- **Features**:
  - Native APT integration
  - Automatic dependency resolution
  - System integration
  - Desktop file registration
  - Post-install configuration

### RPM Package (Red Hat/Fedora)
- **File**: `DropSentinel-1.0.0-x86_64.rpm`
- **Features**:
  - Native YUM/DNF integration
  - Dependency management
  - System service integration
  - SELinux compatibility

### TAR.GZ Archive
- **File**: `DropSentinel-1.0.0-linux-x64.tar.gz` / `DropSentinel-1.0.0-linux-arm64.tar.gz`
- **Features**:
  - Manual installation
  - Custom deployment
  - Server environments

## 🚀 Installation Instructions

### Windows
1. **NSIS Installer** (Recommended):
   - Download `DropSentinel-Setup-1.0.0-x64.exe`
   - Right-click and select "Run as administrator" (if needed)
   - Follow the installation wizard
   - Launch DropSentinel from Desktop or Start Menu

2. **MSI Installer**:
   - Download `DropSentinel-Setup-1.0.0-x64.msi`
   - Double-click to run or use `msiexec` for silent installation
   - For silent install: `msiexec /i DropSentinel-Setup-1.0.0-x64.msi /quiet`

3. **Portable**:
   - Download `DropSentinel-Portable-1.0.0-x64.exe`
   - Run directly from any location
   - No installation required

### macOS
1. **DMG Installer** (Recommended):
   - Download the appropriate DMG for your architecture
   - Double-click to mount the disk image
   - Drag DropSentinel to the Applications folder
   - Launch from Applications or Launchpad

2. **PKG Installer**:
   - Download the appropriate PKG file
   - Double-click to run the installer
   - Follow the installation wizard
   - Enter administrator password when prompted

### Linux
1. **AppImage** (Recommended):
   - Download the AppImage file
   - Make it executable: `chmod +x DropSentinel-1.0.0-x86_64.AppImage`
   - Run directly: `./DropSentinel-1.0.0-x86_64.AppImage`

2. **DEB Package** (Debian/Ubuntu):
   ```bash
   sudo dpkg -i DropSentinel-1.0.0-amd64.deb
   sudo apt-get install -f  # Fix dependencies if needed
   ```

3. **RPM Package** (Red Hat/Fedora):
   ```bash
   sudo rpm -i DropSentinel-1.0.0-x86_64.rpm
   # or
   sudo dnf install DropSentinel-1.0.0-x86_64.rpm
   ```

4. **TAR.GZ Archive**:
   ```bash
   tar -xzf DropSentinel-1.0.0-linux-x64.tar.gz
   cd DropSentinel-1.0.0-linux-x64
   ./dropsentinel
   ```

## 🔧 Advanced Installation Options

### Silent Installation (Windows)
```cmd
# NSIS Installer
DropSentinel-Setup-1.0.0-x64.exe /S

# MSI Installer
msiexec /i DropSentinel-Setup-1.0.0-x64.msi /quiet /norestart
```

### Unattended Installation (macOS)
```bash
# PKG Installer
sudo installer -pkg DropSentinel-1.0.0-x64.pkg -target /
```

### System-wide Installation (Linux)
```bash
# Create system-wide installation
sudo mkdir -p /opt/dropsentinel
sudo tar -xzf DropSentinel-1.0.0-linux-x64.tar.gz -C /opt/dropsentinel --strip-components=1
sudo ln -sf /opt/dropsentinel/dropsentinel /usr/local/bin/dropsentinel
```

## 🛡️ Security Considerations

### Code Signing Status
- **Windows**: Unsigned (SmartScreen warnings expected)
- **macOS**: Unsigned (Gatekeeper warnings expected)
- **Linux**: Package integrity via checksums

### Verification
1. **Checksum Verification**: Always verify file integrity using provided checksums
2. **Source Verification**: Download only from official GitHub releases
3. **Antivirus Scanning**: Scan installers with your antivirus before installation

## 🆘 Troubleshooting

### Windows Issues
- **SmartScreen Warning**: Click "More info" → "Run anyway"
- **Antivirus False Positive**: Add exception for DropSentinel
- **Installation Failed**: Run as administrator

### macOS Issues
- **Gatekeeper Warning**: System Preferences → Security & Privacy → "Open Anyway"
- **Quarantine Attribute**: `xattr -d com.apple.quarantine /Applications/DropSentinel.app`

### Linux Issues
- **Permission Denied**: Ensure execute permissions on AppImage
- **Missing Dependencies**: Install required libraries for your distribution
- **Desktop Integration**: Run `update-desktop-database` after manual installation

## 📞 Support

For installation issues or questions:
- **GitHub Issues**: [Report Installation Problems](https://github.com/JSB2010/virus-total-scanner-app/issues)
- **Documentation**: Check README.md for additional information
- **Community**: Join discussions in GitHub Discussions
