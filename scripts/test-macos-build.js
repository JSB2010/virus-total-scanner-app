#!/usr/bin/env node

/**
 * Test script to diagnose macOS build issues
 * This script helps identify why DMG and PKG builds might be failing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  console.log(`Command: ${command}`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ Success: ${description}`);
    if (output.trim()) {
      console.log(`Output: ${output.trim()}`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${description}`);
    console.log(`Error: ${error.message}`);
    if (error.stdout) {
      console.log(`Stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      console.log(`Stderr: ${error.stderr}`);
    }
    return false;
  }
}

function checkFile(filePath, description) {
  console.log(`\n📁 Checking ${description}...`);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ Found: ${filePath} (${Math.round(stats.size / 1024)} KB)`);
    return true;
  } else {
    console.log(`❌ Missing: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🍎 DropSentinel macOS Build Diagnostics');
  console.log('=====================================\n');

  // Check system requirements
  console.log('🔍 System Requirements Check:');
  runCommand('sw_vers', 'macOS version');
  runCommand('xcode-select -p', 'Xcode command line tools');
  runCommand('which hdiutil', 'hdiutil availability');
  runCommand('which pkgbuild', 'pkgbuild availability');
  runCommand('which productbuild', 'productbuild availability');
  runCommand('node --version', 'Node.js version');
  runCommand('npm --version', 'npm version');

  // Check build dependencies
  console.log('\n🔧 Build Dependencies:');
  checkFile('package.json', 'package.json');
  checkFile('build/dmg-background.png', 'DMG background image');
  checkFile('build/pkg-background.png', 'PKG background image');
  checkFile('build/icon.icns', 'macOS icon');

  // Check electron-builder configuration
  console.log('\n⚙️ Electron Builder Configuration:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const buildConfig = packageJson.build;
    
    if (buildConfig && buildConfig.mac) {
      console.log('✅ macOS build configuration found');
      console.log(`Target: ${JSON.stringify(buildConfig.mac.target, null, 2)}`);
      
      if (buildConfig.dmg) {
        console.log('✅ DMG configuration found');
        console.log(`Background: ${buildConfig.dmg.background}`);
      } else {
        console.log('❌ DMG configuration missing');
      }
      
      if (buildConfig.pkg) {
        console.log('✅ PKG configuration found');
      } else {
        console.log('⚠️ PKG configuration not explicitly defined (using defaults)');
      }
    } else {
      console.log('❌ macOS build configuration missing');
    }
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
  }

  // Test individual build commands
  console.log('\n🧪 Testing Individual Build Commands:');
  
  // Clean first
  runCommand('npm run build:clean', 'Clean previous builds');
  
  // Test Next.js build
  runCommand('npm run build', 'Next.js build');
  
  // Test individual macOS builds
  console.log('\n🍎 Testing macOS Package Builds:');
  
  const buildCommands = [
    { cmd: 'npm run dist:mac:zip', desc: 'ZIP build' },
    { cmd: 'npm run dist:mac:dmg', desc: 'DMG build' },
    { cmd: 'npm run dist:mac:pkg', desc: 'PKG build' }
  ];
  
  const results = {};
  
  for (const { cmd, desc } of buildCommands) {
    console.log(`\n🔄 Testing ${desc}...`);
    results[desc] = runCommand(cmd, desc);
    
    // Check what was created
    if (fs.existsSync('dist')) {
      console.log('\n📦 Files in dist directory:');
      try {
        const files = fs.readdirSync('dist', { withFileTypes: true });
        files.forEach(file => {
          if (file.isFile()) {
            const filePath = path.join('dist', file.name);
            const stats = fs.statSync(filePath);
            console.log(`  ${file.name} - ${Math.round(stats.size / 1024 / 1024 * 100) / 100} MB`);
          }
        });
      } catch (error) {
        console.log(`Error reading dist directory: ${error.message}`);
      }
    }
  }
  
  // Summary
  console.log('\n📊 Build Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([desc, success]) => {
    console.log(`${success ? '✅' : '❌'} ${desc}`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (!results['ZIP build']) {
    console.log('❌ ZIP build failed - check basic electron-builder setup');
  }
  if (!results['DMG build']) {
    console.log('❌ DMG build failed - check DMG background image and hdiutil');
  }
  if (!results['PKG build']) {
    console.log('❌ PKG build failed - check pkgbuild and productbuild tools');
  }
  
  if (results['ZIP build'] && results['DMG build'] && results['PKG build']) {
    console.log('🎉 All builds successful! The issue might be in the CI environment.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkFile };
