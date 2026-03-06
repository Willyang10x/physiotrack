"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { chatAssistantAction } from "@/app/actions/chat-assistant";
import { createClient } from "@/lib/supabase/client"; // <-- IMPORTANTE: Cliente do Supabase

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o assistente da PhysioTrack. Tem alguma dúvida rápida sobre a sua recuperação hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Novo estado para guardar o cargo (role) do utilizador
  const [userRole, setUserRole] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Quando o componente carrega, vai descobrir quem é que está a usar o sistema
  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (profile) setUserRole(profile.role);
      }
    }
    getUserRole();
  }, [supabase]);

  // Faz scroll automático para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const result = await chatAssistantAction(userMsg);

    if (result.success && result.reply) {
      setMessages(prev => [...prev, { role: "assistant", content: result.reply }]);
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: result.error || "Ocorreu um erro." }]);
    }
    
    setIsLoading(false);
  };

  // MÁGICA AQUI: Se ainda estiver a carregar ou se for um fisioterapeuta, não renderiza nada! (Esconde o chat)
  if (userRole !== "athlete") {
    return null; 
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 mb-4 overflow-hidden flex flex-col h-[450px] animate-in slide-in-from-bottom-5">
          <div className="bg-gradient-to-r from-primary to-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold">Assistente PhysioTrack</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-br-sm" 
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-gray-500 font-medium">A pensar...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <Input 
              placeholder="Digite a sua dúvida..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-gray-50 border-none focus-visible:ring-primary/50 rounded-full"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full bg-primary hover:bg-primary/90 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105 flex items-center justify-center p-0"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}
    </div>
  );
}