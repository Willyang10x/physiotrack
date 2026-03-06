"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotificationToUser } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

interface FeedbackData {
  pain: number;
  fatigue: number;
  notes: string;
}

export async function saveFeedbackAction(data: FeedbackData) {
  const supabase = await createClient();
  
  // 1. Pega o Atleta logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  try {
    // 2. Busca o Protocolo Ativo e o Fisioterapeuta responsável
    // Precisamos saber QUEM é o Fisioterapeuta para notificar ele
    const { data: protocol } = await supabase
      .from("protocols")
      .select("id, therapist_id") 
      .eq("athlete_id", user.id)
      .eq("status", "active")
      .single();

    if (!protocol) {
      return { success: false, error: "Nenhum protocolo ativo encontrado." };
    }

    // 3. Salva o Feedback
    const localDate = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    const { error } = await supabase.from("daily_feedback").insert({
      athlete_id: user.id,
      protocol_id: protocol.id,
      date: localDate,
      pain_level: data.pain,
      fatigue_level: data.fatigue,
      mobility_range: 0,
      notes: data.notes,
    });

    if (error) {
      if (error.code === "23505") return { success: false, error: "Você já enviou feedback hoje." };
      throw error;
    }

    // 4. Busca o nome do Atleta para a mensagem ficar bonita
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const athleteName = profile?.full_name || "Seu atleta";

    // 5. NOTIFICA O FISIOTERAPEUTA! 🔔
    if (protocol.therapist_id) {
      sendNotificationToUser({
        userId: protocol.therapist_id,
        title: "Feedback Recebido! 📝",
        message: `${athleteName} completou o treino. Dor: ${data.pain}/10`,
        url: `/dashboard/athletes/${user.id}`, // Link para o perfil do atleta
      });
    }

    revalidatePath("/dashboard");
    return { success: true };

  } catch (err: any) {
    console.error("Erro ao salvar feedback:", err);
    return { success: false, error: err.message };
  }
}