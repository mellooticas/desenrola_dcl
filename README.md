# 🚀 Desenrola DCL - Sistema Completo de Gestão para - **[🗂️ Índice Organizacional](./docs/INDICE-ORGANIZACIONAL.md)** - Mapa completo

---

## ⚡ Setup Ultra Rápido moderno e completo para gestão de ópticas com Kanban de pedidos, Dashboard BI, Mission Control de tarefas diárias e muito mais.

## 📊 Status do Sistema (Atualizado Setembro 2025)

### ✅ **Sistema 100% Operacional e Evoluído**
- **Base de dados robusta** com views otimizadas (<1.4ms)
- **APIs reais** sem dados mockados - tudo conectado ao Supabase
- **Dashboard financeiro** com métricas reais e gráficos
- **Mission Control** completo para tarefas diárias gamificadas
- **Kanban de pedidos** funcional e intuitivo
- **Sistema de autenticação** com RLS (Row Level Security)

### 🎯 **Funcionalidades Principais**
- 📊 **Dashboard BI** - Métricas financeiras, gráficos e KPIs
- 🎮 **Mission Control** - Sistema gamificado de tarefas diárias
- 📋 **Kanban de Pedidos** - Gestão visual do fluxo de trabalho
- 🏪 **Multi-loja** - Suporte para múltiplas unidades
- 👥 **Controle de usuários** - Gestores, operadores e clientes
- 📱 **Responsivo** - Interface adaptada para desktop e mobile

### 📈 **Dados Operacionais Reais**
- **Volume Recente**: 34 pedidos (últimos 30 dias)
- **Taxa Entrega**: 74.7% (2.203 entregues)
- **Ticket Médio**: R$ 1.523,74
- **Lead Time**: 1.9 dias médio
- **Laboratórios Ativos**: 5 laboratórios

### ⚠️ **Pontos de Atenção**
- **SLA Labs**: 0% médio (requer investigação)
- **Volume**: Baixo nos últimos 30 dias (possível sazonalidade)
- **Alertas**: 2 alertas críticos ativos

---

## 📚 Documentação Organizada

**🎯 Toda a documentação foi organizada profissionalmente em [`/docs`](./docs/README.md)**

### 📖 **Acesso Rápido por Área**
- **[🚀 Desenvolvimento](./docs/development/)** - Setup, configuração e guias técnicos
- **[🌐 APIs](./docs/api/)** - Documentação completa das APIs e endpoints
- **[🧩 Componentes](./docs/components/)** - Guia dos componentes React e UI
- **[🗄️ Banco de Dados](./docs/database/)** - Schemas, views e procedures
- **[🎯 Mission Control](./docs/mission-control/)** - Sistema de tarefas diárias
- **[� Deploy](./docs/deployment/)** - Guias de deploy e produção
- **[🔒 Segurança](./docs/security/)** - RLS, autenticação e permissões

### 📋 **Documentos Principais**
- **[📊 Análise Completa](./docs/ANALISE-COMPLETA-SISTEMA.md)** - Visão geral do sistema
- **[🎨 Sistema de Temas](./docs/SISTEMA_TEMAS.md)** - Padrões visuais e temas
- **[� Resumo Técnico](./docs/RESUMO-DOCUMENTACAO.md)** - Resumo executivo
- **[🗂️ Índice Organizacional](./docs/INDICE-ORGANIZACIONAL.md)** - Mapa completo DCL - Sistema de Gestão de Pedidos

Sistema Kanban para gestão de pedidos de laboratórios ópticos com interface moderna e intuitiva.

## � Documentação Completa

**🎯 Toda a documentação detalhada está em [`/docs`](./docs/README.md)**

