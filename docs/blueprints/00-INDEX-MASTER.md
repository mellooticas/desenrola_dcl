
# 🏗️ Índice Mestre: Sistema Desenrola DCL

Este documento serve como mapa central para a documentação técnica (Blueprints) de cada módulo do sistema Desenrola DCL.

## 🗺️ Mapa de Módulos

| Módulo | Blueprint | Descrição | Status |
| :--- | :--- | :--- | :--- |
| **Núcleo** | [01-CORE-SISTEMA.md](./01-CORE-SISTEMA.md) | Autenticação, Roles, Estrutura Base e Navegação. | ✅ Docs |
| **Pedidos & Kanban** | [02-GESTAO-PEDIDOS.md](./02-GESTAO-PEDIDOS.md) | Fluxo de Ordem de Serviço, Kanban Visual, SLA. | ✅ Docs |
| **Catálogo Lentes** | [03-CATALOGO-LENTES.md](./03-CATALOGO-LENTES.md) | Integração Dual-Database (Best Lens), Seleção Inteligente. | ✅ Docs |
| **CRM & Clientes** | [05-CRM-CLIENTES.md](./05-CRM-CLIENTES.md) | Histórico de Pedidos, Dados de Clientes, Contatos. | 🚧 Em Progresso |
| **Administração** | [07-ADMIN-CONFIG.md](./07-ADMIN-CONFIG.md) | Gestão de Lojas, Laboratórios, Usuários. | ✅ Docs |

| **Financeiro & Pagamentos** | [04-FINANCEIRO.md](./04-FINANCEIRO.md) | Confirmação PIX, Caixa, Relatórios de Vendas. | 🚧 Em Progresso |
| **Notificações & Alertas** | [08-ALERTA-NOTIFICACOES.md](./08-ALERTA-NOTIFICACOES.md) | Alertas de SLA, Notificações via WhatsApp (Mock). | 🚧 Em Progresso |

## 🏗️ Arquitetura Geral

O sistema utiliza uma arquitetura moderna baseada em **Next.js 14** (App Router) e **Supabase**.

### 🛠️ Tech Stack Principal
- **Frontend:** Next.js, React, Tailwind CSS, Shadcn/UI, Lucide Icons.
- **State Management:** React Query (Server State), Zustand (Client State).
- **Backend/DB:** Supabase (PostgreSQL), Edge Functions (API Routes).
- **Integrações:** Best Lens Catalog (Banco Externo via Supabase Client Dedicado).

### 📂 Estrutura de Diretórios Chave
- `/src/app`: Rotas e Páginas (Kanban, Pedidos, Dashboard).
- `/src/components`: Blocos de UI (Forms, Cards, Modais).
- `/src/lib/supabase`: Clientes de conexão (DCL + Lentes).
- `/src/lib/hooks`: Lógica de negócios encapsulada (useLentes, usePedidos).

## 📚 Referências Técnicas & Legacy

Documentação técnica detalhada e histórica (dumps de estrutura e especificações antigas).

*   [Estrutura Completa do Banco (Dump)](./BLUEPRINT_COMPLETO_BANCO.md)
*   [Especificação de Compras](./BLUEPRINT_DCL_COMPRAS.md)
*   [Integração Técnica Banco de Lentes](./INTEGRACAO_BANCO_LENTES.md)
*   [Especificação Slug Pedidos (Draft)](./BLUEPRINT-SLUG-PEDIDOS.md)
*   [Resumo Frontend Kanban](./05-resumo-frontend-kanban.md)
