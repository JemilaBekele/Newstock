import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
      remotePatterns: [
        // FIXED 👇 (Add HTTPS for ordere.net)
        {
          protocol: 'https',
          hostname: 'ordere.net',
          pathname: '/**'
        },
  
        // If your local dev also uses HTTP
        {
          protocol: 'http',
          hostname: 'ordere.net',
          port: '5000',
          pathname: '/**'
        },
  
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/**'
        }
      ]
    },
};

export default nextConfig;
