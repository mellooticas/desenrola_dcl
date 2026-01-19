# 🔍 Análise: Status Real do Banco vs Código

## ❌ **PROBLEMA CRÍTICO: Desalinhamento!**

### 📊 **Status no BANCO (Supabase - Real)**

```sql
-- ENUM atual (7 valores):
'pendente'    -- Minúscula
'pago'        -- Minúscula
'producao'    -- Minúscula
'pronto'      -- Minúscula
'enviado'     -- Minúscula
'entregue'    -- Minúscula
'MONTAGEM'    -- MAIÚSCULA (inconsistente!)
```

### 💻 **Status no CÓDIGO (TypeScript)**

```typescript
// src/lib/types/database.ts (10 valores - ERRADO!)
"PENDENTE"; // ❌ Banco tem 'pendente' (minúscula)
"REGISTRADO"; // ❌ NÃO EXISTE no banco!
"AG_PAGAMENTO"; // ❌ NÃO EXISTE no banco!
"PAGO"; // ❌ Banco tem 'pago' (minúscula)
"PRODUCAO"; // ❌ Banco tem 'producao' (minúscula)
"PRONTO"; // ❌ Banco tem 'pronto' (minúscula)
"ENVIADO"; // ❌ Banco tem 'enviado' (minúscula)
"CHEGOU"; // ❌ NÃO EXISTE no banco!
"ENTREGUE"; // ❌ Banco tem 'entregue' (minúscula)
"CANCELADO"; // ❌ NÃO EXISTE no banco!
```

### 🎨 **Kanban Visual (8 colunas)**

```typescript
// src/app/kanban/page.tsx
{ id: 'PENDENTE', title: 'Pendente - DCL' },
{ id: 'REGISTRADO', title: 'Registrado' },         // ❌ não existe
{ id: 'AG_PAGAMENTO', title: 'Aguard. Pagamento' }, // ❌ não existe
{ id: 'PAGO', title: 'Pago' },
{ id: 'PRODUCAO', title: 'Em Produção no LAB' },
{ id: 'PRONTO', title: 'Lentes no DCL' },
{ id: 'ENVIADO', title: 'Montagem' },
{ id: 'CHEGOU', title: 'Na Loja' }                  // ❌ não existe
```

---

## ✅ **MAPEAMENTO CORRETO**

### Opção 1: **Manter nomes do banco (minúsculas)**

```typescript
// TypeScript
export type StatusPedido =
  | "pendente" // ✅ Existe
  | "pago" // ✅ Existe
  | "producao" // ✅ Existe
  | "pronto" // ✅ Existe
  | "enviado" // ✅ Existe
  | "entregue" // ✅ Existe
  | "MONTAGEM"; // ✅ Existe (maiúscula no banco!)
```

**Problema:** Faltam status intermediários que vocês querem!

- ❌ Não tem 'registrado'
- ❌ Não tem 'ag_pagamento'
- ❌ Não tem 'chegou'
- ❌ Não tem 'cancelado'

### Opção 2: **Adicionar novos status no banco (RECOMENDADO)**

```sql
-- Migration para adicionar status faltantes
ALTER TYPE status_pedido ADD VALUE 'registrado' BEFORE 'pago';
ALTER TYPE status_pedido ADD VALUE 'ag_pagamento' AFTER 'registrado';
ALTER TYPE status_pedido ADD VALUE 'chegou' AFTER 'enviado';
ALTER TYPE status_pedido ADD VALUE 'cancelado';

-- Resultado final (11 valores):
'pendente'
'registrado'      -- 🆕 Novo
'ag_pagamento'    -- 🆕 Novo
'pago'
'producao'
'pronto'
'enviado'
'chegou'          -- 🆕 Novo
'entregue'
'MONTAGEM'
'cancelado'       -- 🆕 Novo
```

### Opção 3: **Criar novo ENUM padronizado (IDEAL)**

