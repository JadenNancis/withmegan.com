import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes disabled — our domain-routing pattern uses runtime string
  // hrefs from the site registry, which conflicts with static route typing.
  images: {
    remotePatterns: [],
  },
  env: {
    NEXT_PUBLIC_HAS_BLOB_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? "1" : "",
  },
};

export default nextConfig;