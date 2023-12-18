/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

module.exports = {
    swcMinify: true,  
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: '**firebasestorage.googleapis.com**',
            },
        ],
    },
  }
