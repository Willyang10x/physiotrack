"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function FeedbackPage() {
  const [pain, setPain] = useState([0]);
  const [fatigue, setFatigue] = useState([0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: protocol } = await supabase
      .from("protocols")
      .select("id")
      .eq("athlete_id", user.id)
      .eq("status", "active")
      .single();

    if (!protocol) {
      alert("Você não tem um protocolo ativo para registrar feedback.");
      setLoading(false);
      return;
    }

    // --- CORREÇÃO DE DATA AQUI ---
    // Pega a data local do Brasil (ou onde o usuário estiver) formato YYYY-MM-DD
    const localDate = new Date().toLocaleDateString("en-CA"); // 'en-CA' sempre retorna YYYY-MM-DD

    const { error } = await supabase.from("daily_feedback").insert({
      athlete_id: user.id,
      protocol_id: protocol.id,
      date: localDate, // Usa a data local fixa
      pain_level: pain[0],
      fatigue_level: fatigue[0],
      mobility_range: 0,
      notes: notes,
    });

    if (error) {
      // Se der erro de duplicidade (código 23505), avisamos amigavelmente
      if (error.code === "23505") {
        alert("Você já registrou seu feedback de hoje!");
        router.push("/dashboard");
      } else {
        alert("Erro ao salvar: " + error.message);
      }
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
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

          <div className="space-y-2">
            <Label>Observações (Opcional)</Label>
            <Textarea
              placeholder="Senti um incômodo no terceiro exercício..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="focus-visible:ring-secondary"
            />
          </div>

          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Enviar Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
