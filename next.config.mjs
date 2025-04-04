/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js generates _document.js
  swcMinify: false,
  
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