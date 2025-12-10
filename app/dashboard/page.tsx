import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Calendar,
  ArrowRight,
  ClipboardList,
  Plus,
  CheckCircle2,
} from "lucide-react";
// Importação do Calendário
import { FrequencyCalendar } from "@/components/FrequencyCalendar";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Verificar Autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  // 2. Buscar Perfil Completo
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userRole = user.user_metadata.role || "athlete";
  const firstName = (userProfile?.full_name || "Usuário").split(" ")[0];
  const avatarUrl = userProfile?.avatar_url;

  // --- BUSCA DE DADOS ---
  let activeProtocol = null;
  let workoutDoneToday = false;
  let athletesList = [];
  let athleteDates: string[] = []; // Lista de datas para o calendário

  if (userRole === "athlete") {
    // A. Busca protocolo ativo
    const { data } = await supabase
      .from("protocols")
      .select("*")
      .eq("athlete_id", user.id)
      .eq("status", "active")
      .single();

    activeProtocol = data;

    // B. Verifica se já treinou hoje (Corrigido fuso horário BR)
    if (activeProtocol) {
      const now = new Date();
      const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const today = brazilTime.toISOString().split("T")[0];

      const { data: feedback } = await supabase
        .from("daily_feedback")
        .select("id")
        .eq("protocol_id", activeProtocol.id)
        .eq("date", today)
        .single();
      if (feedback) workoutDoneToday = true;
    }

    // C. NOVO: Busca histórico completo de datas para o calendário
    const { data: allFeedbacks } = await supabase
      .from("daily_feedback")
      .select("date")
      .eq("athlete_id", user.id);

    if (allFeedbacks) {
      athleteDates = allFeedbacks.map((f) => f.date);
    }
  }

  if (userRole === "therapist") {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "athlete")
      .eq("assigned_therapist_id", user.id)
      .limit(20);

    athletesList = data || [];
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        {/* Cabeçalho */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors bg-white shadow-sm relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold uppercase">
                    {firstName.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-primary">
                Olá, {firstName}
              </h1>
              <p className="text-muted-foreground">
                Painel do{" "}
                {userRole === "therapist" ? "Fisioterapeuta" : "Atleta"}
              </p>
            </div>
          </div>

          <form action="/auth/sign-out" method="post">
            <Button
              variant="outline"
              type="submit"
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              Sair
            </Button>
          </form>
        </header>

        {userRole === "therapist" ? (
          /* --- VISÃO DO FISIOTERAPEUTA --- */
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-primary text-primary-foreground border-none">
                <CardContent className="flex flex-col items-start p-6">
                  <h3 className="text-lg font-bold mb-2">Novo Tratamento</h3>
                  <p className="text-primary-foreground/90 mb-4 text-sm">
                    Crie um novo protocolo de exercícios para um atleta.
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 border-none"
                  >
                    <Link href="/dashboard/protocols/create">
                      <Plus className="mr-2 h-4 w-4" /> Criar Protocolo
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Seus Atletas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {athletesList.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  Lista de Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {athletesList.length > 0 ? (
                    athletesList.map((athlete: any) => (
                      <div
                        key={athlete.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold uppercase overflow-hidden">
                            {athlete.avatar_url ? (
                              <img
                                src={athlete.avatar_url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              athlete.full_name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{athlete.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {athlete.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <Link href={`/dashboard/athletes/${athlete.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">
                        Você ainda não tem atletas vinculados.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* --- VISÃO DO ATLETA --- */
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card
                className={`shadow-sm ${
                  workoutDoneToday
                    ? "border-green-200 bg-green-50"
                    : "border-l-4 border-l-primary"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {workoutDoneToday ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <span className="text-green-800">
                          Treino Concluído!
                        </span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-primary">Treino de Hoje</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeProtocol ? (
                    workoutDoneToday ? (
                      <div className="space-y-2">
                        <p className="text-green-700 font-medium">
                          Parabéns! Você já realizou sua sessão de hoje.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full mt-2 bg-white text-green-700 border-green-200"
                          disabled
                        >
                          Sessão Finalizada
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <p className="text-lg font-semibold text-foreground">
                            {activeProtocol.title}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {activeProtocol.exercises?.length || 0} exercícios
                            </span>
                          </div>
                        </div>
                        <Button
                          asChild
                          className="w-full gap-2 bg-primary hover:bg-primary/90"
                        >
                          <Link href="/dashboard/workout">
                            Iniciar Sessão <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhum treino ativo.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-secondary" />
                    <span className="text-secondary">Como você está?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Registre seu nível de dor e recuperação diária.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors"
                  >
                    <Link href="/dashboard/feedback">
                      <ClipboardList className="mr-2 h-4 w-4" /> Registrar
                      Feedback
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* NOVO: CALENDÁRIO NA TELA DO ATLETA */}
            <div className="pt-6">
              <FrequencyCalendar
                dates={athleteDates}
                startDate={
                  activeProtocol?.start_date || new Date().toISOString()
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
