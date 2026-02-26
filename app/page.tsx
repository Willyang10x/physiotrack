import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, MessageSquare, Bell, CalendarDays, Library, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-blue-50/50 to-white">
      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 container mx-auto px-4 py-12">
        
        {/* --- HERO SECTION ORIGINAL --- */}
        <div className="mb-16 text-center space-y-4"> 
          
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
            Plataforma profissional para monitorização de recuperação pós-lesão
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

        {/* --- CARDS DE FEATURES --- */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                Protocolos de Treino
              </h3>
              <p className="text-sm text-muted-foreground">
                Crie treinos personalizados com séries, repetições e vídeos demonstrativos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <CalendarDays className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-secondary">
                Agenda Inteligente
              </h3>
              <p className="text-sm text-muted-foreground">
                Disponibilize os seus horários. O atleta agenda e você recebe notificação push.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                Mapa Corporal 3D
              </h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe gráficos de fadiga e um mapa visual de dores atualizado pelo paciente.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Library className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-secondary">
                Biblioteca de Exercícios
              </h3>
              <p className="text-sm text-muted-foreground">
                Guarde os seus exercícios favoritos e adicione-os com um clique ao montar um protocolo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                Prontuário Eletrónico
              </h3>
              <p className="text-sm text-muted-foreground">
                Anote a evolução da sessão de forma segura e privada no perfil do atleta.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-secondary hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-secondary">
                Feedback e Ofensiva
              </h3>
              <p className="text-sm text-muted-foreground">
                Gamificação que mantém o atleta motivado a aderir ao tratamento todos os dias.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* --- COMO FUNCIONA --- */}
        <div className="rounded-2xl bg-white p-8 md:p-12 text-center shadow-lg border border-border/50 mb-12">
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
                  Execução e Registo
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
                  decisão clínica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- RODAPÉ COM LOGÓTIPO --- */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          
          {/* LOGO NO RODAPÉ */}
          <div className="relative w-[180px] h-[45px]">
            <Image 
              src="/logo-physio-track.png" 
              alt="PhysioTrack Logo" 
              fill
              className="object-contain object-center md:object-left opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Physio Track. Todos os direitos reservados.
          </p>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}