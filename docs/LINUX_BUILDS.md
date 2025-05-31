# 🐧 DropSentinel Linux Builds - Comprehensive Guide

This document provides detailed information about DropSentinel's comprehensive Linux build system, which supports multiple package formats, architectures, and advanced system integration features.

## 📦 Supported Package Formats

DropSentinel now supports **7 different Linux package formats** to ensure compatibility across all major Linux distributions:

### Core Formats (Always Built)

| Format | Extension | Description | Target Distributions |
|--------|-----------|-------------|---------------------|
| **AppImage** | `.AppImage` | Universal Linux application format | All Linux distributions |
| **DEB** | `.deb` | Debian package format | Ubuntu, Debian, Linux Mint, Pop!_OS |
| **RPM** | `.rpm` | Red Hat package format | Fedora, RHEL, CentOS, openSUSE |
| **TAR.GZ** | `.tar.gz` | Compressed archive | Manual installation on any Linux |

### Advanced Formats (Built when tools available)

| Format | Extension | Description | Target Distributions |
|--------|-----------|-------------|---------------------|
| **Snap** | `.snap` | Ubuntu Snap package | Ubuntu, derivatives with snapd |
| **Flatpak** | `.flatpak` | Universal sandboxed package | Most modern Linux distributions |
| **Pacman** | `.pkg.tar.xz` | Arch Linux package | Arch Linux, Manjaro, EndeavourOS |

## 🏗️ Architecture Support

All package formats are built for **multiple architectures**:

- **x64** (Intel/AMD 64-bit) - Primary architecture
- **ARM64** (AArch64) - For ARM-based systems like Raspberry Pi 4+, Apple Silicon via emulation

## 🔧 Enhanced System Integration

### Systemd Integration
- **Background monitoring service** automatically installed
- **User service** for per-user background monitoring
- **Automatic startup** configuration (can be disabled by user)
- **Graceful shutdown** handling during package removal

### Desktop Integration
- **Enhanced .desktop file** with comprehensive metadata
- **File associations** for executable files, archives, and suspicious files
- **MIME type registration** for custom file types
- **Icon integration** with hicolor icon theme
- **Right-click context menu** for file scanning

### System Services
- **USB device monitoring** with udev rules
- **Automatic scanning** of newly connected USB devices
- **Log rotation** configuration for application logs
- **System PATH integration** for command-line access

### Security Features
- **SELinux support** for RPM packages on RHEL/Fedora
- **Proper file permissions** and SUID bits where needed
- **Quarantine directory** with restricted access
- **Secure cleanup** during package removal

## 📋 Installation Scripts

### Enhanced Post-Install Features
- **Comprehensive system integration** setup
- **Dependency verification** and installation
- **Service registration** and activation
- **Desktop database updates** (applications, MIME types, icons)
- **User notification** of successful installation
- **Helpful installation summary** with usage instructions

### Graceful Removal Process
- **Pre-removal script** stops running processes gracefully
- **User data backup** before removal (logs, cache)
- **Selective cleanup** (preserves quarantine for security review)
- **Complete system cleanup** (services, desktop integration, udev rules)
- **Database updates** to remove application traces

## 🚀 Build System

### Comprehensive Build Script
The `scripts/build-linux-comprehensive.sh` script provides:

- **Intelligent dependency detection** and installation
- **Multi-format parallel building** capabilities
- **Architecture-specific optimizations**
- **Detailed build logging** and reporting
- **Fallback strategies** for failed builds
- **Package integrity verification**
- **Comprehensive build reports** in JSON format

### Usage Examples

```bash
# Build all formats for all architectures
./scripts/build-linux-comprehensive.sh

# Build specific formats
./scripts/build-linux-comprehensive.sh deb rpm

# Build for x64 only
./scripts/build-linux-comprehensive.sh --x64-only

# Clean build with verbose output
./scripts/build-linux-comprehensive.sh --clean --verbose

# Build AppImage for ARM64 only
./scripts/build-linux-comprehensive.sh --arm64-only AppImage
```

### NPM Scripts

```bash
# Individual format builds
npm run dist:linux:appimage    # AppImage format
npm run dist:linux:deb         # Debian package
npm run dist:linux:rpm         # RPM package
npm run dist:linux:snap        # Snap package
npm run dist:linux:flatpak     # Flatpak package
npm run dist:linux:pacman      # Arch package
npm run dist:linux:tar         # TAR.GZ archive

# Architecture-specific builds
npm run dist:linux:x64         # x64 architecture only
npm run dist:linux:arm64       # ARM64 architecture only
npm run dist:linux:universal   # Both architectures

# Comprehensive builds
npm run dist:linux:all         # All core formats
npm run dist:linux:comprehensive  # All formats including advanced
```

## 🔍 Package Verification

### Automatic Verification
The build system automatically verifies package integrity:

- **DEB packages**: `dpkg-deb --info` verification
- **RPM packages**: `rpm -qip` verification  
- **AppImage packages**: File format verification
- **Archive packages**: Compression integrity checks

### Manual Verification

```bash
# Verify DEB package
dpkg-deb --info DropSentinel-*.deb
dpkg-deb --contents DropSentinel-*.deb

# Verify RPM package
rpm -qip DropSentinel-*.rpm
rpm -qlp DropSentinel-*.rpm

# Test AppImage
chmod +x DropSentinel-*.AppImage
./DropSentinel-*.AppImage --help
```

## 📊 Build Reports

Each comprehensive build generates a detailed JSON report containing:

- **Build metadata** (timestamp, version, build ID)
- **Target platforms** and architectures
- **Generated artifacts** with sizes
- **Build duration** and performance metrics
- **Success/failure status** for each format

## 🛠️ Development

### Adding New Package Formats

1. **Update package.json** with new target configuration
2. **Add build script** in `scripts/` directory
3. **Update GitHub workflow** to include new format
4. **Add verification logic** to build scripts
5. **Update documentation** and README files

### Testing Builds Locally

```bash
# Install build dependencies
sudo apt-get install build-essential libnss3-dev libgtk-3-dev

# Run comprehensive build
npm run dist:linux:comprehensive

# Test specific package
sudo dpkg -i dist/DropSentinel-*.deb  # For DEB
sudo rpm -i dist/DropSentinel-*.rpm   # For RPM
```

## 🐛 Troubleshooting

### Common Issues

1. **Missing build tools**: Install distribution-specific build tools
2. **Permission errors**: Ensure proper file permissions on build scripts
3. **Dependency conflicts**: Use clean build environment
4. **Architecture mismatches**: Verify target architecture support

### Build Logs

Comprehensive build logs are available in:
- `logs/linux-build-*.log` - Detailed build process logs
- `dist/linux-build-report-*.json` - Structured build reports

## 📈 Performance Optimizations

- **Parallel builds** across different package formats
- **Intelligent caching** of build dependencies and artifacts
- **Maximum compression** for smaller package sizes
- **Optimized memory allocation** for large builds
- **Incremental builds** when possible

## 🔗 Related Documentation

- [Main README](../README.md) - General project information
- [Build System](BUILD_SYSTEM.md) - Overall build system documentation
- [GitHub Workflows](.github/workflows/) - CI/CD configuration
- [Package Configuration](../package.json) - Electron Builder configuration

---

**Note**: This comprehensive Linux build system ensures DropSentinel works seamlessly across all major Linux distributions with proper system integration and security features.
