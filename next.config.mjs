/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // No basePath needed for gh-pages deployment
  // GitHub Pages automatically serves from /repo-name/
};

export default nextConfig;