```sql
-- Dropar e recriar ENUM com padrão consistente
DROP TYPE status_pedido CASCADE;

CREATE TYPE status_pedido AS ENUM (
  'pendente',      -- Aguardando DCL escolher lente (do PDV)
  'registrado',    -- Lente escolhida, aguardando pagamento
  'ag_pagamento',  -- Financeiro precisa pagar lab
  'pago',          -- Lab foi pago, pode produzir
  'producao',      -- Em fabricação no laboratório
  'pronto',        -- Lab finalizou, em trânsito
  'enviado',       -- Saiu do lab, a caminho
  'chegou',        -- Chegou no DCL/loja
  'montagem',      -- Em montagem (se não for 'MONTAGEM')
  'entregue',      -- Montagem finalizada, pronto para cliente
  'cancelado'      -- Cancelado em qualquer etapa
);

-- Recriar tabela com novo ENUM
ALTER TABLE pedidos ALTER COLUMN status TYPE status_pedido USING status::text::status_pedido;
```

---

## 🎯 **FLUXO QUE VOCÊS QUEREM (8 visíveis)**

```
pendente → registrado → ag_pagamento → pago → producao → pronto → enviado → chegou
                                                                                  ↓
                                                                              entregue
```

**Não aparece no Kanban:**

- `cancelado` (gerenciado separadamente)
- `entregue` (sai do Kanban, vai para histórico)
- `montagem` (se existir)

---

## 🚨 **PROBLEMA ATUAL: Kanban QUEBRADO!**

O Kanban está tentando filtrar por status que **NÃO EXISTEM** no banco:

```typescript
// src/app/kanban/page.tsx linha 437
.not('status', 'in', '("ENTREGUE","CANCELADO")')
// ❌ Banco tem 'entregue' (minúscula), não 'ENTREGUE' (maiúscula)!
```

**Resultado:**

- Queries retornam vazio ou erro
- Kanban não mostra pedidos
- Filtros não funcionam

---

## ✅ **SOLUÇÃO IMEDIATA**

### Passo 1: Corrigir TypeScript para minúsculas

```typescript
// src/lib/types/database.ts
export type StatusPedido =
  | "pendente"
  | "pago"
  | "producao"
  | "pronto"
  | "enviado"
  | "entregue"
  | "MONTAGEM"; // Mantém maiúscula (é assim no banco!)

// Temporariamente SEM: registrado, ag_pagamento, chegou, cancelado
```

### Passo 2: Corrigir Kanban

```typescript
// src/app/kanban/page.tsx
const visibleColumns = [
  { id: "pendente", title: "Pendente - DCL" },
  { id: "pago", title: "Pago - Pode Produzir" },
  { id: "producao", title: "Em Produção" },
  { id: "pronto", title: "Pronto" },
  { id: "enviado", title: "Enviado" },
  { id: "MONTAGEM", title: "Montagem" },
  // entregue não aparece (saiu do Kanban)
];
```

### Passo 3: Adicionar status faltantes no banco

```sql
-- Execute no Supabase:
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'registrado' BEFORE 'pago';
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'ag_pagamento' AFTER 'registrado';
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'chegou' AFTER 'enviado';
ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'cancelado';
```

### Passo 4: Atualizar pedidos existentes

```sql
-- Migrar pedidos com status inválido (se houver)
UPDATE pedidos SET status = 'pendente' WHERE status NOT IN (
  'pendente', 'registrado', 'ag_pagamento', 'pago',
  'producao', 'pronto', 'enviado', 'chegou',
  'entregue', 'MONTAGEM', 'cancelado'
);
```

---

## 📋 **CHECKLIST DE CORREÇÃO**

- [ ] 1. Executar diagnóstico no Supabase (diagnostico-status-atual.sql)
- [ ] 2. Anotar status EXATOS do banco (case-sensitive!)
- [ ] 3. Adicionar status faltantes com ALTER TYPE
- [ ] 4. Atualizar src/lib/types/database.ts (minúsculas)
- [ ] 5. Atualizar STATUS_COLORS para minúsculas
- [ ] 6. Atualizar STATUS_LABELS para minúsculas
- [ ] 7. Corrigir Kanban visibleColumns
- [ ] 8. Corrigir queries (.not('status', 'in', ...))
- [ ] 9. Testar Kanban carregamento
- [ ] 10. Testar drag & drop entre colunas

---

## 🎯 **PRÓXIMO PASSO**

**Você prefere:**

**A)** Eu executo diagnóstico e faço correção automática baseado no que encontrar?

**B)** Você executa o SQL de diagnóstico no Supabase e me passa os resultados?

**C)** Refazemos ENUM do zero com padrão consistente (requer mais tempo)?

---

**Aguardando sua decisão para prosseguir! 🚀**
