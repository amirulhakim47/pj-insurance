import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'pj-insurance'; 
// Note: repoName should be the repository name if it's not a user/org site.
// e.g. if your repo is 'my-project', set NEXT_PUBLIC_REPO_NAME='/my-project'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd && repoName ? repoName : undefined,
  assetPrefix: isProd && repoName ? repoName : undefined,
};

export default nextConfig;
