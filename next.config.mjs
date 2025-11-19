/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // No basePath needed - gh-pages serves from custom domain or root
};

export default nextConfig;

