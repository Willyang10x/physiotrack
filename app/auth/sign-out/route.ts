import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verifica se tem alguém logado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Redireciona para a tela de login após sair
  // Usamos request.nextUrl para garantir que a URL base (localhost ou produção) esteja certa
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";

  // O status 302 é padrão para redirecionamentos temporários
  return NextResponse.redirect(url, {
    status: 302,
  });
}
