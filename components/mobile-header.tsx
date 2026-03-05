"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image"; // <-- IMPORTANTE: Importamos o componente de Imagem

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-40 shadow-sm">
      
      {/* AQUI ENTRA A SUA LOGO OFICIAL */}
      <div className="flex items-center">
         <Image 
           src="/FLAVICON-COM-RETANGULO-physio-track.png"
           alt="PhysioTrack Logo"
           width={40} // Tamanho ajustado para não ficar gigante no telemóvel
           height={40}
           className="object-contain"
           priority
         />
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-white border-r-0">
          <VisuallyHidden>
            <SheetTitle>Menu de Navegação Mobile</SheetTitle>
          </VisuallyHidden>
          {/* Reutilizamos a sua Sidebar existente, passando uma função para fechar o menu ao clicar num link */}
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}