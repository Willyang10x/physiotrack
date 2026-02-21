"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- FISIOTERAPEUTA: Cria um horário livre ---
export async function createSlot(dateTimeIso: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("appointments").insert({
    therapist_id: user.id,
    start_time: dateTimeIso, // Salva exatamente o que o navegador mandou
    status: "available",
  });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

// ... (As funções bookSlot e cancelSlot continuam iguais, não precisa mexer) ...
export async function bookSlot(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };
  const { error } = await supabase.from("appointments").update({ athlete_id: user.id, status: "booked" }).eq("id", appointmentId).eq("status", "available");
  if (error) return { error: "Erro ao agendar ou horário já ocupado." };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

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

  // Cria o intervalo: Início do dia até o final do dia
  const startDate = new Date(dateString);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateString);
  endDate.setHours(23, 59, 59, 999);

  // Deleta apenas os que pertencem a esse fisio, estão nesse dia e estão 'available' (livres)
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