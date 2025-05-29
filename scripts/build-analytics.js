#!/usr/bin/env node

/**
 * DropSentinel Build Analytics
 * Analyzes build performance and generates optimization recommendations
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

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuildArtifacts() {
  logStep('ARTIFACTS', 'Analyzing build artifacts...');
  
  const distDir = 'dist';
  if (!fs.existsSync(distDir)) {
    logWarning('No dist directory found. Run a build first.');
    return {};
  }
  
  const artifacts = [];
  const extensions = ['.exe', '.msi', '.dmg', '.pkg', '.AppImage', '.deb', '.rpm', '.zip', '.tar.gz'];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        scanDirectory(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        artifacts.push({
          name: item,
          path: fullPath,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          type: path.extname(item),
          created: stats.birthtime
        });
      }
    }
  }
  
  scanDirectory(distDir);
  
  // Sort by size (largest first)
  artifacts.sort((a, b) => b.size - a.size);
  
  log('\n📦 Build Artifacts Analysis:');
  log('============================');
  
  if (artifacts.length === 0) {
    logWarning('No build artifacts found');
    return {};
  }
  
  let totalSize = 0;
  artifacts.forEach(artifact => {
    totalSize += artifact.size;
    const platform = artifact.name.includes('win') || artifact.name.includes('Setup') || artifact.type === '.exe' || artifact.type === '.msi' ? 'Windows' :
                    artifact.name.includes('mac') || artifact.type === '.dmg' || artifact.type === '.pkg' ? 'macOS' :
                    artifact.type === '.AppImage' || artifact.type === '.deb' || artifact.type === '.rpm' ? 'Linux' : 'Unknown';
    
    log(`  📁 ${artifact.name}`);
    log(`     Size: ${artifact.sizeFormatted}`);
    log(`     Platform: ${platform}`);
    log(`     Type: ${artifact.type}`);
    log('');
  });
  
  log(`📊 Summary:`);
  log(`   Total artifacts: ${artifacts.length}`);
  log(`   Total size: ${formatFileSize(totalSize)}`);
  log(`   Average size: ${formatFileSize(totalSize / artifacts.length)}`);
  
  return {
    artifacts,
    totalSize,
    totalCount: artifacts.length,
    averageSize: totalSize / artifacts.length
  };
}

function analyzeBundleComposition() {
  logStep('BUNDLE', 'Analyzing bundle composition...');
  
  try {
    // Analyze package.json dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    
    log('\n📦 Dependencies Analysis:');
    log('========================');
    log(`Production dependencies: ${Object.keys(deps).length}`);
    log(`Development dependencies: ${Object.keys(devDeps).length}`);
    
    // Check for large dependencies
    const largeDeps = [
      'electron',
      'next',
      'react',
      'react-dom',
      '@electron/rebuild'
    ];
    
    log('\n🔍 Key Dependencies:');
    largeDeps.forEach(dep => {
      if (deps[dep] || devDeps[dep]) {
        log(`  ✅ ${dep}: ${deps[dep] || devDeps[dep]}`);
      }
    });
    
    // Check node_modules size if it exists
    if (fs.existsSync('node_modules')) {
      try {
        const nodeModulesSize = execSync('du -sh node_modules 2>/dev/null || echo "Unknown"', { encoding: 'utf8' }).trim();
        log(`\n📁 node_modules size: ${nodeModulesSize}`);
      } catch (error) {
        log('\n📁 node_modules size: Unable to determine');
      }
    }
    
  } catch (error) {
    logWarning(`Failed to analyze bundle composition: ${error.message}`);
  }
}

function generateOptimizationRecommendations(artifactAnalysis) {
  logStep('OPTIMIZE', 'Generating optimization recommendations...');
  
  const recommendations = [];
  
  // Size-based recommendations
  if (artifactAnalysis.averageSize > 200 * 1024 * 1024) { // 200MB
    recommendations.push({
      type: 'size',
      priority: 'high',
      message: 'Average artifact size is large (>200MB). Consider optimizing dependencies.',
      actions: [
        'Review and remove unused dependencies',
        'Use webpack-bundle-analyzer to identify large modules',
        'Enable tree shaking for better dead code elimination',
        'Consider using dynamic imports for large features'
      ]
    });
  }
  
  // Platform-specific recommendations
  const hasWindows = artifactAnalysis.artifacts.some(a => a.name.includes('win') || a.type === '.exe' || a.type === '.msi');
  const hasMac = artifactAnalysis.artifacts.some(a => a.name.includes('mac') || a.type === '.dmg' || a.type === '.pkg');
  const hasLinux = artifactAnalysis.artifacts.some(a => a.type === '.AppImage' || a.type === '.deb' || a.type === '.rpm');
  
  if (hasWindows && hasMac && hasLinux) {
    recommendations.push({
      type: 'platform',
      priority: 'medium',
      message: 'Building for all platforms. Consider platform-specific optimizations.',
      actions: [
        'Use platform-specific dependencies where possible',
        'Implement platform-specific features conditionally',
        'Consider separate build pipelines for different platforms'
      ]
    });
  }
  
  // Security recommendations
  recommendations.push({
    type: 'security',
    priority: 'high',
    message: 'Enhance security for production releases.',
    actions: [
      'Enable code signing for all platforms',
      'Implement auto-updater with secure channels',
      'Add integrity checks for downloaded updates',
      'Use CSP (Content Security Policy) in renderer processes'
    ]
  });
  
  // Performance recommendations
  recommendations.push({
    type: 'performance',
    priority: 'medium',
    message: 'Optimize application performance.',
    actions: [
      'Implement lazy loading for heavy components',
      'Use React.memo and useMemo for expensive computations',
      'Optimize image assets and use appropriate formats',
      'Implement proper caching strategies'
    ]
  });
  
  log('\n🚀 Optimization Recommendations:');
  log('================================');
  
  recommendations.forEach((rec, index) => {
    const priorityColor = rec.priority === 'high' ? colors.red : 
                         rec.priority === 'medium' ? colors.yellow : colors.green;
    
    log(`\n${index + 1}. ${priorityColor}[${rec.priority.toUpperCase()}]${colors.reset} ${rec.message}`);
    log('   Actions:');
    rec.actions.forEach(action => {
      log(`   • ${action}`);
    });
  });
  
  return recommendations;
}

function generateBuildReport(artifactAnalysis, recommendations) {
  logStep('REPORT', 'Generating comprehensive build report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    platform: process.platform,
    nodeVersion: process.version,
    artifacts: artifactAnalysis,
    recommendations: recommendations,
    buildConfig: {
      compression: 'maximum',
      codeSigningEnabled: false,
      notarizationEnabled: false,
      autoUpdaterEnabled: true
    }
  };
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
  
  const reportPath = `logs/build-analytics-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Build analytics report saved: ${reportPath}`);
  
  return report;
}

// Main execution
async function main() {
  log(colors.bright + '📊 DropSentinel Build Analytics' + colors.reset);
  log('===============================\n');
  
  try {
    const artifactAnalysis = analyzeBuildArtifacts();
    analyzeBundleComposition();
    const recommendations = generateOptimizationRecommendations(artifactAnalysis);
    const report = generateBuildReport(artifactAnalysis, recommendations);
    
    log('\n' + colors.bright + '✨ Analysis Complete!' + colors.reset);
    log('Check the generated report for detailed insights and recommendations.');
    
  } catch (error) {
    log(`${colors.red}❌ Analysis failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBuildArtifacts,
  analyzeBundleComposition,
  generateOptimizationRecommendations
};
