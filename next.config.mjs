import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Desativa em dev para não atrapalhar
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Se você tiver outras configurações (ex: imagens remotas), mantenha aqui
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permite imagens de qualquer lugar (Google, Supabase, etc)
      },
    ],
  },
};

export default withPWA(nextConfig);