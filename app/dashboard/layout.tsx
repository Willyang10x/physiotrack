import { Sidebar } from "@/components/Sidebar";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { AiChatAssistant } from "@/components/ai-chat-assistant";
import { MobileHeader } from "@/components/mobile-header"; // <-- IMPORTAMOS O HEADER MOBILE

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR DESKTOP (Escondida no mobile) */}
      <div className="hidden md:flex flex-col h-full border-r bg-white w-64 shrink-0">
         <Sidebar />
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto w-full relative flex flex-col">
         
         {/* HEADER MOBILE (Só aparece em ecrãs pequenos) */}
         <MobileHeader />

         <PushNotificationManager />

         {/* Área de conteúdo principal */}
         <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1">
            {children}
         </div>

         {/* Chatbot e Alertas Flutuantes */}
         <AiChatAssistant />
      </main>
    </div>
  );
}