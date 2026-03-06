"use server";

import { createClient } from "@/lib/supabase/server";

// Mudamos o tipo para 'any' para evitar conflito de tipos entre Browser e Server
export async function saveSubscription(subscription: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // O subscription já chega aqui como JSON puro agora
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { 
        user_id: user.id, 
        subscription: subscription // Salva o JSON direto
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Erro Supabase:", error);
    throw new Error("Falha ao salvar no banco");
  }

  return { success: true };
}