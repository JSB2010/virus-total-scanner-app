/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Turbopack configuration (replaces webpack when using --turbopack)
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
