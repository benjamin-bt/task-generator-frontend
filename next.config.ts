import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Match all routes starting with /api/
        destination: `${process.env.NEXT_PUBLIC_BACKEND}/api/:path*`, // Proxy to backend server
      },
    ];
  },
};

export default nextConfig;
