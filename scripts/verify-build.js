#!/usr/bin/env node

/**
 * Build verification script for DropSentinel
 * Verifies that all build commands work correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description, allowFailure = false) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} - SUCCESS`);
    return { success: true, output };
  } catch (error) {
    if (allowFailure) {
      console.log(`⚠️ ${description} - FAILED (allowed)`);
      return { success: false, output: error.message, allowed: true };
    } else {
      console.log(`❌ ${description} - FAILED`);
      console.log(`Error: ${error.message}`);
      return { success: false, output: error.message };
    }
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${description} - Found (${Math.round(stats.size / 1024)} KB)`);
    return true;
  } else {
    console.log(`❌ ${description} - Missing`);
    return false;
  }
}

function main() {
  console.log('🔍 DropSentinel Build Verification');
  console.log('==================================\n');

  const results = {
    dependencies: [],
    builds: [],
    files: []
  };

  // Check dependencies
  console.log('📦 Checking Dependencies:');

  const depChecks = [
    { cmd: 'node --version', desc: 'Node.js' },
    { cmd: 'npm --version', desc: 'npm' },
    { cmd: 'npx electron --version', desc: 'Electron', allowFailure: true }
  ];

  for (const check of depChecks) {
    const result = runCommand(check.cmd, check.desc, check.allowFailure);
    results.dependencies.push({ ...check, ...result });
  }

  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('\n📦 Installing dependencies...');
    const installResult = runCommand('npm ci --legacy-peer-deps', 'Install dependencies');
    results.dependencies.push({ cmd: 'npm ci', desc: 'Install dependencies', ...installResult });
  }

  // Check build files
  console.log('\n📁 Checking Build Files:');

  const fileChecks = [
    { path: 'package.json', desc: 'package.json' },
    { path: 'next.config.mjs', desc: 'Next.js config' },
    { path: 'tailwind.config.js', desc: 'Tailwind config' },
    { path: 'build/icon.icns', desc: 'App icon (macOS)' },
    { path: 'build/icon.ico', desc: 'App icon (Windows)' },
    { path: 'build/dmg-background.png', desc: 'DMG background' },
    { path: 'public/icon.png', desc: 'Public icon' }
  ];

  for (const check of fileChecks) {
    const exists = checkFileExists(check.path, check.desc);
    results.files.push({ ...check, exists });
  }

  // Test builds
  console.log('\n🔨 Testing Builds:');

  // Clean first
  runCommand('npm run build:clean', 'Clean previous builds', true);

  const buildChecks = [
    { cmd: 'npm run build', desc: 'Next.js build' },
    { cmd: 'npm run build:electron', desc: 'Electron build', allowFailure: true }
  ];

  for (const check of buildChecks) {
    const result = runCommand(check.cmd, check.desc, check.allowFailure);
    results.builds.push({ ...check, ...result });
  }

  // Check output directories
  console.log('\n📂 Checking Output Directories:');

  const outputChecks = [
    { path: 'out', desc: 'Next.js output' },
    { path: 'dist', desc: 'Electron dist' }
  ];

  for (const check of outputChecks) {
    const exists = fs.existsSync(check.path);
    console.log(`${exists ? '✅' : '❌'} ${check.desc} - ${exists ? 'Found' : 'Missing'}`);
    results.files.push({ ...check, exists });
  }

  // Summary
  console.log('\n📊 Build Verification Summary:');
  console.log('=============================');

  const depSuccess = results.dependencies.filter(r => r.success || r.allowed).length;
  const depTotal = results.dependencies.length;
  console.log(`📦 Dependencies: ${depSuccess}/${depTotal} passed`);

  const buildSuccess = results.builds.filter(r => r.success || r.allowed).length;
  const buildTotal = results.builds.length;
  console.log(`🔨 Builds: ${buildSuccess}/${buildTotal} passed`);

  const fileSuccess = results.files.filter(r => r.exists).length;
  const fileTotal = results.files.length;
  console.log(`📁 Files: ${fileSuccess}/${fileTotal} found`);

  // Overall status
  const allDepsOk = results.dependencies.every(r => r.success || r.allowed);
  const allBuildsOk = results.builds.every(r => r.success || r.allowed);
  const criticalFilesOk = results.files.filter(f =>
    ['package.json', 'Next.js config'].includes(f.desc)
  ).every(f => f.exists);

  console.log('\n🎯 Overall Status:');
  if (allDepsOk && allBuildsOk && criticalFilesOk) {
    console.log('✅ All critical systems are working correctly!');
    console.log('🚀 Ready for release creation');
    return true;
  } else {
    console.log('❌ Some issues detected:');
    if (!allDepsOk) console.log('  - Dependency issues found');
    if (!allBuildsOk) console.log('  - Build failures detected');
    if (!criticalFilesOk) console.log('  - Critical files missing');
    console.log('🔧 Please fix issues before creating release');
    return false;
  }
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { runCommand, checkFileExists };
