import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevent Prisma from being bundled in client-side code
  serverExternalPackages: ['@prisma/client'],
  // Tree-shake heavy utility libraries — only import what's used
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'date-fns/locale', '@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;

