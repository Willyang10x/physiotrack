"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- FISIO: Cria uma nova anotação de sessão ---
export async function createNote(athleteId: string, content: string, noteDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("session_notes").insert({
    therapist_id: user.id,
    athlete_id: athleteId,
    note_date: noteDate,
    content: content
  });

  if (error) return { error: error.message };
  
  // Atualiza a tela do atleta específico
  revalidatePath(`/dashboard/athletes/${athleteId}`);
  return { success: true };
}

// --- FISIO: Apaga uma anotação ---
export async function deleteNote(noteId: string, athleteId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("session_notes")
    .delete()
    .eq("id", noteId);

  if (error) return { error: error.message };
  
  revalidatePath(`/dashboard/athletes/${athleteId}`);
  return { success: true };
}