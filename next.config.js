/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Electron
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  images: {
    unoptimized: true
  },

  // Performance optimizations
  experimental: {
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
  },

  // Configure for Electron static export
  basePath: '',
  assetPrefix: ''
};

module.exports = nextConfig;
