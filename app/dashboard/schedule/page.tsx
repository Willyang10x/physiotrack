import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar } from "@/components/ui/calendar"; // Componente padrão do Shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleManager } from "./schedule-manager"; // Vamos criar esse componente cliente abaixo

export default async function SchedulePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Pega perfil para saber se é fisio ou atleta
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, assigned_therapist_id")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist";
  
  // Se for atleta, precisamos buscar a agenda do SEU fisio. Se for fisio, busca a SUA.
  const targetTherapistId = isTherapist ? user.id : profile?.assigned_therapist_id;

  if (!targetTherapistId && !isTherapist) {
    return <div className="p-8">Você ainda não tem um fisioterapeuta vinculado.</div>;
  }

  // Busca todos os agendamentos futuros
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, profiles:athlete_id(full_name)")
    .eq("therapist_id", targetTherapistId)
    .gte("start_time", new Date().toISOString()) // Apenas futuros
    .order("start_time", { ascending: true });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isTherapist ? "Gerenciar Minha Agenda" : "Agendar Consulta"}
        </h1>
        
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Componente Cliente que gerencia a interação */}
          <ScheduleManager 
            appointments={appointments || []} 
            isTherapist={isTherapist} 
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}