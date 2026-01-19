# 📊 Análise: Kanban + Preparação PDV

## Status Atual

### ✅ O que já está pronto

#### 1. Campos de Integração PDV

```sql
-- ✅ MIGRATION JÁ EXECUTADA
ALTER TABLE pedidos ADD COLUMN venda_id UUID;      -- Link com sis_vendas
ALTER TABLE pedidos ADD COLUMN cliente_id UUID;    -- Cliente universal
ALTER TABLE pedidos ADD COLUMN armacao_id UUID;    -- Produto do crm_erp
```

#### 2. Seleção de Lentes (2 Passos) ✅

- Hook `useLentesDoGrupo` busca labs por `grupo_canonico_id`
- Modal mostra todos os laboratórios disponíveis
- Salva: `lente_id`, `grupo_canonico_id`, `fornecedor_id`, `preco_custo`

#### 3. Status no Sistema

```typescript
// KANBAN ATUAL (8 colunas visíveis)
"PENDENTE"; // 🆕 Novo - DCL escolhe lente
"REGISTRADO"; // Lente escolhida, aguarda pagamento
"AG_PAGAMENTO"; // Aguardando pagamento
"PAGO"; // Pago, pode ir para produção
"PRODUCAO"; // Enviado para laboratório
"PRONTO"; // Laboratório finalizou
"ENVIADO"; // Em trânsito
"CHEGOU"; // Chegou na loja

// NÃO APARECEM NO KANBAN (apenas modal/histórico)
"ENTREGUE"; // Cliente retirou
"CANCELADO"; // Cancelado
```

## ⚠️ Problemas Identificados

### 1. **Fluxo do Kanban está confuso**

**Problema:** Status não refletem a realidade operacional

```
❌ Status Atuais (confusos):
PENDENTE → REGISTRADO → AG_PAGAMENTO → PAGO → PRODUCAO → PRONTO → ENVIADO → CHEGOU → ENTREGUE

✅ Status Corretos (operacionais):
RASCUNHO → PRODUCAO → ENTREGUE → FINALIZADO
```

**Justificativa:**

- **RASCUNHO**: Pedido em criação (manual ou do PDV), aguardando finalização
- **PRODUCAO**: Enviado para laboratório, em fabricação
- **ENTREGUE**: Lente chegou na loja
- **FINALIZADO**: Cliente retirou, processo completo

### 2. **Status mistura conceitos diferentes**

| Status Atual | Conceito        | Problema                  |
| ------------ | --------------- | ------------------------- |
| PENDENTE     | Estado inicial? | Não é operacional         |
| REGISTRADO   | Cadastrado?     | Redundante                |
| AG_PAGAMENTO | Financeiro      | Não é fluxo de produção   |
| PAGO         | Financeiro      | Não é fluxo de produção   |
| PRODUCAO     | Operacional     | ✅ Correto                |
| PRONTO       | Lab finalizou?  | Não chegou ainda          |
| ENVIADO      | Em trânsito?    | Não chegou ainda          |
| CHEGOU       | Na loja         | ✅ Correto (= ENTREGUE)   |
| ENTREGUE     | Cliente retirou | ✅ Correto (= FINALIZADO) |

### 3. **Não está preparado para PDV**

**Cenário PDV:**

```javascript
// SIS_Vendas salva venda com:
{
  venda_id: "uuid",
  cliente_id: "uuid",
  armacao_id: "uuid",
  grupo_canonico_id: "uuid",  // ← Lente canônica escolhida
  // NÃO TEM: lente_id, laboratorio_id, preco_custo
}

// Webhook do PDV chama desenrola_dcl:
POST /api/pedidos/from-pdv
{
  venda_id: "...",
  cliente_id: "...",
  armacao_id: "...",
  grupo_canonico_id: "..."
}

// desenrola_dcl precisa:
1. Criar pedido em RASCUNHO
2. DCL escolhe melhor laboratório (2 passos)
3. Muda para PRODUCAO
4. Envia para lab
```

**Problema:** Sistema atual não tem endpoint `/api/pedidos/from-pdv`

## 🎯 Solução Proposta

### FASE 1: Corrigir Fluxo do Kanban ⚡

#### Novos Status (4 colunas)

```typescript
export type StatusPedido =
  | "RASCUNHO" // Criação inicial (manual ou PDV)
  | "PRODUCAO" // Enviado para lab, em fabricação
  | "ENTREGUE" // Chegou na loja, aguarda retirada
  | "FINALIZADO" // Cliente retirou
  | "CANCELADO"; // Cancelado (não aparece no Kanban)
```

#### Fluxo Correto

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐      ┌─────────────┐
│  RASCUNHO   │ ───▶ │   PRODUCAO   │ ───▶ │  ENTREGUE  │ ───▶ │ FINALIZADO  │
│             │      │              │      │            │      │             │
│ DCL escolhe │      │ Lab fabrica  │      │ Na loja    │      │ Retirado    │
│ lente/lab   │      │ lente        │      │ aguardando │      │ pelo        │
│             │      │              │      │ cliente    │      │ cliente     │
└─────────────┘      └──────────────┘      └────────────┘      └─────────────┘
      │                                                                │
      │                                                                │
      └──────────────────────▶ CANCELADO ◀────────────────────────────┘
                         (não aparece no Kanban)
