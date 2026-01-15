# 🗄️ BLUEPRINT COMPLETO - BANCO DE DADOS BEST_LENS
## Motor de Lentes v2.0 - Arquitetura Definitiva

---

## 📋 SUMÁRIO
 
1. [Visão Geral](#visão-geral)
2. [Arquitetura de Schemas](#arquitetura-de-schemas)
3. [Estrutura Completa](#estrutura-completa)
4. [Relacionamentos](#relacionamentos)
5. [Estratégia de Migração](#estratégia-de-migração)
6. [Plano de Crescimento](#plano-de-crescimento)
7. [Índices e Performance](#índices-e-performance)
8. [Segurança e RLS](#segurança-e-rls)
9. [Backup e Recuperação](#backup-e-recuperação)
10. [Monitoramento](#monitoramento)

---

## 🎯 VISÃO GERAL

### Propósito
Sistema completo para gestão de catálogo de lentes oftálmicas com:
- ✅ Catálogo universal de produtos
- ✅ Gestão de fornecedores
- ✅ Controle de compras (just-in-time + estoque)
- ✅ Canonização inteligente
- ✅ Precificação dinâmica
- ✅ Escalabilidade para multi-loja/franquia

### Modelo de Dados
- **Tipo**: Relacional (PostgreSQL 15+)
- **Paradigma**: Normalizado com JSONB para flexibilidade
- **Estratégia**: Schema-per-domain
- **Escalabilidade**: Horizontal (particionamento futuro)

---

## 🏗️ ARQUITETURA DE SCHEMAS

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE: best_lens                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  lens_catalog    │  │      core       │               │
│  │                  │  │                  │               │
│  │ • lentes         │  │ • fornecedores   │               │
│  │ • lentes_canon.. │  │ • clientes (*)   │               │
│  │ • marcas         │  │ • usuarios (*)   │               │
│  │ • grupos_canon.. │  │                  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │     compras      │  │  contact_lens(*) │               │
│  │                  │  │                  │               │
│  │ • pedidos        │  │ • (lentes contato│               │
│  │ • pedido_itens   │  │   gelatinosas/   │               │
│  │ • estoque_mov... │  │   rígidas)       │               │
│  │ • estoque_saldo  │  │ • Schema reservado               │
│  │ • historico_prec │  │   para expansão │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │    vendas (*)    │  │   auditoria (*)  │               │
│  │                  │  │                  │               │
│  │ • pedidos        │  │ • logs_alteracao │               │
│  │ • pedido_itens   │  │ • logs_acesso    │               │
│  │ • orcamentos     │  │ • logs_vendas    │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐                                       │
│  │   financeiro (*) │                                       │
│  │                  │                                       │
│  │ • contas_receber │                                       │
│  │ • contas_pagar   │                                       │
│  │ • movimentacoes  │                                       │
│  └──────────────────┘                                       │
│                                                              │
│  (*) = Futuro / Expansão                                    │
└─────────────────────────────────────────────────────────────┘
```

### Schemas Atuais (v2.0)

#### 1️⃣ **lens_catalog** - Catálogo de Lentes
**Propósito**: Motor de escolhas, catálogo universal
**Tabelas**:
- `marcas` - Marcas de lentes (Essilor, Varilux, etc)
- `lentes` - Lentes específicas dos fornecedores (1.411 produtos)
- `lentes_canonicas` - Lentes genéricas agrupadas
- `grupos_canonicos` - Agrupamento de lentes similares

#### 2️⃣ **core** - Entidades de Negócio
**Propósito**: Fornecedores, clientes, usuários
**Tabelas**:
- `fornecedores` - Laboratórios e distribuidores (11 fornecedores)

#### 3️⃣ **compras** - Gestão de Compras e Estoque
**Propósito**: Controle de aquisições e estoque
**Tabelas**:
- `pedidos` - Pedidos de compra
- `pedido_itens` - Itens dos pedidos
- `estoque_movimentacoes` - Histórico de movimentações
- `estoque_saldo` - Saldo atual de estoque
- `historico_precos` - Evolução de preços

#### 4️⃣ **contact_lens** - Lentes de Contato (FUTURO)
**Propósito**: Catálogo de lentes de contato (gelatinosas e rígidas)
**Status**: Schema criado e reservado para expansão futura
**Previsão**: Q2/Q3 2025
**Tabelas Planejadas**:
- `contact_lenses` - Lentes de contato
- `contact_lens_brands` - Marcas específicas
- `prescriptions` - Prescrições específicas para contato

---

## 📊 ESTRUTURA COMPLETA

### Schema: `lens_catalog`

#### 🏷️ **Tabela: marcas**
```sql
marcas
├── id (UUID, PK)
├── nome (VARCHAR 100, UNIQUE) -- "ESSILOR", "VARILUX"
├── slug (VARCHAR 100, UNIQUE) -- "essilor", "varilux"
├── is_premium (BOOLEAN) -- Afeta canonização (true → premium_canonicas, false → lentes_canonicas)
├── descricao (TEXT)
├── website (TEXT)
├── ativo (BOOLEAN)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

ÍNDICES:
- pk_marcas (id)
- uk_marcas_nome (nome)
- uk_marcas_slug (slug)
- idx_marcas_premium (is_premium) WHERE ativo = true

TOTAL ESPERADO: 17 marcas

CATEGORIZAÇÃO LÓGICA (não é campo no banco):
┌──────────────────┬────────────────┬──────────────┐
│ Categoria        │ is_premium     │ Marcas       │
├──────────────────┼────────────────┼──────────────┤
│ Super Premium    │ TRUE (6)       │ VARILUX      │
│                  │                │ HOYA         │
│                  │                │ ZEISS        │
│                  │                │ RODENSTOCK   │
│                  │                │ KODAK        │
│                  │                │ LENSCOPE     │
├──────────────────┼────────────────┼──────────────┤
│ Premium          │ TRUE (3)       │ ESSILOR      │
│                  │                │ CRIZAL       │
│                  │                │ TRANSITIONS  │
├──────────────────┼────────────────┼──────────────┤
│ Intermediária    │ FALSE (5)      │ BRASCOR      │
│                  │                │ SYGMA        │
│                  │                │ POLYLUX      │
│                  │                │ BRASLENTES   │
│                  │                │ STYLE        │
├──────────────────┼────────────────┼──────────────┤
│ Econômica        │ FALSE (3)      │ EXPRESS      │
│                  │                │ SO BLOCOS    │
│                  │                │ GENÉRICA     │
└──────────────────┴────────────────┴──────────────┘

ESTRATÉGIA DE CANONIZAÇÃO:
• is_premium = TRUE (9 marcas) → premium_canonicas
  - Mantém marca no nome da lente canônica
  - Ex: "Varilux Comfort 1.67 Multifocal"
  
• is_premium = FALSE (8 marcas) → lentes_canonicas
  - Nome genérico (sem marca)
  - Ex: "Lente CR39 1.50 Visão Simples"
```

#### 🔍 **Tabela: lentes** (Principal)
```sql
lentes
├── id (UUID, PK)
├── fornecedor_id (UUID, FK → core.fornecedores)
├── marca_id (UUID, FK → marcas)
├── grupo_canonico_id (UUID, FK → grupos_canonicos) -- AUTO via trigger
│
├── nome_lente (TEXT) -- Nome comercial original
├── nome_canonizado (TEXT) -- Versão normalizada (AUTO)
├── slug (TEXT, UNIQUE) -- URL-friendly
│
├── tipo_lente (ENUM) -- visao_simples, multifocal, bifocal, leitura, ocupacional
├── material (ENUM) -- CR39, POLICARBONATO, TRIVEX, HIGH_INDEX, VIDRO, ACRILICO
├── indice_refracao (ENUM) -- 1.50, 1.56, 1.59, 1.61, 1.67, 1.74, 1.90
├── categoria (ENUM) -- economica, intermediaria, premium, super_premium
│
├── tratamento_antirreflexo (BOOLEAN)
├── tratamento_antirrisco (BOOLEAN)
├── tratamento_uv (BOOLEAN)
├── tratamento_blue_light (BOOLEAN)
├── tratamento_fotossensiveis (ENUM) -- nenhum, transitions, fotocromático, polarizado
│
├── diametro_mm (INTEGER)
├── curva_base (DECIMAL)
├── espessura_centro_mm (DECIMAL)
├── eixo_optico (VARCHAR)
│
├── grau_esferico_min (DECIMAL)
├── grau_esferico_max (DECIMAL)
├── grau_cilindrico_min (DECIMAL)
├── grau_cilindrico_max (DECIMAL)
├── adicao_min (DECIMAL)
├── adicao_max (DECIMAL)
│
├── preco_custo (DECIMAL 10,2)
├── preco_venda_sugerido (DECIMAL 10,2)
├── margem_lucro (DECIMAL 5,2) -- Percentual
│
├── estoque_disponivel (INTEGER) -- Para controle futuro
├── estoque_minimo (INTEGER)
├── lead_time_dias (INTEGER) -- Prazo específico (sobrescreve fornecedor)
│
├── status (ENUM) -- ativo, inativo, descontinuado, em_falta
├── ativo (BOOLEAN)
├── peso (INTEGER) -- Para ordenação (0-100)
│
├── metadata (JSONB) -- Dados extras flexíveis
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ)

ÍNDICES:
- pk_lentes (id)
- uk_lentes_slug (slug)
- idx_lentes_fornecedor (fornecedor_id) WHERE ativo = true
- idx_lentes_marca (marca_id) WHERE ativo = true
- idx_lentes_grupo (grupo_canonico_id)
- idx_lentes_tipo (tipo_lente) WHERE ativo = true
- idx_lentes_material (material) WHERE ativo = true
- idx_lentes_indice (indice_refracao) WHERE ativo = true
- idx_lentes_categoria (categoria) WHERE ativo = true
- idx_lentes_nome_canonizado (nome_canonizado) -- Para buscas
- idx_lentes_preco (preco_venda_sugerido) WHERE ativo = true
- idx_lentes_status (status)
- gin_lentes_metadata (metadata) -- Para queries JSONB

TOTAL ESPERADO: 1.411 lentes (inicialmente)
CRESCIMENTO: +500-1000/ano
```

#### 🧩 **Tabela: grupos_canonicos**
```sql
grupos_canonicos
├── id (UUID, PK)
├── nome_grupo (TEXT, UNIQUE) -- "Lente CR39 1.50 Visao Simples [-24.00/-18.50 | 0.00/0.00] +AR +UV"
├── slug (TEXT, UNIQUE) -- "lente-cr39-150-visao_simples-esf-n2400-n1850-cil-00-00-ar-uv"
│
├── tipo_lente (ENUM) -- visao_simples, multifocal, bifocal
├── material (ENUM) -- CR39, POLICARBONATO, TRIVEX, etc
├── indice_refracao (ENUM) -- 1.50, 1.56, 1.59, 1.61, 1.67, 1.74
│
├── grau_esferico_min (NUMERIC 5,2) -- Range mínimo esférico
├── grau_esferico_max (NUMERIC 5,2) -- Range máximo esférico
├── grau_cilindrico_min (NUMERIC 5,2) -- Range mínimo cilíndrico
├── grau_cilindrico_max (NUMERIC 5,2) -- Range máximo cilíndrico
├── adicao_min (NUMERIC 3,2) -- Range mínimo adição (multifocais)
├── adicao_max (NUMERIC 3,2) -- Range máximo adição (multifocais)
├── descricao_ranges (TEXT) -- "Esférico: -24.00 a -18.50 | Cilíndrico: 0.00 a 0.00"
│
├── tratamento_antirreflexo (BOOLEAN) -- CENÁRIO 5: Tratamento incluído no agrupamento
├── tratamento_antirrisco (BOOLEAN) -- CENÁRIO 5: Tratamento incluído no agrupamento
├── tratamento_uv (BOOLEAN) -- CENÁRIO 5: Tratamento incluído no agrupamento
├── tratamento_blue_light (BOOLEAN) -- CENÁRIO 5: Tratamento incluído no agrupamento
├── tratamento_fotossensiveis (ENUM) -- CENÁRIO 5: nenhum, fotocromático, polarizado
│
├── total_lentes (INTEGER) -- Contador de lentes no grupo
├── total_marcas (INTEGER) -- Contador de marcas distintas no grupo
├── preco_medio (DECIMAL 10,2)
├── preco_minimo (DECIMAL 10,2)
├── preco_maximo (DECIMAL 10,2)
│
├── is_premium (BOOLEAN) -- AUTO: BOOL_OR(marca.is_premium) - TRUE se qualquer lente é de marca premium
├── peso (INTEGER) -- Para ordenação
│
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

ÍNDICES:
- pk_grupos_canonicos (id)
- uk_grupos_nome (nome_grupo)
- uk_grupos_slug (slug)
- idx_grupos_tipo (tipo_lente)
- idx_grupos_material (material)
- idx_grupos_indice (indice_refracao)
- idx_grupos_premium (is_premium)
- idx_grupos_ranges_esferico (grau_esferico_min, grau_esferico_max)
- idx_grupos_ranges_cilindrico (grau_cilindrico_min, grau_cilindrico_max)
- idx_grupos_ranges_adicao (adicao_min, adicao_max)

TOTAL ATUAL: 461 grupos (CENÁRIO 5)
ESTRATÉGIA: Agrupamento por ranges + tratamentos
CRITÉRIOS: tipo + material + indice + 6 campos de ranges + 5 tratamentos
RESULTADO: 100% de comparabilidade dentro de cada grupo (mesmos graus e mesmos tratamentos)
LÓGICA PREMIUM: Grupo é premium se contém pelo menos uma lente de marca premium
```

#### 🔗 **Tabela: lentes_canonicas**
```sql
lentes_canonicas
├── id (UUID, PK)
├── grupo_canonico_id (UUID, FK → grupos_canonicos)
│
├── nome_canonico (TEXT, UNIQUE) -- "Lente CR39 1.50 Visão Simples com AR"
├── slug (TEXT, UNIQUE)
├── descricao_marketing (TEXT)
│
├── tipo_lente (ENUM)
├── material (ENUM)
├── indice_refracao (ENUM)
├── categoria_base (ENUM) -- economica (sempre para canônicas)
│
├── caracteristicas (JSONB) -- Tratamentos padrão
├── especificacoes_tecnicas (JSONB)
│
├── preco_base (DECIMAL 10,2) -- Calculado como média do grupo
├── peso (INTEGER)
├── ativo (BOOLEAN)
│
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

ÍNDICES:
- pk_lentes_canonicas (id)
- uk_canonicas_nome (nome_canonico)
- uk_canonicas_slug (slug)
- idx_canonicas_grupo (grupo_canonico_id)
- idx_canonicas_tipo (tipo_lente) WHERE ativo = true

TOTAL ESPERADO: Mesmo número de grupos (1:1 ou manual)
```

---

### Schema: `core`

#### 👔 **Tabela: fornecedores**
```sql
fornecedores
├── id (UUID, PK)
├── nome (TEXT) -- "Brascor", "Sygma"
├── razao_social (TEXT)
├── cnpj (VARCHAR 18, UNIQUE)
│
├── cep_origem (VARCHAR 9)
├── cidade_origem (TEXT)
├── estado_origem (VARCHAR 2)
│
├── prazo_visao_simples (INTEGER) -- 3-10 dias
├── prazo_multifocal (INTEGER) -- 5-12 dias
├── prazo_surfacada (INTEGER) -- 7-14 dias
├── prazo_free_form (INTEGER) -- 10-17 dias
│
├── frete_config (JSONB)
│   ├── tipo (TEXT) -- "PAC", "SEDEX"
│   ├── valor_minimo (NUMERIC)
│   ├── frete_gratis_acima (NUMERIC)
│   ├── taxa_fixa (NUMERIC)
│   └── contato (JSONB)
│       ├── email (TEXT)
│       ├── telefone (TEXT)
│       ├── whatsapp_* (TEXT)
│       ├── representante (TEXT)
│       ├── representante_contato (TEXT)
│       ├── observacoes (TEXT)
│       └── condicoes_pagamento (TEXT)
│
├── desconto_volume (JSONB)
│   ├── 5_unidades (NUMERIC) -- 0.03 = 3%
│   ├── 10_unidades (NUMERIC) -- 0.05 = 5%
│   └── 20_unidades (NUMERIC) -- 0.08 = 8%
│
├── ativo (BOOLEAN)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ)

ÍNDICES:
- pk_fornecedores (id)
- uk_fornecedores_cnpj (cnpj)
- idx_fornecedores_nome (nome) WHERE ativo = true
- idx_fornecedores_ativo (ativo)

TOTAL ESPERADO: 11 fornecedores (inicial)
CRESCIMENTO: +2-5/ano
```

#### 👤 **Tabela: clientes** (FUTURO)
```sql
clientes (PLANEJADO - Fase 2)
├── id (UUID, PK)
├── tipo_pessoa (ENUM) -- fisica, juridica
├── nome (TEXT)
├── cpf_cnpj (VARCHAR 18, UNIQUE)
├── email (TEXT)
├── telefone (VARCHAR 20)
├── data_nascimento (DATE)
│
├── endereco (JSONB)
│   ├── cep (TEXT)
│   ├── logradouro (TEXT)
│   ├── numero (TEXT)
│   ├── complemento (TEXT)
│   ├── bairro (TEXT)
│   ├── cidade (TEXT)
│   └── estado (TEXT)
│
├── historico_compras (JSONB)
├── credito_limite (DECIMAL 10,2)
├── credito_utilizado (DECIMAL 10,2)
│
├── ativo (BOOLEAN)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ)
```

---

### Schema: `compras`

#### 🛒 **Tabela: pedidos**
```sql
pedidos
├── id (UUID, PK)
├── numero_pedido (VARCHAR 50, UNIQUE) -- "PED-2025-00001"
├── fornecedor_id (UUID, FK → core.fornecedores)
│
├── status (ENUM) -- rascunho, enviado, confirmado, em_producao, enviado_fornecedor, recebido, cancelado
├── data_pedido (TIMESTAMPTZ)
├── data_confirmacao (TIMESTAMPTZ)
├── data_previsao_entrega (TIMESTAMPTZ)
├── data_recebimento (TIMESTAMPTZ)
│
├── valor_total (DECIMAL 10,2) -- AUTO calculado
├── valor_frete (DECIMAL 10,2)
├── valor_desconto (DECIMAL 10,2)
│
├── observacoes (TEXT)
├── observacoes_internas (TEXT)
├── codigo_rastreio (VARCHAR 100)
│
├── created_by (UUID) -- Futuro: FK → usuarios
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ)

ÍNDICES:
- pk_pedidos (id)
- uk_pedidos_numero (numero_pedido)
- idx_pedidos_fornecedor (fornecedor_id)
- idx_pedidos_status (status)
- idx_pedidos_data (data_pedido DESC)

TRIGGERS:
- trg_pedidos_updated_at (atualiza timestamp)
```

#### 📦 **Tabela: pedido_itens**
```sql
pedido_itens
├── id (UUID, PK)
├── pedido_id (UUID, FK → pedidos CASCADE)
├── lente_id (UUID, FK → lens_catalog.lentes)
│
├── quantidade (INTEGER, CHECK > 0)
├── quantidade_recebida (INTEGER, CHECK >= 0)
│
├── preco_unitario (DECIMAL 10,2, CHECK >= 0)
├── desconto_unitario (DECIMAL 10,2, CHECK >= 0)
├── subtotal (DECIMAL 10,2) -- GENERATED ALWAYS
│
├── observacoes (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

ÍNDICES:
- pk_pedido_itens (id)
- idx_pedido_itens_pedido (pedido_id)
- idx_pedido_itens_lente (lente_id)

TRIGGERS:
- trg_pedido_itens_valor_total (atualiza valor_total do pedido)
```

#### 📈 **Tabela: estoque_movimentacoes**
```sql
estoque_movimentacoes
├── id (UUID, PK)
├── lente_id (UUID, FK → lens_catalog.lentes)
├── pedido_id (UUID, FK → pedidos)
├── pedido_item_id (UUID, FK → pedido_itens)
│
├── tipo (ENUM) -- entrada_compra, saida_venda, ajuste_positivo, ajuste_negativo, 
│                -- transferencia, devolucao_fornecedor, devolucao_cliente
│
├── quantidade (INTEGER)
├── saldo_anterior (INTEGER) -- Auditoria
├── saldo_atual (INTEGER) -- Auditoria
│
├── custo_unitario (DECIMAL 10,2)
├── valor_total (DECIMAL 10,2)
│
├── data_movimentacao (TIMESTAMPTZ)
├── observacoes (TEXT)
│
├── lote (VARCHAR 100)
├── validade (DATE)
│
├── usuario_id (UUID) -- Quem fez
└── created_at (TIMESTAMPTZ)

ÍNDICES:
- pk_estoque_mov (id)
- idx_estoque_mov_lente (lente_id)
- idx_estoque_mov_tipo (tipo)
- idx_estoque_mov_data (data_movimentacao DESC)
- idx_estoque_mov_pedido (pedido_id)

PARTICIONAMENTO FUTURO:
- Por data_movimentacao (range mensal)
```

#### 📊 **Tabela: estoque_saldo**
```sql
estoque_saldo
├── id (UUID, PK)
├── lente_id (UUID, UNIQUE, FK → lens_catalog.lentes)
│
├── quantidade_disponivel (INTEGER, CHECK >= 0)
├── quantidade_reservada (INTEGER, CHECK >= 0)
├── quantidade_minima (INTEGER) -- Alerta
├── quantidade_maxima (INTEGER)
│
├── custo_medio (DECIMAL 10,2) -- Custo médio ponderado
├── valor_total_estoque (DECIMAL 10,2) -- GENERATED ALWAYS
│
├── ultima_entrada (TIMESTAMPTZ)
├── ultima_saida (TIMESTAMPTZ)
│
└── updated_at (TIMESTAMPTZ)

ÍNDICES:
- pk_estoque_saldo (id)
- uk_estoque_lente (lente_id)
- idx_estoque_baixo (quantidade_disponivel) WHERE quantidade_disponivel <= quantidade_minima
```

#### 💰 **Tabela: historico_precos**
```sql
historico_precos
├── id (UUID, PK)
├── lente_id (UUID, FK → lens_catalog.lentes)
├── fornecedor_id (UUID, FK → core.fornecedores)
│
├── preco_compra (DECIMAL 10,2)
├── preco_anterior (DECIMAL 10,2)
├── percentual_variacao (DECIMAL 5,2) -- 5.50 = 5.5%
│
├── pedido_id (UUID, FK → pedidos)
├── data_vigencia_inicio (TIMESTAMPTZ)
├── data_vigencia_fim (TIMESTAMPTZ)
│
├── observacoes (TEXT)
└── created_at (TIMESTAMPTZ)

ÍNDICES:
- pk_historico_precos (id)
- idx_historico_lente (lente_id)
- idx_historico_fornecedor (fornecedor_id)
- idx_historico_vigencia (data_vigencia_inicio DESC)

PARTICIONAMENTO FUTURO:
- Por data_vigencia_inicio (range anual)
```

---

## 🔗 RELACIONAMENTOS

### Diagrama de Relacionamentos Principais

```
┌─────────────────┐
│   fornecedores  │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐       ┌─────────────────┐
│     lentes      │◄──────┤     marcas      │
└────────┬────────┘  N:1  └─────────────────┘
         │ N
         │
         │ 1
┌────────▼────────────┐
│  grupos_canonicos   │
└────────┬────────────┘
         │ 1
         │
         │ 1:1 (ou manual)
┌────────▼────────────┐
│ lentes_canonicas    │
└─────────────────────┘

┌─────────────────┐
│   fornecedores  │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐       ┌─────────────────┐
│    pedidos      │       │     lentes      │
└────────┬────────┘       └────────┬────────┘
         │ 1                       │ 1
         │                         │
         │ N                       │ N
┌────────▼─────────────────────────▼────────┐
│            pedido_itens                    │
└────────┬────────────────────────────────┬─┘
         │ 1                              │
         │                                │
         │ N                              │
┌────────▼────────────┐                   │
│ estoque_moviment... │                   │
└─────────────────────┘                   │
                                           │
┌──────────────────────────────────────────▼──┐
│          estoque_saldo                      │
│  (1 registro por lente)                     │
└─────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     lentes      │       │  fornecedores   │
└────────┬────────┘       └────────┬────────┘
         │ 1:N                     │ 1:N
         │                         │
         └─────────┬───────────────┘
                   │
                   │ N:N
           ┌───────▼────────┐
           │ historico_prec │
           └────────────────┘
```

### Integridade Referencial

#### Foreign Keys Críticas
```sql
-- Catálogo
lentes.fornecedor_id → fornecedores.id (RESTRICT)
lentes.marca_id → marcas.id (RESTRICT)
lentes.grupo_canonico_id → grupos_canonicos.id (SET NULL)
lentes_canonicas.grupo_canonico_id → grupos_canonicos.id (CASCADE)

-- Compras
pedidos.fornecedor_id → fornecedores.id (RESTRICT)
pedido_itens.pedido_id → pedidos.id (CASCADE)
pedido_itens.lente_id → lentes.id (RESTRICT)
estoque_movimentacoes.lente_id → lentes.id (RESTRICT)
estoque_movimentacoes.pedido_id → pedidos.id (SET NULL)
estoque_saldo.lente_id → lentes.id (RESTRICT)
historico_precos.lente_id → lentes.id (CASCADE)
historico_precos.fornecedor_id → fornecedores.id (RESTRICT)
```

#### Regras de Cascata
- ✅ **CASCADE**: `pedido_itens` quando `pedidos` é deletado
- ✅ **CASCADE**: `lentes_canonicas` quando `grupos_canonicos` é deletado
- ✅ **RESTRICT**: Fornecedor não pode ser deletado se tiver lentes ativas
- ✅ **SET NULL**: Grupo canônico pode ser dissociado

---

## 🚀 ESTRATÉGIA DE MIGRAÇÃO

### Fase 0: Preparação (COMPLETO ✅)
```
┌─────────────────────────────────────────┐
│ 00_RESET_COMPLETO.sql                   │
│ • DROP schemas CASCADE                  │
│ • Limpa ENUMs                           │
│ • Backup automático                     │
└─────────────────────────────────────────┘
```

### Fase 1: Estrutura Base (COMPLETO ✅)
```
┌─────────────────────────────────────────┐
│ 01_ESTRUTURA_BASE.sql                   │
│ • CREATE SCHEMAs (3):                   │
│   - lens_catalog                        │
│   - core                                │
│   - compras                             │
│ • CREATE ENUMs (12)                     │
│ • CREATE TABLEs (9):                    │
│   - marcas                              │
│   - lentes_canonicas                    │
│   - grupos_canonicos                    │
│   - fornecedores                        │
│   - pedidos                             │
│   - pedido_itens                        │
│   - estoque_movimentacoes               │
│   - estoque_saldo                       │
│   - historico_precos                    │
│ • Índices básicos                       │
│ • Triggers de auditoria                 │
│ • Views de consulta                     │
└─────────────────────────────────────────┘
```

### Fase 2: Tabela Principal (COMPLETO ✅)
```
┌─────────────────────────────────────────┐
│ 02_TABELA_LENTES.sql                    │
│ • CREATE TABLE lentes (completa)        │
│ • Índices de performance                │
│ • Triggers de canonização               │
│ • Funções de normalização               │
│ • Views otimizadas                      │
└─────────────────────────────────────────┘
```

### Fase 3: População Inicial

#### Checkpoint 1: Fornecedores
```
┌─────────────────────────────────────────┐
│ 01_POPULAR_FORNECEDORES.sql             │
│ • INSERT 11 fornecedores                │
│ • UUIDs preservados do CSV              │
│ • Configurações JSONB completas         │
│ • Dados de contato                      │
│ • Prazos por tipo de lente              │
└─────────────────────────────────────────┘

Verificação:
SELECT COUNT(*) FROM core.fornecedores;
-- Esperado: 11
```

#### Checkpoint 2: Marcas
```
┌─────────────────────────────────────────┐
│ 02_POPULAR_MARCAS.sql                   │
│ • INSERT 7 marcas                       │
│ • Slugs SEO-friendly                    │
│ • Categorização premium                 │
└─────────────────────────────────────────┘

Verificação:
SELECT COUNT(*) FROM lens_catalog.marcas;
-- Esperado: 7
```

#### Checkpoint 3: Lentes (CSV Import)
```
┌─────────────────────────────────────────┐
│ LENTES_IMPORT.csv                       │
│ • COPY 1.411 lentes                     │
│ • Validação de FKs                      │
│ • Trigger de canonização dispara        │
└─────────────────────────────────────────┘

Comando:
COPY lens_catalog.lentes(
  id, fornecedor_id, marca_id, nome_lente, 
  tipo_lente, material, ...
) FROM '/path/LENTES_IMPORT.csv' CSV HEADER;

Verificação:
SELECT COUNT(*) FROM lens_catalog.lentes;
-- Esperado: 1.411
```

#### Checkpoint 4: Canonização Automática
```
┌─────────────────────────────────────────┐
│ 05_TRIGGERS_CANONIZACAO.sql             │
│ • Trigger executa automaticamente       │
│ • Cria grupos canônicos                 │
│ • Associa lentes aos grupos             │
│ • Calcula preços médios                 │
└─────────────────────────────────────────┘

Verificação:
SELECT COUNT(*) FROM lens_catalog.grupos_canonicos;
-- Esperado: 300-500
```

#### Checkpoint 5: Precificação Dinâmica
```
┌─────────────────────────────────────────┐
│ 06_PRECIFICACAO_DINAMICA.sql            │
│ • Atualiza preços médios dos grupos     │
│ • Cria lentes canônicas (se não exist)  │
│ • Calcula margens                       │
└─────────────────────────────────────────┘

Verificação:
SELECT AVG(preco_medio) FROM lens_catalog.grupos_canonicos;
-- Deve retornar valores consistentes
```

### Tempo Total de Migração
```
┌────────────────────┬──────────────┐
│ Fase               │ Tempo        │
├────────────────────┼──────────────┤
│ 0. Reset           │ 10 segundos  │
│ 1. Estrutura Base  │ 30 segundos  │
│ 2. Tabela Lentes   │ 15 segundos  │
│ 3. Fornecedores    │ 5 segundos   │
│ 4. Marcas          │ 2 segundos   │
│ 5. Lentes (CSV)    │ 2 minutos    │
│ 6. Canonização     │ 1 minuto     │
│ 7. Precificação    │ 30 segundos  │
├────────────────────┼──────────────┤
│ TOTAL              │ ~5 minutos   │
└────────────────────┴──────────────┘
```

---

## 📊 EVOLUÇÃO DA NORMALIZAÇÃO - CENÁRIOS TESTADOS

### Histórico de Cenários

O sistema passou por várias iterações na estratégia de agrupamento de lentes (`grupos_canonicos`) até chegar ao modelo atual que garante 100% de comparabilidade.

#### CENÁRIO 1-3: Agrupamento Simples
**Critérios**: tipo + material + índice  
**Resultado**: 
- ~50-80 grupos
- ❌ Problema: Grupos muito heterogêneos
- ❌ Lentes de graus muito diferentes no mesmo grupo
- ❌ Impossível comparar preços corretamente

#### CENÁRIO 4: Agrupamento por Ranges de Graus
**Critérios**: tipo + material + índice + 6 campos de ranges  
**Campos de Range**:
- `grau_esferico_min`, `grau_esferico_max`
- `grau_cilindrico_min`, `grau_cilindrico_max`
- `adicao_min`, `adicao_max`

**Resultado**:
- 197 grupos criados
- ✅ Comparabilidade perfeita de graus
- ❌ Problema: Tratamentos diferentes no mesmo grupo
- ❌ Exemplo: Lente com AR vs sem AR no mesmo grupo

#### CENÁRIO 5: Agrupamento por Ranges + Tratamentos (ATUAL)
**Critérios**: tipo + material + índice + 6 ranges + 5 tratamentos  
**Campos de Tratamento**:
- `tratamento_antirreflexo` (BOOLEAN)
- `tratamento_antirrisco` (BOOLEAN)
- `tratamento_uv` (BOOLEAN)
- `tratamento_blue_light` (BOOLEAN)
- `tratamento_fotossensiveis` (ENUM: nenhum, fotocromático, polarizado)

**Resultado**:
- ✅ 461 grupos criados
- ✅ 100% de comparabilidade (mesmos graus E mesmos tratamentos)
- ✅ Grupos homogêneos e comparáveis
- ✅ Automação de associação funciona perfeitamente

**Lógica Premium**:
```sql
-- Grupo é premium se contém QUALQUER lente de marca premium
is_premium = BOOL_OR(marcas.is_premium)
```

**Distribuição Atual (CENÁRIO 5)**:
- Total de grupos: 461
- Grupos premium: ~120 (26%)
- Grupos não-premium: ~341 (74%)
- Total de lentes: 1.411
- Taxa de associação: 100%

**Exemplo de Grupo CENÁRIO 5**:
```
Nome: "Lente CR39 1.50 Visao Simples [-6.00/-4.50 | -2.00/-0.50] +AR +UV"
Critérios:
├── tipo_lente: visao_simples
├── material: CR39
├── indice_refracao: 1.50
├── grau_esferico: -6.00 a -4.50
├── grau_cilindrico: -2.00 a -0.50
├── adicao: null (não se aplica)
├── tratamento_antirreflexo: true
├── tratamento_antirrisco: false
├── tratamento_uv: true
├── tratamento_blue_light: false
└── tratamento_fotossensiveis: nenhum

Resultado: Todas as lentes deste grupo são PERFEITAMENTE comparáveis
```

### Automação e Triggers

As triggers de automação foram atualizadas para considerar todos os 5 campos de tratamento:

```sql
-- fn_associar_lente_grupo_automatico()
-- Busca grupo WHERE:
--   tipo_lente = NEW.tipo_lente AND
--   material = NEW.material AND
--   indice_refracao = NEW.indice_refracao AND
--   ranges coincidem E
--   tratamento_antirreflexo = NEW.tratamento_antirreflexo AND
--   tratamento_antirrisco = NEW.tratamento_antirrisco AND
--   tratamento_uv = NEW.tratamento_uv AND
--   tratamento_blue_light = NEW.tratamento_blue_light AND
--   tratamento_fotossensiveis = NEW.tratamento_fotossensiveis
```

---

## 🌐 VIEWS PÚBLICAS PARA FRONTEND

### Estratégia de Abstração

#### Schema `public` - Camada de Interface
```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND                               │
│                       ↓                                   │
│              Acessa apenas PUBLIC                         │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│                 SCHEMA: public                            │
│                                                           │
│  Views:                     Funções:                      │
│  • v_lentes_catalogo        • buscar_lentes()            │
│  • v_lentes_busca           • obter_alternativas_lente() │
│  • v_lentes_destaques       • calcular_frete()           │
│  • v_grupos_canonicos       • verificar_estoque()        │
│  • v_grupos_canonicos_completos (NEW - com ranges)       │
│  • v_grupos_premium_marcas  (NEW - premium com marcas)   │
│  • v_filtros_grupos_canon.. (NEW)                        │
│  • v_fornecedores_catalogo                               │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│          SCHEMAS INTERNOS (não acessados)                 │
│                                                           │
│  • lens_catalog (lentes, marcas, grupos)                 │
│  • core (fornecedores, clientes)                         │
│  • compras (pedidos, estoque)                            │
└──────────────────────────────────────────────────────────┘
```

### Vantagens desta Abordagem

✅ **Segurança**: Frontend nunca acessa tabelas diretamente  
✅ **Performance**: Views otimizadas com joins pré-calculados  
✅ **Manutenibilidade**: Mudanças internas não quebram frontend  
✅ **Versionamento**: Criar v2 de views sem afetar v1  
✅ **Simplicidade**: Frontend trabalha com dados desnormalizados  
✅ **Auditoria**: Logs de acesso às views  

### Views Principais

#### 1. `v_lentes_catalogo` - Catálogo Completo
```sql
-- Uso: SELECT * FROM public.v_lentes_catalogo WHERE tipo_lente = 'visao_simples'
-- Retorna: Lentes com fornecedor, marca, grupo, estoque
-- Performance: ~50-100ms para 1.411 lentes
```

**Campos disponíveis**:
- Identificação: id, slug, nome
- Fornecedor: nome, prazos
- Marca: nome, is_premium
- Técnico: tipo, material, índice, tratamentos
- Preços: custo, venda, margem
- Estoque: disponível, reservado
- Status: ativo, peso

#### 2. `v_lentes_busca` - Busca Otimizada
```sql
-- Uso: SELECT * FROM public.v_lentes_busca 
--       WHERE search_text ILIKE '%transitions%'
-- Retorna: Campos essenciais para listagem
-- Performance: ~20-30ms
```

**Otimizações**:
- Menos campos (mais rápida)
- Campo `search_text` concatenado
- Índice GiST para full-text search (futuro)

#### 3. `v_lentes_destaques` - Top Produtos (MATERIALIZED)
```sql
-- Uso: SELECT * FROM public.v_lentes_destaques
-- Retorna: Top 20 lentes populares
-- Performance: ~5ms (em memória)
-- Atualização: REFRESH MATERIALIZED VIEW (diário)
```

**Badges automáticos**:
- `premium` - Marcas premium
- `economica` - Preço < R$100
- `blue_light` - Filtro luz azul
- `fotossensiveis` - Transitions/fotocromáticas

#### 4. `v_grupos_canonicos` - Grupos com Estatísticas
```sql
-- Uso: SELECT * FROM public.v_grupos_canonicos 
--       WHERE tipo_lente = 'multifocal'
-- Retorna: Grupos + array de fornecedores disponíveis (JSONB) + tratamentos
```

**Estatísticas incluídas**:
- Total de lentes no grupo
- Preço mínimo, máximo, médio
- Fornecedores disponíveis (JSONB array)
- Contagem de lentes ativas
- **Tratamentos do grupo**: tratamento_antirreflexo, tratamento_antirrisco, tratamento_uv, tratamento_blue_light, tratamento_fotossensiveis
- **is_premium**: Indica se o grupo contém lentes de marca premium

#### 4.1. `v_grupos_canonicos_completos` - Grupos com Ranges de Graus (NOVA)
```sql
-- Uso: SELECT * FROM public.v_grupos_canonicos_completos 
--       WHERE tipo_lente = 'visao_simples' AND grau_esferico_min >= -6.00
-- Retorna: Grupos completos com ranges de graus calculados das lentes
```

**Campos adicionais**:
- **Ranges de Graus** (calculados do grupo):
  - `grau_esferico_min`, `grau_esferico_max`
  - `grau_cilindrico_min`, `grau_cilindrico_max`
  - `adicao_min`, `adicao_max`
- **categoria_predominante** - Categoria mais comum entre as lentes do grupo (usando MODE())
- **total_marcas** - Contagem de marcas distintas no grupo

**Uso recomendado**: Quando precisar filtrar grupos por ranges de graus ou exibir os ranges na interface do usuário.

**Exemplo de query**:
```sql
-- Buscar grupos para grau esférico entre -3.00 e -6.00
SELECT nome_grupo, grau_esferico_min, grau_esferico_max, categoria_predominante
FROM public.v_grupos_canonicos_completos
WHERE grau_esferico_min <= -3.00 AND grau_esferico_max >= -6.00
ORDER BY preco_medio;
```

#### 4.2. `v_grupos_premium_marcas` - Grupos Premium com Marcas (NOVA)
```sql
-- Uso: SELECT * FROM public.v_grupos_premium_marcas 
--       WHERE tipo_lente = 'multifocal'
-- Retorna: Todos os grupos premium com marcas disponíveis
```

**Propósito**: View especializada para exibir grupos premium (is_premium = true) com detalhamento completo das marcas disponíveis em cada grupo.

**Campos incluídos**:
- Informações básicas do grupo (id, slug, nome, tipo, material, índice)
- Tratamentos do grupo (5 campos)
- Preços (mínimo, máximo, médio)
- **marcas_disponiveis** (JSONB array): Array de objetos com detalhes de cada marca
  - marca_id, marca_nome, marca_slug
  - is_premium da marca
  - total_lentes dessa marca no grupo
- **total_marcas**: Contagem de marcas distintas no grupo
- **marcas_nomes**: String concatenada com nomes das marcas (para busca)

**Exemplo de resposta**:
```json
{
  "grupo_id": "uuid",
  "nome_grupo": "Lente Policarbonato 1.59 Multifocal +AR +UV",
  "tipo_lente": "multifocal",
  "preco_medio": 450.00,
  "marcas_disponiveis": [
    {
      "marca_id": "uuid",
      "marca_nome": "Essilor",
      "marca_slug": "essilor",
      "is_premium": true,
      "total_lentes": 8
    },
    {
      "marca_id": "uuid",
      "marca_nome": "Varilux",
      "marca_slug": "varilux", 
      "is_premium": true,
      "total_lentes": 5
    }
  ],
  "total_marcas": 2,
  "marcas_nomes": "Essilor, Varilux"
}
```

**Casos de uso**:
- Listar produtos premium na homepage
- Filtrar por marca específica em grupos premium
- Mostrar variedade de marcas disponíveis
- Comparar opções premium

#### 6. `v_grupos_com_lentes` - Motor de Escolhas
```sql
-- Uso: SELECT * FROM public.v_grupos_com_lentes 
--       WHERE tipo_lente = 'visao_simples'
-- Retorna: Grupos com array de lentes detalhadas (JSONB)
```

**Estrutura do JSONB**:
```json
{
  "grupo_id": "uuid",
  "nome_grupo": "CR39 1.50 Visão Simples +AR +UV",
  "lentes": [
    {
      "id": "uuid",
      "nome": "Lente Brascor CR39 1.50",
      "fornecedor_nome": "Brascor",
      "preco": 89.90,
      "prazo_dias": 7,
      "estoque": 15,
      "tratamentos": {
        "antirreflexo": true,
        "antirrisco": false,
        "uv": true,
        "blue_light": false,
        "fotossensiveis": "nenhum"
      }
    },
    ...
  ]
}
```

#### 8. `v_fornecedores_catalogo` - Dados Públicos
```sql
-- Uso: SELECT * FROM public.v_fornecedores_catalogo
-- Retorna: Fornecedores SEM dados sensíveis
```

**Dados expostos**:
- ✅ Nome, razão social
- ✅ Prazos de entrega
- ✅ Estatísticas (total lentes, marcas)
- ✅ Preços (min, max, médio)
- ✅ Email e telefone de contato
- ❌ CNPJ completo (últimos 4 dígitos apenas)
- ❌ Dados bancários
- ❌ Contratos

#### 9. `v_filtros_disponiveis` - Faceted Search
```sql
-- Uso: SELECT * FROM public.v_filtros_disponiveis
-- Retorna: Opções para cada filtro + contagens
```

**Filtros gerados**:
- Tipo de lente (visao_simples: 800, multifocal: 400, ...)
- Material (CR39: 600, POLICARBONATO: 500, ...)
- Índice de refração (1.50: 400, 1.67: 300, ...)
- Categoria (economica: 900, premium: 300, ...)
- Marca (ESSILOR: 200, VARILUX: 150, ...)
- Fornecedor (Brascor: 58, Sygma: 14, ...)

#### 10. `v_filtros_grupos_canonicos` - Filtros Agregados por Grupos 🆕
```sql
-- Uso: SELECT * FROM public.v_filtros_grupos_canonicos
-- Retorna: Filtros agregados por grupos canônicos (não lentes individuais)
-- Performance: ~40-60ms para 197 grupos
-- Criada: 2025-12-19
```

**Propósito**: 
View especial para PDV (Point of Sale) que agrega filtros baseados em **grupos canônicos** ao invés de lentes individuais. Permite filtrar catálogo com estatísticas precisas de quantos grupos correspondem a cada filtro.

**Estrutura retornada**:
```typescript
{
  filtro_categoria: string       // tipo_lente | material | indice_refracao | categoria | is_premium | antirreflexo | blue_light | fotossensiveis
  filtro_valor: string           // valor específico (ex: "CR39", "1.56", "true")
  total_grupos: number           // quantos grupos canônicos possuem esse valor
  preco_min: decimal             // menor preço entre os grupos
  preco_max: decimal             // maior preço entre os grupos
  preco_medio_geral: decimal     // preço médio ponderado
  total_lentes_agregado: number  // total de lentes individuais nos grupos
}
```

**Exemplo de dados**:
```json
[
  {
    "filtro_categoria": "tipo_lente",
    "filtro_valor": "visao_simples",
    "total_grupos": 120,
    "preco_min": 10.00,
    "preco_max": 830.00,
    "preco_medio_geral": 156.23,
    "total_lentes_agregado": 850
  },
  {
    "filtro_categoria": "material",
    "filtro_valor": "CR39",
    "total_grupos": 65,
    "preco_min": 15.00,
    "preco_max": 450.00,
    "preco_medio_geral": 98.50,
    "total_lentes_agregado": 380
  },
  {
    "filtro_categoria": "indice_refracao",
    "filtro_valor": "1.56",
    "total_grupos": 44,
    "preco_min": 10.00,
    "preco_max": 830.00,
    "preco_medio_geral": 163.48,
    "total_lentes_agregado": 182
  }
]
```

**SQL Implementação**:
```sql
CREATE OR REPLACE VIEW public.v_filtros_grupos_canonicos AS
-- Tipo de Lente
SELECT 
  'tipo_lente'::TEXT as filtro_categoria,
  tipo_lente::TEXT as filtro_valor,
  COUNT(DISTINCT grupo_id) as total_grupos,
  MIN(preco_venda_sugerido) as preco_min,
  MAX(preco_venda_sugerido) as preco_max,
  AVG(preco_venda_sugerido) as preco_medio_geral,
  SUM(total_lentes) as total_lentes_agregado
FROM public.v_grupos_canonicos
WHERE tipo_lente IS NOT NULL
GROUP BY tipo_lente

UNION ALL

-- Material
SELECT 
  'material'::TEXT,
  material::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE material IS NOT NULL
GROUP BY material

UNION ALL

-- Índice de Refração
SELECT 
  'indice_refracao'::TEXT,
  indice_refracao::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE indice_refracao IS NOT NULL
GROUP BY indice_refracao

UNION ALL

-- Categoria
SELECT 
  'categoria'::TEXT,
  categoria::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE categoria IS NOT NULL
GROUP BY categoria

UNION ALL

-- Premium (is_premium)
SELECT 
  'is_premium'::TEXT,
  is_premium::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE is_premium IS NOT NULL
GROUP BY is_premium

UNION ALL

-- Antirreflexo
SELECT 
  'antirreflexo'::TEXT,
  antirreflexo::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE antirreflexo IS NOT NULL
GROUP BY antirreflexo

UNION ALL

-- Blue Light
SELECT 
  'blue_light'::TEXT,
  blue_light::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE blue_light IS NOT NULL
GROUP BY blue_light

UNION ALL

-- Fotossensíveis
SELECT 
  'fotossensiveis'::TEXT,
  fotossensiveis::TEXT,
  COUNT(DISTINCT grupo_id),
  MIN(preco_venda_sugerido),
  MAX(preco_venda_sugerido),
  AVG(preco_venda_sugerido),
  SUM(total_lentes)
FROM public.v_grupos_canonicos
WHERE fotossensiveis IS NOT NULL
GROUP BY fotossensiveis

ORDER BY filtro_categoria, total_grupos DESC;
```

**Uso no Frontend**:
```typescript
// Hook retorna estrutura tipada
const { data: filtros } = useFiltrosDisponiveis();

// Estrutura:
{
  tipos: [
    { valor: "visao_simples", total: 120, preco_min: 10, preco_max: 830 },
    { valor: "multifocal", total: 55, preco_min: 80, preco_max: 950 }
  ],
  materiais: [
    { valor: "CR39", total: 65, preco_min: 15, preco_max: 450 },
    { valor: "POLICARBONATO", total: 52, preco_min: 50, preco_max: 680 }
  ],
  indices: [
    { valor: "1.56", total: 44, preco_min: 10, preco_max: 830 },
    { valor: "1.67", total: 38, preco_min: 120, preco_max: 950 }
  ]
  // ... outros filtros
}
```

**Diferença vs `v_filtros_disponiveis`**:
| Aspecto | v_filtros_disponiveis | v_filtros_grupos_canonicos |
|---------|----------------------|----------------------------|
| Base de dados | Lentes individuais (1.411) | Grupos canônicos (197) |
| Uso | Admin/Compras | PDV/Vendas |
| Contagens | Total de lentes | Total de grupos |
| Performance | 30-50ms | 40-60ms |
| Informação de preço | Não | Sim (min/max/média) |

**Vantagens**:
- ✅ Filtros correspondem exatamente aos cards exibidos (grupos)
- ✅ Mostra faixas de preço para cada opção de filtro
- ✅ Estatísticas precisas de quantos grupos retornarão
- ✅ UX melhor: "Policarbonato (52 grupos • R$50-680)"
- ✅ Alinha com estratégia de venda (grupos canônicos no PDV)

---

## 🏪 VIEWS E FUNÇÕES ESPECIALIZADAS PARA PDV

### Visão Geral

Esta seção documenta as views e RPCs criadas especificamente para o **Ponto de Venda (PDV)** do sistema Best Lens. O modelo de negócio é **JIT (Just-In-Time)** sem estoque físico, com foco em:

- ✅ Busca por receita do cliente (graus)
- ✅ Segmentação por faixa de preço
- ✅ Gamificação de vendas (margem)
- ✅ Sugestões de upgrade (upselling)
- ✅ Gestão de precificação com controle de desconto

### Modelo de Precificação

**Markup Padrão**: 4x sobre o custo  
**Markup Mínimo**: 3.6x (exceções raras)  
**Desconto Máximo**: 10% sobre preço médio  

**Níveis de Acesso**:
- **Vendedor**: Trabalha com `preco_medio`, desconto até 10%
- **Gerente**: Trabalha com `preco_medio`, desconto até 10%
- **Admin**: Pode usar `preco_minimo` com validação de margem mínima

---

### 📋 VIEWS PARA PDV - VENDAS

#### 11. `v_grupos_por_receita_cliente` - Busca por Grau do Cliente ⭐⭐⭐
```sql
-- Uso: SELECT * FROM public.v_grupos_por_receita_cliente 
--       WHERE -6.00 BETWEEN grau_esferico_min AND grau_esferico_max
--       AND -2.00 BETWEEN grau_cilindrico_min AND grau_cilindrico_max
```

**Propósito**: View principal do PDV. Recebe os graus da receita do cliente e retorna apenas os grupos compatíveis.

**Campos**:
- Informações do grupo (id, nome, slug, tipo, material, índice)
- Ranges de graus (para validação)
- Tratamentos disponíveis
- Preços: `preco_minimo`, `preco_medio`, `preco_maximo`
- Margem média: `(preco_medio / custo_medio)::numeric(5,2)`
- Classificação automática: `categoria_sugerida` (economica/intermediaria/premium)
- Total de opções disponíveis: `total_fornecedores`, `total_marcas`

**Categorização Automática**:
```sql
CASE 
  WHEN preco_medio < 150 THEN 'economica'
  WHEN preco_medio BETWEEN 150 AND 400 THEN 'intermediaria'
  ELSE 'premium'
END as categoria_sugerida
```

**Estratégia de Venda - 3 Opções**:
```javascript
// Sugerir 3 produtos ao cliente
const opcoes = await supabase
  .from('v_grupos_por_receita_cliente')
  .select('*')
  .gte('grau_esferico_min', grauEsferico)
  .lte('grau_esferico_max', grauEsferico)
  .gte('grau_cilindrico_min', grauCilindrico)
  .lte('grau_cilindrico_max', grauCilindrico)
  .order('preco_medio')
  .limit(1); // Opção econômica

// Depois buscar intermediária e premium
```

**Exemplo de Resposta**:
```json
[
  {
    "grupo_id": "uuid",
    "nome_grupo": "Lente CR39 1.50 Visao Simples [-6.00/-4.50 | -2.00/-0.50] +UV",
    "categoria_sugerida": "economica",
    "preco_medio": 89.90,
    "preco_minimo": 75.00,
    "preco_maximo": 120.00,
    "margem_media": 4.2,
    "total_fornecedores": 3,
    "total_marcas": 5
  }
]
```

---

#### 12. `v_grupos_por_faixa_preco` - Segmentação por Investimento ⭐⭐⭐
```sql
-- Uso: SELECT * FROM public.v_grupos_por_faixa_preco
--       WHERE faixa_preco = 'R$150-300'
```

**Propósito**: Facilitar a pergunta: *"Quanto você investiu no seu último óculos?"*  
Permite mostrar opções na faixa atual + sugestão de faixa superior.

**Faixas Definidas**:
- `< R$150` - Entrada
- `R$150-300` - Básico
- `R$300-500` - Intermediário
- `R$500-800` - Premium
- `R$800+` - Super Premium

**Campos**:
- `faixa_preco`: Categoria da faixa
- `faixa_ordem`: Ordem numérica (1-5) para navegação
- Todos os campos do grupo
- `proxima_faixa`: Sugestão de upgrade automático

**Estratégia de Upselling**:
```javascript
// Cliente disse que gastou R$200
const faixaAtual = 'R$150-300';
const { data: opcoes } = await supabase
  .from('v_grupos_por_faixa_preco')
  .select('*')
  .in('faixa_preco', [faixaAtual, 'R$300-500']) // Atual + próxima
  .eq('tipo_lente', tipoDesejado);

// Mostrar opções da faixa atual
// Sugerir "por apenas R$X a mais, você pode ter..."
```

**Exemplo de Resposta**:
```json
[
  {
    "grupo_id": "uuid",
    "nome_grupo": "Lente CR39 1.56 Visao Simples +AR +UV",
    "faixa_preco": "R$150-300",
    "faixa_ordem": 2,
    "preco_medio": 189.90,
    "proxima_faixa": "R$300-500"
  }
]
```

---

#### 13. `v_grupos_melhor_margem` - Ranking de Lucratividade ⭐⭐
```sql
-- Uso: SELECT * FROM public.v_grupos_melhor_margem
--       ORDER BY margem_percentual DESC
--       LIMIT 20
```

**Propósito**: Gamificação e premiação de vendedores. Mostra produtos com melhor margem de lucro.

**Campos**:
- Informações do grupo
- `custo_medio`: Média dos custos das lentes do grupo
- `preco_medio`: Preço de venda médio
- `margem_percentual`: `((preco_medio - custo_medio) / custo_medio * 100)::numeric(5,2)`
- `lucro_unitario`: `(preco_medio - custo_medio)::numeric(10,2)`
- `ranking_margem`: Posição no ranking (ROW_NUMBER)

**Uso para Premiação**:
```sql
-- Top 10 produtos para empurrar este mês
SELECT nome_grupo, margem_percentual, lucro_unitario
FROM v_grupos_melhor_margem
WHERE tipo_lente = 'visao_simples'
ORDER BY ranking_margem
LIMIT 10;
```

**Gamificação**:
- Comissão extra para vendas nos top 20
- Dashboard de vendedores mostrando % de vendas em produtos top margem
- Meta mensal: X% das vendas em produtos top margem

---

#### 14. `v_sugestoes_upgrade` - Upselling Inteligente ⭐⭐
```sql
-- Uso: SELECT * FROM public.v_sugestoes_upgrade
--       WHERE grupo_base_id = 'uuid-do-produto-basico'
```

**Propósito**: Dado um produto básico escolhido, sugerir versões premium com tratamentos melhores.

**Lógica de Sugestão**:
- Mesmo `tipo_lente`, `material`, `indice_refracao`
- Ranges de graus compatíveis
- Mais tratamentos ou melhor categoria
- Diferença de preço calculada
- Benefícios do upgrade listados

**Campos**:
- `grupo_base_id`: Grupo original escolhido
- `grupo_base_nome`: Nome do produto básico
- `grupo_upgrade_id`: Grupo sugerido
- `grupo_upgrade_nome`: Nome do upgrade
- `diferenca_preco`: Quanto mais custa
- `diferenca_percentual`: % de aumento
- `tratamentos_adicionais`: Array com tratamentos extras
- `beneficios`: Texto explicativo

**Exemplo**:
```json
{
  "grupo_base_nome": "Lente CR39 1.50 Visao Simples",
  "grupo_upgrade_nome": "Lente CR39 1.50 Visao Simples +AR +UV +Blue Light",
  "diferenca_preco": 85.00,
  "diferenca_percentual": 45,
  "tratamentos_adicionais": ["Antirreflexo", "Proteção UV", "Filtro Luz Azul"],
  "beneficios": "Proteção completa + conforto visual em telas"
}
```

**Script de Venda**:
```javascript
// Cliente escolheu opção econômica
const upgrade = await supabase
  .from('v_sugestoes_upgrade')
  .select('*')
  .eq('grupo_base_id', escolhaCliente)
  .order('diferenca_preco')
  .limit(2);

// "Por apenas R$85 a mais, você leva proteção completa..."
```

---

### 🔧 FUNÇÕES RPC PARA PDV

#### `calcular_preco_com_desconto()` - Validação de Precificação
```sql
CREATE FUNCTION public.calcular_preco_com_desconto(
  p_grupo_id UUID,
  p_nivel_usuario TEXT, -- 'vendedor', 'gerente', 'admin'
  p_desconto_percentual NUMERIC DEFAULT 0
) RETURNS JSONB
```

**Propósito**: Calcula preço final com desconto aplicado, validando regras de margem mínima.

**Regras de Negócio**:
1. **Vendedor/Gerente**: 
   - Base: `preco_medio`
   - Desconto máximo: 10%
   - Margem mínima: 3.6x validada

2. **Admin**:
   - Pode usar `preco_minimo`
   - Desconto máximo: até margem 3.6x
   - Alerta se abaixo de 3.6x

**Validações**:
- ❌ Desconto > 10% para vendedor/gerente
- ❌ Margem final < 3.6x em qualquer cenário
- ✅ Retorna erro com mensagem clara

**Retorno**:
```json
{
  "sucesso": true,
  "preco_base": 189.90,
  "desconto_percentual": 10,
  "desconto_valor": 18.99,
  "preco_final": 170.91,
  "margem_final": 3.98,
  "margem_valida": true,
  "custo_medio": 42.98,
  "mensagem": "Preço calculado com sucesso"
}
```

**Exemplo de Uso**:
```javascript
const { data } = await supabase.rpc('calcular_preco_com_desconto', {
  p_grupo_id: grupoId,
  p_nivel_usuario: 'vendedor',
  p_desconto_percentual: 8
});

if (!data.sucesso) {
  alert(data.mensagem); // "Desconto ultrapassa margem mínima"
}
```

---

### 📊 VIEWS PARA SISTEMA DE COMPRAS (DCL)

#### 15. `v_fornecedores_por_lente` - Decisão de Compra
```sql
-- Uso: SELECT * FROM public.v_fornecedores_por_lente
--       WHERE lente_id = 'uuid'
--       ORDER BY prazo_entrega_dias
```

**Propósito**: Dado uma lente específica vendida, mostrar todos os fornecedores que a têm, comparando prazos (SLA).

**Campos**:
- `lente_id`, `lente_nome`
- `fornecedor_id`, `fornecedor_nome`
- `preco_custo`
- `prazo_entrega_dias` (SLA)
- `fornecedor_nota`: Avaliação do fornecedor
- `total_compras_historico`: Quantas vezes já compramos

**Lógica de Escolha**:
```sql
-- Melhor fornecedor = menor prazo + histórico bom
ORDER BY prazo_entrega_dias ASC, fornecedor_nota DESC
```

---

#### 16. `v_lentes_cotacao_compra` - Performance Otimizada
```sql
-- Uso: SELECT * FROM public.v_lentes_cotacao_compra
--       WHERE lente_id = ANY(array_lentes_vendidas)
```

**Propósito**: View simplificada e rápida para sistema de compras. Apenas dados essenciais.

**Campos Mínimos**:
- `lente_id`
- `nome`
- `fornecedor_nome`
- `preco_custo`
- `prazo_dias`

**Performance**: ~10-15ms (sem JOINs pesados)

---

### 📈 Fluxo Completo de Venda no PDV

```
1. Cliente entra com receita
   ↓
2. PDV consulta: v_grupos_por_receita_cliente
   → Retorna grupos compatíveis
   ↓
3. Vendedor pergunta: "Quanto investiu no último?"
   ↓
4. PDV filtra: v_grupos_por_faixa_preco
   → Mostra 3 opções (econômica, intermediária, premium)
   ↓
5. Cliente escolhe opção econômica
   ↓
6. PDV sugere: v_sugestoes_upgrade
   → "Por R$X a mais, leve tratamento completo"
   ↓
7. Cliente aceita/recusa
   ↓
8. Vendedor aplica desconto se necessário
   ↓
9. Sistema valida: calcular_preco_com_desconto()
   → Valida margem mínima 3.6x
   ↓
10. Venda confirmada
    ↓
11. Sistema de compras consulta: v_fornecedores_por_lente
    → Escolhe melhor fornecedor (menor SLA)
    ↓
12. Pedido gerado automaticamente (JIT)
```

---

### Funções para API

#### `buscar_lentes()` - Busca Parametrizada
```sql
SELECT * FROM public.buscar_lentes(
    p_tipo_lente := 'visao_simples',
    p_material := 'CR39',
    p_preco_max := 150.00,
    p_tem_ar := true,
    p_limit := 20,
    p_offset := 0
);
```

**Parâmetros opcionais**:
- Tipo, material, índice
- Faixa de preço (min/max)
- Tratamentos (AR, blue light)
- Fornecedor, marca
- Paginação (limit/offset)

#### `obter_alternativas_lente()` - Sugestões
```sql
SELECT * FROM public.obter_alternativas_lente(
    p_lente_id := 'uuid-da-lente',
    p_limit := 5
);
```

**Retorna**:
- Lentes do mesmo grupo canônico
- Ordenadas por diferença de preço
- Máximo 5 alternativas
- Útil para "Veja também"

### Permissões de Acesso

#### Públicas (sem autenticação)
```sql
GRANT SELECT ON public.v_lentes_catalogo TO PUBLIC;
GRANT SELECT ON public.v_lentes_busca TO PUBLIC;
GRANT SELECT ON public.v_lentes_destaques TO PUBLIC;
GRANT SELECT ON public.v_grupos_canonicos TO PUBLIC;
GRANT SELECT ON public.v_grupos_canonicos_completos TO PUBLIC;  -- 🆕 Adicionada 2025-12-20
GRANT SELECT ON public.v_grupos_premium_marcas TO PUBLIC;  -- 🆕 Adicionada 2025-12-20
GRANT SELECT ON public.v_grupos_com_lentes TO PUBLIC;
GRANT SELECT ON public.v_filtros_grupos_canonicos TO PUBLIC;  -- 🆕 Adicionada 2025-12-19
GRANT SELECT ON public.v_fornecedores_catalogo TO PUBLIC;
GRANT SELECT ON public.v_filtros_disponiveis TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_lentes TO PUBLIC;
```

#### Autenticadas (apenas usuários logados)
```sql
GRANT SELECT ON public.v_estoque_disponivel TO authenticated;
GRANT SELECT ON public.v_pedidos_pendentes TO authenticated;
GRANT SELECT ON public.v_estatisticas_catalogo TO authenticated;
```

#### Administrativas (apenas admin)
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA lens_catalog TO admin;
GRANT SELECT ON ALL TABLES IN SCHEMA compras TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA core TO admin;
```

### Manutenção de Views

#### Atualização de Materialized Views
```bash
#!/bin/bash
# refresh_views.sh - Executar diariamente (cron)

psql -h localhost -U postgres -d best_lens -c \
  "REFRESH MATERIALIZED VIEW CONCURRENTLY public.v_lentes_destaques;"
```

#### Monitoramento de Performance
```sql
-- Views mais acessadas
SELECT 
    schemaname,
    viewname,
    pg_stat_get_numscans(oid) as num_scans,
    pg_stat_get_tuples_returned(oid) as tuples_returned
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

#### Recriar Views (se necessário)
```sql
-- Dropa e recria todas as views
\i 03_VIEWS_PUBLICAS_FRONTEND.sql
```

### Exemplos de Uso no Frontend

#### React/Next.js
```typescript
// app/api/lentes/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const { data } = await supabase
    .from('v_lentes_catalogo')
    .select('*')
    .eq('tipo_lente', searchParams.get('tipo'))
    .lte('preco_venda_sugerido', searchParams.get('preco_max'))
    .order('peso', { ascending: false })
    .limit(20);
    
  return Response.json(data);
}
```

#### Svelte
```javascript
// routes/lentes/+page.server.ts
export async function load({ url }) {
  const tipo = url.searchParams.get('tipo') || 'visao_simples';
  
  const { data: lentes } = await supabase
    .from('v_lentes_busca')
    .select('*')
    .eq('tipo_lente', tipo)
    .order('preco', { ascending: true });
    
  return { lentes };
}
```

#### SQL Direto (API REST)
```bash
# GET /api/lentes?tipo=visao_simples
curl "https://api.best_lens.com/lentes?tipo=visao_simples" | jq
```

### Performance Esperada

```
┌────────────────────────────────┬──────────┬─────────────┐
│ View                           │ Tempo    │ Registros   │
├────────────────────────────────┼──────────┼─────────────┤
│ v_lentes_catalogo (sem filtro) │ 80-120ms │ 1.411       │
│ v_lentes_catalogo (filtrado)   │ 20-40ms  │ 50-200      │
│ v_lentes_busca                 │ 15-30ms  │ 1.411       │
│ v_lentes_destaques (cached)    │ 2-5ms    │ 20          │
│ v_grupos_canonicos             │ 50-80ms  │ 300-500     │
│ v_grupos_com_lentes            │ 100-150ms│ 300-500     │
│ v_fornecedores_catalogo        │ 10-20ms  │ 11          │
│ v_filtros_disponiveis          │ 30-50ms  │ ~50 opções  │
└────────────────────────────────┴──────────┴─────────────┘
```

**Otimizações aplicadas**:
- ✅ Índices em colunas filtráveis
- ✅ Materialized view para dados estáticos
- ✅ JSONB para agregações complexas
- ✅ WHERE conditions pushdown
- ✅ Join conditions otimizados

---

## 📈 PLANO DE CRESCIMENTO

### Fase 2: Vendas e Clientes (Próximos 6 meses)

#### Schema: `vendas`
```sql
CREATE SCHEMA vendas;

-- Orçamentos
CREATE TABLE vendas.orcamentos (
    id UUID PRIMARY KEY,
    cliente_id UUID REFERENCES core.clientes(id),
    status ENUM('rascunho', 'enviado', 'aprovado', 'convertido', 'expirado'),
    validade_ate DATE,
    valor_total DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMPTZ
);

-- Pedidos de Venda
CREATE TABLE vendas.pedidos (
    id UUID PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE,
    cliente_id UUID REFERENCES core.clientes(id),
    orcamento_id UUID REFERENCES vendas.orcamentos(id),
    status ENUM('pendente', 'confirmado', 'producao', 'pronto', 'entregue', 'cancelado'),
    valor_total DECIMAL(10,2),
    created_at TIMESTAMPTZ
);

-- Itens de Venda
CREATE TABLE vendas.pedido_itens (
    id UUID PRIMARY KEY,
    pedido_id UUID REFERENCES vendas.pedidos(id) ON DELETE CASCADE,
    lente_id UUID REFERENCES lens_catalog.lentes(id),
    quantidade INTEGER,
    preco_unitario DECIMAL(10,2),
    desconto DECIMAL(10,2),
    subtotal DECIMAL(10,2)
);
```

### Fase 3: Financeiro (12 meses)

#### Schema: `financeiro`
```sql
CREATE SCHEMA financeiro;

-- Contas a Receber
CREATE TABLE financeiro.contas_receber (
    id UUID PRIMARY KEY,
    pedido_venda_id UUID REFERENCES vendas.pedidos(id),
    cliente_id UUID REFERENCES core.clientes(id),
    valor_total DECIMAL(10,2),
    valor_pago DECIMAL(10,2),
    valor_pendente DECIMAL(10,2),
    data_vencimento DATE,
    status ENUM('pendente', 'pago', 'vencido', 'cancelado')
);

-- Contas a Pagar
CREATE TABLE financeiro.contas_pagar (
    id UUID PRIMARY KEY,
    pedido_compra_id UUID REFERENCES compras.pedidos(id),
    fornecedor_id UUID REFERENCES core.fornecedores(id),
    valor_total DECIMAL(10,2),
    valor_pago DECIMAL(10,2),
    data_vencimento DATE,
    status ENUM('pendente', 'pago', 'vencido', 'cancelado')
);
```

### Fase 4: Multi-Loja (18-24 meses)

#### Schema: `organizacao`
```sql
CREATE SCHEMA organizacao;

-- Lojas/Filiais
CREATE TABLE organizacao.lojas (
    id UUID PRIMARY KEY,
    nome TEXT,
    cnpj VARCHAR(18),
    endereco JSONB,
    ativo BOOLEAN
);

-- Usuários por Loja
CREATE TABLE organizacao.usuarios_lojas (
    usuario_id UUID,
    loja_id UUID REFERENCES organizacao.lojas(id),
    permissoes JSONB,
    PRIMARY KEY (usuario_id, loja_id)
);

-- Ajustar estoque por loja
ALTER TABLE compras.estoque_saldo
ADD COLUMN loja_id UUID REFERENCES organizacao.lojas(id);

-- Particionar por loja (se necessário)
```

### Fase 5: Analytics e BI (Contínuo)

#### Schema: `analytics`
```sql
CREATE SCHEMA analytics;

-- Métricas Agregadas
CREATE TABLE analytics.vendas_diarias (
    data DATE PRIMARY KEY,
    total_pedidos INTEGER,
    valor_total DECIMAL(10,2),
    ticket_medio DECIMAL(10,2)
);

-- Produtos mais vendidos
CREATE MATERIALIZED VIEW analytics.produtos_top AS
SELECT 
    l.id,
    l.nome_lente,
    COUNT(vi.id) as total_vendas,
    SUM(vi.quantidade) as quantidade_total,
    SUM(vi.subtotal) as receita_total
FROM lens_catalog.lentes l
JOIN vendas.pedido_itens vi ON l.id = vi.lente_id
GROUP BY l.id, l.nome_lente
ORDER BY total_vendas DESC
LIMIT 100;
```

---

## ⚡ ÍNDICES E PERFORMANCE

### Índices Críticos (Fase 1)

#### Alta Prioridade
```sql
-- Buscas frequentes
CREATE INDEX idx_lentes_search 
ON lens_catalog.lentes(nome_canonizado, tipo_lente, material, indice_refracao)
WHERE ativo = true;

-- Ordenação por preço
CREATE INDEX idx_lentes_preco_tipo 
ON lens_catalog.lentes(tipo_lente, preco_venda_sugerido)
WHERE ativo = true;

-- Join com fornecedores
CREATE INDEX idx_lentes_fornecedor_ativo 
ON lens_catalog.lentes(fornecedor_id, status)
WHERE ativo = true;

-- JSONB (metadados)
CREATE INDEX gin_lentes_metadata 
ON lens_catalog.lentes USING GIN(metadata);

-- Estoque baixo (alerta)
CREATE INDEX idx_estoque_alerta 
ON compras.estoque_saldo(quantidade_disponivel, lente_id)
WHERE quantidade_disponivel <= quantidade_minima;
```

### Índices Compostos (Otimização)
```sql
-- Busca completa de lentes
CREATE INDEX idx_lentes_busca_completa 
ON lens_catalog.lentes(
    tipo_lente, 
    material, 
    indice_refracao, 
    categoria, 
    preco_venda_sugerido
) WHERE ativo = true AND status = 'ativo';

-- Grupos canônicos por características
CREATE INDEX idx_grupos_caracteristicas 
ON lens_catalog.grupos_canonicos(
    tipo_lente,
    material,
    indice_refracao,
    tem_antirreflexo
);
```

### Particionamento (Crescimento Futuro)

#### Tabelas Candidatas
```sql
-- 1. estoque_movimentacoes (por mês)
CREATE TABLE compras.estoque_movimentacoes_2025_01 
PARTITION OF compras.estoque_movimentacoes
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 2. historico_precos (por ano)
CREATE TABLE compras.historico_precos_2025 
PARTITION OF compras.historico_precos
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- 3. vendas.pedidos (por trimestre) - Futuro
```

### Estatísticas e Vacuum
```sql
-- Análise automática
ALTER TABLE lens_catalog.lentes SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- Atualização manual (quando necessário)
ANALYZE lens_catalog.lentes;
ANALYZE lens_catalog.grupos_canonicos;
```

---

## 🔒 SEGURANÇA E RLS

### Row Level Security (Futuro Multi-Loja)

```sql
-- Habilitar RLS
ALTER TABLE lens_catalog.lentes ENABLE ROW LEVEL SECURITY;

-- Política: Usuário vê apenas lentes da sua loja
CREATE POLICY lentes_por_loja ON lens_catalog.lentes
FOR SELECT
USING (
    fornecedor_id IN (
        SELECT f.id 
        FROM core.fornecedores f
        JOIN organizacao.lojas_fornecedores lf ON f.id = lf.fornecedor_id
        WHERE lf.loja_id = current_setting('app.current_loja_id')::uuid
    )
);

-- Política: Admin vê tudo
CREATE POLICY admin_all_lentes ON lens_catalog.lentes
FOR ALL
USING (current_user IN (SELECT username FROM auth.admin_users));
```

### Permissões por Role

```sql
-- Role: Vendedor
CREATE ROLE vendedor;
GRANT SELECT ON lens_catalog.lentes TO vendedor;
GRANT SELECT ON lens_catalog.marcas TO vendedor;
GRANT SELECT ON core.fornecedores TO vendedor;

-- Role: Comprador
CREATE ROLE comprador;
GRANT ALL ON compras.* TO comprador;
GRANT SELECT ON lens_catalog.lentes TO comprador;

-- Role: Admin
CREATE ROLE admin;
GRANT ALL ON ALL TABLES IN SCHEMA lens_catalog TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA core TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA compras TO admin;
```

---

## 💾 BACKUP E RECUPERAÇÃO

### Estratégia de Backup

#### Backup Completo (Diário)
```bash
#!/bin/bash
# backup_diario.sh

DATA=$(date +%Y%m%d)
BACKUP_DIR="/backups/best_lens"

# Backup completo
pg_dump -h localhost -U postgres -d best_lens \
  --format=custom \
  --compress=9 \
  --file="${BACKUP_DIR}/full_backup_${DATA}.dump"

# Backup apenas dados críticos
pg_dump -h localhost -U postgres -d best_lens \
  --schema=lens_catalog \
  --schema=compras \
  --format=plain \
  --file="${BACKUP_DIR}/data_${DATA}.sql"

# Retention: 30 dias
find ${BACKUP_DIR} -name "*.dump" -mtime +30 -delete
```

#### Point-in-Time Recovery (PITR)
```sql
-- Configurar WAL archiving
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'cp %p /backups/wal/%f';

-- Criar restore point
SELECT pg_create_restore_point('pre_migracao_fase2');
```

### Scripts de Restore

```bash
# Restore completo
pg_restore -h localhost -U postgres -d best_lens \
  --clean --if-exists \
  --no-owner --no-privileges \
  /backups/full_backup_20251219.dump

# Restore incremental (apenas dados)
psql -h localhost -U postgres -d best_lens \
  -f /backups/data_20251219.sql
```

---

## 📊 MONITORAMENTO

### Queries Lentas
```sql
-- Criar extensão
CREATE EXTENSION pg_stat_statements;

-- Top 10 queries mais lentas
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    stddev_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Tamanho das Tabelas
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('lens_catalog', 'core', 'compras')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Índices Não Utilizados
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname IN ('lens_catalog', 'core', 'compras')
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Health Check Completo
```sql
-- Criar função de health check
CREATE OR REPLACE FUNCTION public.database_health_check()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check 1: Contagem de lentes
    RETURN QUERY
    SELECT 
        'Lentes Ativas'::TEXT,
        CASE 
            WHEN COUNT(*) >= 1400 THEN 'OK'
            ELSE 'WARNING'
        END,
        COUNT(*)::TEXT || ' lentes'
    FROM lens_catalog.lentes
    WHERE ativo = true;
    
    -- Check 2: Fornecedores ativos
    RETURN QUERY
    SELECT 
        'Fornecedores Ativos'::TEXT,
        CASE 
            WHEN COUNT(*) = 11 THEN 'OK'
            ELSE 'ERROR'
        END,
        COUNT(*)::TEXT || ' fornecedores'
    FROM core.fornecedores
    WHERE ativo = true;
    
    -- Check 3: Grupos canônicos
    RETURN QUERY
    SELECT 
        'Grupos Canônicos'::TEXT,
        CASE 
            WHEN COUNT(*) >= 300 THEN 'OK'
            ELSE 'WARNING'
        END,
        COUNT(*)::TEXT || ' grupos'
    FROM lens_catalog.grupos_canonicos;
    
    -- Check 4: Lentes órfãs (sem grupo)
    RETURN QUERY
    SELECT 
        'Lentes Órfãs'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'OK'
            ELSE 'WARNING'
        END,
        COUNT(*)::TEXT || ' lentes sem grupo'
    FROM lens_catalog.lentes
    WHERE grupo_canonico_id IS NULL AND ativo = true;
    
    -- Check 5: Estoque negativo
    RETURN QUERY
    SELECT 
        'Estoque Negativo'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'OK'
            ELSE 'ERROR'
        END,
        COUNT(*)::TEXT || ' itens'
    FROM compras.estoque_saldo
    WHERE quantidade_disponivel < 0;
    
END;
$$ LANGUAGE plpgsql;

-- Executar
SELECT * FROM public.database_health_check();
```

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### Q1 2025 (Jan-Mar) ✅
- [x] Estrutura base completa
- [x] Migração de fornecedores (11)
- [x] Migração de marcas (7)
- [x] Migração de lentes (1.411)
- [x] Sistema de canonização
- [x] Precificação dinâmica
- [x] Schema de compras

### Q2 2025 (Abr-Jun)
- [ ] Schema de vendas
- [ ] Sistema de clientes
- [ ] Orçamentos
- [ ] Pedidos de venda
- [ ] Integração compras ↔ vendas
- [ ] Dashboards básicos

### Q3 2025 (Jul-Set)
- [ ] Schema financeiro
- [ ] Contas a receber/pagar
- [ ] Fluxo de caixa
- [ ] Relatórios financeiros
- [ ] Conciliação bancária

### Q4 2025 (Out-Dez)
- [ ] Preparação multi-loja
- [ ] Sistema de permissões
- [ ] RLS implementation
- [ ] Analytics avançado
- [ ] Otimização de performance

### 2026+
- [ ] Multi-loja completo
- [ ] API pública
- [ ] Integração com ERPs
- [ ] Mobile app
- [ ] BI avançado

---

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- ✅ Queries < 100ms (95% das consultas)
- ✅ Import CSV < 2 minutos (1.500 lentes)
- ✅ Canonização automática < 1 minuto
- ✅ Backup completo < 5 minutos

### Disponibilidade
- ✅ Uptime > 99.9%
- ✅ Recovery Time Objective (RTO) < 1 hora
- ✅ Recovery Point Objective (RPO) < 24 horas

### Escalabilidade
- ✅ Suporta até 10.000 lentes
- ✅ Suporta até 100 fornecedores
- ✅ Suporta até 1.000 pedidos/mês
- ✅ Crescimento de 30% ao ano sem degradação

### Qualidade de Dados
- ✅ 0% lentes órfãs (sem grupo canônico)
- ✅ 0% preços negativos
- ✅ 0% estoques inconsistentes
- ✅ 100% lentes com fornecedor válido

---

## 🔧 MANUTENÇÃO E OPERAÇÕES

### Tarefas Diárias
```sql
-- 1. Verificar integridade
SELECT * FROM public.database_health_check();

-- 2. Atualizar estatísticas
ANALYZE VERBOSE;

-- 3. Limpar logs antigos
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '30 days';
```

### Tarefas Semanais
```sql
-- 1. Reindexação (se necessário)
REINDEX TABLE CONCURRENTLY lens_catalog.lentes;

-- 2. Vacuum completo
VACUUM FULL ANALYZE lens_catalog.lentes;

-- 3. Verificar tamanho do banco
SELECT pg_size_pretty(pg_database_size('best_lens'));
```

### Tarefas Mensais
```sql
-- 1. Auditoria de índices não utilizados
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- 2. Análise de crescimento
SELECT 
    date_trunc('month', created_at) as mes,
    COUNT(*) as novas_lentes
FROM lens_catalog.lentes
GROUP BY mes
ORDER BY mes DESC
LIMIT 12;

-- 3. Backup teste
-- Executar restore em ambiente de staging
```

---

## 📞 SUPORTE E DOCUMENTAÇÃO

### Documentos Relacionados
- `MIGRACAO_PASSO_A_PASSO.md` - Guia de execução
- `01_ESTRUTURA_BASE.sql` - Script de estrutura
- `02_TABELA_LENTES.sql` - Tabela principal
- `README.md` - Visão geral do projeto

### Contatos Técnicos
- **DBA**: [Definir]
- **DevOps**: [Definir]
- **Backend Lead**: [Definir]

### Troubleshooting

#### Problema: Lentes não canonizam
```sql
-- Verificar trigger
SELECT * FROM pg_trigger WHERE tgname LIKE '%canoni%';

-- Executar manualmente
SELECT lens_catalog.canonizar_lente(id) 
FROM lens_catalog.lentes 
WHERE grupo_canonico_id IS NULL;
```

#### Problema: Performance lenta
```sql
-- Verificar índices
SELECT * FROM pg_stat_user_indexes WHERE idx_scan < 100;

-- Analisar query plan
EXPLAIN ANALYZE
SELECT * FROM lens_catalog.lentes WHERE tipo_lente = 'visao_simples';
```

#### Problema: Estoque inconsistente
```sql
-- Recalcular saldos
UPDATE compras.estoque_saldo es
SET quantidade_disponivel = (
    SELECT COALESCE(SUM(
        CASE 
            WHEN tipo IN ('entrada_compra', 'ajuste_positivo') THEN quantidade
            WHEN tipo IN ('saida_venda', 'ajuste_negativo') THEN -quantidade
            ELSE 0
        END
    ), 0)
    FROM compras.estoque_movimentacoes
    WHERE lente_id = es.lente_id
);
```

---

## ✅ CHECKLIST FINAL

### Pré-Migração
- [ ] Backup do banco atual
- [ ] Verificar versão do PostgreSQL (>= 15)
- [ ] Instalar extensões necessárias (pg_stat_statements)
- [ ] Criar usuários e roles
- [ ] Configurar pg_hba.conf

### Durante Migração
- [ ] Executar scripts em ordem
- [ ] Verificar cada checkpoint
- [ ] Monitorar logs de erro
- [ ] Validar contagens
- [ ] Testar queries principais

### Pós-Migração
- [ ] Executar health check
- [ ] Criar backup pós-migração
- [ ] Testar aplicação frontend
- [ ] Validar integrações
- [ ] Documentar issues encontrados
- [ ] Treinamento da equipe

---

## 📌 VERSÃO E CONTROLE

**Versão do Blueprint**: 2.1  
**Data Inicial**: 19/12/2025  
**Última Atualização**: 20/12/2025  
**Status**: ✅ Pronto para Produção - CENÁRIO 5 Implementado

**Mudanças na v2.1**:
- ✅ CENÁRIO 5 implementado: Agrupamento por ranges + tratamentos
- ✅ 461 grupos criados (vs 197 do CENÁRIO 4)
- ✅ Lógica is_premium baseada em marcas (BOOL_OR)
- ✅ Triggers atualizadas para incluir 5 campos de tratamento
- ✅ Views públicas atualizadas com campos tratamento_*
- ✅ 100% de comparabilidade dentro dos grupos

**Aprovações**:
- [ ] Arquiteto de Dados
- [ ] DBA
- [ ] Tech Lead
- [ ] Product Owner

---

**FIM DO BLUEPRINT COMPLETO**
