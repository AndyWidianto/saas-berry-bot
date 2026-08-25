import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // Menyebabkan HTTP Status Code 301
      },
    ];
  },
};

export default nextConfig;
