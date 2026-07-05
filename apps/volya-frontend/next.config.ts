/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ігноруємо помилки типів під час збірки, щоб запустити MVP
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ігноруємо помилки лінтера під час збірки
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
