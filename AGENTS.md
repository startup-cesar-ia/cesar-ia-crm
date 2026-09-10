# AGENTS.md - CRM César IA

## Visão Geral
CRM PWA para gestão de clientes, agendamentos, tarefas e finanças da empresa César IA.

## Stack Tecnológica
- **Frontend:** Next.js 15 (App Router) + React 19
- **Estilo:** TailwindCSS 4 + design system próprio (kit em `src/components/ui/`)
- **Ícones:** `lucide-react` (única fonte de ícones; proibido `react-icons`)
- **Drag & drop:** HTML5 nativo no Kanban (proibido `@dnd-kit`)
- **Backend:** Firebase (Auth + Firestore)
- **Idioma:** TypeScript (strict)

## Convenções de Código
- Usar TypeScript em todos os arquivos
- Componentes em `src/components/`
- Páginas em `src/app/` (App Router)
- Serviços Firebase em `src/lib/`
- Tipos em `src/types/`
- UI sempre via kit (`ui/`) e tokens (nunca hex hardcoded em `.tsx`)
- `globals.css` define os tokens `@theme`; cores da marca e semânticas vivem lá

## Estrutura de Pastas
- `(auth)/` - Rotas de autenticação (layout sem sidebar)
- `(app)/` - Rotas autenticadas (layout com sidebar)
- `clientes/` - Módulo de gestão de clientes
- `agendamentos/` - Módulo de calendário
- `tarefas/` - Módulo Kanban
- `financeiro/` - Módulo financeiro (receitas/despesas)
- `configuracoes/` - Perfil do usuário e preferências
- `dashboard/` - Visão geral com KPIs e atividade recente

## Regras
- Nunca expor chaves de API no código
- Usar environment variables para configurações
- Componentes devem ser reutilizáveis
- Sem `alert`/`confirm` nativos (usar diálogo acessível)
- Commits em português: `feat:`, `fix:`, `chore:`
- Branches: `feature/nome`, `fix/nome`, `chore/nome`

## Testes
- Framework: Vitest + Testing Library
- Testes em `__tests__/` ou `*.test.ts`
- Cobertura mínima: 70%

## Ambiente
- Copiar `.env.example` para `.env.local`
- Nunca committar `.env.local` (o `.env.example` é versionado)

## Deploy
- Plataforma: Vercel
- Branch principal: `main`

## Cores do Projeto (tokens em `globals.css`)
- Background: `#F4F1EA` (Bege)
- Foreground: `#1A1C20` (Cinza quase preto)
- Primary: `#FF5C00` (Laranja da marca)
- Sidebar (dark): `#1A1C20`
- Semânticas: success `#16A34A`, warning `#F59E0B`, info `#2563EB`, destructive `#DC2626`
