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

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },

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
