import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
  allowedDevOrigins: [
    "10.167.48.85",
    "10.253.91.85",
  ],
};

export default nextConfig;