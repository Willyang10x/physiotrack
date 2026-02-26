"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";

export function InviteButton({ therapistId }: { therapistId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Monta o link mágico com o ID do fisio
    const link = `${window.location.origin}/auth/sign-up?therapist=${therapistId}`;
    
    // Copia para a área de transferência
    navigator.clipboard.writeText(link);
    setCopied(true);
    
    // Volta o ícone ao normal depois de 2 segundos
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      onClick={handleCopyLink} 
      className="bg-green-600 hover:bg-green-700 text-white shadow-sm w-full md:w-auto"
    >
      {copied ? (
        <><Check className="w-4 h-4 mr-2" /> Link Copiado!</>
      ) : (
        <><Share2 className="w-4 h-4 mr-2" /> Convidar Paciente (Link)</>
      )}
    </Button>
  );
}