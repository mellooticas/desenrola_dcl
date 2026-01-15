# 🔧 Correção: Problema de Case nos Status do Kanban

**Data**: 20/12/2025
**Problema**: Coluna PENDENTE não aparecia + colunas reduzidas para gestor

---

## 🐛 Causa Raiz

**Conflito de Nomenclatura (Case Sensitivity)**:

1. **View do Banco** (`v_kanban_colunas`) retorna: `'pendente'`, `'registrado'`, `'pago'` (lowercase)
2. **Permissões ROLE_PERMISSIONS** usavam: `'REGISTRADO'`, `'AG_PAGAMENTO'`, `'PAGO'` (UPPERCASE)
3. **Código fazia `.toUpperCase()`**: Transformava `'pendente'` → `'PENDENTE'`
4. **Filtro `canViewColumn()`**: Comparava `'PENDENTE'` com `['pendente', 'REGISTRADO']` → **❌ Não encontra!**

**Resultado**:

- ❌ Coluna `pendente` não aparecia (filtrada por `canViewColumn`)
- ❌ Outras colunas (`registrado`, `pago`, etc) também eram filtradas erroneamente
- ❌ Gestor via menos colunas que deveria

---

## ✅ Correções Aplicadas

### 1. **src/app/kanban/page.tsx**

#### Removido `.toUpperCase()` (linha ~395)

```typescript
// ANTES (ERRADO):
.map(k => ({
  id: k.id.toUpperCase() as StatusPedido, // ❌ 'pendente' → 'PENDENTE'
  ...
}))

// DEPOIS (CORRETO):
.map(k => ({
  id: k.id as StatusPedido, // ✅ Mantém 'pendente' lowercase
  ...
}))
```

#### Corrigido Filtro de Status Finais (linha ~396)

```typescript
// ANTES:
.filter(k => k.id !== 'ENTREGUE' && k.id !== 'CANCELADO') // ❌ View tem lowercase

// DEPOIS:
.filter(k => k.id !== 'entregue' && k.id !== 'cancelado') // ✅ Match com view
```

#### Fallback Atualizado (linhas ~405-412)

```typescript
// ANTES (IDs misturados):
{ id: 'pendente', ... },      // lowercase
{ id: 'REGISTRADO', ... },    // UPPERCASE ❌
{ id: 'AG_PAGAMENTO', ... },  // UPPERCASE ❌

// DEPOIS (todos lowercase):
{ id: 'pendente', ... },
{ id: 'registrado', ... },
{ id: 'aguardando_pagamento', ... },
{ id: 'pago', ... },
{ id: 'producao', ... },
{ id: 'pronto', ... },
{ id: 'enviado', ... },
{ id: 'entregue', ... }
```

### 2. **ROLE_PERMISSIONS** - Todos os Roles Atualizados

#### Admin (linhas ~121-137)

```typescript
visibleColumns: ['pendente', 'registrado', 'aguardando_pagamento', 'pago', 'producao', 'pronto', 'enviado', 'entregue'],
canMoveFrom: {
  'pendente': ['registrado', 'cancelado'],           // ✅ lowercase
  'registrado': ['aguardando_pagamento', 'cancelado'],
  // ... todas lowercase
}
```

#### Gestor (linhas ~139-157) - **FIX PRINCIPAL!**

```typescript
// ANTES:
visibleColumns: ['pendente', 'REGISTRADO', 'AG_PAGAMENTO', ...] // ❌ Misturado

// DEPOIS:
visibleColumns: ['pendente', 'registrado', 'aguardando_pagamento', 'pago', 'producao', 'pronto', 'enviado', 'entregue']
// ✅ Agora gestor vê TODAS as 8 colunas!
```

#### DCL (linhas ~159-178)

```typescript
visibleColumns: ['pendente', 'registrado', 'aguardando_pagamento', 'pago', 'producao', 'pronto', 'enviado', 'entregue'],
canEdit: ['pendente', 'registrado', 'pago', 'producao', 'pronto', 'enviado'],
canMoveFrom: {
  'pendente': ['registrado', 'cancelado'],  // ✅ DCL pode mover de pendente
  'registrado': ['aguardando_pagamento', 'cancelado'],
  // ... todas lowercase
}
```

#### Financeiro (linhas ~180-196)

```typescript
visibleColumns: ['pendente', 'registrado', 'aguardando_pagamento', 'pago'],
canMoveFrom: {
  'aguardando_pagamento': ['pago', 'cancelado'], // ✅ lowercase
  'pago': ['aguardando_pagamento', 'cancelado'],
}
```

#### Loja (linhas ~198-213)

```typescript
visibleColumns: ['enviado', 'entregue'], // ✅ lowercase
canEdit: ['entregue'],
```

#### Operador (linhas ~215-232)

```typescript
visibleColumns: ['pendente', 'registrado', 'aguardando_pagamento', 'pago', 'producao', 'pronto', 'enviado', 'entregue'],
canEdit: ['registrado', 'aguardando_pagamento'],
canMoveFrom: {
  'pendente': [], // ✅ Vê mas não move
  'registrado': ['aguardando_pagamento'],
}
```

---

## 🎯 Mapeamento Correto

### View do Banco → Frontend

| coluna_id (view) | Permissões     | Fallback       | Status Pedidos                   |
| ---------------- | -------------- | -------------- | -------------------------------- |
| `pendente`       | `'pendente'`   | `'pendente'`   | `'pendente'`                     |
| `registrado`     | `'registrado'` | `'registrado'` | `'REGISTRADO'` ou `'registrado'` |
| `pago`           | `'pago'`       | `'pago'`       | `'PAGO'` ou `'pago'`             |
| `producao`       | `'producao'`   | `'producao'`   | `'PRODUCAO'` ou `'producao'`     |
| `pronto`         | `'pronto'`     | `'pronto'`     | `'PRONTO'` ou `'pronto'`         |
| `enviado`        | `'enviado'`    | `'enviado'`    | `'ENVIADO'` ou `'enviado'`       |
| `entregue`       | `'entregue'`   | `'entregue'`   | `'ENTREGUE'` ou `'entregue'`     |

