export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Activity, Search } from "lucide-react";
// IMPORTA O NOSSO BOTÃO NOVO AQUI
import { InviteButton } from "./invite-button";

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

  const { data: athletes } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .eq("assigned_therapist_id", user.id)
    .order("full_name", { ascending: true });

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Users className="w-8 h-8" /> Meus Pacientes
            </h1>
            <p className="text-gray-500 mt-1">Gerencie seus atletas e acesse os prontuários clínicos.</p>
          </div>
          {/* O NOSSO BOTÃO ENTRA AQUI! Passamos o ID do usuário (fisio) pra ele */}
          <InviteButton therapistId={user.id} />
        </div>

        {/* Lista de Atletas */}
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader className="bg-white border-b pb-4">
            <CardTitle className="text-lg text-primary">Lista de Atletas Ativos</CardTitle>
            <CardDescription>
              Você possui {athletes?.length || 0} paciente(s) sob seus cuidados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {athletes && athletes.length > 0 ? (
              <div className="divide-y">
                {athletes.map((athlete) => (
                  <div key={athlete.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    
                    {/* Info do Atleta */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold uppercase overflow-hidden border border-primary/20 shadow-sm">
                        {athlete.avatar_url ? (
                          <img src={athlete.avatar_url} alt={athlete.full_name} className="w-full h-full object-cover" />
                        ) : (
                          athlete.full_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{athlete.full_name}</p>
                        <p className="text-sm text-gray-500">{athlete.email}</p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
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
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum paciente ainda</h3>
                <p className="max-w-md mx-auto text-sm">
                  Seus pacientes aparecerão aqui assim que se cadastrarem no aplicativo. Clique no botão "Convidar Paciente" lá em cima para enviar o link no WhatsApp!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}