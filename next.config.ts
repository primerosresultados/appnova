import type { NextConfig } from "next";

// Forced restart: Prisma Client Refresh

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevent Prisma from being bundled in client-side code
  serverExternalPackages: ['@prisma/client'],
  // Tree-shake heavy utility libraries — only import what's used
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'date-fns/locale', '@radix-ui/react-icons'],
  },
};

export default nextConfig;

