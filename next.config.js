/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb", // allow large video uploads
    },
  },
};

module.exports = nextConfig;
