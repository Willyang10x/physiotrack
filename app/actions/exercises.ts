"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- FISIO: Cria um novo exercício ---
export async function createExercise(formData: { name: string, description: string, video_url: string, category: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("exercises").insert({
    therapist_id: user.id,
    ...formData
  });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/exercises");
  return { success: true };
}

// --- FISIO: Apaga um exercício ---
export async function deleteExercise(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/exercises");
  return { success: true };
}