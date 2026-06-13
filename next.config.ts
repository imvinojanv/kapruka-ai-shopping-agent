import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "www.kapruka.com" },
      { hostname: "kapruka.com" },
      { hostname: "cdn.kapruka.com" },
      { hostname: "**.kapruka.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
