"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { generateProtocolAction } from "@/app/actions/generate-protocol";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AiGeneratorProps {
  onGenerate: (data: any) => void;
}

export function AiGenerator({ onGenerate }: AiGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    const result = await generateProtocolAction(prompt);
    setLoading(false);

    // --- CORREÇÃO AQUI (TypeScript Fix) ---
    // Usamos (result as any) para o TypeScript não bloquear o build
    // achando que a propriedade 'data' não existe.
    if (result.success) {
      const data = (result as any).data; // Força a leitura do dado
      
      if (data) {
        onGenerate(data); 
        setOpen(false); 
        setPrompt(""); 
      }
    } else {
      // Se deu erro, mostramos a mensagem
      alert("Erro: " + ((result as any).error || "Falha desconhecida."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          type="button" 
          className="gap-2 border-purple-500 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
        >
          <Sparkles className="h-4 w-4" /> 
          IA Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <BrainCircuit className="h-5 w-5" /> Criar Treino Inteligente
          </DialogTitle>
          <DialogDescription>
            Descreva o caso (ex: "Entorse de tornozelo grau 2, atleta de futebol") e a IA montará o treino.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <Textarea
            placeholder="Digite aqui o objetivo do treino..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] focus-visible:ring-purple-500 bg-slate-50"
          />

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando Protocolo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Automaticamente
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}