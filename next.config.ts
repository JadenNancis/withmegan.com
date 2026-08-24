import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes disabled — our domain-routing pattern uses runtime string
  // hrefs from the site registry, which conflicts with static route typing.
  images: {
    remotePatterns: [],
  },
  env: {
    // Client needs to know whether to upload straight to Wasabi (presigned
    // URL) or fall back to the dev multipart POST.
    NEXT_PUBLIC_HAS_WASABI:
      process.env.WASABI_BUCKET &&
      process.env.WASABI_ACCESS_KEY_ID &&
      process.env.WASABI_SECRET_ACCESS_KEY
        ? "1"
        : "",
  },
  // pdfkit reads its font metrics (Helvetica.afm) from __dirname at runtime;
  // bundling it rewrites __dirname to a virtual path that doesn't exist on
  // disk. Load it as a native server package so it resolves from node_modules.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;