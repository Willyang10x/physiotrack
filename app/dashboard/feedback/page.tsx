"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { BodyChart } from "@/components/BodyChart"; // <--- Importamos o boneco

export default function FeedbackPage() {
  const [painLevel, setPainLevel] = useState([0]);
  const [notes, setNotes] = useState("");
  const [painLocations, setPainLocations] = useState<string[]>([]); // Novo estado para locais
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      // Busca protocolo ativo
      const { data: protocol } = await supabase
        .from("protocols")
        .select("id")
        .eq("athlete_id", user.id)
        .eq("status", "active")
        .single();

      if (!protocol) {
        alert("Você não tem um protocolo ativo para enviar feedback.");
        return;
      }

      // Fuso Horário BR
      const now = new Date();
      const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const today = brazilTime.toISOString().split("T")[0];

      // Salva no banco
      const { error } = await supabase.from("daily_feedback").insert({
        athlete_id: user.id,
        protocol_id: protocol.id,
        pain_level: painLevel[0],
        notes,
        date: today,
        pain_location: painLocations, // <--- Salvando o array de locais
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (error: any) {
      alert("Erro ao enviar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPainColor = (level: number) => {
    if (level <= 2) return "text-green-500";
    if (level <= 5) return "text-yellow-500";
    if (level <= 7) return "text-orange-500";
    return "text-red-500 font-bold";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Feedback Diário</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {/* Coluna da Esquerda: Dados Numéricos */}
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Como está a dor hoje?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <span className={`text-5xl font-bold ${getPainColor(painLevel[0])}`}>
                        {painLevel[0]}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">de 0 a 10</p>
                    </div>

                    <Slider
                      value={painLevel}
                      onValueChange={setPainLevel}
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-400 px-1">
                      <span>Sem dor</span>
                      <span>Insuportável</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Ex: Senti um incômodo no agachamento..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
            </div>

            {/* Coluna da Direita: Mapa de Dor */}
            <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Info className="h-4 w-4 text-blue-500"/> Onde dói?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-500 mb-4 text-center">
                        Toque nas partes do corpo para marcar.
                    </p>
                    <BodyChart 
                        onPartsChange={setPainLocations}
                        selectedParts={painLocations}
                    />
                </CardContent>
            </Card>
        </div>

        <Button 
          className="w-full h-12 text-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="mr-2 h-5 w-5" /> Enviar Relatório</>
          )}
        </Button>
      </div>
    </div>
  );
}