"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input"; // <-- NOVO
import { Textarea } from "@/components/ui/textarea"; // <-- NOVO
import { ArrowLeft, Trash2, Video, Calendar, Activity, Info, FileText, Plus, Loader2 } from "lucide-react"; // <-- NOVOS ICONES
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
// Gráficos e Calendário
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FrequencyCalendar } from "@/components/FrequencyCalendar";
import { DownloadReportButton } from "@/components/DownloadReportButton";
import { BodyChart } from "@/components/BodyChart";

// --- IMPORT DAS NOSSAS FUNÇÕES DE PRONTUÁRIO ---
import { createNote, deleteNote } from "@/app/actions/notes";

// Função para corrigir fuso horário
function formatDate(dateString: string) {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export default function AthleteDetailsPage() {
  const [athlete, setAthlete] = useState<any>(null);
  const [activeProtocol, setActiveProtocol] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO PRONTUÁRIO ---
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [savingNote, setSavingNote] = useState(false);

  const params = useParams();
  const supabase = createClient();
  const athleteId = params.id as string;

  useEffect(() => {
    async function loadData() {
      // 1. Dados do Atleta
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", athleteId)
        .single();
      setAthlete(profile);

      // 2. Protocolo Ativo
      const { data: protocol } = await supabase
        .from("protocols")
        .select("*")
        .eq("athlete_id", athleteId)
        .eq("status", "active")
        .single();
      setActiveProtocol(protocol);

      // 3. Feedbacks Recentes
      const { data: recentFeedback } = await supabase
        .from("daily_feedback")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("date", { ascending: true })
        .limit(30);

      const listData = [...(recentFeedback || [])].reverse();
      setFeedbacks(listData);

      if (recentFeedback) {
        const formatted = recentFeedback.map((f) => ({
          date: f.date.split("-").slice(1).reverse().join("/"),
          dor: f.pain_level,
          fadiga: f.fatigue_level,
          mobilidade: f.mobility_range,
        }));
        setChartData(formatted);
      }

      // 4. Datas para o Calendário
      const { data: allFeedbackDates } = await supabase
        .from("daily_feedback")
        .select("date")
        .eq("athlete_id", athleteId);

      if (allFeedbackDates) {
        setAllDates(allFeedbackDates.map((f) => f.date));
      }

      // 5. Prontuários (Anotações do Fisio)
      const { data: sessionNotes } = await supabase
        .from("session_notes")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("note_date", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (sessionNotes) setNotes(sessionNotes);

      setLoading(false);
    }
    if (athleteId) loadData();
  }, [athleteId, supabase]);

  const handleFinishProtocol = async () => {
    if (!confirm("Tem certeza? O atleta não verá mais este treino.")) return;
    const { error } = await supabase
      .from("protocols")
      .update({ status: "completed" })
      .eq("id", activeProtocol.id);
    if (!error) {
      setActiveProtocol(null);
      alert("Protocolo encerrado com sucesso!");
    }
  };

  // --- FUNÇÕES DE PRONTUÁRIO ---
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setSavingNote(true);
    const res = await createNote(athleteId, newNote, noteDate);
    
    if (res.error) {
      alert("Erro ao salvar anotação: " + res.error);
    } else {
      setNewNote("");
      // Recarrega as anotações para mostrar na tela instantaneamente
      const { data } = await supabase
        .from("session_notes")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("note_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (data) setNotes(data);
    }
    setSavingNote(false);
  };

  const handleRemoveNote = async (noteId: string) => {
    if (!confirm("Excluir esta evolução permanentemente?")) return;
    const res = await deleteNote(noteId, athleteId);
    if (res.error) alert("Erro ao excluir: " + res.error);
    else setNotes(notes.filter(n => n.id !== noteId));
  };

  const reportData = {
    athleteName: athlete?.full_name || "Atleta",
    athleteEmail: athlete?.email || "",
    feedbacks: feedbacks || [],
  };

  const latestFeedback = feedbacks.length > 0 ? feedbacks[0] : null;

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando dados...</div>;
  if (!athlete)
    return <div className="p-8 text-center text-destructive">Atleta não encontrado.</div>;

  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-primary hover:bg-primary/10">
              <Link href="/dashboard/athletes">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">{athlete.full_name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Painel Clínico
              </p>
            </div>
          </div>

          <div className="shrink-0">
             <DownloadReportButton data={reportData} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          {/* Menu de Abas (Agora com 3 colunas) */}
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-muted p-1 rounded-lg h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium py-2">
              Evolução e Frequência
            </TabsTrigger>
            <TabsTrigger value="protocol" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium py-2">
              Protocolo Vigente
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium py-2">
              Prontuário (Anotações)
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: Visão Geral e Gráficos */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            
            {latestFeedback ? (
              <Card className="border-l-4 border-l-blue-500 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-blue-50/30 pb-4">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                     <Info className="h-5 w-5"/> Status Atual (Último Registro: {formatDate(latestFeedback.date)})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Lado Esquerdo */}
                      <div className="flex-1 w-full space-y-6">
                         <div className="grid grid-cols-3 gap-4">
                            <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100 shadow-sm">
                               <span className="block text-3xl font-bold text-red-600">{latestFeedback.pain_level ?? "-"}</span>
                               <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">Dor</span>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-100 shadow-sm">
                               <span className="block text-3xl font-bold text-orange-600">{latestFeedback.fatigue_level ?? "-"}</span>
                               <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">Fadiga</span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100 shadow-sm">
                               <span className="block text-3xl font-bold text-green-600">{latestFeedback.mobility_range ?? "-"}</span>
                               <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Mobilidade</span>
                            </div>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Observações do Atleta</p>
                            <p className="text-gray-700 italic">"{latestFeedback.notes || "Sem observações registradas."}"</p>
                         </div>
                      </div>

                      {/* Lado Direito */}
                      <div className="border p-4 rounded-xl bg-white shadow-sm shrink-0 flex flex-col items-center">
                          <p className="text-xs text-center text-gray-400 mb-2 uppercase font-bold">Mapa de Dor</p>
                          <BodyChart 
                             onPartsChange={() => {}} 
                             selectedParts={latestFeedback.pain_location || []}
                             readOnly={true}
                          />
                      </div>
                   </div>
                </CardContent>
              </Card>
            ) : (
                <div className="p-6 bg-blue-50 text-blue-700 rounded-lg text-center">
                   Este atleta ainda não enviou nenhum feedback.
                </div>
            )}
            
            <FrequencyCalendar dates={allDates} startDate={activeProtocol?.start_date || new Date().toISOString()} />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Gráfico */}
              <Card className="border-t-4 border-t-primary shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-primary">Evolução de Sintomas</CardTitle>
                  <CardDescription>Dor vs Fadiga (Últimos 30 dias)</CardDescription>
                </CardHeader>
                <div id="evolution-chart-print" className="bg-white p-2 rounded-lg">
                  <CardContent className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
                          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
                          <YAxis domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
                          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                          <Line type="monotone" dataKey="dor" stroke="var(--destructive)" strokeWidth={3} name="Dor" dot={{ r: 4, fill: "var(--destructive)" }} />
                          <Line type="monotone" dataKey="fadiga" stroke="var(--secondary)" strokeWidth={3} name="Fadiga" dot={{ r: 4, fill: "var(--secondary)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <p>Sem dados suficientes.</p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>

              {/* Lista Feedback */}
              <Card className="border-t-4 border-t-secondary shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-secondary">Histórico Completo</CardTitle>
                  <CardDescription>Detalhes dos registros anteriores</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[350px] overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {feedbacks.map((fb) => (
                      <div key={fb.id} className="flex items-start justify-between border-b pb-3 last:border-0 hover:bg-muted/50 p-2 rounded-md transition-colors">
                        <div>
                          <p className="font-bold text-primary">{formatDate(fb.date)}</p>
                          <p className="text-sm text-muted-foreground italic truncate max-w-[150px]">"{fb.notes || "-"}"</p>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-gray-400 font-bold">DOR</span>
                             <span className={`font-bold ${fb.pain_level > 5 ? 'text-red-500' : 'text-gray-700'}`}>{fb.pain_level}</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-gray-400 font-bold">FAD</span>
                             <span className="font-bold text-gray-700">{fb.fatigue_level}</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-gray-400 font-bold">MOB</span>
                             <span className="font-bold text-gray-700">{fb.mobility_range ?? "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA 2: Protocolo Ativo */}
          <TabsContent value="protocol" className="mt-6">
            {activeProtocol ? (
              <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-primary">{activeProtocol.title}</CardTitle>
                    <CardDescription className="mt-1">{activeProtocol.description}</CardDescription>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleFinishProtocol} className="shadow-sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Encerrar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeProtocol.exercises?.map((ex: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 bg-white p-4 rounded-lg border shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex justify-between font-bold text-primary text-lg">
                        <span>{ex.name}</span>
                        <span className="text-sm bg-primary/10 px-3 py-1 rounded-full text-primary self-start whitespace-nowrap">
                          {ex.sets}x {ex.reps}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-between items-center text-sm text-muted-foreground gap-2">
                        <span>Descanso: <span className="font-medium text-foreground">{ex.rest}</span></span>
                        {ex.videoUrl && (
                          <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-secondary hover:text-secondary/80 hover:underline font-medium bg-secondary/5 px-2 py-1 rounded transition-colors">
                            <Video className="h-4 w-4 mr-1" /> Ver vídeo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg flex gap-3 items-center text-sm text-primary border border-primary/10">
                    <Calendar className="h-5 w-5 shrink-0" />
                    <p>Iniciado em <strong>{new Date(activeProtocol.start_date).toLocaleDateString()}</strong></p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum treino ativo</h3>
                <Button asChild className="bg-primary hover:bg-primary/90 mt-4">
                  <Link href="/dashboard/protocols/create">Criar Novo Protocolo</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ABA 3: Prontuário (Anotações do Fisio) */}
          <TabsContent value="notes" className="mt-6 space-y-6">
            
            {/* CRIAR NOVA NOTA */}
            <Card className="border-t-4 border-t-emerald-500 shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Evolução do Paciente
                </CardTitle>
                <CardDescription>Essas anotações são privadas. O atleta não tem acesso a elas.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div className="w-full sm:w-48">
                    <Input 
                      type="date" 
                      value={noteDate} 
                      onChange={e => setNoteDate(e.target.value)} 
                      required 
                      className="bg-gray-50 cursor-pointer"
                    />
                  </div>
                  <Textarea 
                    placeholder="Escreva a conduta da sessão, relatos do paciente e testes realizados..." 
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="min-h-[120px] resize-y focus-visible:ring-emerald-500"
                    required
                  />
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={savingNote} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-sm">
                      {savingNote ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Salvar Evolução
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* LISTA DE NOTAS ANTIGAS */}
            <div className="space-y-4 pt-4">
               <h3 className="text-xl font-bold text-gray-800 px-1">Histórico Clínico</h3>
               {notes.length === 0 ? (
                 <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                   <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                   <p className="text-gray-500 font-medium">Nenhuma anotação registrada ainda.</p>
                 </div>
               ) : (
                 notes.map(note => (
                   <Card key={note.id} className="shadow-sm border-gray-200">
                     <CardHeader className="py-3 bg-gray-50/80 border-b flex flex-row items-center justify-between">
                       <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                          Sessão: {formatDate(note.note_date)}
                       </CardTitle>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 -my-2 h-8 w-8" 
                          onClick={() => handleRemoveNote(note.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </CardHeader>
                     <CardContent className="py-4">
                       <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                     </CardContent>
                   </Card>
                 ))
               )}
            </div>

          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}