import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-20 text-center space-y-6">
          <h1 className="text-6xl font-extrabold text-primary tracking-tight">
            PhysioTrack
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma profissional para monitoramento de recuperação pós-lesão
            e alta performance.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20"
            >
              <Link href="/auth/login">Acessar Sistema</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary text-primary hover:bg-primary/5"
            >
              <Link href="/auth/sign-up">Criar Conta</Link>
            </Button>
          </div>
        </div>

        {/* Cards de Features */}
        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                Protocolos
              </h3>
              <p className="text-sm text-muted-foreground">
                Fisioterapeutas criam treinos personalizados com vídeos e metas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-secondary">
                Progresso
              </h3>
              <p className="text-sm text-muted-foreground">
                Gráficos automáticos de dor e fadiga para acompanhar a evolução.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                Feedback
              </h3>
              <p className="text-sm text-muted-foreground">
                Atletas registram como se sentem após cada sessão de treino.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Bell className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-secondary">
                Acompanhamento
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitoramento remoto e ajustes rápidos no tratamento.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Como Funciona */}
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm border border-border">
          <h2 className="mb-8 text-3xl font-bold text-primary">
            Como Funciona
          </h2>
          <div className="mx-auto max-w-3xl space-y-6 text-left">
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold shadow-md">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-lg text-primary">
                  Criação do Protocolo
                </h3>
                <p className="text-muted-foreground">
                  O Fisioterapeuta monta o treino e vincula vídeos explicativos.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-white font-bold shadow-md">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-lg text-secondary">
                  Execução e Registro
                </h3>
                <p className="text-muted-foreground">
                  O Atleta realiza o treino e informa o nível de dor e cansaço.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold shadow-md">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-lg text-primary">
                  Análise de Dados
                </h3>
                <p className="text-muted-foreground">
                  O sistema gera gráficos de evolução para auxiliar na tomada de
                  decisão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
