# César IA CRM

CRM PWA (Progressive Web App) para gestão completa da operação da **César IA**: clientes, agendamentos, tarefas, financeiro, notas e arquivos — tudo em um só lugar, com sincronização em tempo real e funcionamento offline.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-ffca28)
![PWA](https://img.shields.io/badge/PWA-instalável-5a0fc8)

---

## O que é

O **César IA CRM** é um sistema de gestão de relacionamento com clientes construído sob medida para a César IA. Ele centraliza o dia a dia comercial e operacional da empresa em uma interface única, rápida e instalável como aplicativo no celular ou desktop.

O sistema é **multi-usuário**: cada pessoa autenticada enxerga apenas os próprios dados, com isolamento garantido tanto no banco (Firestore Security Rules) quanto no armazenamento de arquivos (Storage Rules).

## Para que serve

| Módulo | O que resolve |
| --- | --- |
| **Dashboard** | Visão geral do negócio com KPIs (clientes, tarefas, receita) e atividade recente |
| **Clientes** | Cadastro, edição, busca, tags e paginação da base de clientes |
| **Agendamentos** | Calendário para organizar compromissos, com status (confirmado, pendente, cancelado) |
| **Tarefas** | Kanban com drag & drop nativo para acompanhar demandas por status e prioridade |
| **Financeiro** | Lançamento de receitas e despesas por categoria, com status pago/pendente |
| **Notas** | Editor de texto rico para documentar reuniões, ideias e contextos |
| **Arquivos** | Upload e preview de arquivos vinculados a notas, clientes ou tarefas |
| **Configurações** | Perfil do usuário, avatar e preferências (incluindo tema claro/escuro) |
| **Autenticação** | Login com e-mail/senha e Google, com recuperação de senha |

## Funcionalidades principais

- **Autenticação** com e-mail/senha e Google (Firebase Auth)
- **Isolamento por usuário** — cada conta só acessa os próprios registros
- **Busca global** no cabeçalho e busca por módulo
- **Paginação por cursor** para lidar com grandes volumes de dados
- **Notificações** de prazos e compromissos
- **Tema claro/escuro** persistido no navegador
- **PWA instalável** com service worker e suporte offline
- **Drag & drop** nativo no Kanban de tarefas
- **Editor de texto rico** (Tiptap) nas notas
- **Design responsivo** com atenção especial ao mobile

---

## Stack tecnológica

- **Frontend:** [Next.js 15](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- **Linguagem:** TypeScript (modo `strict`)
- **Estilo:** [TailwindCSS 4](https://tailwindcss.com) + design system próprio
- **Ícones:** [lucide-react](https://lucide.dev)
- **Backend:** [Firebase](https://firebase.google.com) (Authentication + Firestore + Storage)
- **Editor de texto:** [Tiptap](https://tiptap.dev)
- **Testes:** [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
- **Deploy:** [Vercel](https://vercel.com)

---

## Como usar (ambiente de desenvolvimento)

### Pré-requisitos

- **Node.js** 20 ou superior
- **npm** (ou `pnpm` / `yarn` / `bun`)
- Uma conta no **Firebase** com um projeto criado

### 1. Clonar o repositório

```bash
git clone https://github.com/startup-cesar-ia/cesar-ia-crm.git
cd cesar-ia-crm
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Firebase:

```bash
cp .env.example .env.local
```

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Conteúdo esperado do `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> As credenciais ficam em **Firebase Console → Configurações do projeto → Seus apps → Configuração do SDK**.
> O `.env.local` **nunca** deve ser commitado — o `.gitignore` já o protege.

### 4. Configurar o Firebase

No [Firebase Console](https://console.firebase.google.com), habilite:

1. **Authentication** → ative os provedores **E-mail/senha** e **Google**
2. **Firestore Database** → crie o banco em modo produção
3. **Storage** → ative o armazenamento de arquivos

As regras de segurança já estão versionadas no repositório e podem ser publicadas com a CLI do Firebase:

```bash
firebase deploy --only firestore:rules,storage
```

### 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento em `http://localhost:3000` |
| `npm run build` | Gera a build de produção |
| `npm run start` | Executa a build de produção localmente |
| `npm run lint` | Roda o ESLint em todo o projeto |
| `npm test` | Executa os testes uma vez |
| `npm run test:watch` | Executa os testes em modo watch |
| `npm run test:coverage` | Executa os testes com relatório de cobertura |

---

## Estrutura do projeto

```
src/
├── app/                    # Rotas (App Router)
│   ├── (auth)/             # Rotas públicas de autenticação
│   │   └── login/
│   ├── (app)/              # Rotas autenticadas (com sidebar)
│   │   ├── dashboard/      # Visão geral e KPIs
│   │   ├── clientes/       # Gestão de clientes
│   │   ├── agendamentos/   # Calendário
│   │   ├── tarefas/        # Kanban
│   │   ├── financeiro/     # Receitas e despesas
│   │   ├── notas/          # Notas com editor rico
│   │   ├── arquivos/       # Upload e preview
│   │   └── configuracoes/  # Perfil e preferências
│   ├── globals.css         # Tokens de design (@theme)
│   └── layout.tsx          # Layout raiz
├── components/
│   ├── ui/                 # Design system (kit reutilizável)
│   ├── layout/             # Sidebar, Header, Notificações
│   ├── pwa/                # Service worker e botão de instalação
│   └── <modulo>/           # Componentes específicos de cada módulo
├── lib/                    # Serviços e utilitários
│   ├── firebase.ts         # Inicialização do Firebase
│   ├── firebase-services.ts# CRUD no Firestore
│   ├── date.ts             # Formatação de datas
│   └── utils.ts            # Helpers gerais
└── types/                  # Tipagens TypeScript e declarações
```

---

## Design system

As cores ficam centralizadas como tokens em `src/app/globals.css` — nunca use hex direto nos componentes `.tsx`.

| Token | Valor | Uso |
| --- | --- | --- |
| Background | `#F4F1EA` | Fundo (bege) |
| Foreground | `#1A1C20` | Texto principal |
| Primary | `#FF5C00` | Laranja da marca |
| Sidebar | `#1A1C20` | Sidebar escura |
| Success | `#16A34A` | Confirmações |
| Warning | `#F59E0B` | Alertas |
| Info | `#2563EB` | Informação |
| Destructive | `#DC2626` | Erros e exclusões |

---

## Testes

Os testes usam **Vitest** com **Testing Library** e ficam em arquivos `*.test.ts(x)`. A cobertura mínima alvo é de **70%**.

```bash
npm test              # execução única
npm run test:watch    # modo watch
npm run test:coverage # com relatório de cobertura
```

---

## Deploy

O deploy de produção é feito na **Vercel**, a partir da branch `main`.

1. Importe o repositório na [Vercel](https://vercel.com/new)
2. Configure as variáveis de ambiente (as mesmas do `.env.local`) em **Settings → Environment Variables**
3. Faça o deploy — cada push na branch `main` gera uma nova publicação automática

---

## Convenções de contribuição

- **Commits** em português, seguindo o padrão: `feat:`, `fix:`, `chore:`
- **Branches:** `feature/nome`, `fix/nome`, `chore/nome`
- Todo código em **TypeScript**
- **Nunca** commitar chaves ou credenciais
- Sem uso de `alert`/`confirm` nativos — usar diálogos acessíveis
- UI sempre via componentes do kit (`src/components/ui/`)

---

## Licença

Projeto privado da **César IA**. Todos os direitos reservados.