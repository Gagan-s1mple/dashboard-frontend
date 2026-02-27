import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for file uploads through the proxy
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
};

export default nextConfig;