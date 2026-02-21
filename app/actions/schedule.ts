"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotificationToUser } from "@/lib/notifications"; // <-- Importamos a notificação

// --- FISIOTERAPEUTA: Cria um horário livre ---
export async function createSlot(dateTimeIso: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("appointments").insert({
    therapist_id: user.id,
    start_time: dateTimeIso,
    status: "available",
  });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

// --- ATLETA: Reserva um horário e notifica o Fisio ---
export async function bookSlot(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  // 1. Busca os dados do agendamento ANTES de alterar (para saber de quem é e a hora)
  const { data: appointment } = await supabase
    .from("appointments")
    .select("therapist_id, start_time")
    .eq("id", appointmentId)
    .single();

  if (!appointment) return { error: "Agendamento não encontrado." };

  // 2. Atualiza o horário para "booked"
  const { error } = await supabase
    .from("appointments")
    .update({ athlete_id: user.id, status: "booked" })
    .eq("id", appointmentId)
    .eq("status", "available");

  if (error) return { error: "Erro ao agendar ou horário já ocupado." };

  // 3. Busca o nome do Atleta
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const athleteName = profile?.full_name?.split(' ')[0] || "Um atleta";

  // 4. Formata a data e hora para a notificação
  const dateObj = new Date(appointment.start_time);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 5. 🔥 Dispara a Notificação Push para o Fisioterapeuta!
  await sendNotificationToUser({
    userId: appointment.therapist_id,
    title: "Novo Agendamento! 📅",
    message: `${athleteName} reservou dia ${formattedDate} às ${formattedTime}.`,
    url: "/dashboard/schedule"
  });

  revalidatePath("/dashboard/schedule");
  return { success: true };
}

// --- FISIO: Cancela um horário ---
export async function cancelSlot(appointmentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").delete().eq("id", appointmentId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

// --- FISIO: Limpa todos os horários LIVRES de um dia específico ---
export async function clearDaySlots(dateString: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const startDate = new Date(dateString);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateString);
  endDate.setHours(23, 59, 59, 999);

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("therapist_id", user.id)
    .eq("status", "available")
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString());

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/schedule");
  return { success: true };
}