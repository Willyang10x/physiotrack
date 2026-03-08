"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Video, Calendar, Activity, Info, FileText, Plus, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

// Gráficos e Calendário
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FrequencyCalendar } from "@/components/FrequencyCalendar";
import { BodyChart } from "@/components/BodyChart";

import { createNote, deleteNote } from "@/app/actions/notes";
import { ExportPdfButton } from "./export-pdf-button";
import { generateSummaryAction } from "@/app/actions/generate-summary"; 

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

  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [savingNote, setSavingNote] = useState(false);

  // --- ESTADOS DA IA ---
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const params = useParams();
  const supabase = createClient();
  const athleteId = params.id as string;

  useEffect(() => {
    async function loadData() {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", athleteId).single();
      setAthlete(profile);

      const { data: protocol } = await supabase.from("protocols").select("*").eq("athlete_id", athleteId).eq("status", "active").single();
      setActiveProtocol(protocol);

      const { data: recentFeedback } = await supabase.from("daily_feedback").select("*").eq("athlete_id", athleteId).order("date", { ascending: true });
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

      const { data: allFeedbackDates } = await supabase.from("daily_feedback").select("date").eq("athlete_id", athleteId);
      if (allFeedbackDates) setAllDates(allFeedbackDates.map((f) => f.date));

      const { data: sessionNotes } = await supabase.from("session_notes").select("*").eq("athlete_id", athleteId).order("note_date", { ascending: false }).order("created_at", { ascending: false });
      if (sessionNotes) setNotes(sessionNotes);

      setLoading(false);
    }
    if (athleteId) loadData();
  }, [athleteId, supabase]);

  const handleFinishProtocol = async () => {
    if (!confirm("Tem certeza? O atleta não verá mais este treino.")) return;
    const { error } = await supabase.from("protocols").update({ status: "completed" }).eq("id", activeProtocol.id);
    if (!error) {
      setActiveProtocol(null);
      alert("Protocolo encerrado com sucesso!");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    const res = await createNote(athleteId, newNote, noteDate);
    if (!res.error) {
      setNewNote("");
      const { data } = await supabase.from("session_notes").select("*").eq("athlete_id", athleteId).order("note_date", { ascending: false }).order("created_at", { ascending: false });
      if (data) setNotes(data);
    }
    setSavingNote(false);
  };

  const handleRemoveNote = async (noteId: string) => {
    if (!confirm("Excluir esta evolução permanentemente?")) return;
    const res = await deleteNote(noteId, athleteId);
    if (!res.error) setNotes(notes.filter(n => n.id !== noteId));
  };

  // --- FUNÇÃO PARA GERAR O RESUMO COM A IA ---
  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true);
    const result = await generateSummaryAction({
      athleteName: athlete.full_name,
      notes,
      feedbacks
    });

    if (result.success && result.summary) {
      setAiSummary(result.summary);
    } else {
      alert(result.error || "Ocorreu um erro ao gerar o resumo.");
    }
    setIsGeneratingSummary(false);
  };

  const latestFeedback = feedbacks.length > 0 ? feedbacks[0] : null;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando dados...</div>;
  if (!athlete) return <div className="p-8 text-center text-destructive">Atleta não encontrado.</div>;

  return (
    <div className="min-h-screen p-6 flex justify-center overflow-hidden relative">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-primary hover:bg-primary/10">
              <Link href="/dashboard/athletes"><ArrowLeft className="h-6 w-6" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">{athlete.full_name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Painel Clínico
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
             {/* BOTÃO DA IA */}
             <Button 
               onClick={handleGenerateAISummary} 
               disabled={isGeneratingSummary || (notes.length === 0 && feedbacks.length === 0)}
               className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
             >
               {isGeneratingSummary ? (
                 <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
               ) : (
                 <><Sparkles className="w-4 h-4 mr-2" /> Gerar Resumo (IA)</>
               )}
             </Button>
             
             <ExportPdfButton athleteName={athlete.full_name} targetId="medical-report" />
          </div>
        </div>

        {/* CARTÃO DO RESUMO IA (Só aparece quando gerado) */}
        {aiSummary && (
          <Card className="bg-purple-50 border-purple-200 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-800 flex items-center gap-2 text-lg">
                <BrainCircuit className="w-5 h-5" /> Resumo Clínico Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-900 leading-relaxed italic border-l-4 border-purple-400 pl-4 py-1">
                "{aiSummary}"
              </p>
              <p className="text-xs text-purple-400 mt-3 font-medium">
                Resumo gerado por Inteligência Artificial baseado no histórico do paciente. Este resumo será incluído automaticamente no PDF.
              </p>
            </CardContent>
          </Card>
        )}

        {/* RESTO DO CONTEÚDO (Abas, etc) */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-muted p-1 rounded-lg h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium py-2">Evolução e Frequência</TabsTrigger>
            <TabsTrigger value="protocol" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium py-2">Protocolo Vigente</TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium py-2">Prontuário (Anotações)</TabsTrigger>
          </TabsList>

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
                      <div className="border p-4 rounded-xl bg-white shadow-sm shrink-0 flex flex-col items-center">
                          <p className="text-xs text-center text-gray-400 mb-2 uppercase font-bold">Mapa de Dor</p>
                          <BodyChart onPartsChange={() => {}} selectedParts={latestFeedback.pain_location || []} readOnly={true}/>
                      </div>
                   </div>
                </CardContent>
              </Card>
            ) : (
                <div className="p-6 bg-blue-50 text-blue-700 rounded-lg text-center">Este atleta ainda não enviou nenhum feedback.</div>
            )}
            
            <FrequencyCalendar dates={allDates} startDate={activeProtocol?.start_date || new Date().toISOString()} />

            <div className="grid gap-6 md:grid-cols-2">
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
                          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400 font-bold">DOR</span><span className={`font-bold ${fb.pain_level > 5 ? 'text-red-500' : 'text-gray-700'}`}>{fb.pain_level}</span></div>
                          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400 font-bold">FAD</span><span className="font-bold text-gray-700">{fb.fatigue_level}</span></div>
                          <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400 font-bold">MOB</span><span className="font-bold text-gray-700">{fb.mobility_range ?? "-"}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="protocol" className="mt-6">
            {activeProtocol ? (
              <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-primary">{activeProtocol.title}</CardTitle>
                    <CardDescription className="mt-1">{activeProtocol.description}</CardDescription>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleFinishProtocol} className="shadow-sm"><Trash2 className="mr-2 h-4 w-4" /> Encerrar</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeProtocol.exercises?.map((ex: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 bg-white p-4 rounded-lg border shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex justify-between font-bold text-primary text-lg">
                        <span>{ex.name}</span>
                        <span className="text-sm bg-primary/10 px-3 py-1 rounded-full text-primary self-start whitespace-nowrap">{ex.sets}x {ex.reps}</span>
                      </div>
                      <div className="flex flex-wrap justify-between items-center text-sm text-muted-foreground gap-2">
                        <span>Descanso: <span className="font-medium text-foreground">{ex.rest}</span></span>
                        {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-secondary hover:text-secondary/80 hover:underline font-medium bg-secondary/5 px-2 py-1 rounded transition-colors"><Video className="h-4 w-4 mr-1" /> Ver vídeo</a>}
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg flex gap-3 items-center text-sm text-primary border border-primary/10">
                    <Calendar className="h-5 w-5 shrink-0" />
                    <p>Iniciado em <strong>{new Date(activeProtocol.start_date).toLocaleDateString('pt-BR')}</strong></p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum treino ativo</h3>
                <Button asChild className="bg-primary hover:bg-primary/90 mt-4"><Link href="/dashboard/protocols/create">Criar Novo Protocolo</Link></Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-6 space-y-6">
            <Card className="border-t-4 border-t-emerald-500 shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center gap-2"><FileText className="h-5 w-5" /> Evolução do Paciente</CardTitle>
                <CardDescription>Essas anotações são privadas. O atleta não tem acesso a elas.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div className="w-full sm:w-48"><Input type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)} required className="bg-gray-50 cursor-pointer"/></div>
                  <Textarea placeholder="Escreva a conduta da sessão, relatos do paciente e testes realizados..." value={newNote} onChange={e => setNewNote(e.target.value)} className="min-h-[120px] resize-y focus-visible:ring-emerald-500" required/>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={savingNote} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-sm">
                      {savingNote ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Salvar Evolução
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4 pt-4">
               <h3 className="text-xl font-bold text-gray-800 px-1">Histórico Clínico</h3>
               {notes.length === 0 ? (
                 <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"><FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">Nenhuma anotação registrada ainda.</p></div>
               ) : (
                 notes.map(note => (
                   <Card key={note.id} className="shadow-sm border-gray-200">
                     <CardHeader className="py-3 bg-gray-50/80 border-b flex flex-row items-center justify-between">
                       <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-600" /> Sessão: {formatDate(note.note_date)}</CardTitle>
                       <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 -my-2 h-8 w-8" onClick={() => handleRemoveNote(note.id)}><Trash2 className="w-4 h-4" /></Button>
                     </CardHeader>
                     <CardContent className="py-4"><p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p></CardContent>
                   </Card>
                 ))
               )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ======================================================= */}
      {/* RELATÓRIO MÉDICO COMPLETO (Para captura do PDF)         */}
      {/* ======================================================= */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -10 }}>
        <div id="medical-report" className="p-12 w-[800px] space-y-8" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          
          <div className="flex justify-between items-start border-b-2 pb-6" style={{ borderColor: "#01456d" }}>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: "#1f2937" }}>Relatório de Evolução</h2>
              <p className="text-sm font-medium mt-1" style={{ color: "#6b7280" }}>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#01456d" }}>Paciente</p>
              <p className="text-xl font-bold" style={{ color: "#1f2937" }}>{athlete.full_name}</p>
              <p className="text-sm" style={{ color: "#6b7280" }}>{athlete.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "#f9fafb", borderColor: "#f3f4f6" }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#6b7280" }}>Média de Dor</p>
              <p className="font-semibold text-lg" style={{ color: "#dc2626" }}>
                {feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.pain_level, 0) / feedbacks.length).toFixed(1) : "0"}/10
              </p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "#f9fafb", borderColor: "#f3f4f6" }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#6b7280" }}>Total de Sessões</p>
              <p className="font-semibold text-lg" style={{ color: "#ea580c" }}>{feedbacks.length}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "#f9fafb", borderColor: "#f3f4f6" }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: "#6b7280" }}>Treino Atual</p>
              <p className="font-semibold text-lg truncate" style={{ color: "#01456d" }}>{activeProtocol?.title || "Nenhum"}</p>
            </div>
          </div>

          {/* O RESUMO DA IA ENTRA NO PDF AQUI SE FOR GERADO */}
          {aiSummary && (
            <div className="p-6 rounded-lg border mt-8" style={{ backgroundColor: "#f5f3ff", borderColor: "#ede9fe" }}>
              <h3 className="text-sm font-bold uppercase mb-2" style={{ color: "#6b21a8", display: "flex", alignItems: "center", gap: "8px" }}>
                <BrainCircuit className="w-4 h-4" /> Resumo Clínico Integrado (Gerado por IA)
              </h3>
              <p className="text-sm italic" style={{ color: "#4c1d95" }}>{aiSummary}</p>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 border-b pb-2" style={{ color: "#1f2937", borderColor: "#e5e7eb" }}>Gráfico de Evolução (Dor vs Fadiga)</h3>
              <div style={{ width: '700px', height: '280px', margin: '0 auto', backgroundColor: '#ffffff' }}>
                <LineChart width={700} height={280} data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
                  <YAxis domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
                  <Line isAnimationActive={false} type="monotone" dataKey="dor" stroke="#dc2626" strokeWidth={3} name="Dor" dot={{ r: 4, fill: "#dc2626" }} />
                  <Line isAnimationActive={false} type="monotone" dataKey="fadiga" stroke="#ea580c" strokeWidth={3} name="Fadiga" dot={{ r: 4, fill: "#ea580c" }} />
                </LineChart>
              </div>
            </div>
          )}

          {feedbacks.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 className="text-lg font-bold mb-4 border-b pb-2" style={{ color: "#1f2937", borderColor: "#e5e7eb" }}>Histórico de Feedbacks</h3>
              <table className="w-full text-sm text-left border-collapse border" style={{ borderColor: "#e5e7eb" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
                    <th className="p-3 border" style={{ borderColor: "#e5e7eb" }}>Data</th>
                    <th className="p-3 border" style={{ borderColor: "#e5e7eb" }}>Dor</th>
                    <th className="p-3 border" style={{ borderColor: "#e5e7eb" }}>Cansaço</th>
                    <th className="p-3 border" style={{ borderColor: "#e5e7eb" }}>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                      <td className="p-3 border" style={{ borderColor: "#e5e7eb", color: "#374151" }}>{formatDate(fb.date)}</td>
                      <td className="p-3 border font-bold" style={{ borderColor: "#e5e7eb", color: fb.pain_level > 5 ? "#dc2626" : "#374151" }}>{fb.pain_level}/10</td>
                      <td className="p-3 border font-bold" style={{ borderColor: "#e5e7eb", color: "#374151" }}>{fb.fatigue_level}/10</td>
                      <td className="p-3 border italic" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>{fb.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {notes.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 className="text-lg font-bold mb-4 border-b pb-2" style={{ color: "#1f2937", borderColor: "#e5e7eb" }}>Evoluções do Prontuário</h3>
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="p-4 border rounded-lg" style={{ backgroundColor: "#f8fafc", borderColor: "#f3f4f6" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: "#059669" }}>Sessão em: {formatDate(note.note_date)}</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "#374151" }}>{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-16 mt-8 text-center" style={{ pageBreakInside: "avoid" }}>
             <div className="w-64 h-px mx-auto mb-2" style={{ backgroundColor: "#9ca3af" }}></div>
             <p className="text-xs uppercase font-bold tracking-widest" style={{ color: "#6b7280" }}>Assinatura do Fisioterapeuta</p>
             <p className="text-[10px] mt-4" style={{ color: "#9ca3af" }}>PhysioTrack - Relatório gerado e assinado digitalmente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}