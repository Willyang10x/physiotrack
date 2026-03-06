"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeRiskAction(data: { athleteName: string; feedbacks: any[] }) {
  const { athleteName, feedbacks } = data;

  // Precisamos de pelo menos 3 registos para analisar uma tendência clínica
  if (!feedbacks || feedbacks.length < 3) return { hasRisk: false };

  // Pegamos apenas nos 3 registos mais recentes
  const recentFeedbacks = feedbacks.slice(0, 3);

  // PRÉ-FILTRO INTELIGENTE: Só acionamos a API da Google se houver sinal de alerta
  // (Dor igual ou maior a 6, OU Fadiga igual ou maior a 7 nalgum dos últimos 3 dias)
  const isHighRisk = recentFeedbacks.some(f => f.pain_level >= 6 || f.fatigue_level >= 7);

  if (!isHighRisk) {
    return { hasRisk: false };
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return { hasRisk: false };

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const genAI = new GoogleGenerativeAI(cleanKey);

  const promptData = recentFeedbacks.map(f => `Data: ${f.date} | Dor: ${f.pain_level}/10 | Fadiga: ${f.fatigue_level}/10 | Observação: ${f.notes || "Nenhuma"}`).join("\n");

  const systemPrompt = `
    És um sistema de alerta clínico de fisioterapia desportiva.
    O paciente ${athleteName} apresentou os seguintes registos críticos nos últimos treinos:
    
    ${promptData}

    Existe um risco claro de sobrecarga, *overtraining* ou agravamento de lesão.
    Escreve um alerta URGENTE e curto (máximo 2 frases) para o Fisioterapeuta.
    Exemplo: "⚠️ Alerta de Risco: O paciente apresenta dor elevada nos últimos treinos. Sugere-se interrupção temporária e protocolo de recuperação."
    
    Responde APENAS com o texto do alerta em Português do Brasil.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    
    return { hasRisk: true, message: text.trim() };
  } catch (error: any) {
    console.error("❌ Erro na IA (Alerta):", error.message);
    return { hasRisk: false }; // Em caso de erro, não mostramos o alerta para não assustar o utilizador
  }
}