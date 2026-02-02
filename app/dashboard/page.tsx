import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  ArrowRight,
  ClipboardList,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { FrequencyCalendar } from "@/components/FrequencyCalendar";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

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
  let athleteDates: string[] = [];

  if (userRole === "athlete") {
    const { data } = await supabase
      .from("protocols")
      .select("*")
      .eq("athlete_id", user.id)
      .eq("status", "active")
      .single();

    activeProtocol = data;

    if (activeProtocol) {
      // Ajuste de fuso horário BR
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
    // AJUSTE 1: padding menor no mobile (p-4) e maior no desktop (md:p-8)
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* AJUSTE 2: Flex-col no mobile (empilhado) e Flex-row no desktop */}
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors bg-white shadow-sm relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    referrerPolicy="no-referrer"  // Adicione isso aqui
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl md:text-2xl font-bold uppercase">
                    {firstName.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                Olá, {firstName}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Painel do{" "}
                {userRole === "therapist" ? "Fisioterapeuta" : "Atleta"}
              </p>
            </div>
          </div>

          <form
            action="/auth/sign-out"
            method="post"
            className="w-full md:w-auto"
          >
            <Button
              variant="outline"
              type="submit"
              className="w-full md:w-auto border-primary/20 text-primary hover:bg-primary/5"
            >
              Sair
            </Button>
          </form>
        </header>

        {userRole === "therapist" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-primary text-primary-foreground border-none shadow-md">
                <CardContent className="flex flex-col items-start p-6">
                  <h3 className="text-lg font-bold mb-2">Novo Tratamento</h3>
                  <p className="text-primary-foreground/90 mb-4 text-sm">
                    Crie um novo protocolo de exercícios.
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
              <Card className="shadow-sm">
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

            <Card className="shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-primary">
                  Lista de Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                <div className="divide-y">
                  {athletesList.length > 0 ? (
                    athletesList.map((athlete: any) => (
                      <div
                        key={athlete.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-0 md:pb-4 gap-4 hover:bg-gray-50 md:hover:bg-transparent"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold uppercase overflow-hidden">
                            {athlete.avatar_url ? (
                              <img
                                src={athlete.avatar_url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              athlete.full_name.charAt(0)
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium truncate">
                              {athlete.full_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {athlete.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full md:w-auto border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <Link href={`/dashboard/athletes/${athlete.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4">
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
          <div className="space-y-6">
            {/* Cards empilham automaticamente no mobile (grid-cols-1) */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card
                className={`shadow-sm ${
                  workoutDoneToday
                    ? "border-green-200 bg-green-50"
                    : "border-l-4 border-l-primary"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                        <p className="text-green-700 font-medium text-sm">
                          Parabéns! Você já realizou sua sessão.
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
                          <p className="text-base md:text-lg font-semibold text-foreground line-clamp-1">
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
                          className="w-full gap-2 bg-primary hover:bg-primary/90 h-10 md:h-11 text-base"
                        >
                          <Link href="/dashboard/workout">
                            Iniciar Sessão <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Nenhum treino ativo.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-secondary" />
                    <span className="text-secondary">Como você está?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Registre seu nível de dor e recuperação.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors h-10 md:h-11 text-base"
                  >
                    <Link href="/dashboard/feedback">
                      <ClipboardList className="mr-2 h-4 w-4" /> Registrar
                      Feedback
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Container com scroll horizontal para calendário não quebrar em telas minúsculas */}
            <div className="pt-4 overflow-x-auto pb-2">
              <div className="min-w-[300px]">
                <FrequencyCalendar
                  dates={athleteDates}
                  startDate={
                    activeProtocol?.start_date || new Date().toISOString()
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
