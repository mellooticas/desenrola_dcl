
# 🔐 Blueprint: Núcleo do Sistema (Core)

Módulo responsável pela base do sistema: autenticação, permissões, layout e navegação.

## 🎯 Objetivos
- Garantir segurança via autenticação Supabase Auth.
- Gerenciar sessões e redirecionamentos.
- Prover layout responsivo e consistente com Sidebar.
- Controlar acesso via Roles (Admin, Gerente, Vendedor).

## 🔄 Fluxo de Autenticação
1.  **Login:** `/login` - Usuário insere credenciais.
2.  **Auth:** Supabase valida e retorna JWT.
3.  **Callback:** Redirecionamento para Dashboard ou Kanban.
4.  **Middleware:** `src/middleware.ts` protege rotas `/app/*` e `/api/*`.

## 🧩 Componentes Chave
- `src/components/layout/Sidebar.tsx`: Navegação principal.
- `src/components/auth/LoginForm.tsx`: Formulário de entrada.
- `src/app/layout.tsx`: Root Layout com Providers (QueryClient, AuthContext).

## 📦 Banco de Dados (Tabelas Core)
- `auth.users` (Supabase System): Usuários registrados.
- `public.usuarios` (Mapping): Tabela espelho para metadados (Role, Loja Vinculada).
- `public.lojas`: Lojas físicas do sistema.

## 🛠️ Hooks & Libs
- `src/lib/supabase/client.ts`: Cliente Singleton para o frontend.
- `src/lib/supabase/server.ts`: Cliente SSR para API Routes e Server Actions.
- `src/lib/contexts/AuthContext.tsx` (ou similar): Gerenciamento de estado de usuário global. (Verificar existência)

## ✅ Status Atual
- Autenticação funcional.
- Estrutura de pastas `/src/app/(auth)` e `/src/app/(protected)` (Lógica implícita ou explícita).
- Layout responsivo implementado.
