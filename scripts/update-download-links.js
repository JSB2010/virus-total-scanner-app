#!/usr/bin/env node

/**
 * Script to automatically update download links in the website
 * to match the latest release version
 */

const fs = require('fs');
const path = require('path');

// Get version from package.json
function getCurrentVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

// Update download page with current version
function updateDownloadPage(version) {
  const downloadPagePath = path.join(__dirname, '..', 'app', 'website', 'download', 'page.tsx');
  let content = fs.readFileSync(downloadPagePath, 'utf8');

  // Replace version numbers in download links
  const versionRegex = /DropSentinel-\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?-/g;
  const newContent = content.replace(versionRegex, `DropSentinel-${version}-`);

  // Update version badge if it exists
  const badgeRegex = /v\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?\s+Latest Release/;
  const updatedContent = newContent.replace(badgeRegex, `v${version} Latest Release`);

  // Update any hardcoded version references (more comprehensive)
  const hardcodedVersionRegex = /1\.0\.[0-2]/g;
  const finalContent = updatedContent.replace(hardcodedVersionRegex, version);

  fs.writeFileSync(downloadPagePath, finalContent, 'utf8');
  console.log(`✅ Updated download page with version ${version}`);

  // Also update the main website page if it has download links
  const mainPagePath = path.join(__dirname, '..', 'app', 'website', 'page.tsx');
  if (fs.existsSync(mainPagePath)) {
    let mainContent = fs.readFileSync(mainPagePath, 'utf8');
    const updatedMainContent = mainContent.replace(versionRegex, `DropSentinel-${version}-`);
    if (updatedMainContent !== mainContent) {
      fs.writeFileSync(mainPagePath, updatedMainContent, 'utf8');
      console.log(`✅ Updated main page with version ${version}`);
    }
  }
}

// Main function
function main() {
  try {
    const version = getCurrentVersion();
    console.log(`🔍 Current version: ${version}`);

    updateDownloadPage(version);

    console.log('🎉 Download links updated successfully!');
  } catch (error) {
    console.error('❌ Error updating download links:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateDownloadPage, getCurrentVersion };
