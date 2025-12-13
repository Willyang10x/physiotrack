import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Importante para o logo

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-4"> {/* Espaçamento compacto */}
          
          {/* LOGO: Tamanho médio (280px) e próximo do slogan */}
          <div className="flex justify-center mb-2">
            <div className="relative w-[280px] px-2">
              <Image 
                src="/logo-physio-track.png" 
                alt="PhysioTrack Logo" 
                width={280} 
                height={100} 
                priority
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
            Plataforma profissional para monitoramento de recuperação pós-lesão
            e alta performance.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 rounded-full"
            >
              <Link href="/auth/login">Acessar Sistema</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 text-lg border-2 border-primary text-primary hover:bg-primary/5 font-semibold rounded-full"
            >
              <Link href="/auth/sign-up">Criar Conta</Link>
            </Button>
          </div>
        </div>

        {/* Cards de Features */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="rounded-2xl bg-white p-8 md:p-12 text-center shadow-lg border border-border/50">
          <h2 className="mb-8 text-2xl md:text-3xl font-bold text-primary">
            Como Funciona
          </h2>
          <div className="mx-auto max-w-4xl space-y-6 text-left">
            <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
            <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
            <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
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