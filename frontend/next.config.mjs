/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
