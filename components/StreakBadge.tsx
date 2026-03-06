"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flame, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StreakBadge() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getStreak() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Busca o valor atualizado do banco
      const { data } = await supabase
        .from("profiles")
        .select("streak_days")
        .eq("id", user.id)
        .single();

      if (data) {
        setStreak(data.streak_days || 0);
      }
      setLoading(false);
    }

    getStreak();
  }, []);

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-gray-300" />;

  // Se for maior que 0, o fogo acende (Laranja). Se for 0, fica apagado (Cinza).
  const isActive = streak > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
            flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all cursor-default select-none
            ${
              isActive
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-gray-100 border-gray-200 text-gray-400 grayscale"
            }
          `}
          >
            <Flame
              className={`h-5 w-5 ${
                isActive ? "fill-orange-500 animate-pulse text-orange-600" : ""
              }`}
            />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm">
                {streak} {streak === 1 ? "dia" : "dias"}
              </span>
              <span className="text-[10px] uppercase font-semibold opacity-80">
                Ofensiva
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isActive
              ? "Continue assim! Não quebre a corrente! 🔥"
              : "Complete um treino hoje para acender a chama!"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}