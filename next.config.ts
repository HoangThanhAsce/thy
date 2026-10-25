import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export, deployed by Cloudflare Pages Git integration (build output: out/)
  output: "export",
  // Emit /route/index.html so Pages serves the source's trailing-slash URLs
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
