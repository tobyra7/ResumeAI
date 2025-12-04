/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow build to proceed even if there are TypeScript errors
    // (Prisma will be generated at build time)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
