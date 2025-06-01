#!/usr/bin/env node

/**
 * Comprehensive release validation script for DropSentinel
 * Validates version consistency, build readiness, and release requirements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getPackageVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function validateVersionConsistency() {
  console.log('\n📋 Validating Version Consistency:');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const mainVersion = packageJson.version;
  const buildVersion = packageJson.build?.buildVersion;
  const bundleVersion = packageJson.build?.mac?.bundleVersion;
  const bundleShortVersion = packageJson.build?.mac?.bundleShortVersion;
  
  const issues = [];
  
  console.log(`  Main version: ${mainVersion}`);
  console.log(`  Build version: ${buildVersion}`);
  console.log(`  Bundle version: ${bundleVersion}`);
  console.log(`  Bundle short version: ${bundleShortVersion}`);
  
  if (buildVersion !== mainVersion) {
    issues.push(`Build version (${buildVersion}) doesn't match main version (${mainVersion})`);
  }
  
  if (bundleVersion !== mainVersion) {
    issues.push(`Bundle version (${bundleVersion}) doesn't match main version (${mainVersion})`);
  }
  
  if (bundleShortVersion !== mainVersion) {
    issues.push(`Bundle short version (${bundleShortVersion}) doesn't match main version (${mainVersion})`);
  }
  
  if (issues.length === 0) {
    console.log('  ✅ All versions are consistent');
    return true;
  } else {
    console.log('  ❌ Version inconsistencies found:');
    issues.forEach(issue => console.log(`    - ${issue}`));
    return false;
  }
}

function validateDownloadLinks() {
  console.log('\n🔗 Validating Download Links:');
  
  const downloadPagePath = path.join(__dirname, '..', 'app', 'website', 'download', 'page.tsx');
  
  if (!fs.existsSync(downloadPagePath)) {
    console.log('  ❌ Download page not found');
    return false;
  }
  
  const content = fs.readFileSync(downloadPagePath, 'utf8');
  const currentVersion = getPackageVersion();
  
  // Check if download links contain the current version
  const versionRegex = new RegExp(`DropSentinel-${currentVersion.replace(/\./g, '\\.')}-`, 'g');
  const matches = content.match(versionRegex);
  
  if (matches && matches.length > 0) {
    console.log(`  ✅ Found ${matches.length} download links with version ${currentVersion}`);
    return true;
  } else {
    console.log(`  ❌ Download links don't contain version ${currentVersion}`);
    return false;
  }
}

function validateChangelog() {
  console.log('\n📝 Validating Changelog:');
  
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    console.log('  ❌ CHANGELOG.md not found');
    return false;
  }
  
  const content = fs.readFileSync(changelogPath, 'utf8');
  const currentVersion = getPackageVersion();
  
  // Check if changelog contains the current version
  const versionRegex = new RegExp(`## \\[${currentVersion.replace(/\./g, '\\.')}\\]`, 'g');
  const matches = content.match(versionRegex);
  
  if (matches && matches.length > 0) {
    console.log(`  ✅ Changelog contains entry for version ${currentVersion}`);
    return true;
  } else {
    console.log(`  ❌ Changelog missing entry for version ${currentVersion}`);
    return false;
  }
}

function validateGitStatus() {
  console.log('\n🔄 Validating Git Status:');
  
  try {
    // Check if there are uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim() === '') {
      console.log('  ✅ Working directory is clean');
      return true;
    } else {
      console.log('  ❌ Uncommitted changes found:');
      console.log(status);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Git status check failed: ${error.message}`);
    return false;
  }
}

function validateBuildFiles() {
  console.log('\n📁 Validating Build Files:');
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'next.config.mjs', desc: 'Next.js configuration' },
    { path: 'tailwind.config.js', desc: 'Tailwind configuration' },
    { path: 'build/icon.icns', desc: 'macOS app icon' },
    { path: 'build/icon.ico', desc: 'Windows app icon' }
  ];
  
  let allFound = true;
  
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${file.desc} found`);
    } else {
      console.log(`  ❌ ${file.desc} missing (${file.path})`);
      allFound = false;
    }
  }
  
  return allFound;
}

function validateWorkflows() {
  console.log('\n⚙️ Validating Workflow Files:');
  
  const workflowDir = path.join(__dirname, '..', '.github', 'workflows');
  
  if (!fs.existsSync(workflowDir)) {
    console.log('  ❌ Workflows directory not found');
    return false;
  }
  
  const requiredWorkflows = [
    'release.yml',
    'ci.yml',
    'optimized-build.yml'
  ];
  
  let allFound = true;
  
  for (const workflow of requiredWorkflows) {
    const workflowPath = path.join(workflowDir, workflow);
    if (fs.existsSync(workflowPath)) {
      console.log(`  ✅ ${workflow} found`);
    } else {
      console.log(`  ❌ ${workflow} missing`);
      allFound = false;
    }
  }
  
  return allFound;
}

function main() {
  console.log('🔍 DropSentinel Release Validation');
  console.log('==================================');
  
  const currentVersion = getPackageVersion();
  console.log(`\n📦 Current Version: ${currentVersion}`);
  
  const validations = [
    { name: 'Version Consistency', fn: validateVersionConsistency },
    { name: 'Download Links', fn: validateDownloadLinks },
    { name: 'Changelog', fn: validateChangelog },
    { name: 'Git Status', fn: validateGitStatus },
    { name: 'Build Files', fn: validateBuildFiles },
    { name: 'Workflow Files', fn: validateWorkflows }
  ];
  
  const results = [];
  
  for (const validation of validations) {
    const result = validation.fn();
    results.push({ name: validation.name, passed: result });
  }
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log('=====================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} validations passed`);
  
  if (passed === total) {
    console.log('\n🚀 All validations passed! Ready for release.');
    return true;
  } else {
    console.log('\n⚠️ Some validations failed. Please fix issues before release.');
    return false;
  }
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { validateVersionConsistency, validateDownloadLinks, validateChangelog };
