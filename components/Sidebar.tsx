"use client";

import Link from "next/link";
import Image from "next/image"; // Importante para a Logo
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  LogOut,
  Dumbbell,
  FileText,
  Loader2,
  CalendarDays // <-- Ícone novo adicionado aqui
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallPWA } from "@/components/InstallPWA";

// Definição das permissões do menu
const menuItems = [
  { 
    href: "/dashboard", 
    label: "Visão Geral", 
    icon: LayoutDashboard,
    allowedRoles: ["therapist", "athlete"] 
  },
  { 
    href: "/dashboard/protocols/create", 
    label: "Criar Treino", 
    icon: Dumbbell,
    allowedRoles: ["therapist"] 
  },
  { 
    href: "/dashboard/schedule", 
    label: "Agendamentos", 
    icon: CalendarDays,
    allowedRoles: ["therapist", "athlete"] // <-- Adicionado e liberado para os dois!
  },
  { 
    href: "/dashboard/feedback", 
    label: "Registrar Feedback", 
    icon: FileText,
    allowedRoles: ["athlete"] 
  },
  { 
    href: "/dashboard/profile", 
    label: "Meu Perfil", 
    icon: User,
    allowedRoles: ["therapist", "athlete"] 
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) setUserRole(profile.role);
      } catch (error) {
        console.error("Erro ao buscar permissões:", error);
      } finally {
        setLoading(false);
      }
    }
    getUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <aside className="w-64 border-r bg-white h-screen flex flex-col items-center justify-center sticky top-0 left-0 z-50 hidden md:flex">
        {/* Loader com a cor oficial */}
        <Loader2 className="h-8 w-8 animate-spin text-[#01456d]" />
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-white h-screen flex flex-col sticky top-0 left-0 shadow-sm z-50 hidden md:flex">
      {/* --- LOGO PERSONALIZADA --- */}
      <div className="p-6 border-b flex flex-col items-center gap-3">
        {/* Imagem da Logo */}
        <div className="relative w-full h-12 flex justify-center">
             <Image 
               src="/FLAVICON-COM-RETANGULO-physio-track.png"
               alt="PhysioTrack Logo"
               width={150} // Ajuste conforme a proporção da sua imagem
               height={50}
               className="object-contain"
               priority
             />
        </div>
      </div>

      {/* --- NAVEGAÇÃO --- */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems
          .filter(item => userRole && item.allowedRoles.includes(userRole))
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-[#01456d]/10 text-[#01456d] font-bold shadow-sm" // Fundo com 10% da cor oficial
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-[#01456d]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {item.label}
              </Link>
            );
        })}
      </nav>

      {/* --- RODAPÉ --- */}
      <div className="p-4 border-t bg-gray-50/50 space-y-3">
        <div className="pb-2">
           {/* O botão só aparece se o App NÃO estiver instalado */}
           <InstallPWA />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </Button>
        
        <div className="text-center pt-2">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            {userRole === 'therapist' ? 'Modo Fisioterapeuta' : 'Modo Atleta'}
          </p>
        </div>
      </div>
    </aside>
  );
}