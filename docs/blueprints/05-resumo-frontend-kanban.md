# 🎯 Resumo - Frontend Kanban Atualizado com Pendente

**Data**: 2024
**Status**: ✅ Concluído - Coluna PENDENTE agora aparece no Kanban

---

## 📋 O Que Foi Feito

### 1. **src/app/kanban/page.tsx** (Componente Principal)

#### ✅ Busca Dinâmica de Colunas

- **Adicionado**: `useState` para `kanbanColunas` (busca do banco)
- **Adicionado**: `useEffect` que busca da view `v_kanban_colunas`
- **Modificado**: `visibleColumns` useMemo agora:
  - **PRIORIDADE 1**: Usa colunas do banco quando disponível
  - **FALLBACK**: Colunas hardcoded se view não existir
  - **Inclui**: Status `'pendente'` em ambos os casos

```typescript
// Busca do banco (ordem 1)
const { data } = await supabase
  .from('v_kanban_colunas')
  .select('*')
  .order('ordem')

// Fallback hardcoded (ordem 2)
const baseColumns: KanbanColumn[] = [
  { id: 'pendente', title: 'Pendente', color: '#94a3b8', pedidos: [] }, // 🆕
  { id: 'REGISTRADO', title: 'Registrado', ... },
  // ... restante
]
```

#### ✅ Ícones e Cores

- **Adicionado** `STATUS_ICONS['pendente'] = Clock` (⏱️)
- **Adicionado** `STATUS_GRADIENTS['pendente'] = 'from-slate-400 to-slate-500'` (cinza neutro para análise)

#### ✅ Permissões Atualizadas

Todos os roles agora veem/interagem com `'pendente'`:

| Role           | Pode Ver? | Pode Editar? | Pode Mover?                        |
| -------------- | --------- | ------------ | ---------------------------------- |
| **admin**      | ✅        | ✅           | ✅ pendente → registrado/cancelado |
| **gestor**     | ✅        | ✅           | ✅ pendente → registrado/cancelado |
| **dcl**        | ✅        | ✅           | ✅ pendente → registrado/cancelado |
| **financeiro** | ✅        | ❌           | ❌ (só visualiza)                  |
| **operador**   | ✅        | ❌           | ❌ (só visualiza)                  |
| **loja**       | ❌        | ❌           | ❌ (não vê)                        |

**Regra de Negócio**: DCL escolhe lente em `pendente` → move para `registrado` com lab escolhido

---

### 2. **src/lib/utils/constants.ts** (Constantes Globais)

#### ✅ STATUS_COLORS

```typescript
'pendente': '#94a3b8',  // 🆕 Slate 400 - DCL analisa receita
```

#### ✅ STATUS_LABELS

```typescript
'pendente': 'Pendente - Análise DCL',  // 🆕 DCL escolhe lente
```

#### ✅ KANBAN_COLUMNS (Ordem das Colunas)

```typescript
export const KANBAN_COLUMNS: StatusPedido[] = [
  "pendente", // 🆕 Primeira coluna (ordem 1)
  "REGISTRADO",
  "AG_PAGAMENTO",
  // ...
];
```

#### ✅ ALLOWED_TRANSITIONS (Regras de Movimentação)

```typescript
'pendente': ['REGISTRADO', 'CANCELADO'],  // 🆕 DCL escolhe lente → registra
```

---

## 🎨 Como Funciona Agora

### Fluxo Visual no Kanban

```
┌─────────────┐      ┌──────────────┐      ┌───────────────┐
│  PENDENTE   │ ───► │  REGISTRADO  │ ───► │ AG_PAGAMENTO  │ ───► ...
│  ⏱️ Análise │      │  📋 Com Lab  │      │   💰 Pagar    │
└─────────────┘      └──────────────┘      └───────────────┘
     Cinza                Azul                   Amarelo
   #94a3b8              #3b82f6                 #f59e0b
```

### Ordem de Prioridade das Colunas

1. **Busca do Banco** (`v_kanban_colunas`):

   - Se view existe → usa campos: `coluna_id`, `coluna_nome`, `icone`, `cor`, `ordem`
   - Flexível: admin pode adicionar novas colunas no futuro sem code deploy

2. **Fallback Hardcoded**:
   - Se view não existe (erro, banco indisponível) → usa array fixo
   - Garante que UI nunca quebra

---

## 🔐 Permissões Detalhadas

### DCL (Principal Usuário de PENDENTE)

```typescript
'dcl': {
  visibleColumns: ['pendente', 'REGISTRADO', ...], // Vê tudo
  canEdit: ['pendente', 'REGISTRADO', ...],        // Pode editar pendente
  canMoveFrom: {
    'pendente': ['REGISTRADO', 'CANCELADO'],       // Pode mover para registrado
    'REGISTRADO': ['AG_PAGAMENTO', 'CANCELADO'],   // E continuar fluxo
  }
}
```

