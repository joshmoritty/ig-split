import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ig-split",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
