#!/usr/bin/env node

/**
 * DropSentinel Release Management Script
 * 
 * This script helps manage releases by:
 * - Updating version numbers
 * - Creating release files
 * - Triggering release workflows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');
const RELEASE_MD = path.join(__dirname, '..', 'RELEASE.md');

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

function updateVersion(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✅ Updated package.json version to ${newVersion}`);
}

function createReleaseFile(version, type = 'release') {
  const isPrerelease = type === 'prerelease' || version.includes('beta') || version.includes('alpha') || version.includes('rc');
  
  const releaseContent = `# Release ${version}

🎉 **DropSentinel ${version}${isPrerelease ? ' (Prerelease)' : ''}**

${isPrerelease ? 
  'This is a prerelease version for testing and feedback.' : 
  'Official release of DropSentinel with comprehensive file security scanning.'
}

## 🚀 Features

- Real-time file monitoring and threat detection
- VirusTotal API integration for comprehensive analysis
- Cross-platform support (Windows, macOS, Linux)
- Modern UI with dark/light theme support
- System tray integration and background operation
- Detailed scan history and reporting

## 📦 Downloads

Available for all major platforms with multiple package formats:

### Windows
- NSIS Installer (.exe) - Recommended
- MSI Package (.msi) - Enterprise
- Portable (.exe) - No installation

### macOS  
- DMG Disk Image (.dmg) - Standard
- PKG Installer (.pkg) - Alternative
- ZIP Archive (.zip) - Compressed

### Linux
- AppImage (.AppImage) - Universal
- DEB Package (.deb) - Debian/Ubuntu
- RPM Package (.rpm) - Red Hat/Fedora
- TAR.GZ (.tar.gz) - Archive

## 🔐 Security

All packages include:
- Code signing (when available)
- Integrity checksums
- Hardened runtime (macOS)
- Proper permissions and entitlements

## 🚀 Installation

1. Download the package for your platform
2. Install using standard method
3. Launch and configure VirusTotal API key
4. Enable monitoring for automatic protection

## 📚 Documentation

- [README.md](README.md) - Quick start guide
- [BUILD.md](BUILD.md) - Build instructions  
- [GitHub Issues](https://github.com/JSB2010/DropSentinel/issues) - Support

---

**Version**: ${version}  
**Type**: ${isPrerelease ? 'Prerelease' : 'Release'}  
**Date**: ${new Date().toISOString().split('T')[0]}  
**Platforms**: Windows, macOS, Linux
`;

  fs.writeFileSync(RELEASE_MD, releaseContent);
  console.log(`✅ Created RELEASE.md for version ${version}`);
}

function commitAndPush(version, type) {
  try {
    execSync('git add package.json RELEASE.md', { stdio: 'inherit' });
    execSync(`git commit -m "Release ${version}"`, { stdio: 'inherit' });
    console.log(`✅ Committed release ${version}`);
    
    const pushConfirm = process.argv.includes('--push') || process.argv.includes('-p');
    if (pushConfirm) {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log(`✅ Pushed to main branch`);
    } else {
      console.log(`⚠️  Use --push or -p to push to remote`);
    }
  } catch (error) {
    console.error('❌ Git operations failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
DropSentinel Release Management

Usage:
  node scripts/release.js <version> [options]

Examples:
  node scripts/release.js 1.0.0                    # Create release 1.0.0
  node scripts/release.js 1.1.0-beta.1 --prerelease # Create prerelease
  node scripts/release.js 1.0.1 --push             # Create and push release

Options:
  --prerelease, -pre    Mark as prerelease
  --push, -p           Push changes to remote
  --help, -h           Show this help

Current version: ${getCurrentVersion()}
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const version = args[0];
  const isPrerelease = args.includes('--prerelease') || args.includes('-pre');
  const releaseType = isPrerelease ? 'prerelease' : 'release';

  if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
    console.error('❌ Invalid version format. Use semantic versioning (e.g., 1.0.0)');
    process.exit(1);
  }

  console.log(`🚀 Creating ${releaseType} ${version}...`);
  
  try {
    updateVersion(version);
    createReleaseFile(version, releaseType);
    commitAndPush(version, releaseType);
    
    console.log(`
🎉 Release ${version} prepared successfully!

Next steps:
1. Push to trigger release workflow (if not already pushed)
2. Monitor GitHub Actions for build progress
3. Review and publish the release when ready

Release workflow will be triggered by the RELEASE.md file.
`);
  } catch (error) {
    console.error('❌ Release preparation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentVersion, updateVersion, createReleaseFile };
