"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Video, Trophy, PlayCircle, Dumbbell, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function WorkoutPage() {
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar quais os exercícios que já foram feitos
  const [completedExercises, setCompletedExercises] = useState<boolean[]>([]);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadWorkout() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("protocols")
        .select("*")
        .eq("athlete_id", user.id)
        .eq("status", "active")
        .single();

      if (data) {
        setProtocol(data);
        // Inicia o array de conclusão com "false" para todos os exercícios
        setCompletedExercises(new Array(data.exercises?.length || 0).fill(false));
      }
      setLoading(false);
    }
    loadWorkout();
  }, [supabase]);

  // Função para marcar/desmarcar um exercício
  const toggleExercise = (index: number) => {
    const newCompleted = [...completedExercises];
    newCompleted[index] = !newCompleted[index];
    setCompletedExercises(newCompleted);
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-primary bg-gray-50">
        <Dumbbell className="h-10 w-10 animate-bounce" />
        <p className="font-medium text-lg">A preparar o seu treino...</p>
      </div>
    );

  if (!protocol)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
          <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sem treino ativo</h2>
          <p className="text-gray-500 mb-6 text-sm">Aguarde até que o seu fisioterapeuta prescreva o seu próximo protocolo.</p>
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/dashboard">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );

  // Cálculos de Progresso
  const totalExercises = protocol.exercises?.length || 0;
  const completedCount = completedExercises.filter(Boolean).length;
  const progressPercentage = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const isAllFinished = progressPercentage === 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* CABEÇALHO FIXO (Fica no topo enquanto faz scroll) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 md:px-6 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-primary hover:bg-primary/10 shrink-0">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1 overflow-hidden">
              <h1 className="text-xl md:text-2xl font-bold text-primary truncate">Modo Foco</h1>
              <p className="text-sm text-muted-foreground truncate">{protocol.title}</p>
            </div>
            {/* Emblema de contagem */}
            <div className="shrink-0 bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
              {completedCount} / {totalExercises}
            </div>
          </div>

          {/* Barra de Progresso Visual */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Progresso da sessão</span>
              <span className={isAllFinished ? "text-green-600 font-bold" : ""}>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 mt-4">
        
        {/* LISTA DE EXERCÍCIOS */}
        <div className="space-y-5">
          {protocol.exercises?.map((ex: any, i: number) => {
            const isDone = completedExercises[i];

            return (
              <Card
                key={i}
                className={`transition-all duration-300 overflow-hidden ${
                  isDone 
                    ? "border-green-500 bg-green-50/40 opacity-80 scale-[0.98]" 
                    : "border-t-4 border-t-primary shadow-md bg-white hover:shadow-lg"
                }`}
              >
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className={`text-lg md:text-xl font-bold ${isDone ? "text-green-800 line-through decoration-green-400/50" : "text-gray-800"}`}>
                      {i + 1}. {ex.name}
                    </CardTitle>
                  </div>
                  <div className="shrink-0 bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-semibold tracking-wide uppercase">
                    Pausa: {ex.rest}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5">
                  <div className="flex gap-8 text-sm font-medium">
                    <div className="flex flex-col bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Séries</span>
                      <span className={`text-2xl font-black ${isDone ? "text-green-600" : "text-primary"}`}>{ex.sets}</span>
                    </div>
                    <div className="flex flex-col bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Repetições</span>
                      <span className={`text-2xl font-black ${isDone ? "text-green-600" : "text-primary"}`}>{ex.reps}</span>
                    </div>
                  </div>

                  {/* Ações do Cartão (Vídeo + Botão de Concluir) */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {ex.videoUrl && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
                      >
                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2 text-secondary" /> Ver Vídeo
                        </a>
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => toggleExercise(i)}
                      className={`flex-1 font-bold shadow-sm transition-colors ${
                        isDone 
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" 
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                      variant={isDone ? "outline" : "default"}
                    >
                      {isDone ? (
                        <><CheckCircle2 className="h-5 w-5 mr-2" /> Feito!</>
                      ) : (
                        <><PlayCircle className="h-5 w-5 mr-2" /> Concluir Exercício</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ÁREA DE FINALIZAÇÃO INTELIGENTE */}
        <div className="pt-8 pb-12">
          {isAllFinished ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-2xl font-black mb-2">Treino Finalizado!</h3>
              <p className="text-green-50 mb-6 font-medium">Excelente trabalho! O seu corpo agradece o esforço.</p>
              <Button
                size="lg"
                className="w-full bg-white text-green-700 hover:bg-gray-50 text-lg h-14 font-bold rounded-xl shadow-md"
                asChild
              >
                <Link href="/dashboard/feedback">
                  Registar Feedback Final <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center">
               <p className="text-sm text-gray-400 mb-4">
                 Complete todos os exercícios para ativar a finalização.
               </p>
               <Button
                 size="lg"
                 variant="outline"
                 className="w-full border-gray-300 text-gray-500 hover:bg-gray-100 h-14"
                 asChild
               >
                 {/* Caso o utilizador queira saltar direto mesmo sem terminar tudo */}
                 <Link href="/dashboard/feedback">
                   Saltar e avaliar treino incompleto
                 </Link>
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}