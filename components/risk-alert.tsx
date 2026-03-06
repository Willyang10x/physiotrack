"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { analyzeRiskAction } from "@/app/actions/analyze-risk";

interface RiskAlertProps {
  athleteName: string;
  feedbacks: any[];
}

export function RiskAlert({ athleteName, feedbacks }: RiskAlertProps) {
  const [riskData, setRiskData] = useState<{ hasRisk: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRisk() {
      // Se tiver menos de 3 treinos, não há dados suficientes para analisar o risco
      if (!feedbacks || feedbacks.length < 3) {
        setRiskData({ hasRisk: false });
        setLoading(false);
        return;
      }
      
      const result = await analyzeRiskAction({ athleteName, feedbacks });
      setRiskData(result);
      setLoading(false);
    }
    
    checkRisk();
  }, [athleteName, feedbacks]);

  if (loading) {
    return null; // Pode colocar aqui um <Loader2 /> se quiser que o Fisio veja que a IA está a pensar
  }

  // Se a IA disse que está tudo bem, o componente desaparece!
  if (!riskData?.hasRisk) return null;

  // Se há risco, mostramos o cartão vermelho:
  return (
    <div className="bg-red-50 border-l-4 border-l-red-600 border border-y-red-200 border-r-red-200 rounded-r-lg p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
      <div className="bg-red-100 p-3 rounded-full shrink-0">
        <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
      </div>
      <div>
        <h4 className="text-red-800 font-black text-sm uppercase tracking-wider mb-1">IA Preventiva: Alerta de Sobrecarga</h4>
        <p className="text-red-700 font-medium leading-relaxed">{riskData.message}</p>
      </div>
    </div>
  );
}