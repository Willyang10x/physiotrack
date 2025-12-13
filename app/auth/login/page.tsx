"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image"; // Importante para o logo
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gray-50/30">
      <div className="w-full max-w-md space-y-6">
        
        {/* LOGO: Tamanho reduzido e próximo do texto */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative w-[180px] h-auto"> {/* Tamanho controlado (180px) */}
            <Image 
              src="/logo-physio-track.png" 
              alt="PhysioTrack" 
              width={180} 
              height={60} 
              priority
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-muted-foreground mt-2 text-sm"> {/* mt-2 cola o texto ao logo */}
            Monitoramento inteligente de reabilitação
          </p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-secondary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-primary"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Acessar Plataforma"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Não tem uma conta?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary font-semibold hover:underline"
              >
                Cadastre-se gratuitamente
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}