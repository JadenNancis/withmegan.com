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
  // pdfkit reads its font metrics (Helvetica.afm) from __dirname at runtime;
  // bundling it rewrites __dirname to a virtual path that doesn't exist on
  // disk. Load it as a native server package so it resolves from node_modules.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;