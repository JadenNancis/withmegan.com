import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes disabled — our domain-routing pattern uses runtime string
  // hrefs from the site registry, which conflicts with static route typing.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;