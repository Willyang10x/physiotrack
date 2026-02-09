"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
// Importe a Action nova
import { saveFeedbackAction } from "@/app/actions/save-feedback";

export default function FeedbackPage() {
  const [pain, setPain] = useState([0]);
  const [fatigue, setFatigue] = useState([0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);

    // Chamamos a Server Action
    const result = await saveFeedbackAction({
      pain: pain[0],
      fatigue: fatigue[0],
      notes: notes,
    });

    setLoading(false);

    if (!result.success) {
      // Tratamento de erros vindo do servidor
      alert(result.error);
      if (result.error === "Você já enviou feedback hoje.") {
        router.push("/dashboard");
      }
    } else {
      // Sucesso total
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-lg border-t-4 border-t-secondary shadow-sm">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-fit pl-0 hover:bg-secondary/10 text-secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <CardTitle className="text-secondary">Como você está hoje?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Slider de Dor */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Nível de Dor (0 a 10)</Label>
              <span className="font-bold text-destructive text-lg">
                {pain[0]}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-destructive"
              value={pain[0]}
              onChange={(e) => setPain([parseInt(e.target.value)])}
            />
          </div>

          {/* Slider de Cansaço */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Nível de Cansaço (0 a 10)</Label>
              <span className="font-bold text-secondary text-lg">
                {fatigue[0]}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
              value={fatigue[0]}
              onChange={(e) => setFatigue([parseInt(e.target.value)])}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Observações (Opcional)</Label>
            <Textarea
              placeholder="Senti um incômodo no terceiro exercício..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="focus-visible:ring-secondary"
            />
          </div>

          {/* Botão de Enviar */}
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              "Enviar Feedback"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}