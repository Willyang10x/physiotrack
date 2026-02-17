"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Info, 
  Activity, 
  BatteryWarning, 
  Move 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { BodyChart } from "@/components/BodyChart";

export default function FeedbackPage() {
  const [painLevel, setPainLevel] = useState([0]);
  const [fatigueLevel, setFatigueLevel] = useState([0]);
  const [mobilityRange, setMobilityRange] = useState([5]); // <--- NOVO ESTADO: Mobilidade
  const [notes, setNotes] = useState("");
  const [painLocations, setPainLocations] = useState<string[]>([]);
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
        setLoading(false);
        return;
      }

      // Fuso Horário BR
      const now = new Date();
      const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const today = brazilTime.toISOString().split("T")[0];

      // Salva no banco (Agora com pain, fatigue e mobility)
      const { error } = await supabase.from("daily_feedback").insert({
        athlete_id: user.id,
        protocol_id: protocol.id,
        pain_level: painLevel[0],
        fatigue_level: fatigueLevel[0],
        mobility_range: mobilityRange[0], // <--- CORREÇÃO AQUI
        notes,
        date: today,
        pain_location: painLocations,
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

  const getMobilityColor = (level: number) => {
    if (level <= 3) return "text-red-500 font-bold";
    if (level <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-start md:items-center">
      <div className="w-full max-w-5xl space-y-6">
        
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
                
                {/* CARD DE DOR */}
                <Card className="border-l-4 border-l-red-400">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Activity className="h-5 w-5"/> Nível de Dor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${getPainColor(painLevel[0])}`}>
                        {painLevel[0]}
                      </span>
                    </div>
                    <Slider
                      value={painLevel}
                      onValueChange={setPainLevel}
                      max={10}
                      step={1}
                      className="cursor-pointer py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-400 px-1">
                      <span>Sem dor</span>
                      <span>Extrema</span>
                    </div>
                  </CardContent>
                </Card>

                {/* CARD DE FADIGA */}
                <Card className="border-l-4 border-l-orange-400">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <BatteryWarning className="h-5 w-5"/> Cansaço / Fadiga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-700">
                        {fatigueLevel[0]}
                      </span>
                    </div>
                    <Slider
                      value={fatigueLevel}
                      onValueChange={setFatigueLevel}
                      max={10}
                      step={1}
                      className="cursor-pointer py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-400 px-1">
                      <span>Descansado</span>
                      <span>Exausto</span>
                    </div>
                  </CardContent>
                </Card>

                {/* CARD DE MOBILIDADE - NOVO */}
                <Card className="border-l-4 border-l-green-400">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <Move className="h-5 w-5"/> Mobilidade Articular
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${getMobilityColor(mobilityRange[0])}`}>
                        {mobilityRange[0]}
                      </span>
                    </div>
                    <Slider
                      value={mobilityRange}
                      onValueChange={setMobilityRange}
                      max={10}
                      step={1}
                      className="cursor-pointer py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-400 px-1">
                      <span>Travado (Rigidez)</span>
                      <span>Livre (Excelente)</span>
                    </div>
                  </CardContent>
                </Card>

            </div>

            {/* Coluna da Direita: Mapa de Dor e Observações */}
            <div className="space-y-6">
                <Card className="border-l-4 border-l-blue-400">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <Info className="h-5 w-5"/> Onde dói?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2">
                        <p className="text-sm text-gray-500 mb-4 text-center bg-blue-50 px-3 py-1 rounded-full">
                            Toque no corpo para marcar os locais de dor
                        </p>
                        
                        <BodyChart 
                            onPartsChange={setPainLocations}
                            selectedParts={painLocations}
                        />
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Observações (Opcional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Ex: Senti um estalo no joelho durante o agachamento..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>
            </div>
        </div>

        <Button 
          className="w-full h-14 text-lg font-bold shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all hover:scale-[1.01] mt-8" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Salvando Feedback...</>
          ) : (
            <><Save className="mr-2 h-6 w-6" /> Enviar Relatório Diário</>
          )}
        </Button>
      </div>
    </div>
  );
}