# 🚀 Desenrola DCL - Sistema de Gestão de Pedidos

Sistema Kanban para gestão de pedidos de laboratórios ópticos com interface moderna e intuitiva.

## 📊 Status do Sistema (Validado 15/09/2024)

### ✅ **Sistema 100% Operacional**
- **18 tabelas** ativas com 2.948 pedidos históricos
- **17 views** funcionando perfeitamente (performance <1.4ms)
- **APIs** conectadas e retornando dados reais
- **Dashboard** totalmente funcional

### 📈 **Métricas Atuais**
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

## 📚 Documentação Completa

**🎯 Toda a documentação detalhada está em [`/docs`](./docs/README.md)**

### 📖 Links Rápidos
- **[🚀 Início Rápido](./docs/development/developer-guide.md#início-rápido)** - Setup em 5 minutos
- **[🌐 APIs](./docs/api/)** - Documentação completa das APIs
- **[🧩 Componentes](./docs/components/)** - Guia dos componentes React
- **[🗄️ Banco de Dados](./docs/database/schema.md)** - Schema e relacionamentos
- **[🔍 Status Validação](./docs/database/status-validacao.md)** - Resultados dos testes
- **[🚀 Deploy](./docs/deployment/production.md)** - Guia de produção DCL - Sistema de Gestão de Pedidos

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
├── app/                        # Pages (Next.js 14)
│   ├── api/                    # Endpoints API
│   ├── dashboard/              # BI e analytics
│   ├── kanban/                 # Board visual
│   ├── pedidos/                # CRUD pedidos
│   ├── configuracoes/          # Settings
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Redirect para kanban
│   └── login/page.tsx          # Login
├── components/
│   ├── ui/                     # Componentes base
│   ├── kanban/                 # Componentes do Kanban
│   ├── forms/                  # Formulários
│   ├── layout/                 # Header, Sidebar, etc.
│   ├── common/                 # Componentes comuns
│   └── providers/              # Context providers
├── lib/
│   ├── supabase/               # Cliente Supabase
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # Tipos TypeScript
│   └── utils/                  # Utilitários
├── config/                     # Arquivos de configuração
│   ├── eslint.config.mjs       # Config ESLint
│   ├── postcss.config.js       # Config PostCSS
│   ├── tailwind.config.ts      # Config Tailwind
│   └── next.config.js          # Config Next.js
├── scripts/                    # Scripts utilitários
│   ├── *.py                    # Scripts Python
│   ├── *.bat                   # Scripts batch
│   └── *.sql                   # Scripts SQL
├── docs/                       # Documentação
├── .env.example                # Template de variáveis
└── package.json                # Dependências
```

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
