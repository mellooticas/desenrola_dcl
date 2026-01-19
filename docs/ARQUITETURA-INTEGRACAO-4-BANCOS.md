# 🏗️ Arquitetura de Integração - 4 Bancos

**Data:** 17 de Janeiro de 2026  
**Status:** Documento de Planejamento  
**Versão:** 1.0

---

## 📊 Visão Geral dos Sistemas

### Sistema Atual (Janeiro/2026)

```
┌──────────────────────────────────────────────────────────────┐
│                    ECOSSISTEMA MELLO ÓTICAS                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  SIS_LENS   │  │ SIS_VENDAS   │  │   DESENROLA_DCL   │  │
│  │  (Supabase) │  │  (Supabase)  │  │    (Supabase)     │  │
│  └──────┬──────┘  └───────┬──────┘  └─────────┬─────────┘  │
│         │                 │                    │            │
│         │                 │                    │            │
│  ┌──────▼─────────────────▼────────────────────▼─────────┐  │
│  │              CRM_ERP (Supabase)                       │  │
│  │      Produtos • Armações • Acessórios • Serviços     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           APPS FRONTEND (Consumidores)                │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  • SIS_Estoque (SvelteKit) → crm_erp                 │ │
│  │  • Desenrola_DCL (Next.js) → desenrola + sis_lens    │ │
│  │  • SIS_Vendas (App PDV) → sis_vendas + crm_erp       │ │
│  │  • App Marketing → todos (via UUIDs)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ sis_lens - Catálogo de Lentes

### 🎯 Função

Repositório centralizado de lentes, fornecedores/laboratórios e relacionamentos canônicos.

### 📦 Estrutura Principal

```sql
-- SCHEMA: lens_catalog
lentes (86 colunas)
  ├── id (UUID)
  ├── nome, descricao
  ├── marca_id → marcas
  ├── fornecedor_id → core.fornecedores
  ├── grupo_canonico_id → grupos_canonicos
  ├── classe_lente (prata, gold, premium)
  ├── preco_custo, preco_venda
  ├── tratamentos (JSONB)
  └── especificacoes técnicas

-- SCHEMA: core
fornecedores (17 colunas)
  ├── id (UUID)
  ├── nome, tipo (laboratorio, distribuidor)
  ├── contato (JSONB)
  ├── sla_padrao_dias
  └── ativo (boolean)
```

### ✅ Estado de Integração

**INTEGRADO com desenrola_dcl**

- Lentes canônicas → `desenrola_dcl.pedidos.grupo_canonico_id`
- Fornecedores → `desenrola_dcl.laboratorios` (nomes similares, IDs diferentes)

### ⚠️ Pendências

- [ ] Melhorar filtros de seleção de lentes
- [ ] Sincronizar IDs de laboratórios (mapping table?)
- [ ] Adicionar webhook para novas lentes

---

## 2️⃣ sis_vendas - PDV e Controle de Vendas

### 🎯 Função

Sistema de Ponto de Venda (PDV) com controle financeiro completo.

### 📦 Estrutura Principal

```sql
-- SCHEMA: vendas
vendas.vendas (25 tabelas no schema)
  ├── id (UUID) ← CHAVE PRINCIPAL
  ├── cliente_id (UUID) ← Cliente único
  ├── loja_id
  ├── data_venda
  ├── valor_total, valor_pago
  ├── forma_pagamento
  └── status

vendas.itens_venda (39 colunas)
  ├── id (UUID)
  ├── venda_id → vendas.vendas
  ├── tipo_produto (lente, armacao, acessorio, servico)
  ├── produto_uuid ← Liga a produtos (crm_erp)
  ├── produto_sku_visual, codigo_fornecedor
  ├── descricao, quantidade
  ├── preco_unitario, desconto
  ├── possui_estoque (boolean)
  └── lente_uuid (se for lente)

vendas.receitas (receitas oftalmológicas)
  ├── venda_id
  ├── graus OD/OE (esférico, cilíndrico, eixo, adição)
  ├── distância_pupilar
  └── observacoes

-- SCHEMA: core
core.clientes (9 tabelas no schema)
  ├── id (UUID) ← Cliente único em TODO sistema
  ├── cpf (UNIQUE) ← Chave secundária
  ├── nome, email, telefone
  ├── endereco (JSONB)
  └── created_at
