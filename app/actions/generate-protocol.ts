"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateProtocolAction(description: string) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Chave de API não configurada." };
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const genAI = new GoogleGenerativeAI(cleanKey);

  // --- PROMPT AJUSTADO PARA PT-BR E LINKS ---
  const systemPrompt = `
    Você é um fisioterapeuta especialista brasileiro.
    Crie um protocolo de reabilitação para: "${description}".

    REGRAS OBRIGATÓRIAS:
    1. Responda **ESTRITAMENTE EM PORTUGUÊS DO BRASIL**.
    2. Retorne APENAS um JSON válido.
    3. Para o campo 'videoUrl', gere um link de busca do YouTube combinando as palavras do exercício.
       Exemplo: Se o exercício for "Flexão", o link deve ser "https://www.youtube.com/results?search_query=exercicio+flexao".

    Estrutura Exata do JSON:
    {
      "title": "Título Profissional em Português",
      "description": "Descrição clínica curta em Português (max 200 caracteres)",
      "exercises": [
        { 
          "name": "Nome do Exercício em Português", 
          "sets": "3", 
          "reps": "12", 
          "rest": "60s", 
          "videoUrl": "https://www.youtube.com/results?search_query=nome+do+exercicio" 
        }
      ]
    }
  `;

  try {
    // Usando o modelo que descobrimos que sua chave aceita
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return processResponse(text);

  } catch (error: any) {
    console.error("❌ Erro na IA:", error.message);
    return { 
      success: false, 
      error: "Erro ao gerar treino. Tente novamente." 
    };
  }
}

function processResponse(text: string) {
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: "A IA não retornou um formato válido." };
  }
}