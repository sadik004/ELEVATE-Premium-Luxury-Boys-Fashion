/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/product',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
