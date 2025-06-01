#!/usr/bin/env node

/**
 * Simple release creation script for DropSentinel
 * Usage: npm run create-release 1.0.1
 * Usage: node scripts/create-release.js 1.0.1 [--prerelease] [--draft]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}`);
    return false;
  }
}

function validateVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
  if (!semverRegex.test(version)) {
    return false;
  }

  // Additional validation: ensure version is greater than current
  const currentVersion = getCurrentVersion();
  if (currentVersion) {
    const current = parseVersion(currentVersion);
    const new_ = parseVersion(version);

    if (compareVersions(new_, current) <= 0) {
      console.log(`❌ New version ${version} must be greater than current version ${currentVersion}`);
      return false;
    }
  }

  return true;
}

function parseVersion(version) {
  const [main, prerelease] = version.split('-');
  const [major, minor, patch] = main.split('.').map(Number);
  return { major, minor, patch, prerelease: prerelease || null };
}

function compareVersions(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;

  // Handle prerelease comparison
  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && b.prerelease) {
    return a.prerelease.localeCompare(b.prerelease);
  }

  return 0;
}

function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.log('❌ Could not read current version from package.json');
    return null;
  }
}

function updatePackageVersion(version) {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.version = version;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated package.json version to ${version}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to update package.json: ${error.message}`);
    return false;
  }
}

function createReleaseNotes(version, isPrerelease) {
  const releaseNotesPath = path.join(process.cwd(), 'RELEASE.md');

  const releaseNotes = `# Release ${version}

## 🚀 What's New in DropSentinel ${version}

${isPrerelease ? '⚠️ **This is a pre-release version for testing purposes.**\n\n' : ''}Advanced file security scanner with real-time protection and comprehensive threat detection.

## ✨ Key Features

- 🛡️ **Real-time File Monitoring** - Automatic scanning of new files
- 🔍 **VirusTotal Integration** - Comprehensive threat analysis
- 🎯 **Smart Detection** - Advanced malware identification
- 📊 **Detailed Reports** - Comprehensive scan results
- 🌙 **Dark/Light Mode** - Modern, responsive interface
- ⚡ **High Performance** - Optimized scanning engine

## 📦 Installation

Download the appropriate package for your platform:

### Windows
- **NSIS Installer** (`.exe`) - Recommended for most users
- **MSI Package** (`.msi`) - For enterprise deployment
- **Portable** (`.exe`) - No installation required

### macOS
- **DMG** (`.dmg`) - Standard macOS installer
- **PKG** (`.pkg`) - Alternative installer format

### Linux
- **AppImage** (`.AppImage`) - Universal Linux format
- **DEB** (`.deb`) - For Debian/Ubuntu systems
- **RPM** (`.rpm`) - For Red Hat/Fedora systems

## 🔧 System Requirements

- **Windows**: Windows 10 or later (x64)
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Modern Linux distribution (x64)

## 🚀 Getting Started

1. Download and install DropSentinel
2. Launch the application
3. Configure your VirusTotal API key in settings
4. Enable real-time monitoring (optional)
5. Start scanning files for threats

## 📞 Support

- [GitHub Issues](https://github.com/JSB2010/DropSentinel/issues)
- [Documentation](https://github.com/JSB2010/DropSentinel/blob/main/README.md)
- [Website](https://dropsentinel.com)

---

**Full Changelog**: https://github.com/JSB2010/DropSentinel/compare/v${getCurrentVersion() || '1.0.0'}...v${version}
`;

  fs.writeFileSync(releaseNotesPath, releaseNotes, 'utf8');
  console.log(`✅ Created release notes: ${releaseNotesPath}`);
  return true;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 DropSentinel Release Creator

Usage:
  npm run create-release <version> [options]
  node scripts/create-release.js <version> [options]

Examples:
  npm run create-release 1.0.1
  npm run create-release 1.1.0-beta.1 --prerelease
  npm run create-release 2.0.0 --draft

Options:
  --prerelease    Create as a pre-release
  --draft         Create as a draft release
  --help, -h      Show this help message

The script will:
1. Validate the version number
2. Update package.json version
3. Create release notes (RELEASE.md)
4. Commit changes
5. Create and push Git tag
6. Trigger the automated release workflow
`);
    return;
  }

  const version = args[0];
  const isPrerelease = args.includes('--prerelease');
  const isDraft = args.includes('--draft');

  console.log('🚀 DropSentinel Release Creator');
  console.log('===============================\n');

  // Validate version
  if (!validateVersion(version)) {
    console.log('❌ Invalid version format. Use semantic versioning (e.g., 1.0.1, 2.0.0-beta.1)');
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  console.log(`📋 Current version: ${currentVersion}`);
  console.log(`📋 New version: ${version}`);
  console.log(`📋 Release type: ${isDraft ? 'Draft' : isPrerelease ? 'Pre-release' : 'Release'}`);

  // Check if working directory is clean
  try {
    execSync('git diff --quiet', { stdio: 'pipe' });
    execSync('git diff --cached --quiet', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️ Working directory has uncommitted changes. Please commit or stash them first.');
    process.exit(1);
  }

  // Update package.json version
  if (!updatePackageVersion(version)) {
    process.exit(1);
  }

  // Create release notes
  if (!createReleaseNotes(version, isPrerelease)) {
    process.exit(1);
  }

  // Update download links
  if (!runCommand('npm run update-download-links', 'Update download links')) {
    console.log('⚠️ Failed to update download links, continuing anyway...');
  }

  // Commit changes
  if (!runCommand('git add package.json RELEASE.md app/website/', 'Stage changes')) {
    process.exit(1);
  }

  if (!runCommand(`git commit -m "chore: Prepare release ${version}"`, 'Commit changes')) {
    process.exit(1);
  }

  // Create and push tag
  if (!runCommand(`git tag v${version}`, 'Create Git tag')) {
    process.exit(1);
  }

  if (!runCommand('git push origin main', 'Push changes')) {
    process.exit(1);
  }

  if (!runCommand(`git push origin v${version}`, 'Push tag')) {
    process.exit(1);
  }

  console.log('\n🎉 Release creation completed successfully!');
  console.log(`
📋 Summary:
- Version: ${version}
- Type: ${isDraft ? 'Draft' : isPrerelease ? 'Pre-release' : 'Release'}
- Tag: v${version}
- Release workflow: Will be triggered automatically

🔗 Links:
- Release: https://github.com/JSB2010/DropSentinel/releases/tag/v${version}
- Actions: https://github.com/JSB2010/DropSentinel/actions
- Website: https://dropsentinel.com

⏳ The release workflow will now:
1. Build packages for all platforms
2. Create GitHub release with artifacts
3. Update website download links
4. Publish to GitHub Packages
`);
}

if (require.main === module) {
  main();
}

module.exports = { validateVersion, updatePackageVersion, createReleaseNotes };
