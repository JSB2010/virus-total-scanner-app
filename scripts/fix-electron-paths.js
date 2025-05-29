#!/usr/bin/env node

/**
 * Fix paths in Next.js export for Electron
 * Converts absolute paths to relative paths for proper loading in Electron
 */

const fs = require('fs');
const path = require('path');

function fixHtmlPaths(filePath) {
  console.log(`Fixing paths in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/_next\//g, 'href="./_next/');
  content = content.replace(/src="\/_next\//g, 'src="./_next/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/([^"]*\.(?:css|js|png|jpg|jpeg|gif|svg|ico))"/g, 'href="./$1"');
  content = content.replace(/src="\/([^"]*\.(?:css|js|png|jpg|jpeg|gif|svg|ico))"/g, 'src="./$1"');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed paths in: ${filePath}`);
}

function fixJsPaths(filePath) {
  console.log(`Fixing JS paths in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix JavaScript asset paths
  content = content.replace(/"\/assets\//g, '"./assets/');
  content = content.replace(/"\/([^"]*\.(?:css|js|png|jpg|jpeg|gif|svg|ico))"/g, '"./$1"');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed JS paths in: ${filePath}`);
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.html')) {
      fixHtmlPaths(fullPath);
    } else if (item.endsWith('.js')) {
      fixJsPaths(fullPath);
    }
  }
}

function main() {
  const outDir = 'out';
  
  if (!fs.existsSync(outDir)) {
    console.error('❌ Out directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  console.log('🔧 Fixing paths for Electron...');
  processDirectory(outDir);
  console.log('✅ All paths fixed for Electron!');
}

if (require.main === module) {
  main();
}

module.exports = { fixHtmlPaths, fixJsPaths, processDirectory };
