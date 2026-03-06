"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WhatsappButtonProps {
  athleteId: string;
  athleteName: string;
  initialPhone: string | null;
}

export function WhatsappButton({ athleteId, athleteName, initialPhone }: WhatsappButtonProps) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const getWhatsappLink = (phoneNumber: string) => {
    // Limpa o número para deixar só os dígitos
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    
    // Constrói a mensagem
    const appUrl = window.location.origin; // Pega o endereço do seu site (localhost ou vercel)
    const message = `Olá ${athleteName}, o seu treino de hoje já está disponível no PhysioTrack! Acesse aqui para ver e iniciar o protocolo: ${appUrl}`;
    
    // Cria o link oficial do WhatsApp
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleAction = async () => {
    // Se já temos um número guardado, apenas abre o WhatsApp!
    if (initialPhone) {
      window.open(getWhatsappLink(initialPhone), "_blank");
      return;
    }
    
    // Se não temos número, abre o modal para perguntar
    setIsOpen(true);
  };

  const handleSavePhoneAndSend = async () => {
    if (!phone.trim() || phone.length < 10) {
      alert("Por favor, digite um número de WhatsApp válido (com DDD).");
      return;
    }

    setIsLoading(true);
    // Guarda o número na base de dados (na conta deste atleta)
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phone })
      .eq("id", athleteId);

    setIsLoading(false);

    if (error) {
      alert("Erro ao guardar o telefone.");
      return;
    }

    setIsOpen(false);
    // Abre o WhatsApp com o número que acabou de guardar!
    window.open(getWhatsappLink(phone), "_blank");
  };

  return (
    <>
      <Button 
        onClick={handleAction} 
        variant="outline" 
        size="sm"
        className="w-full sm:w-auto border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 shadow-sm"
      >
        <MessageCircle className="w-4 h-4 mr-2" /> 
        {initialPhone ? "Avisar no Whats" : "Adicionar Whats"}
      </Button>

      {/* Modal para pedir o telefone na primeira vez */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <MessageCircle className="w-5 h-5" /> Registar WhatsApp
            </DialogTitle>
            <DialogDescription>
              Ainda não temos o número do(a) <strong>{athleteName}</strong>. Guarde-o agora para poder enviar avisos de treino com um clique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Número com DDD (Ex: 83999999999)</label>
              <Input
                placeholder="DDD + Número"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <Button 
              onClick={handleSavePhoneAndSend} 
              disabled={isLoading || !phone}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Guardar e Enviar Mensagem</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}