```

### 📊 Relacionamentos com Outros Bancos

#### → crm_erp (Produtos)

```sql
-- itens_venda.produto_uuid = produtos.id (crm_erp)
SELECT iv.*, p.sku, p.sku_visual, p.custo
FROM vendas.itens_venda iv
JOIN crm_erp.produtos p ON iv.produto_uuid = p.id
WHERE iv.venda_id = '...';
```

#### → desenrola_dcl (Pedidos de Lentes)

```sql
-- Quando venda tem lente, cria pedido no desenrola
-- venda.id → pedidos.venda_id (campo a criar)
-- cliente.id → pedidos.cliente_id (campo a criar)
```

### ✅ Estado Atual

- **SEM integração automática** com desenrola_dcl
- Lançamento de pedidos é **MANUAL** hoje

### 🎯 Integração Target

1. **Venda com lente** → Dispara criação automática de pedido no desenrola_dcl
2. **Pedido finalizado** no desenrola → Webhook atualiza venda (status: "pronto_retirada")
3. **Cliente retira óculos** → PDV registra entrega → desenrola marca como entregue

---

## 3️⃣ crm_erp - Produtos e Estoque

### 🎯 Função

**ATENÇÃO:** sis_vendas e crm_erp são O MESMO BANCO!

Controle de:

- ✅ Armações (com estoque)
- ✅ Acessórios (com estoque)
- ✅ Serviços (sem estoque)
- ❌ **NÃO** controla lentes (lentes vêm do sis_lens, JIT)

### 📦 Estrutura Principal (Schema Completo)

```sql
-- Este é o MESMO banco do sis_vendas!
-- Schemas: vendas, core, marketing, auth_sistema, carnes, pagamentos, etc.

-- Produtos estão em vendas.itens_venda, NÃO há tabela separada
vendas.itens_venda
  ├── tipo_produto: 'armacao' | 'acessorio' | 'servico' | 'lente'
  ├── fornecedor, codigo_fornecedor
  ├── produto_uuid (UUID único do produto)
  ├── produto_sku_visual (ex: "MO123456")
  ├── descricao (montada automaticamente)
  ├── preco_custo, preco_venda
  ├── possui_estoque (boolean)
  └── quantidade

-- Controle de estoque (se existir tabela separada)
-- TODO: Investigar se há estoque.estoque_produto
```

### 🔑 Chaves de Busca para Integração

```typescript
// Buscar produto por:
interface ProdutoBusca {
  sku_visual: string; // "MO123456" (preferencial)
  cod: string; // Código interno
  nome: string; // Nome/descrição
  produto_uuid: string; // UUID único
}
```

### ✅ Estado Atual

- **SEM integração** com desenrola_dcl
- Desenrola **não controla estoque**
- Desenrola **não registra armações** (ainda)

### 🎯 Integração Target

1. **Wizard de pedido** no desenrola → Buscar armações do crm_erp via API
2. **Pedido criado** → Registrar `armacao_id` (UUID do crm_erp)
3. **Pedido finalizado** → **NÃO** dar baixa em estoque (só PDV faz isso)
4. **Consulta de estoque** → API read-only para verificar disponibilidade

---

## 4️⃣ desenrola_dcl - Controle de Produção

### 🎯 Função

Sistema de controle de pedidos de lentes, SLA laboratorial, montagem e entrega.

### 📦 Estrutura Principal

```sql
-- SCHEMA: public
pedidos (639 registros) - 86 COLUNAS!
  ├── id (UUID)
  ├── loja_id → lojas
  ├── laboratorio_id → laboratorios
  ├── vendedor_id → colaboradores
  ├── montador_id → montadores
  ├── cliente_nome, cliente_cpf, cliente_telefone
  │
  ├── -- RECEITA (campos diretos na tabela)
  ├── esferico_od, cilindrico_od, eixo_od, adicao_od
  ├── esferico_oe, cilindrico_oe, eixo_oe, adicao_oe
  ├── distancia_pupilar
  │
  ├── -- LENTE (integração sis_lens)
  ├── grupo_canonico_id → sis_lens.grupos_canonicos
  ├── lente_selecionada_id → sis_lens.lentes
  ├── fornecedor_lente_id → sis_lens.fornecedores
  ├── nome_lente, nome_grupo_canonico
  ├── preco_lente, custo_lente, margem_lente_percentual
  ├── tratamentos_lente (JSONB)
  ├── classe_lente (prata, gold, premium)
  │
  ├── -- MONTAGEM
  ├── montador_id, montador_nome, montador_local
  ├── data_envio_montagem, data_montagem
  ├── custo_montagem
  │
  ├── -- CONTROLE DE OS
  ├── os_fisica (número sequencial por loja)
  ├── os_laboratorio (número do lab)
  ├── data_os
  │
  ├── -- SLA
  ├── data_sla_laboratorio (calculado)
  ├── data_prevista_montagem
  ├── observacoes_sla
  │
  ├── -- STATUS
  ├── status (rascunho, producao, entregue, finalizado)
  ├── urgente (boolean)
  ├── data_entrega_cliente
  │
  └── -- CAMPOS A ADICIONAR
      ├── venda_id (UUID) ← Liga ao sis_vendas
      ├── cliente_id (UUID) ← UUID único do cliente
      └── armacao_id (UUID) ← Liga ao crm_erp.produtos

