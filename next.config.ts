import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Allow both production domains and localhost variants in dev.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;