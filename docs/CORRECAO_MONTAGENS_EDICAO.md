# 🔧 Correções Aplicadas - Montagens e Edição de Pedidos

**Data:** 15 de janeiro de 2026  
**Problemas Identificados:** 2  
**Status:** ✅ Correções aplicadas, aguardando execução do SQL

---

## 📋 Problemas Identificados

### 1️⃣ Módulo de Montagens - Acesso do Role Financeiro

**Status:** ✅ Corrigido

**Problema:**

- Usuários com role "financeiro" não tinham acesso ao módulo de montagens
- Middleware não incluía a rota `/montagens` nas permissões

**Análise:**

- ✅ RLS policies das views de montagens: OK (já configuradas)
- ✅ Permissões das views: OK (authenticated tem SELECT)
- ❌ Middleware: faltava adicionar `/montagens` às rotas protegidas

**Correção Aplicada:**

- Atualizado `src/middleware.ts`:
  - Adicionada rota `/montagens` em `ROUTE_PERMISSIONS` com roles: `['gestor', 'dcl', 'financeiro', 'demo_viewer']`
  - Adicionada rota `/montagens` em `protectedRoutes`

---

### 2️⃣ Detalhes do Pedido - Edição e Montador

#### 2.1 Edição Não Funcionando

**Status:** ✅ Corrigido (SQL precisa ser executado)

**Problema:**

- Página de edição de pedidos não estava salvando as alterações
- Possível problema com RLS policies de UPDATE

**Análise:**

- Encontrado arquivo `database/migrations/fix-rls-update-definitivo.sql` com policy correta
- Policy permite UPDATE para:
  - Usuários da mesma loja
  - Gestores
  - Usuários do laboratório vinculado

**Correção Aplicada:**

- Criado `database/fix-montagens-e-edicao-pedidos.sql` com:
  - DROP das policies antigas de UPDATE
  - Criação de nova policy incluindo roles: `'gestor', 'dcl', 'financeiro'`
  - Policy aplicada tanto em USING quanto em WITH CHECK

---

#### 2.2 Montador Não Aparece nos Detalhes

**Status:** ✅ Corrigido (SQL precisa ser executado)

**Problema:**

- Informações do montador não aparecem na página de detalhes do pedido
- View `v_pedidos_kanban` não estava fazendo JOIN com a tabela `montadores`

**Análise:**

```sql
-- ❌ ANTES: View sem dados do montador
CREATE VIEW v_pedidos_kanban AS
SELECT
  p.*,
  l.nome as loja_nome,
  lab.nome as laboratorio_nome,
  cl.nome as classe_nome,
  -- Faltavam campos do montador
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id;
-- ❌ Faltava: LEFT JOIN montadores m ON p.montador_id = m.id
```

**Correção Aplicada:**

```sql
-- ✅ DEPOIS: View com dados do montador
CREATE VIEW v_pedidos_kanban AS
SELECT
  p.*,
  l.nome as loja_nome,
  lab.nome as laboratorio_nome,
  cl.nome as classe_nome,
  -- ✨ NOVO: Dados do montador
  m.nome as montador_nome,
  m.tipo as montador_tipo,
  m.local_trabalho as montador_local,
  m.contato as montador_contato,
  ...
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
LEFT JOIN laboratorios lab ON p.laboratorio_id = lab.id
LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
LEFT JOIN montadores m ON p.montador_id = m.id; -- ✅ Adicionado
```

---

## 📁 Arquivos Modificados

### 1. `src/middleware.ts`

```typescript
// ANTES
const ROUTE_PERMISSIONS = {
  "/dashboard": ["gestor", "financeiro", "demo_viewer"],
  "/kanban": ["gestor", "dcl", "financeiro", "loja", "demo_viewer"],
  "/alertas": ["gestor", "dcl", "demo_viewer"],
  "/pedidos": ["gestor", "dcl", "financeiro", "loja", "demo_viewer"],
  "/configuracoes": ["gestor"],
};

// DEPOIS
const ROUTE_PERMISSIONS = {
  "/dashboard": ["gestor", "financeiro", "demo_viewer"],
  "/kanban": ["gestor", "dcl", "financeiro", "loja", "demo_viewer"],
  "/alertas": ["gestor", "dcl", "demo_viewer"],
  "/pedidos": ["gestor", "dcl", "financeiro", "loja", "demo_viewer"],
  "/montagens": ["gestor", "dcl", "financeiro", "demo_viewer"], // ✨ NOVO
  "/configuracoes": ["gestor"],
};
```

### 2. `database/fix-montagens-e-edicao-pedidos.sql` (NOVO)

