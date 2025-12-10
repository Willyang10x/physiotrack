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
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    // Envia o email de recuperação
    // O truke é o redirectTo: manda o usuário para a página de trocar senha após clicar no email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Verifique seu e-mail! Enviamos um link para você redefinir sua senha."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gray-50/50">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          asChild
          className="pl-0 hover:bg-transparent text-primary hover:text-primary/80"
        >
          <Link href="/auth/login">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-muted-foreground">
            Não se preocupe, vamos resolver isso.
          </p>
        </div>

        <Card className="border-t-4 border-t-secondary shadow-lg">
          <CardHeader>
            <CardTitle className="text-secondary">Esqueceu a senha?</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber o link de redefinição.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm text-center">
                {message}
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Seu E-mail Cadastrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 focus-visible:ring-secondary"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
