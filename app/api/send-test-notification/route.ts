import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import webPush from "web-push";

export async function GET() {
  const supabase = await createClient();

  // 1. Pega o usuário logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  // 2. Busca a inscrição desse usuário no banco
  const { data: subscriptionRecord } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", user.id)
    .single();

  if (!subscriptionRecord) {
    return NextResponse.json({ error: "Nenhuma inscrição encontrada para este usuário." }, { status: 404 });
  }

  // 3. Configura o disparador (Web Push)
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Chaves VAPID não configuradas no .env" }, { status: 500 });
  }

  webPush.setVapidDetails(
    'mailto:suporte@physiotrack.com', // Pode ser qualquer email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // 4. Prepara a mensagem
  const payload = JSON.stringify({
    title: "Funciona! 🚀",
    body: `Olá, ${user.email}! O sistema de notificações do PhysioTrack está ativo.`,
    url: "/dashboard" // Para onde vai quando clicar
  });

  // 5. Envia a notificação
  try {
    await webPush.sendNotification(
      subscriptionRecord.subscription, // O JSON que você viu no banco
      payload
    );
    
    return NextResponse.json({ success: true, message: "Notificação enviada com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return NextResponse.json({ error: "Falha ao enviar notificação", details: error }, { status: 500 });
  }
}