#!/usr/bin/env node

/**
 * DropSentinel Build Optimizer
 * Automatically optimizes build configuration and dependencies
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

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function optimizePackageJson() {
  logStep('PACKAGE', 'Optimizing package.json configuration...');
  
  try {
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    let modified = false;
    
    // Ensure build optimization settings
    if (!packageJson.build) {
      packageJson.build = {};
    }
    
    const optimizations = {
      compression: 'maximum',
      removePackageScripts: true,
      nodeGypRebuild: false,
      buildDependenciesFromSource: false,
      generateUpdatesFilesForAllChannels: true,
      detectUpdateChannel: true
    };
    
    for (const [key, value] of Object.entries(optimizations)) {
      if (packageJson.build[key] !== value) {
        packageJson.build[key] = value;
        modified = true;
        log(`  Updated build.${key} = ${value}`);
      }
    }
    
    // Optimize file exclusions
    const excludePatterns = [
      "!node_modules/.cache/**/*",
      "!node_modules/electron/**/*",
      "!node_modules/electron-builder/**/*",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
      "!.editorconfig",
      "!**/._*",
      "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
      "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
      "!**/{appveyor.yml,.travis.yml,circle.yml}",
      "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
      "!**/._*",
      "!**/electron",
      "!**/electron-prebuilt",
      "!**/electron-rebuild"
    ];
    
    if (!packageJson.build.files) {
      packageJson.build.files = [];
    }
    
    // Add base files if not present
    const baseFiles = [
      ".next/**/*",
      "public/**/*",
      "node_modules/**/*",
      "package.json"
    ];
    
    for (const file of baseFiles) {
      if (!packageJson.build.files.includes(file)) {
        packageJson.build.files.push(file);
        modified = true;
      }
    }
    
    // Add exclusions
    for (const pattern of excludePatterns) {
      if (!packageJson.build.files.includes(pattern)) {
        packageJson.build.files.push(pattern);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      logSuccess('package.json optimized');
    } else {
      logSuccess('package.json already optimized');
    }
    
  } catch (error) {
    logWarning(`Failed to optimize package.json: ${error.message}`);
  }
}

function optimizeNextConfig() {
  logStep('NEXT', 'Optimizing Next.js configuration...');
  
  const nextConfigPath = 'next.config.js';
  
  const optimizedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Electron
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production'
  },
  
  // Bundle analyzer (optional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')())({
          enabled: true,
          openAnalyzer: false
        })
      );
      return config;
    }
  }),
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false
    };
    
    // Reduce bundle size for client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;
