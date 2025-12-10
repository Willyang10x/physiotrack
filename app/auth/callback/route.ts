import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // O link do email traz um "code" e um "next" (para onde ir depois)
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    // Troca o código temporário por uma sessão real de usuário
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Se deu certo, manda o usuário para a página de Nova Senha (ou Dashboard)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se der erro ou o código for inválido, volta para o login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_code_error`);
}
