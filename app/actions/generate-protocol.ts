"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateProtocolAction(description: string) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  // 1. Verificação de Segurança da Chave
  if (!apiKey) {
    console.error("❌ ERRO: Chave GOOGLE_GEMINI_API_KEY não encontrada.");
    return { success: false, error: "Chave de API não configurada no servidor." };
  }

  // Remove espaços vazios acidentais na chave
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");

  // Inicializa
  const genAI = new GoogleGenerativeAI(cleanKey);

  // Prompt Otimizado
  const systemPrompt = `
    Atue como um fisioterapeuta especialista. Crie um protocolo de reabilitação para: "${description}".
    
    Retorne APENAS um JSON válido. Sem Markdown.
    Estrutura obrigatória:
    {
      "title": "Nome do Protocolo",
      "description": "Breve descrição (max 200 chars)",
      "exercises": [
        {
          "name": "Nome Exercício",
          "sets": "3",
          "reps": "12",
          "rest": "60s",
          "videoUrl": ""
        }
      ]
    }
  `;

  try {
    // TENTATIVA 1: Modelo Flash Estável (Geralmente funciona melhor)
    console.log("🤖 Tentando modelo: gemini-1.5-flash-latest");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return processResponse(text);

  } catch (error: any) {
    console.warn("⚠️ Flash falhou (" + error.message + "). Tentando Pro...");

    try {
      // TENTATIVA 2: Modelo Pro (Fallback clássico)
      const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
      const resultPro = await modelPro.generateContent(systemPrompt);
      const responsePro = await resultPro.response;
      return processResponse(responsePro.text());
    } catch (finalError: any) {
      console.error("❌ Falha Total na IA:", finalError.message);
      return { 
        success: false, 
        error: "Erro de conexão com a IA. Verifique se sua chave API está correta no .env.local" 
      };
    }
  }
}

function processResponse(text: string) {
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);
    return { success: true, data };
  } catch (e) {
    console.error("Erro ao processar JSON:", text);
    return { success: false, error: "A IA não retornou um formato válido." };
  }
}