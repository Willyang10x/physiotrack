export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScheduleManager } from "./schedule-manager";

export default async function SchedulePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, assigned_therapist_id")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist";
  const targetTherapistId = isTherapist ? user.id : profile?.assigned_therapist_id;

  if (!targetTherapistId && !isTherapist) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-gray-500 font-medium">Você ainda não tem um fisioterapeuta vinculado.</p>
        </div>
      </div>
    );
  }

  // Busca apenas de HOJE em diante
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*, profiles:athlete_id(full_name)")
    .eq("therapist_id", targetTherapistId)
    .gte("start_time", startOfToday.toISOString()) // <-- Voltou essa linha!
    .order("start_time", { ascending: true });

  // SE DER ERRO NO BANCO, AGORA ELE GRITA NO SEU TERMINAL DO VSCODE
  if (error) {
    console.error("🚨 ERRO GRAVE NO SUPABASE:", error.message);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isTherapist ? "Gerenciar Minha Agenda" : "Agendar Consulta"}
        </h1>
        
        <div className="grid md:grid-cols-[350px_1fr] gap-6 items-start">
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