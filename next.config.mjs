/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Legacy compatibility options
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig; 