laboratorios (14 registros)
  ├── id (UUID)
  ├── nome (ex: "Brascor", "Style", "Sygma")
  ├── sla_padrao_dias (5)
  ├── trabalha_sabado (boolean)
  └── ativo

lojas (7 registros)
  ├── id (UUID)
  ├── nome, codigo
  ├── margem_seguranca_dias (2)
  └── alerta_sla_dias (1)

montadores (via laboratorios)
  ├── id (UUID)
  ├── laboratorio_id
  ├── nome, local, contato
  └── custo_montagem_padrao
```

### 🔄 Views Críticas

```sql
v_dashboard_kpis          -- Métricas principais (volume, ticket, SLA)
v_pedidos_kanban          -- Cards para arrastar no Kanban
v_pedido_timeline_completo -- Histórico de eventos
v_montadores_ativos       -- Montadores disponíveis
```

### ✅ Estado Atual

- **INTEGRADO** com sis_lens (lentes canônicas)
- **MANUAL** para criar pedidos (não vem automático do PDV)
- **SEM** controle de armações (não busca do crm_erp)
- **SEM** vínculo formal com vendas (não tem venda_id)

---

## 🔗 Mapa de Integrações

### Chaves de Ligação Entre Sistemas

```typescript
// CLIENTE (chave universal)
interface ClienteUniversal {
  uuid: string; // ✅ Preferencial (único em todos os bancos)
  cpf: string; // ⚠️ Fallback (pode ter gaps)
  nome: string; // Info adicional
}

// VENDA → PEDIDO
interface VendaPedidoLink {
  venda_id: string; // UUID da venda (sis_vendas)
  pedido_id: string; // UUID do pedido (desenrola_dcl)
  cliente_id: string; // UUID do cliente (universal)
  loja_id: string; // UUID da loja (presente em ambos)
}

// PRODUTO (armação/acessório)
interface ProdutoLink {
  produto_uuid: string; // UUID único (crm_erp.produtos)
  sku_visual: string; // "MO123456" (busca rápida)
  cod: string; // Código interno alternativo
  nome: string; // Descrição
}

// LENTE (já integrado)
interface LenteLink {
  grupo_canonico_id: string; // sis_lens → desenrola_dcl
  lente_selecionada_id: string; // Lente específica escolhida
  fornecedor_lente_id: string; // Fornecedor da lente
}

