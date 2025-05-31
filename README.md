# 🛡️ DropSentinel

**Advanced file security scanner with drag-and-drop protection**

[![CI](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/ci.yml/badge.svg)](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🌟 Features

- **🔍 Real-time File Scanning** - Automatic detection and scanning of new files
- **🛡️ VirusTotal Integration** - Leverage the power of VirusTotal's comprehensive threat database
- **📁 Background Monitoring** - Continuous monitoring of Downloads folder and custom locations
- **🎯 Smart Detection** - Advanced threat classification and detailed analysis
- **🗂️ Quarantine Management** - Safe isolation and management of detected threats
- **📊 Detailed Analytics** - Comprehensive scan history and threat analytics
- **🌙 Modern UI/UX** - Ultra-modern, responsive design with dark/light mode support
- **⚡ High Performance** - Built with Next.js and optimized for speed
- **🔔 System Notifications** - Native system notifications for scan results
- **⚙️ Customizable Settings** - Flexible configuration options for all user needs
- **🌍 Cross-Platform** - Full compatibility with Windows, macOS, and Linux

## 🖥️ Platform Support

DropSentinel is designed to work seamlessly across all major operating systems:

### Windows 🪟
- **Supported Versions**: Windows 10, Windows 11
- **Architectures**: x64, ARM64
- **Downloads Monitoring**: `%USERPROFILE%\Downloads`
- **Quarantine Storage**: `%LOCALAPPDATA%\DropSentinel\quarantine`
- **File Types**: Comprehensive Windows executable detection (.exe, .msi, .bat, .cmd, .scr, .pif, .com, .vbs, .ps1)

### macOS 🍎
- **Supported Versions**: macOS 10.15 (Catalina) and later
- **Architectures**: Intel (x64), Apple Silicon (ARM64)
- **Downloads Monitoring**: `~/Downloads`
- **Quarantine Storage**: `~/Library/Application Support/DropSentinel/quarantine`
- **File Types**: macOS-specific detection (.dmg, .pkg, .app, .command, .workflow)
- **Security**: Full compatibility with macOS security features and notarization

### Linux 🐧
- **Supported Distributions**: Ubuntu, Debian, CentOS, RHEL, Arch, and more
- **Architectures**: x64, ARM64
- **Downloads Monitoring**: `~/Downloads`
- **Quarantine Storage**: `~/.local/share/DropSentinel/quarantine` (XDG compliant)
- **File Types**: Linux executable detection (.deb, .rpm, .appimage, .snap, .flatpak, .sh, .run)

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**, **yarn**, or **pnpm**
- **VirusTotal API Key** (free registration at [VirusTotal](https://www.virustotal.com/))

### Installation

#### Automated Setup (Recommended)

**For macOS and Linux:**
```bash
git clone https://github.com/JSB2010/virus-total-scanner-app.git dropsentinel
cd dropsentinel
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

**For Windows (PowerShell):**
```powershell
git clone https://github.com/JSB2010/virus-total-scanner-app.git dropsentinel
cd dropsentinel
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup-dev.ps1
```

#### Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JSB2010/virus-total-scanner-app.git dropsentinel
   cd dropsentinel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your VirusTotal API key to `.env.local`:
   ```
   VIRUSTOTAL_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Launch the Electron app**
   ```bash
   npm run electron-dev
   # or
   yarn electron-dev
   # or
   pnpm electron-dev
   ```

## 📦 Download Pre-built Packages

Pre-built packages for **Windows**, **macOS**, and **Linux** are automatically generated for every commit to the main branch. You can download them from the [GitHub Actions artifacts](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/optimized-build.yml) without waiting for a formal release.

1. Go to the [Optimized Build workflow](https://github.com/JSB2010/virus-total-scanner-app/actions/workflows/optimized-build.yml)
2. Click on the latest successful run
3. Download the artifact for your platform:
   - `windows-comprehensive-*` for Windows (EXE, MSI, ZIP, Portable)
   - `macos-universal-*` for macOS (DMG, PKG, ZIP)
   - `linux-comprehensive-*` for Linux (AppImage, DEB, RPM, TAR.GZ, Snap, Flatpak, Pacman)

**Linux Distribution Compatibility:**
- **Ubuntu/Debian**: Use `.deb` packages
- **Fedora/RHEL/CentOS**: Use `.rpm` packages
- **Arch Linux/Manjaro**: Use `.pkg.tar.xz` packages
- **Universal**: Use `.AppImage` (works on all distributions)
- **Snap-enabled systems**: Use `.snap` packages
- **Flatpak-enabled systems**: Use `.flatpak` packages

## 🏗️ Building for Production

### Web Application
```bash
npm run build
npm start
```

### Desktop Application

#### Build for Current Platform
```bash
npm run electron-pack
```

#### Cross-Platform Builds

**Windows Builds:**
```bash
npm run dist:win:portable  # Portable executable
npm run dist:win:nsis      # NSIS installer
npm run dist:win:msi       # MSI installer
npm run dist:win:zip       # ZIP archive
npm run dist:win:all       # All Windows packages
```

**macOS Builds:**
```bash
npm run dist:mac:dmg       # DMG disk image
npm run dist:mac:pkg       # PKG installer
npm run dist:mac:zip       # ZIP archive
npm run dist:mac:all       # All macOS packages
```

**Linux Builds (Comprehensive):**
```bash
# Core formats (always built)
npm run dist:linux:appimage # Universal AppImage
npm run dist:linux:deb      # Debian/Ubuntu package
npm run dist:linux:rpm      # Red Hat/Fedora package
npm run dist:linux:tar      # TAR.GZ archive

# Advanced formats (when tools available)
npm run dist:linux:snap     # Ubuntu Snap package
npm run dist:linux:flatpak  # Flatpak package
npm run dist:linux:pacman   # Arch Linux package

# Architecture-specific builds
npm run dist:linux:x64      # x64 architecture only
npm run dist:linux:arm64    # ARM64 architecture only
npm run dist:linux:universal # Both architectures

# Comprehensive builds
npm run dist:linux:all      # All core formats
npm run dist:linux:comprehensive # All formats including advanced

# Use the comprehensive build script for advanced features
./scripts/build-linux-comprehensive.sh
```

**Linux Features:**
- 🏗️ **Multi-architecture support**: x64 + ARM64
- 📦 **7 package formats**: AppImage, DEB, RPM, TAR.GZ, Snap, Flatpak, Pacman
- 🔧 **Systemd integration**: Background monitoring service
- 🖥️ **Enhanced desktop integration**: File associations, MIME types
- 🔐 **SELinux support**: For RPM packages on RHEL/Fedora
- 📋 **Comprehensive post-install scripts**: System integration
- 🔄 **Automatic system database updates**: Desktop, MIME, icons
- 📁 **USB device monitoring**: With udev rules
- 📝 **Log rotation**: Automatic log management

**All Platforms:**
```bash
npm run dist:all           # Build for all platforms
```

The built applications will be available in the `dist/` directory with platform-specific subdirectories.

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with [React 19](https://reactjs.org/)
- **Desktop Framework**: [Electron](https://www.electronjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **State Management**: React Hooks & Context
- **File Monitoring**: [Chokidar](https://github.com/paulmillr/chokidar)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Build Tool**: [Turbopack](https://turbo.build/pack) (enabled)

## 📖 Usage

### Initial Setup
1. Launch the application
2. Complete the welcome setup by entering your VirusTotal API key
3. Configure your preferred scan locations and settings

### Scanning Files
- **Automatic Scanning**: Files are automatically detected and scanned when added to monitored folders
- **Manual Scanning**: Drag and drop files or use the manual scan dialog
- **Bulk Scanning**: Select multiple files or entire directories for scanning

### Managing Results
- View detailed scan results with threat classifications
- Access comprehensive scan history
- Manage quarantined files safely
- Export scan reports for analysis

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please see our [Security Policy](SECURITY.md).

## 📞 Support

- 📧 **Email**: support@dropsentinel.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/JSB2010/virus-total-scanner-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/JSB2010/virus-total-scanner-app/discussions)

## 🙏 Acknowledgments

- [VirusTotal](https://www.virustotal.com/) for their comprehensive threat intelligence API
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Lucide](https://lucide.dev/) for beautiful icons
- The open-source community for amazing tools and libraries

---

<div align="center">
  <strong>Built with ❤️ for digital security</strong>
</div>