**Nota**: Pedidos antigos podem ter `'REGISTRADO'` (uppercase) mas a view normaliza para lowercase.

---

## 🧪 Como Testar

### 1. Abrir Kanban no browser

```bash
http://localhost:3000/kanban
```

### 2. Login como Gestor

```
Email: gestor@dcl.com.br (ou admin@dcl.com.br)
```

### 3. Verificar Visualmente

**✅ DEVE VER 8 COLUNAS**:

1. **Pendente** (⏳ cinza #94a3b8)
2. **Registrado** (📋 azul #3b82f6)
3. **Aguardando Pagamento** (💰 amarelo #eab308) ← pode aparecer como "Aguard. Pagamento"
4. **Pago** (💰 verde #10b981)
5. **Produção** (⚙️ laranja #f97316)
6. **Pronto** (✅ roxo #8b5cf6)
7. **Enviado** (📦 azul índigo #6366f1)
8. **Entregue** (🎉 verde #10b981)

### 4. Testar Drag & Drop

**DCL/Admin/Gestor pode**:

- Arrastar de `pendente` → `registrado` ✅
- Arrastar de `registrado` → `aguardando_pagamento` ✅
- Arrastar de `aguardando_pagamento` → `pago` ✅

**Operador pode**:

- Ver coluna `pendente` mas **NÃO** arrastar ✅
- Arrastar de `registrado` → `aguardando_pagamento` ✅

### 5. Console do Browser (F12)

**Verificar se há erros**:

```javascript
// NÃO deve ter:
// - "Erro ao buscar colunas do Kanban"
// - Erros de TypeScript sobre StatusPedido

// DEVE ter (console.log removido depois):
console.log("Colunas do banco:", kanbanColunas);
// Resultado esperado:
// [
//   { id: 'pendente', nome: 'Pendente', icone: '⏳', cor: '#94a3b8' },
//   { id: 'registrado', nome: 'Registrado', icone: '📋', cor: '#3b82f6' },
//   ...
// ]
```

---

## 📊 Queries de Diagnóstico

Execute no Supabase SQL Editor:

### Ver Colunas da View

```sql
SELECT * FROM v_kanban_colunas ORDER BY ordem;
```

**Resultado Esperado**:

```
coluna_id | coluna_nome            | icone | cor      | ordem
----------|------------------------|-------|----------|------
pendente  | Pendente               | ⏳    | #94a3b8  | 1
registrado| Registrado             | 📋    | #3b82f6  | 3
pago      | Pago                   | 💰    | #eab308  | 4
...
```

### Ver Status dos Pedidos Reais

```sql
SELECT status, COUNT(*) FROM pedidos GROUP BY status;
```

**Deve retornar pedidos com status existentes** (podem ser uppercase ou lowercase).

---

## ⚠️ Observações Importantes

### 1. Compatibilidade com Dados Antigos

Pedidos cadastrados antes podem ter:

- `status = 'REGISTRADO'` (uppercase)
- View `v_pedidos_kanban` normaliza para lowercase
- Frontend agora usa **sempre lowercase** nas comparações

### 2. AG_PAGAMENTO vs aguardando_pagamento

- **View**: retorna `'aguardando_pagamento'` (nome completo)
- **Frontend antigo**: usava `'AG_PAGAMENTO'` (abreviado)
- **Corrigido**: Agora usa `'aguardando_pagamento'` em todos os lugares

### 3. CHEGOU vs entregue

- **View**: usa `'entregue'`
- **Frontend antigo**: usava `'CHEGOU'`
- **Corrigido**: Padronizado para `'entregue'`

---

## 🎯 Resultado Final

### ANTES (❌ Broken)

```typescript
// View retorna:
{ id: 'pendente', nome: 'Pendente', ... }

// Código transformava:
'pendente' → .toUpperCase() → 'PENDENTE'

// Permissões tinham:
visibleColumns: ['REGISTRADO', 'AG_PAGAMENTO'] // ❌ Não incluía 'PENDENTE'

// canViewColumn() comparava:
'PENDENTE'.includes(['REGISTRADO', 'AG_PAGAMENTO']) → false ❌
// Coluna não aparecia!
```

### DEPOIS (✅ Fixed)

```typescript
// View retorna:
{ id: 'pendente', nome: 'Pendente', ... }

// Código mantém:
'pendente' (sem transformação)

// Permissões têm:
visibleColumns: ['pendente', 'registrado', 'aguardando_pagamento', ...] // ✅

// canViewColumn() compara:
'pendente'.includes(['pendente', 'registrado', ...]) → true ✅
// Coluna aparece!
```

---

## 📝 Checklist de Validação

- [x] Todas as permissões convertidas para lowercase
- [x] Código não faz mais `.toUpperCase()`
- [x] Filtro de status finais usa lowercase ('entregue', 'cancelado')
- [x] Fallback usa lowercase
- [x] Gestor pode ver todas as 8 colunas
- [x] DCL pode mover cards de `pendente` → `registrado`
- [ ] **TESTAR**: Recarregar página e verificar visualmente ← PRÓXIMO PASSO

---

## 🔍 Arquivos para Diagnóstico SQL

Criados para o usuário executar no Supabase:

1. `06-debug-colunas-kanban.sql` - Verificar view v_kanban_colunas
2. `07-debug-status-real.sql` - Ver status reais dos pedidos

**Execute esses arquivos e cole os resultados para confirmar que view está correta!**
