#!/usr/bin/env node

/**
 * Comprehensive repository health check script for DropSentinel
 * Validates workflows, dependencies, configurations, and overall repo health
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkWorkflowHealth() {
  console.log('\n🔄 Checking Workflow Health:');

  const workflowDir = path.join(__dirname, '..', '.github', 'workflows');
  const workflows = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml'));

  const workflowStatus = {
    active: [],
    deprecated: [],
    issues: []
  };

  workflows.forEach(workflow => {
    const workflowPath = path.join(workflowDir, workflow);
    const content = fs.readFileSync(workflowPath, 'utf8');

    // Check for common issues
    if (content.includes('publish-packages') && workflow !== 'release-analytics.yml') {
      workflowStatus.issues.push(`${workflow}: References deprecated publish-packages event`);
    }

    if (content.includes('docker/build-push-action@v5')) {
      workflowStatus.issues.push(`${workflow}: Uses outdated docker/build-push-action@v5`);
    }

    // Categorize workflows
    switch (workflow) {
      case 'ci.yml':
      case 'release.yml':
      case 'optimized-build.yml':
      case 'deploy-website.yml':
      case 'codeql.yml':
      case 'smart-release.yml':
      case 'release-analytics.yml':
        workflowStatus.active.push(workflow);
        break;
      case 'build-packages.yml':
        workflowStatus.deprecated.push(workflow);
        break;
      default:
        workflowStatus.active.push(workflow);
    }
  });

  console.log(`  ✅ Active workflows: ${workflowStatus.active.length}`);
  workflowStatus.active.forEach(w => console.log(`    - ${w}`));

  if (workflowStatus.deprecated.length > 0) {
    console.log(`  ⚠️ Deprecated workflows: ${workflowStatus.deprecated.length}`);
    workflowStatus.deprecated.forEach(w => console.log(`    - ${w}`));
  }

  if (workflowStatus.issues.length > 0) {
    console.log(`  ❌ Workflow issues: ${workflowStatus.issues.length}`);
    workflowStatus.issues.forEach(issue => console.log(`    - ${issue}`));
    return false;
  }

  return true;
}

function checkDependencyHealth() {
  console.log('\n📦 Checking Dependency Health:');

  try {
    // Check for security vulnerabilities
    console.log('  🔍 Running security audit...');
    const auditResult = execSync('npm audit --audit-level=moderate', { encoding: 'utf8' });
    console.log('  ✅ No moderate or high security vulnerabilities found');
  } catch (error) {
    console.log('  ⚠️ Security vulnerabilities detected');
    console.log('  💡 Run `npm audit fix` to resolve issues');
    return false;
  }

  // Check for outdated dependencies
  try {
    console.log('  📅 Checking for outdated dependencies...');
    const outdatedResult = execSync('npm outdated --depth=0', { encoding: 'utf8' });
    if (outdatedResult.trim()) {
      console.log('  ⚠️ Some dependencies are outdated');
      console.log('  💡 Run `npm update` to update dependencies');
    } else {
      console.log('  ✅ All dependencies are up to date');
    }
  } catch (error) {
    // npm outdated returns exit code 1 when outdated packages exist
    console.log('  ⚠️ Some dependencies may be outdated');
  }

  return true;
}

function checkConfigurationHealth() {
  console.log('\n⚙️ Checking Configuration Health:');

  const configFiles = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'next.config.mjs', desc: 'Next.js configuration' },
    { path: 'tailwind.config.js', desc: 'Tailwind configuration' },
    { path: 'tsconfig.json', desc: 'TypeScript configuration' },
    { path: '.gitignore', desc: 'Git ignore rules' }
  ];

  let allValid = true;

  configFiles.forEach(config => {
    const configPath = path.join(__dirname, '..', config.path);
    if (fs.existsSync(configPath)) {
      console.log(`  ✅ ${config.desc} found`);

      // Validate JSON files
      if (config.path.endsWith('.json')) {
        try {
          JSON.parse(fs.readFileSync(configPath, 'utf8'));
          console.log(`    ✅ Valid JSON syntax`);
        } catch (error) {
          console.log(`    ❌ Invalid JSON syntax: ${error.message}`);
          allValid = false;
        }
      }
    } else {
      console.log(`  ❌ ${config.desc} missing (${config.path})`);
      allValid = false;
    }
  });

  return allValid;
}

function checkBuildHealth() {
  console.log('\n🔨 Checking Build Health:');

  try {
    console.log('  🔍 Testing build process...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('  ✅ Build process successful');
    return true;
  } catch (error) {
    console.log('  ❌ Build process failed');
    console.log('  💡 Check build logs for details');
    return false;
  }
}

function checkReleaseHealth() {
  console.log('\n🚀 Checking Release Health:');

  // Check if validation script exists and works
  try {
    execSync('npm run validate-release', { stdio: 'pipe' });
    console.log('  ✅ Release validation passed');
    return true;
  } catch (error) {
    console.log('  ❌ Release validation failed');
    return false;
  }
}

function generateHealthReport() {
  console.log('\n📊 Generating Health Report:');

  const healthData = {
    timestamp: new Date().toISOString(),
    repository: 'JSB2010/DropSentinel',
    checks: {
      workflows: checkWorkflowHealth(),
      dependencies: checkDependencyHealth(),
      configuration: checkConfigurationHealth(),
      build: checkBuildHealth(),
      release: checkReleaseHealth(),
      container: checkContainerConfig().healthy
    }
  };

  const passedChecks = Object.values(healthData.checks).filter(Boolean).length;
  const totalChecks = Object.keys(healthData.checks).length;

  console.log('\n📋 Health Summary:');
  console.log('==================');

  Object.entries(healthData.checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check.charAt(0).toUpperCase() + check.slice(1)}`);
  });

  console.log(`\n🎯 Overall Health: ${passedChecks}/${totalChecks} checks passed`);

  if (passedChecks === totalChecks) {
    console.log('\n🎉 Repository is in excellent health!');
    return true;
  } else {
    console.log('\n⚠️ Repository needs attention. Please address the issues above.');
    return false;
  }
}

function main() {
  console.log('🏥 DropSentinel Repository Health Check');
  console.log('======================================');

  const isHealthy = generateHealthReport();

  console.log('\n💡 Recommendations:');
  console.log('- Run this health check regularly');
  console.log('- Address any failing checks promptly');
  console.log('- Keep dependencies updated');
  console.log('- Monitor workflow performance');

  return isHealthy;
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

function checkContainerConfig() {
  console.log('\n🐳 Checking Container Configuration:');

  const containerStatus = {
    healthy: true,
    issues: []
  };

  // Check for Dockerfile in workflow
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'release-analytics.yml');
  if (fs.existsSync(workflowPath)) {
    const content = fs.readFileSync(workflowPath, 'utf8');

    if (content.includes('Create Dockerfile')) {
      console.log('  ✅ Container workflow includes Dockerfile creation');
    } else {
      containerStatus.issues.push('Container workflow missing Dockerfile creation');
      containerStatus.healthy = false;
    }

    if (content.includes('ghcr.io')) {
      console.log('  ✅ Container registry configured (GitHub Container Registry)');
    } else {
      containerStatus.issues.push('Container registry not configured');
      containerStatus.healthy = false;
    }

    if (content.includes('HEALTHCHECK')) {
      console.log('  ✅ Health checks configured in container');
    } else {
      containerStatus.issues.push('Container health checks not configured');
      containerStatus.healthy = false;
    }
  } else {
    containerStatus.issues.push('Container workflow not found');
    containerStatus.healthy = false;
  }

  // Check for .dockerignore
  const dockerignorePath = path.join(__dirname, '..', '.dockerignore');
  if (fs.existsSync(dockerignorePath)) {
    console.log('  ✅ .dockerignore file exists');
  } else {
    containerStatus.issues.push('.dockerignore file missing');
    containerStatus.healthy = false;
  }

  // Check for health API endpoint
  const healthApiPath = path.join(__dirname, '..', 'pages', 'api', 'health.js');
  if (fs.existsSync(healthApiPath)) {
    console.log('  ✅ Health API endpoint exists');
  } else {
    containerStatus.issues.push('Health API endpoint missing');
    containerStatus.healthy = false;
  }

  // Check for Docker scripts in package.json
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dockerScripts = Object.keys(packageJson.scripts || {}).filter(script => script.startsWith('docker:'));

    if (dockerScripts.length > 0) {
      console.log(`  ✅ Docker scripts available: ${dockerScripts.join(', ')}`);
    } else {
      containerStatus.issues.push('No Docker scripts in package.json');
      containerStatus.healthy = false;
    }
  }

  return containerStatus;
}

module.exports = {
  checkWorkflowHealth,
  checkDependencyHealth,
  checkConfigurationHealth,
  checkContainerConfig
};