// LABORATÓRIO (precisa mapping)
interface LaboratorioMapping {
  desenrola_id: string; // UUID no desenrola_dcl
  sis_lens_id: string; // UUID no sis_lens.fornecedores
  nome: string; // Nome para match manual
}
```

---

## 🎯 Fluxos de Integração

### Fluxo 1: Venda com Lente (Target - Automático)

```
┌─────────────────────────────────────────────────────────┐
│  CLIENTE COMPRA ÓCULOS NO PDV (sis_vendas)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  1. PDV registra venda                                  │
│     • vendas.vendas (venda_id, cliente_id, loja_id)    │
│     • vendas.itens_venda (armacao, lente, servicos)    │
│     • vendas.receitas (graus)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Webhook/Trigger dispara para desenrola_dcl         │
│     POST /api/pedidos/criar-de-venda                   │
│     {                                                  │
│       venda_id: "uuid",                               │
│       cliente_id: "uuid",                             │
│       loja_id: "uuid",                                │
│       receita: {...},                                 │
│       armacao_uuid: "...",                            │
│       lente_grupo_id: "..."                           │
│     }                                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. desenrola_dcl cria pedido                          │
│     • pedidos (status: rascunho)                       │
│     • venda_id, cliente_id preenchidos                 │
│     • OS gerada automaticamente                        │
│     • Wizard completa dados de lente                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Pedido avança no Kanban                            │
│     rascunho → producao → entregue → finalizado        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. Webhook retorna ao sis_vendas                      │
│     PUT /api/vendas/{venda_id}/status                  │
│     • "producao" → "pronto_retirada" → "entregue"     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. App Marketing consome timeline                      │
│     GET /api/jornada-cliente/{cliente_id}              │
│     • Envia SMS/Email de acompanhamento                │
│     • "Sua lente chegou!"                             │
└─────────────────────────────────────────────────────────┘
```

### Fluxo 2: Criação Manual (Atual - Híbrido)

```
┌─────────────────────────────────────────────────────────┐
│  USUÁRIO DCL (gestor/dcl) cria pedido manual           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  1. Wizard de Pedido (desenrola_dcl)                   │
│     • Seleciona loja                                   │
│     • Busca cliente (por CPF ou cria novo)            │
│     • Preenche receita                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Buscar Armação (NOVA INTEGRAÇÃO)                   │
│     GET crm_erp /api/produtos/buscar                   │
│     ?tipo=armacao&sku=MO123456                        │
│     → Retorna: uuid, nome, preco, tem_estoque         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Selecionar Lente (JÁ INTEGRADO)                   │
│     • Filtros por grupo canônico                       │
│     • sis_lens retorna lentes disponíveis             │
│     • Wizard mostra preços e tratamentos              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Salvar Pedido                                      │
│     INSERT INTO pedidos (                              │
│       cliente_id, armacao_id, lente_selecionada_id,   │
│       venda_id: NULL ← Sem venda vinculada            │
│     )                                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. Fluxo normal no Kanban                             │
│     (igual ao Fluxo 1, a partir do passo 4)           │
└─────────────────────────────────────────────────────────┘
```

### Fluxo 3: Consulta de Estoque (Read-Only)

```
┌─────────────────────────────────────────────────────────┐
│  Wizard desenrola_dcl busca armação                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  GET crm_erp /api/produtos/estoque                     │
│  ?produto_uuid=...&loja_id=...                        │
│                                                        │
│  Response:                                             │
│  {                                                     │
│    produto_uuid: "...",                               │
│    sku_visual: "MO123456",                            │
│    nome: "MELLO CAT EYE PRETO 54-18",                 │
│    quantidade_atual: 3,                               │
│    preco_venda: 450.00,                               │
│    tem_estoque: true                                  │
│  }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Wizard mostra: "3 disponíveis | R$ 450,00"            │
│  ⚠️ desenrola NÃO dá baixa em estoque                 │
│  ✅ Apenas consulta para informar cliente             │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ APIs Necessárias

### API 1: crm_erp → Produtos (Read-Only)

```typescript
// GET /api/produtos/buscar
interface ProdutosBuscarRequest {
  tipo?: "armacao" | "acessorio" | "servico";
  sku_visual?: string;
  cod?: string;
  nome?: string;
  loja_id?: string; // Filtrar por disponibilidade na loja
  limite?: number;
}

interface ProdutoResponse {
  produto_uuid: string;
  sku: string;
  sku_visual: string;
  cod: string;
  nome: string;
  descricao: string;
  tipo: string;
  marca: string;
  modelo: string;
  cor: string;
  tamanho: string;
  preco_custo: number;
  preco_venda: number;
  tem_estoque: boolean;
  quantidade_disponivel?: number; // Se tem_estoque = true
  imagem_url?: string;
}

// GET /api/produtos/estoque/{produto_uuid}
interface EstoqueResponse {
  produto_uuid: string;
  loja_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
  status_estoque: "SEM_ESTOQUE" | "CRITICO" | "NORMAL";
  ultima_atualizacao: string;
}
```

### API 2: desenrola_dcl → Pedidos

