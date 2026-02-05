"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotificationToUser } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

interface ProtocolData {
  athlete_id: string;
  title: string;
  description: string;
  exercises: any[];
}

export async function createProtocolAction(data: ProtocolData) {
  const supabase = await createClient();
  
  // 1. Verifica quem é o Fisioterapeuta logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  try {
    // 2. Arquiva protocolos antigos (opcional, mas recomendado)
    await supabase
      .from("protocols")
      .update({ status: "completed" })
      .eq("athlete_id", data.athlete_id)
      .eq("status", "active");

    // 3. Cria o novo protocolo
    const { error } = await supabase.from("protocols").insert({
      therapist_id: user.id,
      athlete_id: data.athlete_id,
      title: data.title,
      description: data.description,
      exercises: data.exercises,
      start_date: new Date().toISOString(),
      status: "active",
    });

    if (error) throw error;

    // 4. DISPARA A NOTIFICAÇÃO! 🔔
    // Não usamos 'await' aqui para não travar a resposta se a notificação demorar (Fire and Forget)
    sendNotificationToUser({
      userId: data.athlete_id,
      title: "Novo Treino Disponível! 🏋️",
      message: `O protocolo "${data.title}" foi criado para você. Toque para ver.`,
      url: "/dashboard/workout",
    });

    revalidatePath("/dashboard");
    return { success: true };

  } catch (err: any) {
    console.error("Erro ao criar protocolo:", err);
    return { success: false, error: err.message };
  }
}