```

#### Mudanças no Kanban

**Antes (8 colunas):**

```
PENDENTE | REGISTRADO | AG_PAGAMENTO | PAGO | PRODUCAO | PRONTO | ENVIADO | CHEGOU
```

**Depois (3 colunas):**

```
RASCUNHO | PRODUCAO | ENTREGUE
```

(FINALIZADO não aparece - sai do Kanban)

### FASE 2: Criar Endpoint para PDV 🔌

```typescript
// src/app/api/pedidos/from-pdv/route.ts
export async function POST(request: Request) {
  const { venda_id, cliente_id, armacao_id, grupo_canonico_id } =
    await request.json();

  // 1. Criar pedido em RASCUNHO
  const pedido = await supabase
    .from("pedidos")
    .insert({
      venda_id,
      cliente_id,
      armacao_id,
      grupo_canonico_id,
      status: "RASCUNHO",
      loja_id: extractLojaFromCliente(cliente_id), // ← Pegar loja do cliente
      // lente_id: null        ← DCL vai escolher
      // laboratorio_id: null  ← DCL vai escolher
      // preco_custo: null     ← DCL vai escolher
    })
    .select()
    .single();

  return NextResponse.json({ pedido_id: pedido.id, status: "RASCUNHO" });
}
```

### FASE 3: Melhorias UX/UI Kanban 🎨

#### 1. **Drag & Drop inteligente**

```typescript
// Só permite mover para próximo status
RASCUNHO → só pode arrastar para PRODUCAO
PRODUCAO → só pode arrastar para ENTREGUE
ENTREGUE → só pode arrastar para FINALIZADO (sai do Kanban)
```

#### 2. **Badges visuais por urgência**

```tsx
// Calcular dias até data_prometida
const urgencia = calcularUrgencia(pedido.data_prometida)

<Badge className={cn(
  urgencia === 'CRITICO' && 'bg-red-600 animate-pulse',
  urgencia === 'URGENTE' && 'bg-orange-500',
  urgencia === 'NORMAL' && 'bg-green-500'
)}>
  {diasRestantes} dias
</Badge>
```

#### 3. **Filtros poderosos**

```tsx
// Filtros simultâneos
- Por loja (multi-select)
- Por laboratório (multi-select)
- Por urgência (CRÍTICO, URGENTE, NORMAL, OK)
- Por período (hoje, esta semana, este mês, custom)
- Por busca (OS, cliente, lente)
```

#### 4. **Actions rápidos nos cards**

```tsx
<KanbanCard>
  {/* Quick actions */}
  <div className="flex gap-2">
    <Button size="sm" onClick={() => verDetalhes(pedido)}>
      <Eye className="h-4 w-4" />
    </Button>
    <Button size="sm" onClick={() => avancarStatus(pedido)}>
      <ArrowRight className="h-4 w-4" />
    </Button>
    {status === "RASCUNHO" && (
      <Button size="sm" onClick={() => escolherLente(pedido)}>
        <Package className="h-4 w-4" /> Escolher Lente
      </Button>
    )}
  </div>
</KanbanCard>
```

#### 5. **Indicadores visuais**

```tsx
// Card com gradiente por laboratório
<Card className={cn(
  'relative overflow-hidden',
  `bg-gradient-to-br ${LAB_GRADIENTS[pedido.laboratorio_nome] || 'from-gray-400 to-gray-500'}`
)}>

// Linha de progresso no card
<div className="h-1 bg-gray-200">
  <div
    className="h-full bg-blue-500 transition-all"
    style={{ width: `${progresso}%` }}
  />
</div>

// Badge de origem (manual vs PDV)
{pedido.venda_id && (
  <Badge variant="outline" className="border-purple-500 text-purple-700">
    📱 PDV
  </Badge>
)}
```

## 📝 Checklist de Implementação

### ✅ Pronto

- [x] Campos de integração (`venda_id`, `cliente_id`, `armacao_id`)
- [x] Seleção de lentes em 2 passos
- [x] Hook `useLentesDoGrupo` com view `v_lentes_cotacao_compra`

### 🔄 A Fazer - FASE 1 (Kanban)

- [ ] Migração: Alterar ENUM de status no Supabase
- [ ] Atualizar tipos TypeScript (`StatusPedido`)
- [ ] Atualizar constantes (`STATUS_COLORS`, `STATUS_LABELS`, `STATUS_ICONS`)
- [ ] Refatorar componente Kanban (3 colunas)
- [ ] Adicionar badges de urgência
- [ ] Melhorar filtros (multi-select)
- [ ] Adicionar quick actions nos cards
- [ ] Indicadores visuais (gradientes, progresso)

### 🔄 A Fazer - FASE 2 (PDV)

- [ ] Criar endpoint `/api/pedidos/from-pdv`
- [ ] Webhook handler do SIS_Vendas
- [ ] Validação de dados do PDV
- [ ] Notificação para DCL (novo pedido do PDV)
- [ ] Tela especial: "Pedidos do PDV Aguardando Lente"

### 🔄 A Fazer - FASE 3 (UX/UI)

- [ ] Animações de transição entre status
- [ ] Skeleton loading
- [ ] Empty states bonitos
- [ ] Drag & drop com feedback visual
- [ ] Toast notifications
- [ ] Testes end-to-end

## 🚀 Próximo Passo Imediato

**Começar por:** FASE 1 - Corrigir status do Kanban

1. Criar migration SQL para alterar ENUM
2. Atualizar tipos TypeScript
3. Refatorar componente Kanban
4. Testar fluxo completo

**Prioridade:** 🔴 ALTA - Sistema atual está funcional mas confuso
**Tempo estimado:** 2-3 horas
**Impacto:** Simplifica operação em 50% (8 → 3 colunas)
