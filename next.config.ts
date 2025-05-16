import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tsammkizfkrxmlanalcx.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
