/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Gera servidor standalone para rodar em Docker sem o node_modules completo
  output: 'standalone',

  // Em produção (VPS): NEXT_PUBLIC_BASE_PATH=/mestre → app fica em /mestre/
  // Em desenvolvimento local: variável não definida → app fica na raiz /
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Proxy server-side: /api/mestre/* → Node.js backend do VPS (http://node:3001)
  // Em desenvolvimento: MESTRE_API_URL não definido → usa localhost:3001
  async rewrites() {
    const apiUrl = process.env.MESTRE_API_URL || 'http://localhost:3001';
    return [
      {
        // O Next.js auto-prefixa o source com basePath, então:
        //   produção:    /mestre/api/mestre/:path* → http://node:3001/api/mestre/:path*
        //   development: /api/mestre/:path*        → http://localhost:3001/api/mestre/:path*
        source: '/api/mestre/:path*',
        destination: `${apiUrl}/api/mestre/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
