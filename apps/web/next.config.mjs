/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@stive/ui", "@stive/i18n", "@stive/ads"],
  async rewrites() {
    return [
      {
        source: "/calc/:path*",
        destination: "http://localhost:3004/:path*",
      },
      {
        source: "/net/:path*",
        destination: "http://localhost:3005/:path*",
      },
      {
        source: "/convert/:path*",
        destination: "http://localhost:3006/:path*",
      },
    ];
  },
};

export default nextConfig;
