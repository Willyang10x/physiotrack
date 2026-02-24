export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar as CalendarIcon,
  ArrowRight,
  ClipboardList,
  Plus,
  CheckCircle2,
  Bell,
  Users,
  Clock,
  AlertCircle
} from "lucide-react";
import { FrequencyCalendar } from "@/components/FrequencyCalendar";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { StreakBadge } from "@/components/StreakBadge";

// --- FUNÇÕES DE FORMATAÇÃO ---
function formatTime(dateString: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

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

  // --- BUSCA DE DADOS GERAIS ---
  let activeProtocol = null;
  let workoutDoneToday = false;
  let athletesList = [];
  let athleteDates: string[] = [];
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  let todayAppointments: any[] = [];
  let recentFeedbacks: any[] = [];
  let nextAppointment = null;

  // ==========================================
  // DADOS DO ATLETA
  // ==========================================
  if (userRole === "athlete") {
    const { data } = await supabase
      .from("protocols")
      .select("*")
      .eq("athlete_id", user.id)
      .eq("status", "active")
      .single();

    activeProtocol = data;

    if (activeProtocol) {
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

    const { data: aptData } = await supabase
      .from("appointments")
      .select("*, profiles:therapist_id(full_name)")
      .eq("athlete_id", user.id)
      .eq("status", "booked")
      .gte("start_time", startOfToday.toISOString())
      .order("start_time", { ascending: true })
      .limit(1)
      .single();
    if (aptData) nextAppointment = aptData;
  }

  // ==========================================
  // DADOS DO FISIOTERAPEUTA
  // ==========================================
  if (userRole === "therapist") {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "athlete")
      .eq("assigned_therapist_id", user.id)
      .limit(20);

    athletesList = data || [];

    const { data: apts } = await supabase
      .from("appointments")
      .select("*, profiles:athlete_id(full_name)")
      .eq("therapist_id", user.id)
      .eq("status", "booked")
      .gte("start_time", startOfToday.toISOString())
      .lte("start_time", endOfToday.toISOString())
      .order("start_time", { ascending: true });
    if (apts) todayAppointments = apts;

    const { data: fbs } = await supabase
      .from("daily_feedback")
      .select("*, profiles:athlete_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(5);
    if (fbs) recentFeedbacks = fbs;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        
        {/* ================= HEADER ================= */}
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors bg-white shadow-sm relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-primary">
                  Olá, {firstName}
                </h1>
                {userRole === "athlete" && (
                  <div className="scale-90 origin-left sm:scale-100">
                    <StreakBadge />
                  </div>
                )}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Painel do {userRole === "therapist" ? "Fisioterapeuta" : "Atleta"}
              </p>
            </div>
          </div>

          <form action="/auth/sign-out" method="post" className="w-full md:w-auto">
            <Button variant="outline" type="submit" className="w-full md:w-auto border-primary/20 text-primary hover:bg-primary/5">
              Sair
            </Button>
          </form>
        </header>

        {/* ================= NOTIFICAÇÕES ================= */}
        <div className="mb-8">
          <Card className="border-l-4 border-l-primary shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Bell className="h-5 w-5" /> Configurar Notificações
              </CardTitle>
              <CardDescription>
                Ative para receber avisos sobre consultas e treinos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationManager />
            </CardContent>
          </Card>
        </div>

        {/* ================= CONTEÚDO PRINCIPAL ================= */}
        {userRole === "therapist" ? (
          <div className="space-y-6">
            
            {/* CARDS DE RESUMO DO DIA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <Card className="shadow-sm border-l-4 border-l-primary">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Atletas Ativos</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{athletesList.length}</h3>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-secondary">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Consultas Hoje</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{todayAppointments.length}</h3>
                  </div>
                  <div className="p-4 bg-secondary/10 rounded-full">
                    <CalendarIcon className="w-8 h-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-primary/60">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Últimos Feedbacks</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{recentFeedbacks.length}</h3>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Activity className="w-8 h-8 text-primary/80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AGENDA E FEEDBACKS RECENTES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* AGENDA (Cor Secondary - Marrom) */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                    <Clock className="w-5 h-5" /> Agenda de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {todayAppointments.length > 0 ? (
                    <div className="divide-y">
                      {todayAppointments.map((app) => (
                        <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-md">
                              {formatTime(app.start_time)}
                            </span>
                            <span className="font-medium text-gray-800">{app.profiles?.full_name}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="text-secondary hover:bg-secondary/10 hover:text-secondary">
                            <Link href={`/dashboard/athletes/${app.athlete_id}`}>Ver Prontuário</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p>Nenhuma consulta agendada para hoje.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* FEEDBACKS (Cor Primary - Azul) */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <AlertCircle className="w-5 h-5" /> Feedbacks Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentFeedbacks.length > 0 ? (
                    <div className="divide-y">
                      {recentFeedbacks.map((fb) => (
                        <div key={fb.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="font-bold text-gray-800">{fb.profiles?.full_name}</p>
                            <p className="text-sm text-gray-500 flex gap-3 mt-1">
                              <span>Dor: <strong className={fb.pain_level > 5 ? 'text-red-500' : ''}>{fb.pain_level}</strong></span>
                              <span>•</span>
                              <span>Fadiga: <strong>{fb.fatigue_level}</strong></span>
                            </p>
                          </div>
                          <Button variant="outline" size="icon" className="border-primary/20 text-primary hover:bg-primary/10" asChild>
                            <Link href={`/dashboard/athletes/${fb.athlete_id}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>Nenhum feedback registrado recentemente.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* SEUS ATLETAS E NOVO TREINO */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-1 bg-primary text-primary-foreground border-none shadow-md">
                <CardContent className="flex flex-col items-start p-6 h-full justify-center">
                  <h3 className="text-xl font-bold mb-2">Novo Tratamento</h3>
                  <p className="text-primary-foreground/90 mb-6 text-sm">
                    Crie um novo protocolo de exercícios para seus pacientes.
                  </p>
                  <Button asChild variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100 border-none">
                    <Link href="/dashboard/protocols/create">
                      <Plus className="mr-2 h-4 w-4" /> Criar Protocolo
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 py-4">
                  <CardTitle className="text-primary text-lg">
                    Lista Completa de Pacientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {athletesList.length > 0 ? (
                      athletesList.map((athlete: any) => (
                        <div key={athlete.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold uppercase overflow-hidden">
                              {athlete.avatar_url ? (
                                <img src={athlete.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                athlete.full_name.charAt(0)
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium truncate">{athlete.full_name}</p>
                              <p className="text-sm text-gray-500 truncate">{athlete.email}</p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5">
                            <Link href={`/dashboard/athletes/${athlete.id}`}>Ver Detalhes</Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 px-4">
                        <p className="text-gray-500">Você ainda não tem atletas vinculados.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* CARD PRÓXIMA SESSÃO (Cor Secondary - Marrom) */}
              <Card className="shadow-sm border-t-4 border-t-secondary h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-secondary">
                    <CalendarIcon className="w-5 h-5" /> Próxima Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextAppointment ? (
                    <div className="space-y-4">
                      <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                        <p className="text-sm text-secondary font-medium">Fisioterapeuta: {nextAppointment.profiles?.full_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xl font-bold text-secondary">{formatDate(nextAppointment.start_time)}</span>
                          <span className="text-lg font-bold text-secondary bg-secondary/20 px-2 py-1 rounded">às {formatTime(nextAppointment.start_time)}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-secondary hover:bg-secondary/90 text-white" asChild>
                        <Link href="/dashboard/schedule">Ver Agenda Completa</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">Você não tem sessões agendadas.</p>
                      <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10" asChild>
                        <Link href="/dashboard/schedule">Marcar Nova Sessão</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CARD DE TREINO (Cor Primary - Azul) */}
              <Card className={`shadow-sm h-full ${workoutDoneToday ? "border-primary/50 bg-primary/5" : "border-t-4 border-t-primary"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {workoutDoneToday ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        <span className="text-primary font-bold">Treino Concluído!</span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-5 w-5 text-primary" />
                        <span className="text-gray-700">Seu Treino Atual</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeProtocol ? (
                    workoutDoneToday ? (
                      <div className="space-y-2">
                        <p className="text-primary font-medium text-sm">Parabéns! Você já realizou sua sessão.</p>
                        <Button variant="outline" className="w-full mt-2 bg-white text-primary border-primary/30" disabled>
                          Sessão Finalizada
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 bg-primary/10 p-4 rounded-lg border border-primary/20">
                          <p className="text-base md:text-lg font-bold text-primary line-clamp-1">
                            {activeProtocol.title}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                              {activeProtocol.exercises?.length || 0} exercícios
                            </span>
                          </div>
                        </div>
                        <Button asChild className="w-full gap-2 bg-primary hover:bg-primary/90 h-10 md:h-11 text-base text-white">
                          <Link href="/dashboard/workout">
                            Iniciar Sessão <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-6">Nenhum treino ativo no momento.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CARD DE FEEDBACK TURBINADO */}
            <Card className="shadow-sm bg-linear-to-r from-primary to-[#015a8f] text-white">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold">Como você está se sentindo hoje?</h3>
                  <p className="text-primary-foreground/80 mt-2 max-w-md">
                    O seu feedback diário alimenta a sua ofensiva (🔥) e ajuda o fisio a ajustar seu tratamento.
                  </p>
                </div>
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shrink-0 shadow-lg font-bold" asChild>
                  <Link href="/dashboard/feedback">
                    <ClipboardList className="w-5 h-5 mr-2" /> Registrar Feedback
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* SEU CALENDÁRIO ORIGINAL */}
            <div className="pt-4 overflow-x-auto pb-2">
              <div className="min-w-[300px]">
                <FrequencyCalendar
                  dates={athleteDates}
                  startDate={activeProtocol?.start_date || new Date().toISOString()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}