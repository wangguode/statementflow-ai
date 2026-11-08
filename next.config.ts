import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 适配 Cloudflare 全球边缘静态部署 */
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
