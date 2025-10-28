# 🎯 Copilot Instructions - Desenrola DCL

## 📋 Arquitetura do Sistema

**Desenrola DCL** é um sistema completo de gestão para ópticas com arquitetura Next.js 14 + Supabase + PostgreSQL.

### 🏗️ Estrutura Principal
- **Frontend**: Next.js 14 App Router com TypeScript
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **Estado**: Zustand para estado global, TanStack Query para cache
- **UI**: shadcn/ui + Tailwind CSS + Radix UI + Framer Motion
- **Autenticação**: Supabase Auth com middleware personalizado

## 🎨 Padrões de Código

### Estrutura de Componentes
```tsx
// Padrão de componente com providers
'use client'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'

export function Component() {
  // 1. Hooks de estado/auth primeiro
  // 2. Queries com TanStack Query
  // 3. Handlers de eventos
  // 4. JSX com className usando cn() utility
}
```

### Queries e APIs
- **Supabase Client**: Use `@/lib/supabase/client` com helpers pré-definidos
- **Cache**: TanStack Query com staleTime de 5min, gcTime de 10min
- **Erro**: Sempre use try/catch com toast de erro para UX

### Sistema de Permissões (RLS)
```typescript
// Roles: 'gestor', 'dcl', 'financeiro', 'loja', 'demo_viewer'
// Middleware em /src/middleware.ts controla acesso por rota
// RLS policies no Supabase filtram dados por loja/role
```

## 🗄️ Banco de Dados

### Estrutura Principal
- **pedidos**: Core business (status: rascunho→producao→entregue→finalizado)
- **laboratorios**: Parceiros de produção
- **lojas**: Multi-tenant (cada loja vê apenas seus dados)
- **usuarios**: Sistema de auth + roles
- **mission_control_***: Sistema gamificado de tarefas diárias

### Views Críticas
- `view_dashboard_kpis`: Métricas principais (usar sempre)
- `view_pedidos_timeline`: Histórico de eventos
- `view_mission_control_*`: Sistema de gamificação

## 🎮 Funcionalidades Principais

### Dashboard (/dashboard)
- **KPIs Reais**: Volume, ticket médio, SLA labs (dados não-mock)
- **Gráficos**: Recharts para evolução financeira/mensal
- **Alertas**: Sistema de notificações críticas

### Kanban (/kanban)  
- **Drag & Drop**: @hello-pangea/dnd para movimentação
- **Estados**: rascunho → producao → entregue → finalizado
- **Filtros**: Por laboratório, loja, período

### Mission Control (/mission-control)
- **Gamificação**: Sistema de pontos e badges
- **Tarefas Diárias**: Renovação automática (stored procedures)
- **Multi-loja**: Cada loja tem suas próprias missões

## 🛠️ Comandos de Desenvolvimento

```bash
# Setup inicial
npm install
cp .env.example .env.local
npm run dev

# Database (usar scripts em /database/setup/)
# Execute na ordem: estruturas-basicas.sql → setup específicos

# Lint/Build
npm run lint
npm run build
```

## ⚠️ Pontos Críticos

### Configuração Obrigatória
- **Supabase**: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
- **RLS**: Sempre ativo - nunca desabilitar policies
- **Timezone**: Sistema usa fuso de São Paulo para missões diárias

### Performance
- **Views são otimizadas**: Use sempre views, não queries diretas
- **Cache**: TanStack Query já configurado - não bypass
- **Lazy Loading**: Componentes pesados usam Suspense

### Segurança
```typescript
// NUNCA usar service role key no frontend
// SEMPRE validar permissões no middleware
// RLS policies filtram automaticamente por loja_id
```

## 📁 Estrutura de Arquivos Importantes

```
/src/
├── app/                 # App Router (Next.js 14)
├── components/          # Componentes organizados por feature
├── lib/
│   ├── supabase/       # Cliente e helpers Supabase
│   ├── stores/         # Zustand stores
│   └── utils/          # Utilitários (cn, formatters, etc)
└── hooks/              # Custom hooks

/database/
├── setup/              # Scripts SQL iniciais
├── functions/          # Stored procedures
└── migrations/         # Migrações e correções

/docs/                  # Documentação técnica completa
```

## 🎯 Fluxo de Trabalho Típico

1. **Autenticação**: Login via Supabase → middleware valida role → redireciona
2. **Dados**: Component usa TanStack Query → cache automático → RLS filtra
3. **UI**: shadcn/ui components → Tailwind classes → tema inteligente
4. **Estado**: Zustand para global → React Query para server state

## 📝 Convenções

- **Arquivos**: kebab-case para pastas, PascalCase para componentes
- **Imports**: Absolute paths com @ alias configurado
- **Styling**: Tailwind first, CSS modules para casos específicos
- **DB**: snake_case para tabelas/colunas, camelCase no TypeScrip