import type { NextConfig } from "next";

const apiProxyTarget = (process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  .replace(/\/+$/, "");

const nextConfig: NextConfig = {
  experimental: {
    devtoolSegmentExplorer: false
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiProxyTarget}/:path*`
      }
    ];
  }
};

export default nextConfig;
