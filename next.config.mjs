/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'opgreen.myshopify.com' },
    ],
  },
  // Keep old Shopify URLs working after the domain moves here.
  async redirects() {
    return [
      { source: '/pages/contact', destination: '/contact', permanent: true },
      { source: '/collections', destination: '/collections/all', permanent: false },
      { source: '/products', destination: '/collections/all', permanent: false },
    ];
  },
};

export default nextConfig;
