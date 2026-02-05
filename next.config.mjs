import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  // --- MUDANÇA AQUI: Coloque false para testar o PWA agora ---
  disable: false, 
  workboxOptions: {
    disableDevLogs: true,
    importScripts: ["/sw-push.js"],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },
};

export default withPWA(nextConfig);