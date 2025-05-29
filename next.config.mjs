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
  // Enable static export for website deployment
  output: process.env.BUILD_WEBSITE === 'true' ? 'export' : undefined,
  trailingSlash: process.env.BUILD_WEBSITE === 'true',
  basePath: process.env.BUILD_WEBSITE === 'true' ? '/virus-total-scanner-app' : '',
  assetPrefix: process.env.BUILD_WEBSITE === 'true' ? '/virus-total-scanner-app/' : '',
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
