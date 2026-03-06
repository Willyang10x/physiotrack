export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExerciseManager } from "./exercise-manager";

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Bloqueia se um Atleta tentar acessar essa URL
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "therapist") redirect("/dashboard");

  // Busca todos os exercícios do Fisioterapeuta logado
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("therapist_id", user.id)
    .order("name", { ascending: true });

  // Passa os dados para o componente interativo
  return <ExerciseManager initialExercises={exercises || []} />;
}