**Caso de Uso**:

1. Operador cria pedido → cai em `pendente` (sem lab escolhido)
2. DCL analisa receita → escolhe lente do catálogo
3. DCL arrasta card para `REGISTRADO` → laboratorio_id definido automaticamente
4. Pedido continua no fluxo normal (AG_PAGAMENTO → PAGO → ...)

---

## 🧪 Como Testar Localmente

### 1. Abra o servidor local

```bash
npm run dev
# http://localhost:3000/kanban
```

### 2. Login como DCL

```
Email: dcl@oticastatymello.com.br
Senha: [senha do sistema]
```

### 3. Verificações Visuais

**✅ Coluna PENDENTE aparece?**

- Deve ser a **primeira coluna** do Kanban
- Cor: **Cinza claro** (#94a3b8)
- Ícone: **⏱️ Clock**

**✅ Pode arrastar cards?**

- DCL pode arrastar de `pendente` → `registrado`
- Outros roles (financeiro, operador) **não podem** mover cards de pendente

**✅ Fallback funciona?**

- Abra Network tab do DevTools
- Se query `v_kanban_colunas` falhar → colunas hardcoded aparecem mesmo assim

---

## 📊 Dados do Banco

### View v_kanban_colunas

```sql
SELECT * FROM v_kanban_colunas ORDER BY ordem;

coluna_id     | coluna_nome            | icone | cor       | ordem
--------------|-----------------------|-------|-----------|-------
pendente      | Pendente - Análise DCL | ⏳    | #94a3b8   | 1
registrado    | Registrado            | 📋    | #3b82f6   | 2
pago          | Pago                  | 💰    | #eab308   | 3
producao      | Em Produção           | ⚙️     | #f97316   | 4
pronto        | Pronto                | ✅    | #8b5cf6   | 5
enviado       | Enviado               | 📦    | #6366f1   | 6
entregue      | Entregue              | 🎉    | #10b981   | 8
```

**Nota**: Coluna `aguardando_pagamento` também existe na view (ordem 3) mas frontend ainda usa nome antigo `AG_PAGAMENTO` por compatibilidade.

---

## 🎯 Próximos Passos (Não Implementados Ainda)

### 1. **Exibir Campos de Lente nos Cards**

- Arquivo: `src/components/kanban/KanbanCard.tsx` ou `KanbanCardModern.tsx`
- Mostrar: `nome_lente`, `badge_margem`, `qtd_tratamentos`
- Condição: `usa_catalogo_lentes = true`

### 2. **Campo Editável numero_pedido_laboratorio**

- Quando: `pode_editar_numero_lab = true` (status pendente/registrado)
- Component: Input no drawer de detalhes do pedido
- Validação: Não vazio ao mover para AG_PAGAMENTO

### 3. **Componente Seletor de Lentes (FASE 2)**

- Arquivo novo: `src/components/lentes/SeletorLentesReceita.tsx`
- Funcionalidade: DCL escolhe lente baseado em receita
- Integração: Abre modal ao clicar em card de `pendente`

---

## ✅ Status Final

| Item                   | Status | Arquivo                                                 |
| ---------------------- | ------ | ------------------------------------------------------- |
| Busca colunas do banco | ✅     | [page.tsx](../../../src/app/kanban/page.tsx#L361)       |
| Fallback hardcoded     | ✅     | [page.tsx](../../../src/app/kanban/page.tsx#L408)       |
| Ícone Clock            | ✅     | [page.tsx](../../../src/app/kanban/page.tsx#L78)        |
| Cor #94a3b8            | ✅     | [constants.ts](../../../src/lib/utils/constants.ts#L5)  |
| Permissões DCL         | ✅     | [page.tsx](../../../src/app/kanban/page.tsx#L164)       |
| Transições             | ✅     | [constants.ts](../../../src/lib/utils/constants.ts#L63) |

**Resultado**: Coluna PENDENTE funcional, visível para roles corretos, com permissões de movimentação configuradas!

---

## 🐛 Troubleshooting

### Coluna não aparece?

1. Verifica console do browser (F12) → aba Console
2. Procura por erro: `Erro ao buscar colunas do Kanban`
3. Se erro: frontend usa fallback hardcoded (coluna ainda deve aparecer)

### DCL não consegue mover card?

1. Verifica role do usuário logado: `localStorage.getItem('userRole')`
2. Role deve ser `'dcl'`, `'gestor'` ou `'admin'`
3. Status atual do card deve ser `'pendente'`

### Card sumiu depois de mover?

- Normal! Quando move de `pendente` → `registrado`:
  - Backend atualiza: `status = 'registrado'`
  - Card reaparece na coluna `REGISTRADO`
  - Se não aparecer: recarrega página (F5)
