import { Sidebar } from "@/components/Sidebar";
import { PushNotificationManager } from "@/components/PushNotificationManager"; // Lembra dele? Importante estar aqui!

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* A Sidebar fica fixa na esquerda.
        O 'hidden md:flex' esconde ela no celular (mobile) para não quebrar a tela 
        (No futuro podemos criar um menu hambúrguer para celular).
      */}
      <div className="hidden md:flex flex-col h-full border-r bg-white w-64 shrink-0">
         <Sidebar />
      </div>

      {/* Conteúdo Principal (que rola) */}
      <main className="flex-1 overflow-y-auto w-full relative">
         {/* Colocamos o Gerenciador de Notificações aqui dentro.
            Assim, ele só roda quando o usuário está logado no dashboard.
         */}
         <PushNotificationManager />

         {/* Aqui entra o conteúdo das páginas (Feedbacks, Atletas, etc) */}
         <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
}