```typescript
// POST /api/pedidos/criar-de-venda
interface CriarPedidoDeVendaRequest {
  venda_id: string; // UUID da venda no sis_vendas
  cliente_id: string; // UUID do cliente
  loja_id: string;

  receita: {
    esferico_od: number;
    cilindrico_od: number;
    eixo_od: number;
    adicao_od?: number;
    esferico_oe: number;
    cilindrico_oe: number;
    eixo_oe: number;
    adicao_oe?: number;
    distancia_pupilar: number;
  };

  armacao_uuid?: string; // Se vendeu armação
  lente_grupo_id?: string; // Grupo canônico pré-selecionado

  observacoes?: string;
}

interface PedidoResponse {
  pedido_id: string;
  os_fisica: string; // "MO-0001/2026"
  status: string;
  data_prevista_entrega: string;
}

// PUT /api/pedidos/{pedido_id}/status
interface AtualizarStatusRequest {
  status: "rascunho" | "producao" | "entregue" | "finalizado";
  data_entrega_cliente?: string;
  observacoes?: string;
}
```

### API 3: desenrola_dcl → sis_vendas (Webhook)

```typescript
// PUT /api/vendas/{venda_id}/status-pedido
interface WebhookStatusPedido {
  venda_id: string;
  pedido_id: string;
  status_pedido: string;
  os_fisica: string;
  data_prevista_entrega: string;
  mensagem: string; // "Lente em produção no laboratório Brascor"
}
```

---

## 📋 Plano de Implementação

### Fase 1: Estrutura Base (1-2 dias) ✅ PRIORITÁRIO

#### 1.1 Adicionar Campos no desenrola_dcl

```sql
-- Migration: add-integration-fields.sql
ALTER TABLE pedidos
  ADD COLUMN venda_id UUID REFERENCES sis_vendas.vendas.vendas(id),
  ADD COLUMN cliente_id UUID,  -- UUID universal do cliente
  ADD COLUMN armacao_id UUID;  -- UUID do produto (crm_erp)

CREATE INDEX idx_pedidos_venda_id ON pedidos(venda_id);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);

-- Comentários para documentação
COMMENT ON COLUMN pedidos.venda_id IS 'UUID da venda no sis_vendas (quando pedido vem do PDV)';
COMMENT ON COLUMN pedidos.cliente_id IS 'UUID universal do cliente (chave em todos os bancos)';
COMMENT ON COLUMN pedidos.armacao_id IS 'UUID do produto armação no crm_erp';
```

#### 1.2 Criar API de Produtos (crm_erp)

- [ ] Endpoint GET `/api/produtos/buscar`
- [ ] Endpoint GET `/api/produtos/estoque/{uuid}`
- [ ] RLS policies para acesso read-only
- [ ] Documentação Swagger/OpenAPI

#### 1.3 Criar API de Pedidos (desenrola_dcl)

- [ ] Endpoint POST `/api/pedidos/criar-de-venda`
- [ ] Endpoint PUT `/api/pedidos/{id}/status`
- [ ] Validações de receita e dados obrigatórios

### Fase 2: Integração Wizard (3-4 dias)

#### 2.1 Busca de Armações no Wizard

- [ ] Componente `ArmacaoSelector.tsx`
- [ ] Autocomplete com API crm_erp
- [ ] Mostrar estoque disponível
- [ ] Salvar `armacao_id` no pedido

#### 2.2 Melhorias na Busca de Cliente

- [ ] Buscar por CPF retorna `cliente_id` (UUID)
- [ ] Salvar `cliente_id` em vez de apenas nome/cpf
- [ ] Criar cliente se não existir (dual-write em sis_vendas?)

### Fase 3: Webhook Bidirecional (2-3 dias)

#### 3.1 desenrola → sis_vendas

- [ ] Trigger/Function no PostgreSQL
- [ ] Webhook on status change
- [ ] Retry logic (fila?)

#### 3.2 sis_vendas → desenrola

- [ ] Botão no PDV: "Criar Pedido DCL"
- [ ] Formulário simplificado (receita + lente)
- [ ] Chama API POST `/api/pedidos/criar-de-venda`

### Fase 4: App Marketing (1-2 dias)

#### 4.1 API de Jornada do Cliente

- [ ] GET `/api/jornada/{cliente_id}`
- [ ] Agregar dados de vendas + pedidos
- [ ] Timeline unificada

#### 4.2 Notificações

- [ ] SMS: "Sua lente chegou!"
- [ ] Email com link de rastreio

---

## 🔐 Segurança e Permissões

### RLS Policies

