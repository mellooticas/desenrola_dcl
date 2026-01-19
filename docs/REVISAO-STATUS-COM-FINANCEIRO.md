# 🔄 Análise Revisada: Status Kanban com Financeiro

## ❌ Erro na Análise Anterior

**Minha suposição errada:**

> "Financeiro é burocrático, separa do operacional"

**Realidade do negócio:**

> **Pagamento à vista aos labs** = Financeiro É OPERACIONAL
>
> Laboratório só inicia produção APÓS confirmar pagamento!

## ✅ Modelo Correto: Híbrido Operacional + Financeiro

### Fluxo Real (6 status visíveis no Kanban)

```
┌──────────────┐   ┌────────────────┐   ┌───────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────┐
│  RASCUNHO    │──▶│ AG_PAGAMENTO   │──▶│   PAGO    │──▶│  PRODUCAO  │──▶│  ENTREGUE  │──▶│ FINALIZADO  │
└──────────────┘   └────────────────┘   └───────────┘   └────────────┘   └────────────┘   └─────────────┘
      │                    │                   │                │                 │                │
    📝 DCL             💰 Aguarda         ✅ Pago          🏭 Lab          📦 Loja         🎉 Cliente
  escolhe lente         pagamento       à vista =        produz           aguarda         retirou
                                        pode enviar       lente           retirada
                                        ao lab
```

### Justificativa de cada status

| Status           | Significado Operacional                    | Por que é necessário                                   |
| ---------------- | ------------------------------------------ | ------------------------------------------------------ |
| **RASCUNHO**     | Pedido em criação, DCL escolhe lente/lab   | PDV envia grupo_canonico_id, DCL define lab específico |
| **AG_PAGAMENTO** | Lente definida, aguarda pagamento          | Cliente paga (loja ou online), controla inadimplência  |
| **PAGO**         | Pagamento confirmado, pode enviar ao lab   | **CRÍTICO**: Lab só aceita pedido se pago à vista      |
| **PRODUCAO**     | Lab confirmou recebimento, está fabricando | Tracking real: lab recebeu e está produzindo           |
| **ENTREGUE**     | Lente chegou na loja, aguarda cliente      | SLA do lab concluído, aguarda retirada                 |
| **FINALIZADO**   | Cliente retirou, ciclo completo            | Saiu do Kanban, vai para histórico                     |

### Por que 6 colunas (não 3)?

**Cenário real:**

```javascript
// Pedido #1234
1. RASCUNHO: DCL escolhe Essilor, R$ 350
2. AG_PAGAMENTO: Cliente demora 3 dias para pagar
3. PAGO: Confirmado pagamento, DCL faz transferência à vista para Essilor
4. PRODUCAO: Essilor confirma recebimento $ e inicia fabricação (7 dias)
5. ENTREGUE: Lente chegou na loja, cliente não apareceu ainda (2 dias)
6. FINALIZADO: Cliente retirou, processo concluído

// Se pularmos AG_PAGAMENTO e PAGO:
❌ Não sabemos se pedido está travado por falta de $
❌ Não conseguimos cobrar cliente
❌ Não sabemos se já pagamos o lab
❌ Lab reclama: "não recebi pagamento, não vou produzir"
```

### Integração com sis_finance

**Gatilhos financeiros:**

```typescript
// Mudança de status → Evento no sis_finance

RASCUNHO → AG_PAGAMENTO:
  - Criar conta_receber no sis_finance
  - Cliente: pedido.cliente_id
  - Valor: pedido.valor_pedido
  - Vencimento: hoje + 3 dias

AG_PAGAMENTO → PAGO:
  - Marcar conta_receber como PAGA
  - Criar conta_pagar no sis_finance
  - Fornecedor: pedido.laboratorio_id
  - Valor: pedido.custo_lentes
  - Status: PENDENTE (ainda não transferimos)

PAGO → PRODUCAO:
  - Marcar conta_pagar como PAGA
  - Registrar transacao_bancaria
  - Integração: enviar OS para lab (API/email)
  - Lab confirma: pedido.data_enviado_producao = NOW()
```

## 📊 Kanban Visual (6 colunas)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RASCUNHO (5)  │ AG_PGTO (12) │  PAGO (8)   │ PRODUCAO (45) │ ENTREGUE (8) │ [FINALIZADOS: 234]  │
│ ─────────     │ ──────────   │ ─────       │ ──────────    │ ──────────   │                      │
│               │              │             │               │              │                      │
│ ┌──────────┐  │ ┌──────────┐ │ ┌────────┐ │ ┌──────────┐  │ ┌──────────┐ │                      │
│ │OS #1234  │  │ │OS #1235  │ │ │OS #1240│ │ │OS #1237  │  │ │OS #1250  │ │                      │
│ │🔴 SEM   │  │ │💰 R$ 450│ │ │✅ Pago │ │ │🏭 Essilor│  │ │✅ Pronto │ │                      │
│ │  LENTE   │  │ │Há 2 dias│ │ │Enviar  │ │ │⏰ 3 dias │  │ │Há 1 dia  │ │                      │
│ │          │  │ │         │ │ │ao lab  │ │ │60% ████▓│  │ │          │ │                      │
│ │[Escolher]│  │ │[Cobrar] │ │ │[Enviar]│ │ │          │  │ │[Entregar]│ │                      │
│ └──────────┘  │ └──────────┘ │ └────────┘ │ └──────────┘  │ └──────────┘ │                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 🏦 Integração sis_finance (5º banco)

