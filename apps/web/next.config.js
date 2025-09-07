export default {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@ai-build-flow/ui"],
  experimental: { externalDir: true },
  eslint: { ignoreDuringBuilds: true }
};
