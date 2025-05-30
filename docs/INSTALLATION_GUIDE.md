# DropSentinel Installation Guide

## 🛡️ Windows SmartScreen Warning - This is Normal!

When you download and run DropSentinel for the first time, Windows may show this warning:

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

App: DropSentinel-Setup-0.1.0-x64.exe
Publisher: Unknown publisher
```

**This is completely normal and expected!** Here's why and how to proceed safely:

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
git clone https://github.com/JSB2010/virus-total-scanner-app.git dropsentinel
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

## 🔮 Future Plans

We're working on eliminating the SmartScreen warning:

- **Q1 2024**: Self-signed certificate implementation
- **Q2 2024**: Code signing certificate purchase
- **Q3 2024**: Microsoft Store submission
- **Q4 2024**: Windows Package Manager integration

## 📞 Need Help?

- **GitHub Issues**: [Report problems](https://github.com/JSB2010/virus-total-scanner-app/issues)
- **Documentation**: [Full documentation](https://github.com/JSB2010/virus-total-scanner-app/wiki)
- **Community**: [Discussions](https://github.com/JSB2010/virus-total-scanner-app/discussions)

## 🏆 Why Choose DropSentinel?

- **Real-time Protection**: Monitors files as they're downloaded
- **VirusTotal Integration**: Uses 70+ antivirus engines
- **Lightweight**: Minimal system resource usage
- **Privacy Focused**: No data collection or tracking
- **Free & Open Source**: No hidden costs or subscriptions

---

**Remember**: The SmartScreen warning is just Windows being cautious. DropSentinel is safe, effective, and designed to protect your computer from real threats!
