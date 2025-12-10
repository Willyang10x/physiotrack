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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LockKeyhole, UserPlus } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"therapist" | "athlete">("athlete");

  const [accessCode, setAccessCode] = useState("");
  const [selectedTherapistId, setSelectedTherapistId] = useState("");
  const [therapistsList, setTherapistsList] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const THERAPIST_SECRET_CODE = "FISIO2025";

  useEffect(() => {
    async function loadTherapists() {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "therapist");

      if (data) setTherapistsList(data);
    }
    loadTherapists();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (role === "therapist" && accessCode !== THERAPIST_SECRET_CODE) {
      setError("Código de verificação de Fisioterapeuta inválido.");
      setIsLoading(false);
      return;
    }

    if (role === "athlete" && !selectedTherapistId) {
      setError("Por favor, selecione seu fisioterapeuta na lista.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: role,
            therapist_id: role === "athlete" ? selectedTherapistId : null,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fundo limpo (usa o do globals.css)
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary">PhysioTrack</h1>
          <p className="mt-2 text-muted-foreground">
            Crie sua conta para começar
          </p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Cadastro</CardTitle>
            <CardDescription>Preencha os dados abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input
                  placeholder="Seu nome"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label>Seu Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-primary"
                />
              </div>

              <div className="grid gap-2">
                <Label>Eu sou...</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as "therapist" | "athlete")}
                >
                  <SelectTrigger className="focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="athlete">Atleta (Paciente)</SelectItem>
                    <SelectItem value="therapist">
                      Fisioterapeuta (Profissional)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "therapist" && (
                <div className="grid gap-2 p-3 bg-primary/5 border border-primary/20 rounded-md animate-in fade-in slide-in-from-top-2">
                  <Label className="flex items-center gap-2 text-primary font-semibold">
                    <LockKeyhole className="h-4 w-4" /> Código da Clínica
                  </Label>
                  <Input
                    placeholder="Senha Mestra"
                    className="bg-white border-primary/30"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </div>
              )}

              {role === "athlete" && (
                <div className="grid gap-2 p-3 bg-secondary/5 border border-secondary/20 rounded-md animate-in fade-in slide-in-from-top-2">
                  <Label className="flex items-center gap-2 text-secondary font-semibold">
                    <UserPlus className="h-4 w-4" /> Seu Fisioterapeuta
                  </Label>

                  <Select
                    onValueChange={setSelectedTherapistId}
                    value={selectedTherapistId}
                  >
                    <SelectTrigger className="bg-white border-secondary/30 focus:ring-secondary">
                      <SelectValue placeholder="Selecione na lista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {therapistsList.length > 0 ? (
                        therapistsList.map((fisio) => (
                          <SelectItem key={fisio.id} value={fisio.id}>
                            {fisio.full_name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Nenhum fisio encontrado
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-secondary">
                    Selecione o profissional que vai acompanhar você.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label>Repetir Senha</Label>
                <Input
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="focus-visible:ring-primary"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Já tem conta?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-bold hover:underline"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
