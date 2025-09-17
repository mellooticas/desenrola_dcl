# 📚 Documentação Desenrola DCL

Bem-vindo à documentação completa do sistema **Desenrola DCL** - Sistema de Gestão de Pedidos para Óticas com Dashboard BI.

## 📖 Índice Geral

### 🚀 [Início Rápido](./development/quick-start.md)
- Configuração do ambiente
- Primeiro deploy
- Login e acesso

### 🏗️ [Desenvolvimento](./development/)
- **[Guia do Desenvolvedor](./development/developer-guide.md)** - Setup completo do ambiente
- **[Estrutura do Projeto](./development/project-structure.md)** - Organização de pastas e arquivos
- **[Convenções de Código](./development/coding-standards.md)** - Padrões e boas práticas
- **[Contribuição](./development/contributing.md)** - Como contribuir com o projeto

### 🌐 [APIs](./api/)
- **[Autenticação](./api/auth.md)** - Login, logout e validação
- **[Pedidos](./api/pedidos.md)** - CRUD de pedidos e ações
- **[Dashboard](./api/dashboard.md)** - KPIs, métricas e analytics
- **[Kanban](./api/kanban.md)** - Board visual e drag & drop
- **[Configurações](./api/configuracoes.md)** - Lojas, labs, classes

### 🧩 [Componentes](./components/)
- **[UI Components](./components/ui.md)** - Botões, inputs, cards
- **[Forms](./components/forms.md)** - Formulários e validações
- **[Layout](./components/layout.md)** - Header, sidebar, navigation
- **[Dashboard](./components/dashboard.md)** - Gráficos e métricas
- **[Kanban](./components/kanban.md)** - Board, cards, colunas

### 🗄️ [Banco de Dados](./database/)
- **[Schema](./database/schema.md)** - Tabelas e relacionamentos
- **[Migrations](./database/migrations.md)** - Versionamento do banco
- **[Views](./database/views.md)** - Views para relatórios
- **[Procedures](./database/procedures.md)** - Stored procedures

### 🚀 [Deploy](./deployment/)
- **[Produção](./deployment/production.md)** - Deploy em produção
- **[Vercel](./deployment/vercel.md)** - Deploy na Vercel
- **[Supabase](./deployment/supabase.md)** - Configuração do banco
- **[Variáveis de Ambiente](./deployment/environment.md)** - Configuração .env

### 🔐 [Segurança](./security/)
- **[Autenticação](./security/authentication.md)** - Sistema de login
- **[Permissões](./security/permissions.md)** - Controle de acesso
- **[Senhas](./security/senhas-reais-descobertas.md)** - Credenciais do sistema

## 🎯 Funcionalidades Principais

### ✅ **Sistema Kanban**
- 9 colunas de status personalizáveis
- Drag & drop entre colunas
- Filtros avançados (loja, lab, prioridade)
- Updates em tempo real

### ✅ **Dashboard BI**
- KPIs financeiros e operacionais
- Gráficos interativos
- Ranking de laboratórios
- Alertas automáticos

### ✅ **Gestão de Pedidos**
- CRUD completo
- Timeline de eventos
- Observações e anexos
- Relatórios customizados

### ✅ **Autenticação**
- Login seguro com BCrypt
- Controle de sessão
- Diferentes níveis de acesso

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel
- **State**: Zustand, React Query

## 📊 Métricas do Projeto

- **Componentes**: 50+ componentes React reutilizáveis
- **APIs**: 30+ endpoints documentados
- **Telas**: 15+ páginas funcionais
- **Tabelas**: 20+ tabelas no banco
- **Usuários**: 4 perfis de acesso

## 🔗 Links Úteis

- [Repositório GitHub](https://github.com/mellooticas/desenrola_dcl)
- [Deploy Produção](https://desenrola-dcl.vercel.app)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Figma Design System](link-do-figma)

## 📝 Última Atualização

**Data**: 15 de setembro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Produção