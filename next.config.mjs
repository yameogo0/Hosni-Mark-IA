/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorer les avertissements de sécurité (temporaire)
  swcMinify: true,
}

export default nextConfig
