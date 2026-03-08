"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function saveAnamnesisAction(formData: {
  goal: string;
  injuries: string;
  medications: string;
  pain: string;
  routine: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado." };

  // 1. Busca os dados do atleta para saber QUEM é o Fisioterapeuta dele
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, assigned_therapist_id")
    .eq("id", user.id)
    .single();

  const rawAnamnesis = `
    Objetivo: ${formData.goal}
    Lesões/Cirurgias: ${formData.injuries}
    Doenças/Medicação: ${formData.medications}
    Dores Atuais: ${formData.pain}
    Rotina/Profissão: ${formData.routine}
  `;

  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    let aiSummary = "Resumo indisponível no momento.";

    if (apiKey) {
      const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Você é um Fisioterapeuta Esportivo Sênior analisando a anamnese inicial de um novo paciente.
        Aqui estão as respostas dele ao questionário de admissão:
        
        ${rawAnamnesis}

        Crie um "Resumo Clínico" direto, profissional e focado no que importa para o tratamento fisioterapêutico (máximo de 4-5 linhas). 
        Aponte bandeiras vermelhas (red flags) se houver.
        
        REGRAS ABSOLUTAS DE FORMATAÇÃO:
        1. NÃO use formatação Markdown.
        2. É ESTRITAMENTE PROIBIDO usar asteriscos (*) ou símbolos especiais.
        3. Não tente colocar palavras em negrito.
        4. Escreva apenas em texto puro (plain text), separando os assuntos apenas com quebra de linha.
        5. Seja objetivo e não converse com o usuário. Escreva em Português do Brasil.
      `;

      const result = await model.generateContent(prompt);
      aiSummary = await result.response.text();
    }

    // Guarda as respostas na base de dados
    const { error } = await supabase
      .from("profiles")
      .update({
        anamnesis_text: rawAnamnesis,
        clinical_summary: aiSummary.trim()
      })
      .eq("id", user.id);

    if (error) throw error;

    // ==========================================
    // 2. MÁGICA AQUI: DISPARA A NOTIFICAÇÃO
    // ==========================================
    if (profile?.assigned_therapist_id) {
      await supabase.from("notifications").insert({
        user_id: profile.assigned_therapist_id,
        title: "Nova Avaliação Recebida! 📋",
        message: `O paciente ${profile.full_name} acabou de preencher a avaliação inicial. O resumo inteligente já está disponível no prontuário.`,
        read: false,
        type: "system"
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro na Anamnese IA:", error.message);
    return { success: false, error: "Erro ao processar anamnese." };
  }
}