/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      'chromadb',
      '@xenova/transformers',
      'bullmq',
      'ioredis',
    ],
  },
}

module.exports = nextConfig
