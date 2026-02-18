"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- FISIOTERAPEUTA: Cria um horário livre ---
export async function createSlot(date: Date, time: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  // Combina Data + Hora (ex: 2024-05-20 + "14:00")
  const [hours, minutes] = time.split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0, 0);

  const { error } = await supabase.from("appointments").insert({
    therapist_id: user.id,
    start_time: startDate.toISOString(),
    status: "available",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

// --- ATLETA: Reserva um horário ---
export async function bookSlot(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  // Tenta atualizar o horário para "booked" e coloca o ID do atleta
  const { error } = await supabase
    .from("appointments")
    .update({
      athlete_id: user.id,
      status: "booked"
    })
    .eq("id", appointmentId)
    .eq("status", "available"); // Garante que ninguém roubou a vaga no último segundo

  if (error) return { error: "Erro ao agendar ou horário já ocupado." };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

// --- FISIO: Cancela um horário ---
export async function cancelSlot(appointmentId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/schedule");
  return { success: true };
}