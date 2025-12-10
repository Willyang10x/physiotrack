"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function WorkoutPage() {
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadWorkout() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Busca o treino ativo do atleta logado
      const { data } = await supabase
        .from("protocols")
        .select("*")
        .eq("athlete_id", user.id)
        .eq("status", "active")
        .single();

      setProtocol(data);
      setLoading(false);
    }
    loadWorkout();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Carregando seu treino...</div>;
  if (!protocol)
    return (
      <div className="p-8 text-center space-y-4">
        <p>Você não tem um treino ativo no momento.</p>
        <Button asChild>
          <Link href="/dashboard">Voltar</Link>
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Hora do Treino</h1>
            <p className="text-muted-foreground">{protocol.title}</p>
          </div>
        </div>

        {/* Lista de Exercícios para Execução */}
        <div className="space-y-4">
          {protocol.exercises?.map((ex: any, i: number) => (
            <Card
              key={i}
              className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden"
            >
              <CardHeader className="bg-white pb-2">
                <CardTitle className="text-lg flex flex-wrap justify-between items-center gap-2">
                  {ex.name}
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wide">
                    Descanso: {ex.rest}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex gap-8 text-sm font-medium text-gray-700 mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase">
                      Séries
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {ex.sets}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase">
                      Repetições
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {ex.reps}
                    </span>
                  </div>
                </div>

                {/* Botão de Vídeo (Se tiver link) */}
                {ex.videoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <a
                      href={ex.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4" /> Ver demonstração em vídeo
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão Finalizar */}
        <div className="pt-4 pb-8">
          <Button
            size="lg"
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-lg h-14 shadow-lg"
            asChild
          >
            <Link href="/dashboard/feedback">
              <CheckCircle2 className="h-6 w-6" /> Concluir Treino e Avaliar
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Ao concluir, você será levado para a tela de feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
