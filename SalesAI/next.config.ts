// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Correct key position for modern Next.js configurations
  serverExternalPackages: ['tesseract.js'],
};

export default nextConfig;