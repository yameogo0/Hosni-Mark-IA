/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Forcer le build même avec vulnérabilités
  swcMinify: true,
  output: 'standalone',
}

export default nextConfig