```sql
-- crm_erp: Produtos (Read-Only para desenrola_dcl)
CREATE POLICY "desenrola_pode_ler_produtos"
ON produtos FOR SELECT
USING (
  auth.jwt() ->> 'app' = 'desenrola_dcl'
  OR current_user = 'anon'
);

-- desenrola_dcl: Pedidos (Write para sis_vendas)
CREATE POLICY "sis_vendas_pode_criar_pedidos"
ON pedidos FOR INSERT
USING (
  auth.jwt() ->> 'app' = 'sis_vendas'
);
```

### API Keys

```env
# desenrola_dcl .env
CRM_ERP_API_URL=https://mhgbuplnxtfgipbemchb.supabase.co
CRM_ERP_API_KEY=eyJ...  # Read-only key
SIS_VENDAS_WEBHOOK_SECRET=webhook_secret_123

# sis_vendas .env
DESENROLA_API_URL=https://seu-projeto.supabase.co
DESENROLA_API_KEY=eyJ...  # Write key para pedidos
```

---

## 📊 SIS_Estoque (SvelteKit) - Detalhes Técnicos

### Conexão Atual

```typescript
// src/lib/services/supabase.ts
PUBLIC_SUPABASE_URL=https://mhgbuplnxtfgipbemchb.supabase.co
// ☝️ Este É O BANCO crm_erp!
```

### Tabelas Principais

```typescript
// Produto (interface TypeScript)
interface Produto {
  id: string; // UUID
  sku: string; // SKU técnico
  sku_visual: string; // "MO123456"
  sku_num: string;
  cod: string;
  descricao: string;
  tipo: string; // armacao, acessorio, servico
  marca_id: string;
  categoria_id: string;
  fornecedor_id: string;
  custo: number;
  preco_venda: number;
  possui_estoque: boolean;
  ativo: boolean;
}

// Estoque
interface EstoqueProduto {
  id: string;
  produto_id: string;
  loja_id: string;
  quantidade: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  valor_unitario: number;
  localizacao: string;
}

// Movimentação
interface EstoqueMovimentacao {
  id: string;
  produto_id: string;
  loja_id: string;
  tipo: "entrada" | "saida";
  tipo_movimentacao: string;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  data_movimentacao: string;
  usuario_id: string;
}
```

### RPC Functions Disponíveis

```sql
-- Entrada de produtos
registrar_entrada_estoque(
  p_produto_id UUID,
  p_quantidade INT,
  p_loja_id UUID,
  p_fornecedor UUID,
  p_valor_unitario NUMERIC
)

-- Saída de produtos (com validação de saldo)
registrar_saida_estoque(
  p_produto_id UUID,
  p_quantidade INT,
  p_loja_id UUID,
  p_motivo TEXT -- 'venda', 'perda', 'dano'
)
```

### Views Otimizadas

```sql
-- View principal (JOIN produtos + estoque)
vw_estoque_completo
  • produto_id, sku, sku_visual, descricao
  • quantidade_atual (calculado)
  • status_estoque ('SEM_ESTOQUE' | 'CRITICO' | 'NORMAL')
  • custo, preco_venda
  • marca, categoria

-- View leve para autocomplete
vw_estoque_atual
  • produto_id, sku_visual, nome
  • quantidade, loja_id
```

---

## ⚠️ Considerações Importantes

### 1. Separação de Responsabilidades

```
┌──────────────────────────────────────────────────────┐
│  QUEM CONTROLA O QUÊ?                                │
├──────────────────────────────────────────────────────┤
│  sis_vendas (PDV)                                    │
│    ✅ Vendas, pagamentos, carnês                    │
│    ✅ Baixa em estoque (quando vende armação)       │
│    ✅ Registro financeiro                            │
│                                                      │
│  desenrola_dcl                                       │
│    ✅ Pedidos de lentes, SLA, montagem              │
│    ✅ Kanban de produção                            │
│    ❌ NÃO controla estoque                          │
│    ❌ NÃO registra pagamentos                       │
│                                                      │
│  crm_erp (SIS_Estoque)                              │
│    ✅ Produtos (armações, acessórios)               │
│    ✅ Controle de estoque (entrada/saída)           │
│    ✅ RPC functions para movimentação               │
│    ❌ NÃO controla lentes (lentes = JIT)            │
│                                                      │
│  sis_lens                                            │
│    ✅ Catálogo de lentes (canônicas)                │
│    ✅ Fornecedores/laboratórios                     │
│    ❌ NÃO controla pedidos                          │
└──────────────────────────────────────────────────────┘
```

