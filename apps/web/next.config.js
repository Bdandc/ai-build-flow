/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@ai-build-flow/ui'],
  experimental: { externalDir: true }
};
export default nextConfig;

