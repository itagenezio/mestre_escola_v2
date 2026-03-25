/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopack: {
      packInstruction: true,
    }
  }
}

module.exports = nextConfig