- **Parte 1:** Atualização da view `v_pedidos_kanban` com dados do montador
- **Parte 2:** Correção das RLS policies de UPDATE para pedidos
- **Parte 3:** Garantia de permissões para views de montagens
- **Parte 4:** Verificação de policies RLS na tabela montadores
- **Validação:** Queries para testar todas as correções

---

## 🚀 Próximos Passos

### Passo 1: Executar SQL no Supabase

```bash
1. Abrir Supabase SQL Editor
2. Copiar conteúdo de: database/fix-montagens-e-edicao-pedidos.sql
3. Executar o script completo
4. Verificar se todas as validações passaram
```

### Passo 2: Testar Funcionalidades

#### Teste 1: Acesso ao Módulo de Montagens com Usuário Financeiro

1. Login com usuário role `financeiro`
2. Navegar para `/montagens`
3. ✅ Deve carregar a página normalmente
4. ✅ Deve exibir KPIs e lista de montadores

#### Teste 2: Edição de Pedidos

1. Login com qualquer usuário (gestor, dcl, financeiro, loja)
2. Acessar um pedido: `/pedidos/[id]`
3. Clicar em "Editar"
4. Modificar algum campo (ex: observações)
5. Clicar em "Salvar Alterações"
6. ✅ Deve salvar com sucesso
7. ✅ Toast de sucesso deve aparecer
8. ✅ Dados devem ser atualizados na página

#### Teste 3: Visualização do Montador nos Detalhes

1. Acessar um pedido que tenha montador vinculado
2. Ir para `/pedidos/[id]`
3. ✅ Deve aparecer card "Montador Responsável" na coluna 2
4. ✅ Deve exibir:
   - Nome do montador
   - Local de trabalho
   - Contato
5. Se pedido não tem montador, card não deve aparecer (comportamento correto)

---

## 🔍 Verificações de Segurança

### RLS Policies Aplicadas

#### Tabela: `pedidos` (UPDATE)

```sql
✅ Permite UPDATE se:
   - Usuário pertence à mesma loja DO pedido
   - OU usuário é gestor/dcl/financeiro
   - OU usuário pertence ao laboratório vinculado

✅ Impede que usuário mude loja_id para uma loja sem acesso
```

#### Tabela: `montadores` (SELECT)

```sql
✅ Permite SELECT se:
   - Montador está ativo (ativo = true)
   - OU usuário é gestor/dcl (pode ver inativos também)
```

#### Views de Montagens

```sql
✅ view_relatorio_montagens: SELECT para authenticated/anon
✅ view_kpis_montadores: SELECT para authenticated/anon
✅ view_performance_diaria_montadores: SELECT para authenticated/anon
✅ view_ranking_montadores: SELECT para authenticated/anon
✅ Todas com security_invoker = true
```

#### View Principal

```sql
✅ v_pedidos_kanban: SELECT para authenticated/anon
✅ security_invoker = true
✅ Inclui LEFT JOIN com montadores
```

---

## 📊 Campos Adicionados à View

A view `v_pedidos_kanban` agora retorna:

```typescript
interface PedidoKanban {
  // ... campos existentes ...

  // ✨ NOVOS CAMPOS DO MONTADOR
  montador_nome: string | null; // Nome do montador
  montador_tipo: string | null; // 'interno' | 'externo'
  montador_local: string | null; // Local de trabalho
  montador_contato: string | null; // Telefone/contato
}
```

Esses campos já estão sendo consumidos no frontend:

- `src/app/pedidos/[id]/page.tsx` (linha 147-150)
- Card "Montador Responsável" (linha 826-842)

---

## ✅ Checklist de Deploy

- [x] Middleware atualizado com rota `/montagens`
- [x] SQL de correção criado em `database/fix-montagens-e-edicao-pedidos.sql`
- [ ] **EXECUTAR SQL NO SUPABASE** ⚠️
- [ ] Testar acesso ao módulo de montagens (financeiro)
- [ ] Testar edição de pedidos
- [ ] Testar visualização de montador nos detalhes
- [ ] Validar queries no console do navegador
- [ ] Fazer commit das alterações

---

## 🎯 Resumo

**Total de Arquivos Criados:** 2

- `database/fix-montagens-e-edicao-pedidos.sql` (script de correção SQL)
- `docs/CORRECAO_MONTAGENS_EDICAO.md` (este documento)

**Total de Arquivos Modificados:** 1

- `src/middleware.ts` (adicionada rota `/montagens`)

**Próxima Ação Crítica:**
🔴 **EXECUTAR `database/fix-montagens-e-edicao-pedidos.sql` NO SUPABASE SQL EDITOR**

Após executar o SQL, todos os problemas estarão resolvidos! 🚀
