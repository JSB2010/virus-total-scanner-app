# 📖 DropSentinel User Guide

Welcome to DropSentinel! This guide will help you get started with advanced file security scanning and real-time protection.

## 🚀 Getting Started

### First Launch

When you first launch DropSentinel, you'll see the welcome screen that guides you through initial setup:

1. **API Key Setup**: Enter your free VirusTotal API key
   - Get one at [virustotal.com](https://www.virustotal.com/gui/join-us)
   - Click "Sign up" and verify your email
   - Go to your profile and copy your API key

2. **Monitoring Preferences**: Choose which folders to monitor
   - Downloads folder (recommended)
   - Custom folders of your choice

3. **Notification Settings**: Configure how you want to be notified
   - System notifications
   - In-app notifications
   - Sound alerts

### Main Dashboard

The main dashboard provides an overview of your system's security status:

- **Scan Statistics**: Total scans, threats detected, files quarantined
- **Recent Activity**: Latest scan results and file detections
- **Quick Actions**: Manual scan, settings, quarantine management

## 🔍 Scanning Files

### Automatic Scanning

DropSentinel automatically monitors your configured folders and scans new files:

1. **File Detection**: When a new file is added to a monitored folder
2. **Scan Prompt**: A dialog appears asking if you want to scan the file
3. **Scanning Process**: File is uploaded to VirusTotal for analysis
4. **Results**: You're notified of the scan results

### Manual Scanning

You can manually scan files at any time:

1. **Drag & Drop**: Drag files directly onto the DropSentinel window
2. **File Dialog**: Use the "Scan Files" button to select files
3. **Context Menu**: Right-click files in your file manager (if enabled)

### Scan Results

Scan results show detailed information:

- **Threat Level**: Clean, Suspicious, or Malicious
- **Detection Count**: How many antivirus engines detected threats
- **Detailed Report**: Link to full VirusTotal report
- **Recommended Action**: What DropSentinel suggests you do

## 🛡️ Threat Management

### Quarantine System

When threats are detected, DropSentinel can quarantine them:

- **Automatic Quarantine**: Malicious files are moved to a secure location
- **Manual Quarantine**: You can quarantine suspicious files
- **Quarantine Review**: View and manage quarantined files
- **Restore Files**: Restore false positives if needed

### Threat Actions

For each detected threat, you can:

- **Quarantine**: Move to secure isolation
- **Delete**: Permanently remove the file
- **Ignore**: Mark as safe (not recommended for malicious files)
- **View Report**: See detailed VirusTotal analysis

## ⚙️ Settings & Configuration

### General Settings

- **Auto-start**: Launch DropSentinel when your computer starts
- **Background Mode**: Run in system tray/menu bar
- **Update Checks**: Automatically check for app updates

### Monitoring Settings

- **Folder Selection**: Choose which folders to monitor
- **File Types**: Configure which file types to scan
- **Scan Sensitivity**: Adjust detection sensitivity
- **Exclusions**: Add files/folders to skip scanning

### Notification Settings

- **System Notifications**: Native OS notifications
- **Sound Alerts**: Audio notifications for threats
- **Email Alerts**: Email notifications (if configured)
- **Notification Frequency**: How often to show notifications

### Advanced Settings

- **API Configuration**: VirusTotal API settings
- **Quarantine Location**: Where quarantined files are stored
- **Log Level**: Debugging and logging options
- **Performance**: Resource usage optimization

## 🖥️ Platform-Specific Features

### Windows

- **System Tray**: DropSentinel runs in your system tray
- **Context Menu**: Right-click files to scan them
- **Windows Defender**: Works alongside Windows Defender
- **Startup Integration**: Auto-start with Windows

### macOS

- **Menu Bar**: Access DropSentinel from the menu bar
- **Dock Integration**: Show/hide from dock as needed
- **Spotlight**: Quick access via Spotlight search
- **Gatekeeper**: Compatible with macOS security features

### Linux

- **Desktop Integration**: Native Linux desktop integration
- **Package Managers**: Install via DEB, RPM, or AppImage
- **System Service**: Optional background service mode
- **File Associations**: Integrate with file managers

## 🔧 Troubleshooting

### Common Issues

**DropSentinel won't start**
- Check if you have a valid VirusTotal API key
- Ensure you have internet connectivity
- Try running as administrator (Windows) or with sudo (Linux)

**Files aren't being detected**
- Verify folder monitoring is enabled
- Check if the folder path is correct
- Ensure file types are not excluded

**Scans are slow**
- VirusTotal has rate limits for free accounts
- Large files take longer to upload and scan
- Check your internet connection speed

**False positives**
- Some antivirus engines may flag legitimate files
- Review the detailed report to understand detections
- You can restore files from quarantine if needed

### Getting Help

If you need assistance:

1. **Check Logs**: View application logs in settings
2. **GitHub Issues**: Report bugs on our GitHub repository
3. **Community**: Join discussions on GitHub Discussions
4. **Documentation**: Review our comprehensive documentation

## 🔒 Privacy & Security

### Data Privacy

- **No Data Collection**: DropSentinel doesn't collect personal data
- **Local Processing**: File analysis happens via VirusTotal API
- **Secure Storage**: API keys and settings stored securely locally

### Security Best Practices

- **Keep Updated**: Always use the latest version
- **Verify Downloads**: Only download from official sources
- **API Key Security**: Keep your VirusTotal API key private
- **Regular Scans**: Scan downloaded files regularly

## 📊 Understanding Scan Results

### Threat Levels

- **🟢 Clean**: No threats detected by any antivirus engine
- **🟡 Suspicious**: Few engines detected potential threats
- **🔴 Malicious**: Multiple engines detected threats

### Detection Scores

- **0/70**: Clean file, no detections
- **1-5/70**: Possibly suspicious, review carefully
- **6+/70**: Likely malicious, quarantine recommended

### Report Details

Each scan provides:
- **File Hash**: Unique identifier for the file
- **File Size**: Size of the scanned file
- **Detection Names**: What each engine detected
- **Scan Date**: When the file was last scanned
- **Permalink**: Link to full VirusTotal report

---

## 🎯 Quick Reference

### Keyboard Shortcuts

- **Ctrl/Cmd + O**: Open file scan dialog
- **Ctrl/Cmd + S**: Open settings
- **Ctrl/Cmd + Q**: Quit application
- **F5**: Refresh dashboard

### File Types Monitored

By default, DropSentinel monitors these file types:
- Executables (.exe, .msi, .dmg, .pkg, .deb, .rpm)
- Archives (.zip, .rar, .7z, .tar.gz)
- Scripts (.bat, .sh, .ps1, .py)
- Documents (.pdf, .doc, .xls) - if enabled

### System Requirements

- **Windows**: Windows 10 (1903) or later
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Ubuntu 18.04 LTS or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 200MB free space
- **Network**: Internet connection required

---

For more detailed information, visit our [website](https://dropsentinel.com) or check our [GitHub repository](https://github.com/JSB2010/DropSentinel).
