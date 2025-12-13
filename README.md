<img width="1229" height="446" alt="image" src="https://github.com/user-attachments/assets/2def62b8-d3cb-418f-9728-9b3592bae7e3" />

# Physio Track 🏃‍♂️

> Plataforma profissional para monitorização de recuperação pós-lesão e alta performance.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📖 Sobre o Projeto

O **Physio Track** é uma aplicação web progressiva (PWA) desenvolvida para conectar **Fisioterapeutas** e **Atletas**. O objetivo é substituir fichas de papel e planilhas complexas por uma interface limpa, rápida e focada em dados clínicos.

O sistema permite que profissionais criem protocolos de treino personalizados e acompanhem a evolução dos seus pacientes através de gráficos de dor, fadiga e consistência de treino.

### ✨ Funcionalidades Principais

#### 👨‍⚕️ Para Fisioterapeutas
- **Gestão de Pacientes:** Visualização de lista de atletas vinculados.
- **Criação de Protocolos:** Editor de treinos com suporte a exercícios, séries, repetições, descanso e upload de vídeos demonstrativos.
- **Painel Clínico:** Acesso a gráficos de evolução (Dor vs. Fadiga) e calendário de frequência de treinos/page.tsx].
- **Segurança:** Registo exclusivo via código de verificação da clínica.

#### 🏃‍♂️ Para Atletas
- **Treino do Dia:** Acesso fácil ao protocolo ativo com vídeos explicativos.
- **Feedback Diário:** Registo rápido de níveis de dor (0-10), fadiga (0-10) e notas após cada sessão.
- **Histórico:** Visualização da própria evolução e consistência.
- **Mobile First:** Interface totalmente adaptada para telemóveis.

## 🛠 Tecnologias Utilizadas

O projeto foi construído com foco em performance, tipagem estática e componentes reutilizáveis.

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, RLS)

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma conta no [Supabase](https://supabase.com/)

### Passo a Passo

1.  **Clone o repositório e instale as dependências:**

    ```bash
    git clone [https://github.com/seu-usuario/physio-track.git](https://github.com/seu-usuario/physio-track.git)
    cd physio-track
    npm install
    ```

2.  **Configure as Variáveis de Ambiente:**

    Renomeie o ficheiro `.env.example` para `.env.local` (ou crie um novo) e adicione as suas credenciais do Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_publica
    ```

3.  **Configure a Base de Dados (Supabase):**

    Aceda ao **SQL Editor** no painel do Supabase e execute os scripts da pasta `scripts/` na seguinte ordem para criar as tabelas e políticas de segurança:

    1.  `001_create_profiles.sql` (Cria perfis e roles)
    2.  `002_create_protocols.sql` (Tabela de treinos)
    3.  `003_create_daily_feedback.sql` (Feedback dos atletas)
    4.  `004_create_notifications.sql` (Sistema de notificações)
    5.  `005_create_messages.sql` (Chat entre utilizadores)

4.  **Execute o projeto:**

    ```bash
    npm run dev
    ```

    Aceda a `http://localhost:3000` no seu navegador.

## 🤝 Autores e Colaboradores

Este projeto foi desenvolvido com a colaboração técnica entre Engenharia de Software e Fisioterapia:

* **[Willyan Gabriel](https://github.com/Willyang10x)** - *Desenvolvimento e Engenharia*
* **[Ana](http://lattes.cnpq.br/2579677218357791)** - *Fisioterapeuta Parceira e Consultoria Técnica*

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - consulte o ficheiro [LICENSE](LICENSE) para mais detalhes.
