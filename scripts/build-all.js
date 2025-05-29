#!/usr/bin/env node

/**
 * Comprehensive Build Script for DropSentinel
 * Builds all installer types for all platforms with optimizations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const config = {
  productName: 'DropSentinel',
  version: require('../package.json').version,
  platforms: {
    mac: ['dmg', 'pkg', 'zip'],
    win: ['nsis', 'msi', 'portable', 'zip'],
    linux: ['AppImage', 'deb', 'rpm', 'tar.gz']
  },
  architectures: ['x64', 'arm64'],
  outputDir: 'dist',
  buildDir: 'build',
  tempDir: '.build-temp'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}[${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    logError(`Command failed: ${command}`);
    logError(error.message);
    process.exit(1);
  }
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
}

function cleanBuildDirectories() {
  logStep('CLEAN', 'Cleaning build directories...');
  
  const dirsToClean = [config.outputDir, '.next', config.tempDir];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      execCommand(`rimraf "${dir}"`);
      log(`Cleaned: ${dir}`);
    }
  });
  
  logSuccess('Build directories cleaned');
}

function prepareBuildEnvironment() {
  logStep('PREPARE', 'Preparing build environment...');
  
  // Ensure required directories exist
  ensureDirectoryExists(config.outputDir);
  ensureDirectoryExists(config.buildDir);
  ensureDirectoryExists('public/assets');
  
  // Check for required assets
  const requiredAssets = [
    'public/assets/app-icon.ico',
    'public/assets/app-icon.icns',
    'public/assets/app-icon.png'
  ];
  
  requiredAssets.forEach(asset => {
    if (!fs.existsSync(asset)) {
      logWarning(`Missing asset: ${asset}`);
    }
  });
  
  logSuccess('Build environment prepared');
}

function buildNextApp() {
  logStep('BUILD', 'Building Next.js application...');
  
  execCommand('npm run build');
  
  logSuccess('Next.js application built successfully');
}

function buildElectronApp(platform, targets = null) {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  logStep('ELECTRON', `Building Electron app for ${platformName}...`);
  
  let command = `electron-builder --${platform}`;
  
  if (targets && targets.length > 0) {
    command += ` ${targets.join(' ')}`;
  }
  
  // Set environment variables for optimized builds
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    ELECTRON_BUILDER_COMPRESSION_LEVEL: '9',
    ELECTRON_BUILDER_CACHE: 'true',
    DEBUG: 'electron-builder'
  };
  
  execCommand(command, { env });
  
  logSuccess(`${platformName} build completed`);
}

function getCurrentPlatform() {
  const platform = os.platform();
  switch (platform) {
    case 'darwin': return 'mac';
    case 'win32': return 'win';
    case 'linux': return 'linux';
    default: return 'unknown';
  }
}

function validatePlatformSupport(targetPlatform) {
  const currentPlatform = getCurrentPlatform();
  
  // Platform build restrictions
  const restrictions = {
    mac: ['mac'], // macOS can only be built on macOS
    win: ['mac', 'win', 'linux'], // Windows can be built on any platform
    linux: ['mac', 'linux'] // Linux can be built on macOS and Linux
  };
  
  if (!restrictions[targetPlatform].includes(currentPlatform)) {
    logError(`Cannot build ${targetPlatform} on ${currentPlatform}`);
    return false;
  }
  
  return true;
}

function buildSpecificPlatform(platform, targets = null) {
  if (!validatePlatformSupport(platform)) {
    return false;
  }
  
  try {
    buildElectronApp(platform, targets);
    return true;
  } catch (error) {
    logError(`Failed to build ${platform}: ${error.message}`);
    return false;
  }
}

function buildAllPlatforms() {
  logStep('BUILD-ALL', 'Building for all supported platforms...');
  
  const currentPlatform = getCurrentPlatform();
  const results = {};
  
  // Build based on current platform capabilities
  if (currentPlatform === 'mac') {
    // macOS can build for all platforms
    results.mac = buildSpecificPlatform('mac');
    results.win = buildSpecificPlatform('win');
    results.linux = buildSpecificPlatform('linux');
  } else if (currentPlatform === 'win') {
    // Windows can build for Windows and Linux
    results.win = buildSpecificPlatform('win');
    results.linux = buildSpecificPlatform('linux');
    logWarning('macOS builds require macOS platform');
  } else if (currentPlatform === 'linux') {
    // Linux can build for Linux and Windows
    results.linux = buildSpecificPlatform('linux');
    results.win = buildSpecificPlatform('win');
    logWarning('macOS builds require macOS platform');
  }
  
  return results;
}

function generateBuildReport(results) {
  logStep('REPORT', 'Generating build report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    platform: getCurrentPlatform(),
    version: config.version,
    results: results,
    artifacts: []
  };
  
  // Scan output directory for artifacts
  if (fs.existsSync(config.outputDir)) {
    const files = fs.readdirSync(config.outputDir, { recursive: true });
    report.artifacts = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.dmg', '.pkg', '.exe', '.msi', '.deb', '.rpm', '.appimage', '.zip', '.tar.gz'].includes(ext);
    }).map(file => {
      const filePath = path.join(config.outputDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        created: stats.birthtime
      };
    });
  }
  
  // Save report
  const reportPath = path.join(config.outputDir, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  log('\n' + colors.bright + '📊 BUILD SUMMARY' + colors.reset);
  log('================');
  log(`Version: ${config.version}`);
  log(`Platform: ${getCurrentPlatform()}`);
  log(`Artifacts: ${report.artifacts.length}`);
  
  if (report.artifacts.length > 0) {
    log('\nGenerated Files:');
    report.artifacts.forEach(artifact => {
      log(`  • ${artifact.name} (${artifact.sizeFormatted})`);
    });
  }
  
  logSuccess(`Build report saved to: ${reportPath}`);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  log(colors.bright + '🚀 DropSentinel Build System' + colors.reset);
  log('============================\n');
  
  try {
    // Always clean and prepare
    cleanBuildDirectories();
    prepareBuildEnvironment();
    buildNextApp();
    
    let results = {};
    
    switch (command) {
      case 'mac':
        results.mac = buildSpecificPlatform('mac');
        break;
      case 'win':
        results.win = buildSpecificPlatform('win');
        break;
      case 'linux':
        results.linux = buildSpecificPlatform('linux');
        break;
      case 'all':
      default:
        results = buildAllPlatforms();
        break;
    }
    
    generateBuildReport(results);
    
    logSuccess('Build process completed successfully! 🎉');
    
  } catch (error) {
    logError(`Build process failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main();
}

module.exports = {
  buildSpecificPlatform,
  buildAllPlatforms,
  cleanBuildDirectories,
  prepareBuildEnvironment
};
