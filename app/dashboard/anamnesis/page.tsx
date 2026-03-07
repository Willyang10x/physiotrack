"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardPlus, Sparkles, CheckCircle2 } from "lucide-react";
import { saveAnamnesisAction } from "@/app/actions/save-anamnesis";

export default function AnamnesisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    goal: "",
    injuries: "",
    medications: "",
    pain: "",
    routine: ""
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await saveAnamnesisAction(formData);
    
    setLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      setSuccess(true);
      // Redireciona para o dashboard após 2.5 segundos
      setTimeout(() => router.push("/dashboard"), 2500);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-800 text-center">Tudo Pronto!</h1>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          A sua ficha foi enviada com sucesso para o seu fisioterapeuta. A Inteligência Artificial já está a preparar o seu resumo clínico.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 pb-24">
      <div className="text-center space-y-2 mb-8">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardPlus className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Avaliação Inicial</h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">
          Responda a estas breves perguntas para que o seu Fisioterapeuta possa conhecer o seu histórico e montar o melhor tratamento.
        </p>
      </div>

      <Card className="shadow-lg border-t-4 border-t-primary">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6 md:p-8 pt-8">
            
            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-800">1. Qual o seu objetivo principal com a fisioterapia?</Label>
              <Textarea 
                placeholder="Ex: Voltar a jogar futebol sem dor, melhorar a postura, me recuperar da cirurgia..." 
                required 
                value={formData.goal}
                onChange={e => handleChange("goal", e.target.value)}
                className="bg-gray-50 resize-y"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-800">2. Já teve alguma lesão grave ou passou por cirurgias? Descreva.</Label>
              <Textarea 
                placeholder="Ex: Rompi o LCA em 2021, fratura no braço na infância... (Se nenhuma, escreva 'Não')" 
                required 
                value={formData.injuries}
                onChange={e => handleChange("injuries", e.target.value)}
                className="bg-gray-50 resize-y"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-800">3. Possui alguma doença crônica ou toma medicamentos contínuos?</Label>
              <Textarea 
                placeholder="Ex: Hipertensão, Diabetes, tomo remédio para tireoide... (Se nenhuma, escreva 'Não')" 
                required 
                value={formData.medications}
                onChange={e => handleChange("medications", e.target.value)}
                className="bg-gray-50 resize-y"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-800">4. Sente alguma dor atualmente? Onde e quando incomoda mais?</Label>
              <Textarea 
                placeholder="Ex: Dor na lombar ao final do dia, dor no ombro quando levanto o braço..." 
                required 
                value={formData.pain}
                onChange={e => handleChange("pain", e.target.value)}
                className="bg-gray-50 resize-y"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-800">5. Como é a sua rotina de trabalho e exercícios físicos?</Label>
              <Textarea 
                placeholder="Ex: Trabalho 8h sentado, treino musculação 3x na semana..." 
                required 
                value={formData.routine}
                onChange={e => handleChange("routine", e.target.value)}
                className="bg-gray-50 resize-y"
              />
            </div>

          </CardContent>
          
          <div className="p-6 md:p-8 bg-gray-50 border-t rounded-b-xl flex flex-col items-center gap-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 text-lg font-bold shadow-xl rounded-xl transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processando Ficha...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Enviar Avaliação</>
              )}
            </Button>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1 text-center">
              <Sparkles className="w-3 h-3" /> Resumo otimizado por Inteligência Artificial
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}