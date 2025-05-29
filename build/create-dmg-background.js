#!/usr/bin/env node

/**
 * DropSentinel DMG Background Generator
 * Creates a professional DMG background image with branding
 */

const fs = require('fs');
const path = require('path');

// SVG template for DMG background
const dmgBackgroundSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="420" viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:0.1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="600" height="420" fill="url(#backgroundGradient)"/>
  
  <!-- Accent stripe -->
  <rect x="0" y="0" width="600" height="80" fill="url(#accentGradient)"/>
  
  <!-- Header text -->
  <text x="300" y="40" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" 
        font-size="24" font-weight="600" fill="#1f2937">
    DropSentinel
  </text>
  <text x="300" y="65" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" 
        font-size="14" font-weight="400" fill="#6b7280">
    Advanced File Security Scanner
  </text>
  
  <!-- Installation instruction -->
  <text x="300" y="320" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" 
        font-size="16" font-weight="500" fill="#374151">
    Drag DropSentinel to Applications to install
  </text>
  
  <!-- Arrow pointing from app to Applications -->
  <path d="M 200 240 Q 300 200 400 240" stroke="#3b82f6" stroke-width="3" 
        fill="none" stroke-dasharray="5,5" opacity="0.7"/>
  <polygon points="390,235 400,240 390,245" fill="#3b82f6" opacity="0.7"/>
  
  <!-- Security badge -->
  <circle cx="500" cy="350" r="30" fill="#10b981" opacity="0.1"/>
  <text x="500" y="345" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" 
        font-size="20" fill="#10b981">🛡️</text>
  <text x="500" y="365" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" 
        font-size="10" font-weight="500" fill="#059669">
    SECURE
  </text>
  
  <!-- Version info -->
  <text x="50" y="400" font-family="SF Pro Display, -apple-system, sans-serif" 
        font-size="12" font-weight="400" fill="#9ca3af">
    Version 1.0.0 • Sentinel Guard
  </text>
</svg>`;

// Create the build directory if it doesn't exist
const buildDir = path.join(__dirname);
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Write the SVG file
const svgPath = path.join(buildDir, 'dmg-background.svg');
fs.writeFileSync(svgPath, dmgBackgroundSVG);

console.log('✅ DMG background SVG created:', svgPath);

// Note: To convert to PNG, you would need a tool like Inkscape or similar
// For now, we'll use the SVG directly or convert manually
console.log('📝 To convert to PNG, run:');
console.log('   inkscape --export-png=dmg-background.png --export-width=600 --export-height=420 dmg-background.svg');
console.log('   or use any SVG to PNG converter online');
