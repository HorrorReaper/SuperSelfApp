// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "th.bing.com",
        port: "",
        pathname: "/th/id/**",
      },
      { protocol: "https", hostname: "tse1.mm.bing.net", port: "", pathname: "/th/id/**" },
    ],
  },
};

export default nextConfig;
