/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'pj-insurance';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd && repoName ? repoName : undefined,
  assetPrefix: isProd && repoName ? repoName : undefined,
};

export default nextConfig;

