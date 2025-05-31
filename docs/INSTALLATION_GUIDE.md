# 📦 DropSentinel Installation Guide

Welcome to DropSentinel! This comprehensive guide covers installation on Windows, macOS, and Linux systems.

## 🎯 Quick Installation

### Download Options

Visit [dropsentinel.com/download](https://dropsentinel.com/download) or [GitHub Releases](https://github.com/JSB2010/DropSentinel/releases) to download:

- **Windows**: NSIS Installer, MSI Package, or Portable EXE
- **macOS**: Universal DMG (Intel & Apple Silicon) or PKG Installer
- **Linux**: AppImage, DEB, RPM, or other package formats

## 🪟 Windows Installation

### Recommended: NSIS Installer

1. **Download** `DropSentinel-Setup-1.0.0-x64.exe`
2. **Run** the installer (see SmartScreen section below)
3. **Follow** the installation wizard
4. **Launch** DropSentinel from Start Menu or Desktop

### 🛡️ Windows SmartScreen Warning - This is Normal!

When you first run DropSentinel, Windows may show this warning:

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
```

**This is completely normal!** Here's why and how to proceed safely:

## 🤔 Why Does This Happen?

1. **No Code Signing Certificate**: DropSentinel is currently not code-signed with an expensive certificate ($300-400/year)
2. **New Software**: Windows is cautious about new applications without established reputation
3. **Security Feature**: SmartScreen protects users from potentially harmful downloads

## ✅ How to Install Safely

### Step 1: Click "More info"
When you see the SmartScreen warning, click the **"More info"** link at the bottom.

### Step 2: Click "Run anyway"
After clicking "More info", you'll see a **"Run anyway"** button. Click it to proceed.

### Step 3: Proceed with installation
The installer will now run normally. Follow the installation wizard.

## 🔒 Is DropSentinel Safe?

**Yes, absolutely!** Here's why you can trust DropSentinel:

- ✅ **Open Source**: All code is publicly available on GitHub
- ✅ **No Malware**: The application contains no malicious code
- ✅ **Security Focused**: Built specifically to protect your files
- ✅ **Transparent**: You can review the entire codebase
- ✅ **Community Verified**: Open to public scrutiny and contributions

## 🎯 Alternative Installation Methods

If you prefer to avoid the SmartScreen warning entirely:

### Option 1: Build from Source
```bash
git clone https://github.com/JSB2010/DropSentinel.git dropsentinel
cd dropsentinel
npm install
npm run build
npm run dist:win
```

### Option 2: Use Package Managers (Coming Soon)
- **Chocolatey**: `choco install dropsentinel` (planned)
- **Winget**: `winget install DropSentinel` (planned)
- **Microsoft Store**: Distribution planned

## 🚀 What Happens After Installation?

1. **System Tray Icon**: DropSentinel runs in your system tray
2. **Background Monitoring**: Automatically monitors your Downloads folder
3. **File Scanning**: New files are scanned with VirusTotal
4. **Threat Detection**: Malicious files are quarantined or deleted
5. **Notifications**: You're alerted about scan results

## ⚙️ First-Time Setup

1. **API Key**: You'll need a free VirusTotal API key
2. **Folder Selection**: Choose which folders to monitor
3. **Preferences**: Configure scan settings and notifications

## 🆘 Troubleshooting

### "This app can't run on your PC"
- **Cause**: Wrong architecture (x64 vs ARM)
- **Solution**: Download the correct version for your system

### "Windows cannot access the specified device"
- **Cause**: Antivirus blocking the installer
- **Solution**: Temporarily disable antivirus or add exception

### Installation fails silently
- **Cause**: Insufficient permissions
- **Solution**: Right-click installer and "Run as administrator"

## 🍎 macOS Installation

### Recommended: DMG Disk Image

1. **Download** `DropSentinel-1.0.0-universal.dmg`
2. **Open** the DMG file
3. **Drag** DropSentinel to Applications folder
4. **Launch** from Applications or Spotlight

### Alternative: PKG Installer

1. **Download** `DropSentinel-1.0.0-universal.pkg`
2. **Double-click** to run installer
3. **Follow** installation prompts
4. **Launch** from Applications

### macOS Security Notes

- DropSentinel is compatible with macOS Gatekeeper
- Universal binary supports Intel and Apple Silicon Macs
- Requires macOS 10.15 (Catalina) or later

## 🐧 Linux Installation

### Recommended: AppImage (Universal)

1. **Download** `DropSentinel-1.0.0-x64.AppImage`
2. **Make executable**: `chmod +x DropSentinel-1.0.0-x64.AppImage`
3. **Run**: `./DropSentinel-1.0.0-x64.AppImage`

### Debian/Ubuntu: DEB Package

```bash
wget https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-x64.deb
sudo dpkg -i DropSentinel-1.0.0-x64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### RHEL/CentOS/Fedora: RPM Package

```bash
wget https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-x64.rpm
sudo rpm -i DropSentinel-1.0.0-x64.rpm
# or
sudo dnf install DropSentinel-1.0.0-x64.rpm
```

## 🔮 Future Distribution Plans

We're working on expanding distribution options:

- **Windows Store**: Microsoft Store submission planned
- **Package Managers**: Chocolatey, Winget, Homebrew, Snap, Flatpak
- **Code Signing**: Trusted certificates for all platforms

## 💻 System Requirements

### Minimum Requirements

| Platform | OS Version | RAM | Storage | Architecture |
|----------|------------|-----|---------|--------------|
| Windows | Windows 10 (1903) or later | 4 GB | 200 MB | x64, ARM64 |
| macOS | macOS 10.15 (Catalina) or later | 4 GB | 200 MB | Intel, Apple Silicon |
| Linux | Ubuntu 18.04 LTS or equivalent | 4 GB | 200 MB | x64, ARM64 |

### Additional Requirements

- **Internet Connection**: Required for VirusTotal API
- **VirusTotal API Key**: Free registration at virustotal.com
- **Administrator Privileges**: For installation only

## ⚙️ First-Time Setup

After installation, DropSentinel will guide you through initial setup:

1. **API Key Configuration**: Enter your free VirusTotal API key
2. **Folder Selection**: Choose which folders to monitor
3. **Notification Preferences**: Configure alert settings
4. **Background Mode**: Enable auto-start and system tray operation

## 📞 Support & Help

- **Website**: [dropsentinel.com](https://dropsentinel.com)
- **User Guide**: [Complete user documentation](../USER_GUIDE.md)
- **GitHub Issues**: [Report bugs and problems](https://github.com/JSB2010/DropSentinel/issues)
- **Discussions**: [Community support](https://github.com/JSB2010/DropSentinel/discussions)

## 🏆 Why Choose DropSentinel?

- **🛡️ Real-time Protection**: Monitors files as they're downloaded
- **🔍 VirusTotal Integration**: Uses 70+ antivirus engines
- **⚡ Lightweight**: Minimal system resource usage
- **🔒 Privacy Focused**: No data collection or tracking
- **💰 Free & Open Source**: No hidden costs or subscriptions
- **🌍 Cross-Platform**: Native support for Windows, macOS, and Linux

---

**Security Note**: DropSentinel is safe, open-source software designed to protect your computer from real threats. Any security warnings during installation are normal for new applications without expensive code signing certificates.
