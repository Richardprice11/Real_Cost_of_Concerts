import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ticketm.net" },
      { protocol: "https", hostname: "**.ticketmaster.com" },
      { protocol: "https", hostname: "**.ticketmaster.eu" },
    ],
  },
};

export default nextConfig;
