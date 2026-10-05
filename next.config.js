const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-label'],
  },

  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },

  compress: true,

  webpack: (config, { isServer }) => {
    // Explicit alias — some hosts (e.g. Hostinger) don't resolve tsconfig paths reliably
    config.resolve.alias['@'] = path.join(__dirname, 'src')

    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analyzer-report.html',
        })
      )
    }

    return config
  },
}

module.exports = nextConfig
