/** @type {import('next').NextConfig} */
const nextConfig = {
  // Common configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Website-specific configuration
  ...(process.env.BUILD_WEBSITE === 'true' && {
    output: 'export',
    trailingSlash: true,
    basePath: '',
    assetPrefix: '',
    distDir: 'out',
  }),

  // Main app configuration (Electron)
  ...(process.env.BUILD_WEBSITE !== 'true' && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
    basePath: '',
    assetPrefix: '',
    // Performance optimizations for main app
    experimental: {
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
    },
    // Build optimizations for main app
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
      reactRemoveProperties: process.env.NODE_ENV === 'production'
    },
  }),

  // Webpack optimizations (only when not using Turbopack)
  ...(process.env.NODE_ENV !== 'development' && process.env.BUILD_WEBSITE !== 'true' && {
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
    },
  }),

  // Turbopack configuration (for development)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
