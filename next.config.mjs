/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/dentra-website',
  assetPrefix: '/dentra-website',
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/dentra-website',
  },
};

export default nextConfig;
