import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Importante para PWA: impede zoom automático em inputs no iOS
  userScalable: false, // Dá a sensação de "app nativo" (não permite pinça de zoom)
  themeColor: "#2563eb", // Cor da barra de status do navegador no celular
};

export const metadata: Metadata = {
  title: "PhysioTrack - Monitoramento de Reabilitação",
  description: "Plataforma profissional para monitorar a recuperação pós-lesão de atletas",
  manifest: "/manifest.json", // Link para o arquivo de configuração do PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PhysioTrack",
  },
  icons: {
    // Seus ícones originais
    icon: "/FLAVICON-COM-RETANGULO-physio-track.png",
    apple: "/FLAVICON-COM-RETANGULO-physio-track.png",
    shortcut: "/FLAVICON-COM-RETANGULO-physio-track.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}