### 📖 Links Rápidos
- **[🚀 Início Rápido](./docs/development/developer-guide.md#início-rápido)** - Setup em 5 minutos
- **[🌐 APIs](./docs/api/)** - Documentação completa das APIs
- **[🧩 Componentes](./docs/components/)** - Guia dos componentes React
- **[🗄️ Banco de Dados](./docs/database/schema.md)** - Schema e relacionamentos
- **[🚀 Deploy](./docs/deployment/production.md)** - Guia de produção

## ⚡ Setup Ultra Rápido

```bash
# 1. Clone e instale
git clone https://github.com/mellooticas/desenrola_dcl.git
cd desenrola_dcl
npm install

# 2. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Execute
npm run dev
```

**Acesse:** `http://localhost:3000`

**Criar projeto no Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Anote a URL e anon key

**Configurar .env.local:**
```bash
# Copiar template
cp .env.example .env.local

# Editar com suas credenciais
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Configurar Banco de Dados

Execute o schema SQL completo que você já tem funcionando:

```sql
-- Executar no SQL Editor do Supabase
-- 1. Criar todas as tabelas (laboratorios, lojas, classes_lente, etc.)
-- 2. Inserir dados de teste
-- 3. Criar funções e triggers
-- 4. Configurar RLS policies
```

### 4. Rodar o Projeto
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
desenrola_dcl/
├── src/                        # Código fonte
│   ├── app/                    # Pages (Next.js 14)
│   │   ├── api/                # Endpoints API
│   │   ├── dashboard/          # BI e analytics
│   │   ├── kanban/             # Board visual
│   │   ├── pedidos/            # CRUD pedidos
│   │   ├── mission-control/    # Tarefas diárias
│   │   ├── configuracoes/      # Settings
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Redirect para kanban
│   │   └── login/page.tsx      # Login profissional
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── kanban/             # Componentes do Kanban
│   │   ├── forms/              # Formulários
│   │   ├── layout/             # Header, Sidebar, etc.
│   │   ├── permissions/        # Sistema de permissões
│   │   └── providers/          # Context providers
│   ├── lib/
│   │   ├── supabase/           # Cliente Supabase
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # Tipos TypeScript
│   │   └── utils/              # Utilitários + permissões
│   └── styles/                 # Estilos globais
│
├── scripts/                    # 📜 Scripts organizados
│   ├── dev/                    # 🔧 Scripts de desenvolvimento (não vão para git)
│   │   ├── tests/              # Testes (15 arquivos)
│   │   ├── diagnostics/        # Diagnósticos (12 arquivos)
│   │   ├── investigations/     # Investigações (8 arquivos)
│   │   └── debug/              # Debug temporário
│   ├── setup/                  # ⚙️ Scripts de setup (7 arquivos)
│   ├── generators/             # 🏗️ Geradores de dados (5 arquivos)
│   ├── operations/             # 🔄 Operações de sistema
│   └── README.md               # Guia completo de scripts
│
├── database/                   # 💾 Arquivos SQL organizados
│   ├── setup/                  # Setup inicial (4 arquivos)
│   ├── migrations/             # Migrações (5 arquivos)
│   ├── scripts/                # Scripts utilitários (4 arquivos)
│   └── README.md               # Guia de SQL
│
├── docs/                       # 📚 Documentação completa
│   ├── features/               # Docs de funcionalidades (3 docs)
│   ├── fixes/                  # Docs de correções (3 docs)
│   ├── instructions/           # Guias passo-a-passo (2 docs)
│   ├── api/                    # Documentação de APIs
│   ├── components/             # Docs de componentes
│   ├── database/               # Docs de banco
│   ├── deployment/             # Docs de deploy
│   ├── development/            # Docs de desenvolvimento
│   ├── mission-control/        # Docs do Mission Control
│   └── README_STRUCTURE.md     # Guia da documentação
│
├── public/                     # Assets estáticos
├── supabase/                   # Migrações do Supabase
├── .env.example                # Template de variáveis
├── next.config.js              # Config Next.js
├── tailwind.config.ts          # Config Tailwind
└── package.json                # Dependências
```

### 📊 Organização Recente (Janeiro 2025)

O projeto foi completamente reorganizado para melhor manutenibilidade:
- ✅ **68 arquivos** movidos da raiz para pastas apropriadas
- ✅ **Scripts** organizados por categoria (teste, diagnóstico, setup)
- ✅ **SQL** separado por finalidade (setup, migrations, scripts)
- ✅ **Documentação** categorizada (features, fixes, instruções)
- ✅ **READMEs** criados para cada seção principal

Veja os guias completos:
- [`scripts/README.md`](./scripts/README.md) - Guia de scripts
- [`database/README.md`](./database/README.md) - Guia de SQL
- [`docs/README_STRUCTURE.md`](./docs/README_STRUCTURE.md) - Guia de documentação

## 🎯 Funcionalidades Implementadas

### ✅ Core
- **Kanban Visual** - 9 colunas de status
- **Drag & Drop** - Mover pedidos entre status
- **Nova Ordem** - Formulário otimizado (meta: 10s)
- **Autenticação** - Login via Supabase
- **Filtros** - Por loja, lab, status, prioridade
- **Real-time** - Updates automáticos

### ✅ UX/UI
- **Responsivo** - Mobile first
- **Loading States** - Feedback visual
- **Error Handling** - Tratamento de erros
- **Themes** - Claro/escuro (preparado)
- **Accessibility** - ARIA compliant

### ✅ Performance
- **React Query** - Cache inteligente
- **Optimistic Updates** - UI responsiva
- **Code Splitting** - Carregamento otimizado

## 🔧 Configuração do Banco

O sistema espera as seguintes tabelas principais:

```sql
-- Principais tabelas necessárias
- laboratorios (labs ópticos)
- lojas (pontos de venda)
- classes_lente (tipos de lente)
- pedidos (pedidos principais)
- usuarios (usuários do sistema)
- alertas (notificações)
- pedido_eventos (histórico)

-- Views necessárias
- v_pedidos_kanban (dados completos para interface)
- v_dashboard_resumo (métricas resumidas)

-- Funções necessárias
- marcar_pagamento()
- alterar_status_pedido()
- calcular_sla_pedido()
```

## 🎨 Customização

### Cores do Sistema
As cores estão definidas em `src/lib/utils/constants.ts`:

```typescript
export const STATUS_COLORS = {
  'REGISTRADO': '#94A3B8',
  'AG_PAGAMENTO': '#F59E0B',
  'PAGO': '#10B981',
  // ... etc
}
```

### Adicionar Novo Status
1. Adicionar ao enum `StatusPedido` em `database.ts`
2. Adicionar cor em `STATUS_COLORS`
3. Adicionar label em `STATUS_LABELS`
4. Configurar transições em `ALLOWED_TRANSITIONS`

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard da Vercel
```

### Outras Plataformas
- **Netlify**: Funciona out-of-the-box
- **Railway**: Suporte nativo ao Next.js
- **Digital Ocean**: App Platform

## 🔒 Autenticação

O sistema usa Supabase Auth com:
- **Email/Senha** - Login tradicional
- **Row Level Security** - Segurança no banco
- **Roles e Permissões** - admin, gestor, operador, financeiro

### Criar Usuário de Teste
```sql
-- Inserir na tabela usuarios após criar no Supabase Auth
INSERT INTO usuarios (id, email, nome, role, permissoes, ativo)
VALUES (
  'uuid-do-usuario-supabase',
  'admin@dcl.com.br',
  'Administrador',
  'admin',
  ARRAY['admin'],
  true
);
```

## 📱 Próximas Funcionalidades

### Em Desenvolvimento
- [ ] Dashboard executivo
- [ ] Relatórios avançados  
- [ ] PWA completo
- [ ] Integração WhatsApp

### Roadmap V2
- [ ] Multi-tenant
- [ ] API externa
- [ ] Mobile app nativo
- [ ] IA para previsões

## 🐛 Troubleshooting

### Erro "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
```

### Erro de autenticação
```bash
# Verificar .env.local
# Verificar RLS policies no Supabase
# Verificar se usuario existe na tabela usuarios
```

### Erro de build
```bash
# Verificar tipos TypeScript
npm run type-check

# Build local para testar
npm run build
```

## 📞 Suporte

- **Documentação**: Ver arquivos em `/docs`
- **Tipos**: Auto-gerados do Supabase
- **Logs**: Console do navegador + Supabase Dashboard

## 🎉 Status Atual

**✅ SISTEMA FUNCIONAL!**

- Interface carregando corretamente
- Autenticação funcionando
- Estrutura completa criada
- Pronto para conectar ao banco

**Próximo passo:** Configurar variáveis de ambiente e testar com dados reais!

---

**Desenvolvido para DCL - Sistema de gestão de laboratórios ópticos** 🚀# desenrola_dcl
