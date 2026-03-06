"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detecta se é iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Ouve o evento do Chrome/Android para instalação
    const handler = (e: any) => {
      e.preventDefault(); // Impede o navegador de mostrar a barra nativa feia
      setSupportsPWA(true);
      setPromptInstall(e); // Guarda o evento para usar no clique
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = (e: any) => {
    e.preventDefault();
    if (!promptInstall) {
      return;
    }
    // Mostra o prompt nativo
    promptInstall.prompt();
  };

  // Se não suporta PWA (ou já está instalado) e não é iOS, não mostra nada
  if (!supportsPWA && !isIOS) {
    return null;
  }

  // --- VERSÃO PARA IPHONE (iOS) ---
  if (isIOS) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Download className="h-4 w-4" /> Instalar App
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar PhysioTrack no iPhone</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>O iOS não permite instalação automática, mas é fácil:</p>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                1. Toque no botão <Share className="h-5 w-5 text-blue-500" /> <strong>Compartilhar</strong> no navegador.
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                2. Role para baixo e escolha <span className="font-bold">"Adicionar à Tela de Início"</span>.
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // --- VERSÃO ANDROID / PC ---
  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
    >
      <Download className="h-4 w-4" /> Instalar App
    </Button>
  );
}