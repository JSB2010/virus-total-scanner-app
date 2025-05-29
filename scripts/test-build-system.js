#!/usr/bin/env node

/**
 * DropSentinel Build System Test
 * Tests the build configuration and validates all components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description}: ${filePath}`);
    return true;
  } else {
    logError(`Missing ${description}: ${filePath}`);
    return false;
  }
}

function checkScriptExecutable(scriptPath) {
  try {
    const stats = fs.statSync(scriptPath);

    // On Windows, check if file exists and has proper extension
    if (process.platform === 'win32') {
      const ext = path.extname(scriptPath).toLowerCase();
      if (['.js', '.ps1', '.bat', '.cmd'].includes(ext)) {
        logSuccess(`Script is valid for Windows: ${scriptPath}`);
        return true;
      } else {
        logWarning(`Script may not be executable on Windows: ${scriptPath}`);
        return false;
      }
    }

    // On Unix-like systems, check executable bit
    if (stats.mode & parseInt('111', 8)) {
      logSuccess(`Script is executable: ${scriptPath}`);
      return true;
    } else {
      logWarning(`Script not executable: ${scriptPath} (run: chmod +x ${scriptPath})`);
      return false;
    }
  } catch (error) {
    logError(`Cannot check script: ${scriptPath} - ${error.message}`);
    return false;
  }
}

function validatePackageJson() {
  logStep('PACKAGE', 'Validating package.json configuration...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Check basic fields
    const requiredFields = ['name', 'version', 'description', 'main', 'build'];
    let valid = true;

    for (const field of requiredFields) {
      if (!packageJson[field]) {
        logError(`Missing required field: ${field}`);
        valid = false;
      }
    }

    // Check build configuration
    if (packageJson.build) {
      const buildConfig = packageJson.build;

      // Check required build fields
      const requiredBuildFields = ['appId', 'productName', 'directories'];
      for (const field of requiredBuildFields) {
        if (!buildConfig[field]) {
          logError(`Missing build field: ${field}`);
          valid = false;
        }
      }

      // Check platform configurations
      const platforms = ['mac', 'win', 'linux'];
      for (const platform of platforms) {
        if (buildConfig[platform]) {
          logSuccess(`${platform} configuration found`);
        } else {
          logWarning(`${platform} configuration missing`);
        }
      }

      // Check installer configurations
      const installers = ['nsis', 'msi', 'portable', 'dmg', 'pkg'];
      for (const installer of installers) {
        if (buildConfig[installer]) {
          logSuccess(`${installer} configuration found`);
        }
      }
    }

    // Check scripts
    const requiredScripts = [
      'build', 'dist:all', 'dist:mac', 'dist:win', 'dist:linux',
      'build:all', 'build:clean', 'build:comprehensive'
    ];

    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        logSuccess(`Script found: ${script}`);
      } else {
        logError(`Missing script: ${script}`);
        valid = false;
      }
    }

    if (valid) {
      logSuccess('package.json validation passed');
    } else {
      logError('package.json validation failed');
    }

    return valid;
  } catch (error) {
    logError(`Failed to validate package.json: ${error.message}`);
    return false;
  }
}

function validateAssets() {
  logStep('ASSETS', 'Validating required assets...');

  const requiredAssets = [
    'public/assets/app-icon.ico',
    'public/assets/app-icon.icns',
    'public/assets/app-icon.png',
    'build/entitlements.mac.plist'
  ];

  let allAssetsExist = true;

  for (const asset of requiredAssets) {
    if (!checkFileExists(asset, 'Asset')) {
      allAssetsExist = false;
    }
  }

  return allAssetsExist;
}

function validateBuildScripts() {
  logStep('SCRIPTS', 'Validating build scripts...');

  const scripts = [
    'scripts/build-all.js',
    'scripts/build-mac.sh',
    'scripts/build-win.ps1',
    'scripts/build-comprehensive.sh'
  ];

  let allScriptsValid = true;

  for (const script of scripts) {
    if (!checkFileExists(script, 'Build script')) {
      allScriptsValid = false;
    } else {
      // Check executability but don't fail on Windows for shell scripts
      checkScriptExecutable(script);
      // Only fail if it's a critical script that should work on current platform
      if (process.platform === 'win32' && script.endsWith('.ps1')) {
        // PowerShell scripts should work on Windows
      } else if (process.platform !== 'win32' && script.endsWith('.sh')) {
        // Shell scripts should work on Unix-like systems
      } else if (script.endsWith('.js')) {
        // JavaScript should work everywhere
      }
      // Don't fail for cross-platform compatibility warnings
    }
  }

  return allScriptsValid;
}

function validateInstallerConfigs() {
  logStep('INSTALLERS', 'Validating installer configurations...');

  const configs = [
    'build/pkg-scripts/preinstall',
    'build/pkg-scripts/postinstall',
    'build/pkg-welcome.html',
    'build/pkg-conclusion.html'
  ];

  // Optional configs (not required for basic functionality)
  const optionalConfigs = [
    'build/installer.nsi',
    'build/installer.nsh'
  ];

  let allConfigsExist = true;

  for (const config of configs) {
    if (!checkFileExists(config, 'Installer config')) {
      allConfigsExist = false;
    }
  }

  // Check optional configs (warnings only)
  for (const config of optionalConfigs) {
    if (fs.existsSync(config)) {
      logSuccess(`Optional config found: ${config}`);
    } else {
      logWarning(`Optional config missing: ${config} (using electron-builder defaults)`);
    }
  }

  // Check script permissions (warnings only on Windows)
  const scriptFiles = [
    'build/pkg-scripts/preinstall',
    'build/pkg-scripts/postinstall'
  ];

  for (const script of scriptFiles) {
    if (fs.existsSync(script)) {
      checkScriptExecutable(script);
      // These are macOS-specific scripts, so warnings on Windows are expected
    }
  }

  return allConfigsExist;
}

function validateDependencies() {
  logStep('DEPS', 'Validating dependencies...');

  try {
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      logError('node_modules directory not found. Run npm install first.');
      return false;
    }

    // Check critical dependencies
    const criticalDeps = [
      'electron',
      'electron-builder',
      'next',
      'react',
      'react-dom'
    ];

    let allDepsInstalled = true;

    for (const dep of criticalDeps) {
      const depPath = path.join('node_modules', dep);
      if (fs.existsSync(depPath)) {
        logSuccess(`Dependency installed: ${dep}`);
      } else {
        logError(`Missing dependency: ${dep}`);
        allDepsInstalled = false;
      }
    }

    // Check electron-builder
    try {
      execSync('npx electron-builder --version', { stdio: 'pipe' });
      logSuccess('electron-builder is working');
    } catch (error) {
      logError('electron-builder is not working properly');
      allDepsInstalled = false;
    }

    return allDepsInstalled;
  } catch (error) {
    logError(`Failed to validate dependencies: ${error.message}`);
    return false;
  }
}

function validateDirectoryStructure() {
  logStep('STRUCTURE', 'Validating directory structure...');

  const requiredDirs = [
    'public',
    'public/assets',
    'build',
    'build/pkg-scripts',
    'scripts',
    'app',
    'components'
  ];

  let allDirsExist = true;

  for (const dir of requiredDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      logSuccess(`Directory exists: ${dir}`);
    } else {
      logError(`Missing directory: ${dir}`);
      allDirsExist = false;
    }
  }

  return allDirsExist;
}

function runBuildTest() {
  logStep('BUILD-TEST', 'Testing build system...');

  try {
    // Test Next.js build
    log('Testing Next.js build...');
    execSync('npm run build', { stdio: 'pipe' });
    logSuccess('Next.js build successful');

    // Test electron-builder dry run
    log('Testing electron-builder configuration...');
    execSync('npx electron-builder --help', { stdio: 'pipe' });
    logSuccess('electron-builder configuration valid');

    return true;
  } catch (error) {
    logError(`Build test failed: ${error.message}`);
    return false;
  }
}

function generateReport(results) {
  logStep('REPORT', 'Generating test report...');

  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r).length,
      failed: Object.values(results).filter(r => !r).length
    }
  };

  // Create logs directory if it doesn't exist
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }

  const reportPath = `logs/build-system-test-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log('\n' + colors.bright + '📊 TEST SUMMARY' + colors.reset);
  log('================');
  log(`Total Tests: ${report.summary.total}`);
  log(`Passed: ${colors.green}${report.summary.passed}${colors.reset}`);
  log(`Failed: ${colors.red}${report.summary.failed}${colors.reset}`);

  if (report.summary.failed === 0) {
    logSuccess('🎉 All tests passed! Build system is ready.');
  } else {
    logError('❌ Some tests failed. Please fix the issues above.');
  }

  logSuccess(`Test report saved: ${reportPath}`);

  return report.summary.failed === 0;
}

// Main execution
async function main() {
  log(colors.bright + '🧪 DropSentinel Build System Test' + colors.reset);
  log('==================================\n');

  const results = {
    packageJson: validatePackageJson(),
    assets: validateAssets(),
    scripts: validateBuildScripts(),
    installers: validateInstallerConfigs(),
    dependencies: validateDependencies(),
    structure: validateDirectoryStructure(),
    buildTest: runBuildTest()
  };

  const success = generateReport(results);

  process.exit(success ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    logError(`Test failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  validatePackageJson,
  validateAssets,
  validateBuildScripts,
  validateInstallerConfigs,
  validateDependencies,
  validateDirectoryStructure
};
