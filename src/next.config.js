/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'radio.kusmedios.lat',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'http',
        hostname: 'radio.kusmedios.lat',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.habbo.es',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'www.habbo.com',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'images.habbo.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.habboemotion.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'habbo.es',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'habbofurni.com',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'habboassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'puhekupla.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fcm.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.habbo-happy.net',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
