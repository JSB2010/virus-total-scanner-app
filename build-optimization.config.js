/**
 * DropSentinel Build Optimization Configuration
 * Advanced settings for faster builds and smaller packages
 */

const os = require('os');

module.exports = {
  // Build performance settings
  performance: {
    // Use all available CPU cores for parallel processing
    maxConcurrency: os.cpus().length,
    
    // Memory optimization
    nodeOptions: [
      '--max-old-space-size=8192',
      '--optimize-for-size',
      '--gc-interval=100'
    ],
    
    // Build caching
    cache: {
      enabled: true,
      directory: '.build-cache',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      compression: true
    },
    
    // Incremental builds
    incremental: {
      enabled: true,
      trackChanges: true,
      skipUnchanged: true
    }
  },

  // Electron Builder optimizations
  electronBuilder: {
    // Compression settings
    compression: 'maximum',
    
    // Parallel builds
    buildConcurrency: 3,
    
    // File exclusions for smaller packages
    files: [
      '!**/.git',
      '!**/node_modules/.cache',
      '!**/node_modules/.bin',
      '!**/*.map',
      '!**/*.md',
      '!**/test',
      '!**/tests',
      '!**/__tests__',
      '!**/coverage',
      '!**/docs',
      '!**/examples',
      '!**/demo',
      '!**/.nyc_output',
      '!**/jest.config.js',
      '!**/rollup.config.js',
      '!**/webpack.config.js'
    ],
    
    // Platform-specific optimizations
    win: {
      // Windows-specific optimizations
      requestedExecutionLevel: 'asInvoker',
      signAndEditExecutable: false,
      signDlls: false,
      
      // NSIS optimizations
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        displayLanguageSelector: false,
        installerLanguages: ['en_US'],
        packElevateHelper: false
      },
      
      // MSI optimizations
      msi: {
        oneClick: false,
        perMachine: false,
        runAfterFinish: true,
        warningsAsErrors: false
      }
    },
    
    mac: {
      // macOS-specific optimizations
      hardenedRuntime: false,
      gatekeeperAssess: false,
      
      // DMG optimizations
      dmg: {
        writeUpdateInfo: false,
        sign: false
      },
      
      // PKG optimizations
      pkg: {
        allowAnywhere: true,
        allowCurrentUserHome: true,
        allowRootDirectory: false
      }
    },
    
    linux: {
      // Linux-specific optimizations
      desktop: {
        StartupNotify: 'false',
        Terminal: 'false'
      },
      
      // AppImage optimizations
      appImage: {
        systemIntegration: 'ask'
      }
    }
  },

  // Next.js optimizations
  nextjs: {
    // Build optimizations
    swcMinify: true,
    
    // Experimental features for better performance
    experimental: {
      turbo: {
        loaders: {
          '.svg': ['@svgr/webpack']
        }
      },
      optimizeCss: true,
      optimizePackageImports: ['lucide-react', 'date-fns']
    },
    
    // Compiler optimizations
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
      styledComponents: false
    },
    
    // Image optimizations
    images: {
      unoptimized: true,
      formats: ['image/webp', 'image/avif']
    },
    
    // Bundle analysis
    bundleAnalyzer: {
      enabled: process.env.ANALYZE === 'true',
      openAnalyzer: false
    }
  },

  // Dependency optimizations
  dependencies: {
    // External dependencies to exclude from bundle
    externals: [
      'electron',
      'fsevents',
      'chokidar'
    ],
    
    // Dependencies to optimize
    optimize: [
      'react',
      'react-dom',
      'next',
      'lucide-react'
    ],
    
    // Tree shaking configuration
    treeShaking: {
      enabled: true,
      sideEffects: false,
      usedExports: true
    }
  },

  // Asset optimizations
  assets: {
    // Image optimization
    images: {
      quality: 85,
      progressive: true,
      optimizationLevel: 7
    },
    
    // Font optimization
    fonts: {
      preload: ['Inter', 'system-ui'],
      display: 'swap'
    },
    
    // Icon optimization
    icons: {
      sizes: [16, 24, 32, 48, 64, 128, 256, 512, 1024],
      formats: ['ico', 'png', 'icns']
    }
  },

  // CI/CD optimizations
  ci: {
    // GitHub Actions optimizations
    github: {
      // Cache configuration
      cache: {
        paths: [
          '~/.npm',
          '~/.cache/electron',
          '~/.cache/electron-builder',
          '.next/cache',
          'node_modules/.cache'
        ],
        restoreKeys: [
          'node-modules-',
          'electron-cache-',
          'next-cache-'
        ]
      },
      
      // Parallel job configuration
      matrix: {
        strategy: 'parallel',
        maxJobs: 3,
        failFast: false
      },
      
      // Artifact optimization
      artifacts: {
        retention: 30,
        compression: 6,
        excludePaths: [
          '**/*.log',
          '**/*.tmp',
          '**/node_modules'
        ]
      }
    }
  },

  // Monitoring and analytics
  monitoring: {
    // Build metrics to track
    metrics: [
      'buildTime',
      'bundleSize',
      'artifactCount',
      'memoryUsage',
      'cpuUsage',
      'cacheHitRate'
    ],
    
    // Performance thresholds
    thresholds: {
      buildTime: 300000, // 5 minutes
      bundleSize: 200 * 1024 * 1024, // 200MB
      memoryUsage: 4 * 1024 * 1024 * 1024 // 4GB
    },
    
    // Reporting
    reports: {
      enabled: true,
      format: ['json', 'html'],
      includeRecommendations: true
    }
  },

  // Development optimizations
  development: {
    // Hot reload optimizations
    hotReload: {
      enabled: true,
      overlay: false,
      quiet: true
    },
    
    // Source map optimizations
    sourceMaps: {
      development: 'eval-source-map',
      production: false
    },
    
    // TypeScript optimizations
    typescript: {
      transpileOnly: true,
      experimentalDecorators: true
    }
  }
};

// Export configuration based on environment
const config = module.exports;

// Apply environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  config.nextjs.compiler.removeConsole = true;
  config.development.sourceMaps.production = false;
}

if (process.env.CI === 'true') {
  config.performance.cache.enabled = true;
  config.ci.github.cache.enabled = true;
}

if (process.env.ANALYZE === 'true') {
  config.nextjs.bundleAnalyzer.enabled = true;
  config.nextjs.bundleAnalyzer.openAnalyzer = true;
}
