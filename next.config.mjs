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
  eslint: {
    // Only run ESLint on specific files/directories
    dirs: ['pages', 'utils', 'components'], // exclude components/main
    // Or disable it completely during builds
    ignoreDuringBuilds: true,
  },


  reactStrictMode: true,
};

export default nextConfig; 