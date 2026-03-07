export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Activity, Search } from "lucide-react";
import { InviteButton } from "./invite-button";
import { RiskAlert } from "@/components/risk-alert";
import { WhatsappButton } from "./whatsapp-button"; // <-- O BOTÃO VOLTOU AQUI!

export default async function AthletesListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "therapist") {
    redirect("/dashboard"); 
  }

  const { data: athletesData } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .eq("assigned_therapist_id", user.id)
    .order("full_name", { ascending: true });

  const athletes = await Promise.all(
    (athletesData || []).map(async (athlete) => {
      const { data: feedbacks } = await supabase
        .from("daily_feedback")
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("date", { ascending: false })
        .limit(3);
        
      return { ...athlete, feedbacks: feedbacks || [] };
    })
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
              <Users className="w-7 h-7 md:w-8 md:h-8" /> Meus Pacientes
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Gerencie seus atletas e acesse os prontuários.</p>
          </div>
          <div className="w-full md:w-auto">
            <InviteButton therapistId={user.id} />
          </div>
        </div>

        {/* Lista de Atletas */}
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader className="bg-white border-b pb-4 px-4 md:px-6">
            <CardTitle className="text-lg text-primary">Lista de Atletas Ativos</CardTitle>
            <CardDescription>
              Você possui {athletes?.length || 0} paciente(s) sob seus cuidados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {athletes && athletes.length > 0 ? (
              <div className="divide-y">
                {athletes.map((athlete) => (
                  <div key={athlete.id} className="p-4 md:p-6 flex flex-col gap-4 hover:bg-gray-50 transition-colors">
                    
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      {/* Info do Atleta */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold uppercase overflow-hidden border border-primary/20 shadow-sm">
                          {athlete.avatar_url ? (
                            <img src={athlete.avatar_url} alt={athlete.full_name} className="w-full h-full object-cover" />
                          ) : (
                            athlete.full_name.charAt(0)
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-800 text-base md:text-lg truncate">{athlete.full_name}</p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{athlete.email}</p>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                        
                        {/* BOTÃO DO WHATSAPP AQUI */}
                        <div className="w-full sm:w-auto">
                          <WhatsappButton 
                            athleteId={athlete.id} 
                            athleteName={athlete.full_name} 
                            initialPhone={athlete.phone} 
                          />
                        </div>

                        <Button asChild variant="outline" className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5">
                          <Link href={`/dashboard/protocols/create?athlete=${athlete.id}`}>
                            <Activity className="w-4 h-4 mr-2" /> Novo Treino
                          </Link>
                        </Button>
                        <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-sm">
                          <Link href={`/dashboard/athletes/${athlete.id}`}>
                            Prontuário <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {athlete.feedbacks && athlete.feedbacks.length > 0 && (
                      <div className="mt-2">
                        <RiskAlert athleteName={athlete.full_name} feedbacks={athlete.feedbacks} />
                      </div>
                    )}
                    
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 md:p-12 text-center text-gray-500">
                <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">Nenhum paciente ainda</h3>
                <p className="max-w-md mx-auto text-xs md:text-sm">
                  Seus pacientes aparecerão aqui assim que se cadastrarem.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}