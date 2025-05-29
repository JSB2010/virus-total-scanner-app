#!/usr/bin/env node

/**
 * DropSentinel Enhanced Build System
 * Professional build process with comprehensive logging, analytics, and optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Enhanced logging with colors and timestamps
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

class EnhancedLogger {
  constructor() {
    this.startTime = Date.now();
    this.logs = [];

    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logFile = path.join(logsDir, `build-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
  }

  log(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      category,
      message,
      data,
      elapsed: Date.now() - this.startTime
    };

    this.logs.push(entry);

    // Console output with colors
    const timeStr = new Date().toLocaleTimeString();
    const elapsedStr = `+${Math.round(entry.elapsed / 1000)}s`;

    let color = colors.reset;
    let icon = '•';

    switch (level) {
      case 'info': color = colors.blue; icon = 'ℹ'; break;
      case 'success': color = colors.green; icon = '✅'; break;
      case 'warning': color = colors.yellow; icon = '⚠️'; break;
      case 'error': color = colors.red; icon = '❌'; break;
      case 'step': color = colors.cyan; icon = '🔄'; break;
      case 'metric': color = colors.magenta; icon = '📊'; break;
    }

    const prefix = `${colors.gray}[${timeStr}]${colors.reset} ${color}${icon}${colors.reset}`;
    console.log(`${prefix} ${colors.bright}[${category.toUpperCase()}]${colors.reset} ${message}`);

    if (data) {
      console.log(`${colors.gray}   ${JSON.stringify(data, null, 2)}${colors.reset}`);
    }

    // Write to log file
    fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
  }

  info(category, message, data) { this.log('info', category, message, data); }
  success(category, message, data) { this.log('success', category, message, data); }
  warning(category, message, data) { this.log('warning', category, message, data); }
  error(category, message, data) { this.log('error', category, message, data); }
  step(category, message, data) { this.log('step', category, message, data); }
  metric(category, message, data) { this.log('metric', category, message, data); }

  timer(category, operation) {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.metric(category, `${operation} completed`, { duration: `${duration}ms` });
      return duration;
    };
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const errors = this.logs.filter(log => log.level === 'error');
    const warnings = this.logs.filter(log => log.level === 'warning');
    const metrics = this.logs.filter(log => log.level === 'metric');

    const report = {
      buildId: `build_${Date.now()}`,
      timestamp: new Date().toISOString(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalTime: `${Math.round(totalTime / 1000)}s`,
      status: errors.length > 0 ? 'failed' : 'success',
      summary: {
        totalLogs: this.logs.length,
        errors: errors.length,
        warnings: warnings.length,
        metrics: metrics.length
      },
      performance: {
        totalDuration: totalTime,
        averageStepTime: metrics.length > 0
          ? Math.round(metrics.reduce((sum, m) => sum + (parseInt(m.data?.duration) || 0), 0) / metrics.length)
          : 0
      },
      errors: errors.map(e => ({ category: e.category, message: e.message, data: e.data })),
      warnings: warnings.map(w => ({ category: w.category, message: w.message, data: w.data }))
    };

    // Save report
    const reportFile = path.join(__dirname, '..', 'dist', `build-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return report;
  }
}

class EnhancedBuildSystem {
  constructor() {
    this.logger = new EnhancedLogger();
    this.buildConfig = this.loadBuildConfig();
  }

  loadBuildConfig() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        platforms: ['win32', 'darwin', 'linux'],
        compressionLevel: 9,
        parallelBuilds: true
      };
    } catch (error) {
      this.logger.error('config', 'Failed to load build configuration', { error: error.message });
      throw error;
    }
  }

  async validateEnvironment() {
    this.logger.step('validation', 'Validating build environment...');

    const checks = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'npm', command: 'npm --version' },
      { name: 'Git', command: 'git --version' }
    ];

    for (const check of checks) {
      try {
        const version = execSync(check.command, { encoding: 'utf8' }).trim();
        this.logger.success('validation', `${check.name} available`, { version });
      } catch (error) {
        this.logger.error('validation', `${check.name} not available`, { error: error.message });
        throw new Error(`${check.name} is required for building`);
      }
    }

    // Check disk space
    const stats = fs.statSync('.');
    this.logger.info('validation', 'Build environment validated', {
      platform: os.platform(),
      arch: os.arch(),
      memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      cpus: os.cpus().length
    });
  }

  async cleanBuildDirectory() {
    this.logger.step('cleanup', 'Cleaning build directory...');
    const timer = this.logger.timer('cleanup', 'Directory cleanup');

    try {
      if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
      }
      fs.mkdirSync('dist', { recursive: true });

      timer();
      this.logger.success('cleanup', 'Build directory cleaned');
    } catch (error) {
      timer();
      this.logger.error('cleanup', 'Failed to clean build directory', { error: error.message });
      throw error;
    }
  }

  async installDependencies() {
    this.logger.step('deps', 'Installing dependencies...');
    const timer = this.logger.timer('deps', 'Dependency installation');

    try {
      execSync('npm ci --legacy-peer-deps', { stdio: 'pipe' });
      timer();
      this.logger.success('deps', 'Dependencies installed successfully');
    } catch (error) {
      timer();
      this.logger.error('deps', 'Failed to install dependencies', { error: error.message });
      throw error;
    }
  }

  async runTests() {
    this.logger.step('test', 'Running test suite...');
    const timer = this.logger.timer('test', 'Test execution');

    try {
      const output = execSync('npm test', { encoding: 'utf8' });
      timer();
      this.logger.success('test', 'All tests passed');

      // Parse test results if possible
      const testResults = this.parseTestOutput(output);
      if (testResults) {
        this.logger.metric('test', 'Test metrics', testResults);
      }
    } catch (error) {
      timer();
      this.logger.error('test', 'Tests failed', { error: error.message });
      throw error;
    }
  }

  parseTestOutput(output) {
    try {
      // Simple test result parsing - can be enhanced based on test framework
      const lines = output.split('\n');
      const passedMatch = output.match(/(\d+) passing/);
      const failedMatch = output.match(/(\d+) failing/);

      return {
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        total: (passedMatch ? parseInt(passedMatch[1]) : 0) + (failedMatch ? parseInt(failedMatch[1]) : 0)
      };
    } catch (error) {
      return null;
    }
  }

  async buildPlatform(platform) {
    this.logger.step('build', `Building for ${platform}...`);
    const timer = this.logger.timer('build', `${platform} build`);

    try {
      let command;
      switch (platform) {
        case 'win32':
          command = 'npm run dist:win:all';
          break;
        case 'darwin':
          command = 'npm run dist:mac:all';
          break;
        case 'linux':
          command = 'npm run dist:linux:all';
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      execSync(command, { stdio: 'pipe' });
      const duration = timer();

      // Analyze build artifacts
      const artifacts = this.analyzeBuildArtifacts(platform);
      this.logger.success('build', `${platform} build completed`, {
        duration: `${Math.round(duration / 1000)}s`,
        artifacts: artifacts.length,
        totalSize: this.formatBytes(artifacts.reduce((sum, a) => sum + a.size, 0))
      });

      return artifacts;
    } catch (error) {
      timer();
      this.logger.error('build', `${platform} build failed`, { error: error.message });
      throw error;
    }
  }

  analyzeBuildArtifacts(platform) {
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) return [];

    const artifacts = [];
    const files = fs.readdirSync(distDir);

    files.forEach(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        artifacts.push({
          name: file,
          size: stats.size,
          platform,
          type: path.extname(file).slice(1) || 'unknown'
        });
      }
    });

    return artifacts;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateBuildSummary(allArtifacts) {
    this.logger.step('summary', 'Generating build summary...');

    const report = this.logger.generateReport();
    const totalSize = allArtifacts.reduce((sum, a) => sum + a.size, 0);

    this.logger.success('summary', 'Build completed successfully!', {
      totalArtifacts: allArtifacts.length,
      totalSize: this.formatBytes(totalSize),
      buildTime: report.totalTime,
      reportFile: path.basename(this.logger.logFile)
    });

    return report;
  }
}

// Main execution
async function main() {
  const builder = new EnhancedBuildSystem();

  try {
    builder.logger.info('build', 'Starting enhanced build process...', {
      version: builder.buildConfig.version,
      platforms: builder.buildConfig.platforms
    });

    await builder.validateEnvironment();
    await builder.cleanBuildDirectory();
    await builder.installDependencies();
    await builder.runTests();

    // Build for current platform only (can be extended for cross-platform)
    const currentPlatform = os.platform();
    const artifacts = await builder.buildPlatform(currentPlatform);

    const report = await builder.generateBuildSummary(artifacts);

    process.exit(0);
  } catch (error) {
    builder.logger.error('build', 'Build process failed', {
      error: error.message,
      stack: error.stack
    });

    const report = builder.logger.generateReport();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EnhancedBuildSystem, EnhancedLogger };
