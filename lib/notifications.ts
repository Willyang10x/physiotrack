import { createClient } from "@/lib/supabase/server";
import * as webPush from "web-push";

type NotificationPayload = {
  userId: string;
  title: string;
  message: string;
  url?: string;
};

export async function sendNotificationToUser({
  userId,
  title,
  message,
  url = "/dashboard",
}: NotificationPayload) {
  // 1. Validação básica das chaves
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error("❌ Chaves VAPID não configuradas.");
    return { success: false, error: "Chaves de servidor ausentes" };
  }

  // 2. Configura o Carteiro (Web Push)
  webPush.setVapidDetails(
    "mailto:suporte@physiotrack.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    const supabase = await createClient();

    // 3. Busca o endereço (inscrição) do destinatário no banco
    // OBS: Se você tiver RLS (regras de segurança) muito estritas, 
    // pode ser necessário usar o supabaseAdmin (service_role) aqui.
    const { data: record, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)
      .single();

    if (error || !record) {
      console.warn(`⚠️ Nenhuma inscrição encontrada para o usuário ${userId}`);
      return { success: false, error: "Usuário não tem notificações ativas" };
    }

    // 4. Prepara o pacote
    const payload = JSON.stringify({
      title,
      body: message,
      url,
    });

    // 5. Envia!
    await webPush.sendNotification(record.subscription, payload);
    
    console.log(`✅ Notificação enviada para ${userId}`);
    return { success: true };

  } catch (err) {
    console.error("❌ Erro ao enviar notificação:", err);
    // Em produção, aqui você poderia marcar a inscrição como inválida se o erro for 410 (Gone)
    return { success: false, error: err };
  }
}