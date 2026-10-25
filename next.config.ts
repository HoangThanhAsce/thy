import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to out/, served as Cloudflare Workers static assets (see wrangler.jsonc)
  output: "export",
  // Emit /route/index.html so the trailing-slash URLs match the source
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