### 2. Modelo JIT para Lentes

- Lentes **não têm estoque**
- Compra → Pagamento → Pedido ao lab → Recebimento
- Controle apenas de **pedidos em aberto**
- SLA é crítico (5-7 dias úteis típico)

### 3. Multi-Loja

Todas as 4 bases têm `loja_id`:

- Estoque é **separado** por loja
- Usuários veem **apenas sua loja** (RLS)
- APIs devem filtrar por `loja_id` do usuário logado

### 4. Integridade de Dados

```typescript
// Cliente universal
{
  uuid: "abc-123",  // ✅ Chave primária em TODOS os bancos
  cpf: "12345678900"  // ⚠️ Pode ter duplicatas/erros
}

// SEMPRE usar UUID quando possível
// CPF apenas para busca/exibição
```

---

## 📈 Métricas de Sucesso

### KPIs de Integração

#### Automação

- [ ] % pedidos criados automaticamente (target: 80%)
- [ ] % pedidos com armação vinculada (target: 70%)
- [ ] Tempo médio de criação de pedido (target: < 2min)

#### Qualidade de Dados

- [ ] % pedidos com `cliente_id` correto (target: 95%)
- [ ] % pedidos com `venda_id` vinculada (target: 85%)
- [ ] Erros de sincronização webhook (target: < 1%)

#### Experiência

- [ ] App Marketing: tempo de resposta API jornada (target: < 500ms)
- [ ] Wizard desenrola: tempo de busca de armação (target: < 300ms)
- [ ] PDV: tempo para criar pedido (target: < 30s)

---

## 🚀 Próximos Passos Imediatos

### 1. Decisões Técnicas (HOJE)

- [ ] Aprovar estrutura de campos novos em `pedidos`
- [ ] Definir formato de webhook (REST ou Event-driven?)
- [ ] Escolher lib para HTTP client (fetch, axios, ky?)

### 2. Setup de Ambiente (AMANHÃ)

- [ ] Criar branch `feature/integracao-4-bancos`
- [ ] Configurar .env com URLs dos 4 bancos
- [ ] Testar conexões cross-database

### 3. Primeira Entrega (SEMANA 1)

- [ ] Migration de campos (5min)
- [ ] API crm_erp `/produtos/buscar` (4h)
- [ ] Componente `ArmacaoSelector` (6h)
- [ ] Testes manuais (2h)

---

## 📚 Referências

### Documentação Existente

- `/database/investigacao-*.sql` - Estruturas mapeadas
- `D:/projetos/SIS_Estoque/docs/MANUAL-TECNICO-BANCO-DADOS.md`
- `D:/projetos/SIS_Estoque/docs/MAPA-SISTEMA-ATUAL.md`

### Credenciais (Supabase)

```
sis_lens: [ver investigacao-sis-lens.sql]
sis_vendas: [ver investigacao-sis-vendas.sql]
crm_erp: mhgbuplnxtfgipbemchb.supabase.co (MESMO do sis_vendas!)
desenrola_dcl: [projeto atual]
```

---

**Última atualização:** 17/01/2026  
**Responsável:** Equipe DCL  
**Status:** 🟡 Em Planejamento

---

## ❓ FAQ

**P: Por que 4 bancos se sis_vendas e crm_erp são o mesmo?**  
R: São 4 **conexões lógicas** mas 3 bancos físicos. crm_erp é o nome lógico para produtos/estoque dentro do mesmo Supabase do sis_vendas.

**P: Podemos dar baixa em estoque direto do desenrola_dcl?**  
R: **NÃO**. Apenas o PDV (sis_vendas) controla estoque. Desenrola só consulta para informar disponibilidade.

**P: E se a venda for cancelada depois do pedido criado?**  
R: Webhook reverso: PDV notifica desenrola → pedido muda para status "cancelado" (campo a criar).

**P: Como mapear laboratórios entre sis_lens e desenrola_dcl?**  
R: Criar tabela `laboratorios_mapping` ou fazer match por nome (case-insensitive).

**P: App Marketing precisa de banco próprio?**  
R: **NÃO**. Apenas consome APIs dos 4 bancos via UUIDs (cliente_id + venda_id).
