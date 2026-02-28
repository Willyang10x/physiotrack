"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateSummaryAction(data: {
  athleteName: string;
  notes: any[];
  feedbacks: any[];
}) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Chave de API não configurada." };
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const genAI = new GoogleGenerativeAI(cleanKey);

  // Preparamos os dados para a IA ler
  const notesText = data.notes.map(n => `- Data: ${n.note_date} | Relato: ${n.content}`).join("\n");
  const feedbacksText = data.feedbacks.map(f => `- Data: ${f.date} | Dor: ${f.pain_level}/10 | Fadiga: ${f.fatigue_level}/10`).join("\n");

  const systemPrompt = `
    Você é um fisioterapeuta extremamente experiente a escrever um relatório de evolução clínica de um paciente para ser enviado ao médico cirurgião ortopedista.
    
    Paciente: ${data.athleteName}

    Aqui estão as anotações do prontuário:
    ${notesText || "Nenhuma anotação registada."}

    Aqui está o histórico diário de dor e fadiga relatado pelo paciente:
    ${feedbacksText || "Nenhum histórico de dor registado."}

    SUA TAREFA:
    Escreva um parágrafo único (máximo 6 linhas), com linguagem clínica, formal e direta, resumindo a evolução do paciente.
    Destaque tendências de melhoria, estabilização ou agravamento na dor e mobilidade com base nos dados.
    Responda APENAS com o texto do resumo clínico em Português do Brasil. Sem saudações, sem introduções.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();

    return { success: true, summary: text.trim() };
  } catch (error: any) {
    console.error("❌ Erro na IA:", error.message);
    return { success: false, error: "Erro ao gerar o resumo com IA." };
  }
}