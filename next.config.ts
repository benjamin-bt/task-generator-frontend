import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Match all routes starting with /api/
        destination: /* "http://localhost:8000/api/:path*" */ `${process.env.REACT_APP_BACKEND}/api/:path*`, // Proxy to backend server
      },
    ];
  },
};

export default nextConfig;