### Informações necessárias

**Por favor, confirme a estrutura do sis_finance:**

```sql
-- Tabelas que imagino existir (confirmar):

-- 1. Contas a Receber (cliente paga)
CREATE TABLE contas_receber (
  id UUID PRIMARY KEY,
  pedido_id UUID?,           -- Link com desenrola_dcl
  cliente_id UUID,           -- Cliente universal
  valor NUMERIC(10,2),
  data_vencimento DATE,
  data_pagamento DATE?,
  status VARCHAR,            -- pendente/pago/atrasado
  forma_pagamento VARCHAR?   -- dinheiro/pix/credito/debito
);

-- 2. Contas a Pagar (pagar lab à vista)
CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY,
  pedido_id UUID?,           -- Link com desenrola_dcl
  fornecedor_id UUID,        -- Laboratório
  valor NUMERIC(10,2),
  data_vencimento DATE,
  data_pagamento DATE?,
  status VARCHAR,            -- pendente/pago
  tipo VARCHAR               -- laboratorio/fornecedor/outros
);

-- 3. Transações (movimentação real)
CREATE TABLE transacoes (
  id UUID PRIMARY KEY,
  conta_pagar_id UUID?,
  conta_receber_id UUID?,
  valor NUMERIC(10,2),
  data_transacao TIMESTAMPTZ,
  tipo VARCHAR,              -- entrada/saida
  descricao TEXT
);
```

### Endpoints necessários

```typescript
// desenrola_dcl ← sis_finance

// 1. Notificar pagamento recebido do cliente
POST /api/webhooks/sis_finance/pagamento_recebido
{
  pedido_id: "uuid",
  valor: 450.00,
  forma_pagamento: "pix",
  data_pagamento: "2026-01-17T10:30:00Z"
}
→ Muda pedido: AG_PAGAMENTO → PAGO

// 2. Consultar status financeiro de um pedido
GET /api/sis_finance/pedido/{pedido_id}/status
→ {
  conta_receber_status: "pago",
  conta_pagar_status: "pendente",
  valor_recebido: 450.00,
  valor_a_pagar: 350.00,
  margem: 100.00
}

// 3. Registrar pagamento ao lab
POST /api/sis_finance/pagar_laboratorio
{
  pedido_id: "uuid",
  laboratorio_id: "uuid",
  valor: 350.00,
  forma_pagamento: "transferencia"
}
→ Cria transacao + marca conta_pagar como PAGA
```

## 🎯 Status Finais

### TypeScript

```typescript
export type StatusPedido =
  | "RASCUNHO" // Pedido em criação, DCL escolhe lente/lab
  | "AG_PAGAMENTO" // Aguardando pagamento do cliente
  | "PAGO" // Cliente pagou, pode pagar lab e enviar para produção
  | "PRODUCAO" // Lab confirmou recebimento $, está fabricando
  | "ENTREGUE" // Chegou na loja, aguarda retirada do cliente
  | "FINALIZADO" // Cliente retirou, processo completo
  | "CANCELADO"; // Cancelado (não aparece no Kanban)
```

### SQL Migration

```sql
CREATE TYPE status_pedido_novo AS ENUM (
  'RASCUNHO',
  'AG_PAGAMENTO',
  'PAGO',
  'PRODUCAO',
  'ENTREGUE',
  'FINALIZADO',
  'CANCELADO'
);
```

## 📋 Campos Adicionais Necessários

```sql
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS
  -- Controle financeiro
  valor_recebido NUMERIC(10,2),              -- Quanto cliente pagou
  data_pagamento_cliente TIMESTAMPTZ,        -- Quando cliente pagou
  forma_pagamento_cliente VARCHAR,           -- pix/credito/dinheiro

  -- Controle de pagamento ao lab
  valor_pago_lab NUMERIC(10,2),              -- Quanto pagamos ao lab
  data_pagamento_lab TIMESTAMPTZ,            -- Quando pagamos o lab
  forma_pagamento_lab VARCHAR,               -- transferencia/pix

  -- Links com sis_finance
  conta_receber_id UUID,                     -- ID da conta a receber
  conta_pagar_id UUID,                       -- ID da conta a pagar

  -- Margem (calculado)
  margem_lucro AS (valor_recebido - valor_pago_lab) STORED;
```

## 🚀 Próximos Passos

### Perguntas para você:

1. **Estrutura sis_finance:**

   - Tem as tabelas contas_receber, contas_pagar, transacoes?
   - Quais os campos principais?
   - Já tem integração/webhook?

2. **Fluxo de pagamento:**

   - Cliente paga na loja ou online?
   - Como sis_finance fica sabendo do pagamento?
   - Vocês transferem para lab manualmente ou automático?

3. **SLA do laboratório:**

   - O SLA começa quando? (quando pagam o lab ou quando enviam OS?)
   - Labs diferentes têm SLAs diferentes?

4. **Prioridade:**
   - Quer que eu implemente:
     a) Kanban com 6 colunas + integração sis_finance?
     b) Ou começamos só com Kanban e integramos finance depois?

### Aguardando informações para continuar! 🎯
