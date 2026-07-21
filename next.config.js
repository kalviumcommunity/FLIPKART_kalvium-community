/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'rukminim2.flixcart.com' },
      { protocol: 'https', hostname: 'static-assets-web.flixcart.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' }
    ]
  }
};

module.exports = nextConfig;