`;
  
  try {
    if (!fs.existsSync(nextConfigPath)) {
      fs.writeFileSync(nextConfigPath, optimizedConfig);
      logSuccess('Created optimized next.config.js');
    } else {
      // Check if current config needs updates
      const currentConfig = fs.readFileSync(nextConfigPath, 'utf8');
      if (!currentConfig.includes('optimizeCss') || !currentConfig.includes('removeConsole')) {
        fs.writeFileSync(nextConfigPath, optimizedConfig);
        logSuccess('Updated next.config.js with optimizations');
      } else {
        logSuccess('next.config.js already optimized');
      }
    }
  } catch (error) {
    logWarning(`Failed to optimize Next.js config: ${error.message}`);
  }
}

function optimizeDependencies() {
  logStep('DEPS', 'Analyzing and optimizing dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = packageJson.dependencies || {};
    
    // Check for potentially large or unnecessary dependencies
    const heavyDeps = [
      'lodash', // Suggest lodash-es or specific functions
      'moment', // Suggest date-fns or dayjs
      'axios', // Native fetch might be sufficient
      'jquery', // Usually not needed in React
      'bootstrap', // Might be heavy if not fully utilized
    ];
    
    const foundHeavyDeps = [];
    for (const dep of heavyDeps) {
      if (deps[dep]) {
        foundHeavyDeps.push(dep);
      }
    }
    
    if (foundHeavyDeps.length > 0) {
      logWarning('Found potentially heavy dependencies:');
      foundHeavyDeps.forEach(dep => {
        log(`  • ${dep} - Consider lighter alternatives`);
      });
    } else {
      logSuccess('No heavy dependencies detected');
    }
    
    // Check for duplicate functionality
    const duplicateChecks = [
      { deps: ['axios', 'fetch'], message: 'Both axios and fetch polyfill detected' },
      { deps: ['lodash', 'ramda'], message: 'Multiple utility libraries detected' },
      { deps: ['moment', 'date-fns', 'dayjs'], message: 'Multiple date libraries detected' }
    ];
    
    for (const check of duplicateChecks) {
      const found = check.deps.filter(dep => deps[dep]);
      if (found.length > 1) {
        logWarning(`${check.message}: ${found.join(', ')}`);
      }
    }
    
  } catch (error) {
    logWarning(`Failed to analyze dependencies: ${error.message}`);
  }
}

function optimizeAssets() {
  logStep('ASSETS', 'Optimizing assets...');
  
  const assetDirs = ['public/assets', 'public/images', 'assets'];
  
  for (const dir of assetDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir, { recursive: true });
        const imageFiles = files.filter(file => 
          typeof file === 'string' && /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(file)
        );
        
        log(`  Found ${imageFiles.length} image files in ${dir}`);
        
        // Check for large images
        const largeImages = [];
        for (const file of imageFiles) {
          const filePath = path.join(dir, file);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 1024 * 1024) { // 1MB
              largeImages.push({ file, size: stats.size });
            }
          }
        }
        
        if (largeImages.length > 0) {
          logWarning(`Large images detected in ${dir}:`);
          largeImages.forEach(({ file, size }) => {
            log(`    • ${file} (${(size / 1024 / 1024).toFixed(2)}MB)`);
          });
          log('    Consider optimizing these images');
        }
        
      } catch (error) {
        logWarning(`Failed to analyze ${dir}: ${error.message}`);
      }
    }
  }
}

function createOptimizationScript() {
  logStep('SCRIPT', 'Creating optimization maintenance script...');
  
  const scriptContent = `#!/bin/bash

# DropSentinel Build Optimization Maintenance Script
# Run this periodically to keep builds optimized

echo "🚀 Running DropSentinel build optimizations..."

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
npm run build:clean

# Update dependencies
echo "📦 Checking for dependency updates..."
npm outdated || true

# Run optimization
echo "⚡ Running build optimizer..."
node scripts/optimize-build.js

# Run analytics
echo "📊 Running build analytics..."
node scripts/build-analytics.js

# Test build system
echo "🧪 Testing build system..."
npm run test:build

echo "✅ Optimization complete!"
`;

  const scriptPath = 'scripts/optimize-maintenance.sh';
  fs.writeFileSync(scriptPath, scriptContent);
  
  try {
    fs.chmodSync(scriptPath, '755');
    logSuccess('Created optimization maintenance script');
  } catch (error) {
    logWarning('Created script but could not set executable permissions');
  }
}

// Main execution
async function main() {
  log(colors.bright + '⚡ DropSentinel Build Optimizer' + colors.reset);
  log('==============================\n');
  
  try {
    optimizePackageJson();
    optimizeNextConfig();
    optimizeDependencies();
    optimizeAssets();
    createOptimizationScript();
    
    log('\n' + colors.bright + '✨ Optimization Complete!' + colors.reset);
    log('Your build configuration has been optimized for better performance and smaller bundle sizes.');
    log('\n📋 Next steps:');
    log('  1. Run a test build: npm run dist:win:portable');
    log('  2. Check analytics: npm run build:analytics');
    log('  3. Run maintenance: scripts/optimize-maintenance.sh');
    
  } catch (error) {
    log(`${colors.red}❌ Optimization failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main();
}

module.exports = {
  optimizePackageJson,
  optimizeNextConfig,
  optimizeDependencies,
  optimizeAssets
};
