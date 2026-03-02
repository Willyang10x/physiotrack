"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chatAssistantAction(userMessage: string) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Chave de API não configurada." };
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const genAI = new GoogleGenerativeAI(cleanKey);

  const systemPrompt = `
    Você é o Assistente Virtual da plataforma PhysioTrack.
    O seu papel é ajudar pacientes em reabilitação fisioterapêutica com dúvidas SIMPLES de recuperação 
    (ex: quando usar gelo vs calor, o que é dor muscular normal vs dor de lesão, hidratação, etc.).

    REGRAS OBRIGATÓRIAS:
    1. Responda ESTRITAMENTE em Português do Brasil, de forma amigável, empática e curta (máximo 1 ou 2 parágrafos curtos).
    2. NUNCA prescreva medicamentos.
    3. NUNCA dê diagnósticos médicos.
    4. OBRIGATÓRIO: Termine SEMPRE a sua resposta lembrando o paciente de que você é uma IA e que ele deve anotar isso no próximo feedback ou avisar o seu Fisioterapeuta.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Passamos as regras junto com a mensagem do paciente
    const prompt = `${systemPrompt}\n\nPergunta do Paciente: "${userMessage}"`;
    
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return { success: true, reply: text.trim() };
  } catch (error: any) {
    console.error("❌ Erro no Chat IA:", error.message);
    return { success: false, error: "Desculpe, os meus circuitos estão a descansar agora. Tente novamente mais tarde!" };
  }
}