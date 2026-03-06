"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { saveSubscription } from "@/app/actions/save-subscription";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Chave VAPID pública não encontrada!");

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Transformamos o objeto complexo em JSON simples ANTES de enviar
      const plainSubscription = JSON.parse(JSON.stringify(sub));
      
      await saveSubscription(plainSubscription);
      
      setSubscription(sub);
      alert("Notificações ativadas com sucesso! 🔔");
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);
      alert("Erro ao ativar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-muted-foreground">Notificações não suportadas.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {subscription ? (
        <div className="text-green-600 flex items-center gap-2 text-sm font-medium p-2 border border-green-200 bg-green-50 rounded-md">
          <Bell className="h-4 w-4" /> Notificações Ativas neste dispositivo
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Receba alertas de novos treinos e mensagens.
          </p>
          <Button 
            onClick={subscribeToPush} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ativando...</>
            ) : (
              "Ativar Notificações"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}