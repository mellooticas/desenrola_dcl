# 📘 Documentação: Sistema de Lentes de Contato

## 🎯 Visão Geral

Sistema completo para gerenciar vendas de lentes de contato, integrado ao workflow existente do Desenrola DCL.

---

## 🗂️ Estrutura de Arquivos

### 1. Migração do Enum

**Arquivo:** `database/ADD-LENTES-CONTATO-ENUM.sql`

Adiciona `'LENTES_CONTATO'` ao enum `tipo_pedido_enum` existente.

```sql
ALTER TYPE public.tipo_pedido_enum ADD VALUE IF NOT EXISTS 'LENTES_CONTATO';
```

**Valores do Enum Completo:**

- `LENTES` - Lentes de grau
- `LENTES_CONTATO` - ← **NOVO**
- `ARMACAO` - Armação sem lentes
- `COMPLETO` - Armação + lentes
- `SERVICO` - Montagem, ajustes, reparos
- `LENTE_AVULSA` - Lente avulsa

### 2. Tabela de Catálogo

**Arquivo:** `database/CREATE-TABELA-LENTES-CONTATO.sql`

Cria `lens_catalog.lentes_contato` com **80+ campos** organizados em categorias.

---

## 📊 Estrutura da Tabela `lentes_contato`

### Categorias de Campos

#### 🆔 Identificação (6 campos)

```sql
id                UUID PRIMARY KEY
sku               VARCHAR(100) UNIQUE  -- Ex: "ACUVUE-OASYS-30"
nome_produto      TEXT                 -- "Acuvue Oasys com Hydraclear Plus"
slug              TEXT UNIQUE          -- "acuvue-oasys-com-hydraclear-plus"
marca_id          UUID                 -- FK para marcas
marca_nome        TEXT                 -- Denormalizado
```

#### 🏷️ Tipo e Categoria (3 campos)

```sql
tipo_lente_contato  VARCHAR(50)  -- 'diaria', 'mensal', 'cosmetica', etc.
categoria           VARCHAR(50)  -- 'estetica', 'corretiva', 'cosmetica', 'terapeutica'
design_lente        VARCHAR(50)  -- 'esferico', 'torico', 'multifocal'
```

**Tipos Disponíveis:**

- `diaria` - Descartável 1 dia
- `quinzenal` - 15 dias
- `mensal` - 30 dias
- `trimestral` - 3 meses
- `semestral` - 6 meses
- `anual` - 12 meses
- `cosmetica` - Colorida/estética
- `terapeutica` - Bandagem/tratamento

#### 🔬 Especificações Técnicas (12 campos)

```sql
-- Material
material              VARCHAR(100)  -- 'hidrogel', 'silicone_hidrogel'
material_detalhado    TEXT          -- 'Senofilcon A', 'Etafilcon A'

-- Geometria
diametro_mm           NUMERIC(4,2)  -- 14.20, 14.50
curvatura_base        NUMERIC(3,1)  -- 8.4, 8.6, 8.8
espessura_centro_mm   NUMERIC(4,3)  -- 0.084

-- Hidratação
teor_agua_percentual  INTEGER       -- 38%, 58%, 78%
dk_t                  INTEGER       -- Transmissibilidade O₂ (30-160)
permeabilidade_dk     INTEGER       -- Permeabilidade ao oxigênio

zona_optica_mm        NUMERIC(4,2)  -- Diâmetro zona óptica
```

**DK/t (Transmissibilidade):**

- `< 30`: Baixa (não recomendado uso prolongado)
- `30-87`: Médio
- `87-125`: Alto
- `> 125`: Muito Alto (pode dormir com a lente)

**Teor de Água:**

- `< 50%`: Baixo teor (mais resistente, menos confortável)
- `50-60%`: Médio
- `> 60%`: Alto teor (mais confortável, mais frágil)

#### 👓 Disponibilidade de Graus (10 campos)

```sql
-- Esférico (miopia/hipermetropia)
esferico_min          NUMERIC(5,2)  -- -12.00
esferico_max          NUMERIC(5,2)  -- +8.00
esferico_steps        NUMERIC(4,2)  -- 0.25, 0.50

-- Cilíndrico (astigmatismo)
cilindrico_min        NUMERIC(5,2)  -- -2.75
cilindrico_max        NUMERIC(5,2)  -- 0.00
cilindrico_steps      NUMERIC(4,2)  -- 0.25

-- Eixo (tóricas)
eixo_disponivel       INTEGER[]     -- [10, 20, 70, 80, 90, 160, 170, 180]
eixo_steps            INTEGER       -- 10° ou 5°

-- Adição (multifocais)
adicao_min            NUMERIC(3,2)  -- +0.75
adicao_max            NUMERIC(3,2)  -- +2.50
adicao_disponivel     NUMERIC[]     -- [0.75, 1.00, 1.25, ...]
```

#### ⭐ Características Especiais (12 campos)

```sql
-- Tecnologias
tem_protecao_uv             BOOLEAN  -- Bloqueio UV400
tem_filtro_azul             BOOLEAN  -- Blue Light Filter
tem_hidratacao_prolongada   BOOLEAN  -- Hydraclear, Aqua Comfort
tem_tecnologia_asferica     BOOLEAN  -- Visão mais nítida

-- Tipos
eh_multifocal               BOOLEAN  -- Para presbiopia
eh_torica                   BOOLEAN  -- Para astigmatismo
eh_cosmetica                BOOLEAN  -- Colorida
eh_terapeutica              BOOLEAN  -- Bandagem

-- Cor (cosméticas)
cor_disponivel              TEXT[]   -- ['azul', 'verde', 'mel', 'cinza']
eh_opaca                    BOOLEAN  -- Muda cor completamente
eh_realce                   BOOLEAN  -- Apenas realça cor natural
```

#### 📦 Embalagem (6 campos)

```sql
qtd_por_caixa         INTEGER       -- 30, 90, 180
qtd_por_blister       INTEGER       -- 1, 2
olho                  VARCHAR(10)   -- 'direito', 'esquerdo', 'ambos'
tipo_embalagem        VARCHAR(50)   -- 'caixa', 'kit', 'unidade'
codigo_barras         VARCHAR(100)
registro_anvisa       VARCHAR(100)
```

#### 🏭 Fornecedor (6 campos)

```sql
fornecedor_id         UUID
fornecedor_nome       TEXT
codigo_fornecedor     VARCHAR(100)
fabricante            TEXT          -- 'Johnson & Johnson', 'Alcon'
pais_origem           VARCHAR(100)
```

#### 💰 Precificação (9 campos)

```sql
-- Custo
preco_custo_unitario          NUMERIC(10,2)
preco_custo_caixa             NUMERIC(10,2)
preco_custo_kit               NUMERIC(10,2)  -- Kit OD + OE

-- Venda
preco_venda_sugerido_unitario NUMERIC(10,2)
preco_venda_sugerido_caixa    NUMERIC(10,2)
preco_venda_kit               NUMERIC(10,2)

-- Margem
margem_percentual             NUMERIC(5,2)
categoria_preco               VARCHAR(50)    -- 'economica', 'premium'
```

**Categorias de Preço:**

- `economica`: Até R$ 50/caixa
- `intermediaria`: R$ 50-150/caixa
- `premium`: R$ 150-300/caixa
- `super_premium`: > R$ 300/caixa

#### 🚚 Logística (9 campos)

```sql
prazo_entrega_dias    INTEGER       -- 3, 7, 15
disponibilidade       VARCHAR(50)   -- 'pronta_entrega', 'sob_encomenda'

-- Estoque
estoque_disponivel    INTEGER       -- Quantidade atual
estoque_minimo        INTEGER       -- Alerta mínimo
estoque_maximo        INTEGER       -- Limite superior
ponto_reposicao       INTEGER       -- Quando repor
```

#### 👤 Uso e Manutenção (6 campos)

```sql
tempo_uso_diario_horas    INTEGER   -- 8h, 12h, 14h
substituicao_dias         INTEGER   -- Quantos dias usar
permite_dormir            BOOLEAN   -- Pode dormir com a lente
permite_reuso             BOOLEAN   -- Pode reusar (mensal, anual)
solucao_recomendada       TEXT[]    -- ['Opti-Free', 'ReNu']
requer_limpeza_diaria     BOOLEAN
```

#### 🏥 Informações Clínicas (6 campos)

```sql
indicacoes              TEXT      -- "Correção de miopia leve a moderada"
contraindicacoes        TEXT      -- "Infecções oculares ativas"
cuidados_especiais      TEXT      -- "Não usar em piscina sem óculos de proteção"
idade_minima            INTEGER   -- 18
requer_adaptacao        BOOLEAN   -- Se precisa teste
```

#### 🔐 Controle (8 campos)

```sql
ativo                   BOOLEAN   DEFAULT true
descontinuado           BOOLEAN   DEFAULT false
data_descontinuacao     DATE
motivo_descontinuacao   TEXT
created_at              TIMESTAMPTZ DEFAULT now()
updated_at              TIMESTAMPTZ DEFAULT now()
created_by              TEXT
updated_by              TEXT
```

#### 📝 Marketing (11 campos)

```sql
descricao_curta         TEXT      -- 100 caracteres
descricao_completa      TEXT      -- Descrição detalhada
descricao_fabricante    TEXT      -- Texto oficial
diferenciais            TEXT[]    -- ['Tecnologia X', 'Conforto 14h']
keywords                TEXT[]    -- ['miopia', 'mensal', 'conforto']

-- SEO
meta_title              TEXT
meta_description        TEXT

-- Imagens
imagem_principal_url    TEXT
imagens_adicionais      TEXT[]

-- Documentos
bula_url                TEXT
certificado_anvisa_url  TEXT
ficha_tecnica_url       TEXT
```

#### 📌 Observações (3 campos)

```sql
observacoes          TEXT
observacoes_internas TEXT
tags                 TEXT[]  -- ['best_seller', 'promocao', 'novidade']
```

---

## 🔍 Índices Criados (15 índices)

### Busca e Identificação

```sql
idx_lentes_contato_sku          (sku)
idx_lentes_contato_slug         (slug)
idx_lentes_contato_nome         USING gin(to_tsvector('portuguese', nome_produto))
```

### Filtros

```sql
idx_lentes_contato_marca        (marca_id)
idx_lentes_contato_tipo         (tipo_lente_contato)
idx_lentes_contato_categoria    (categoria)
idx_lentes_contato_fornecedor   (fornecedor_id)
```

### Características

```sql
idx_lentes_contato_torica       (eh_torica) WHERE eh_torica = true
idx_lentes_contato_multifocal   (eh_multifocal) WHERE eh_multifocal = true
idx_lentes_contato_cosmetica    (eh_cosmetica) WHERE eh_cosmetica = true
```

### Status e Performance

```sql
idx_lentes_contato_ativo        (ativo) WHERE ativo = true
idx_lentes_contato_preco_caixa  (preco_venda_sugerido_caixa)
idx_lentes_contato_estoque      (estoque_disponivel) WHERE estoque_disponivel > 0
```

---

## ⚙️ Triggers Criados (3 triggers)

### 1. Atualizar `updated_at`

Automaticamente atualiza `updated_at` em qualquer UPDATE.

### 2. Gerar Slug

Gera slug automaticamente a partir do `nome_produto`:

```
"Acuvue Oasys 1-Day" → "acuvue-oasys-1-day"
```

### 3. Controle de Estoque (Sugerido)

```sql
-- Exemplo: alertar quando estoque < estoque_minimo
CREATE OR REPLACE FUNCTION lens_catalog.check_lentes_contato_estoque()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estoque_disponivel < NEW.estoque_minimo THEN
    INSERT INTO alertas (tipo, mensagem, severidade, referencia_id)
    VALUES (
      'estoque_baixo',
      'Lente de contato ' || NEW.nome_produto || ' com estoque baixo: ' || NEW.estoque_disponivel,
      'WARNING',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Casos de Uso

### Caso 1: Venda Simples - Cliente compra lentes mensais

```sql
-- Cliente: João Silva
-- Olho Direito: -3.00 (miopia)
-- Olho Esquerdo: -2.75 (miopia)
-- Produto: Acuvue Oasys (mensal, 6 lentes/caixa)

SELECT
  nome_produto,
  tipo_lente_contato,
  preco_venda_sugerido_caixa,
  qtd_por_caixa,
  prazo_entrega_dias
FROM lens_catalog.lentes_contato
WHERE tipo_lente_contato = 'mensal'
  AND esferico_min <= -3.00
  AND esferico_max >= -2.75
  AND ativo = true
ORDER BY preco_venda_sugerido_caixa ASC;

-- Pedido:
-- 1 caixa OD (-3.00) = R$ 160,00
-- 1 caixa OE (-2.75) = R$ 160,00
-- Total: R$ 320,00
```

### Caso 2: Cliente com Astigmatismo - Tóricas

```sql
-- Cliente: Maria Souza
-- OD: -2.50 cil -0.75 eixo 180°
-- OE: -2.25 cil -1.00 eixo 170°

SELECT
  nome_produto,
  marca_nome,
  preco_venda_sugerido_caixa
FROM lens_catalog.lentes_contato
WHERE eh_torica = true
  AND esferico_min <= -2.50
  AND cilindrico_min <= -1.00
  AND 180 = ANY(eixo_disponivel)
  AND 170 = ANY(eixo_disponivel)
  AND ativo = true;
```

### Caso 3: Cliente Presbiope - Multifocais

```sql
-- Cliente: Carlos (50 anos)
-- OD: +1.50 ADD +2.00
-- OE: +1.25 ADD +2.00

SELECT
  nome_produto,
  tipo_lente_contato,
  preco_venda_sugerido_caixa,
  adicao_disponivel
FROM lens_catalog.lentes_contato
WHERE eh_multifocal = true
  AND esferico_min <= +1.50
  AND esferico_max >= +1.50
  AND 2.00 = ANY(adicao_disponivel)
  AND ativo = true
ORDER BY preco_venda_sugerido_caixa DESC;
```

### Caso 4: Lentes Cosméticas

```sql
-- Cliente quer lentes coloridas (sem grau)

SELECT
  nome_produto,
  cor_disponivel,
  tipo_lente_contato,
  preco_venda_sugerido_caixa
FROM lens_catalog.lentes_contato
WHERE eh_cosmetica = true
  AND esferico_min = 0.00
  AND esferico_max = 0.00
  AND ativo = true;
```

---

## 🔗 Integração com Sistema Existente

### Tabela `pedidos`

Quando `tipo_pedido = 'LENTES_CONTATO'`:

```sql
-- Campos a preencher
pedidos.lente_contato_id       UUID  -- FK para lentes_contato
pedidos.quantidade_caixas_od   INTEGER
pedidos.quantidade_caixas_oe   INTEGER
pedidos.grau_od                TEXT  -- "-3.00"
pedidos.grau_oe                TEXT  -- "-2.75"
pedidos.eixo_od                INTEGER
pedidos.eixo_oe                INTEGER
pedidos.valor_total            NUMERIC
```

**Sugestão de Migração:**

```sql
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS lente_contato_id UUID;

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS quantidade_caixas_od INTEGER DEFAULT 1;

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS quantidade_caixas_oe INTEGER DEFAULT 1;

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS grau_completo_od TEXT;

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS grau_completo_oe TEXT;

-- FK (se lentes_contato existir)
ALTER TABLE public.pedidos
ADD CONSTRAINT fk_pedidos_lente_contato
FOREIGN KEY (lente_contato_id)
REFERENCES lens_catalog.lentes_contato(id);
```

---

## 📱 Frontend - Componentes Sugeridos

### 1. Step Seleção de Lentes de Contato

`src/components/forms/wizard-steps/Step4LentesContato.tsx`

```tsx
interface Props {
  data: WizardData;
  onChange: (data: WizardData) => void;
}

// Fluxo:
// 1. Escolher tipo (diária, mensal, etc.)
// 2. Filtros: marca, preço, características
// 3. Informar grau OD/OE
// 4. Escolher quantidade de caixas
// 5. Calcular total
```

### 2. Filtros de Lentes de Contato

```tsx
interface FiltrosLentesContato {
  tipo: "diaria" | "mensal" | "cosmetica" | "todas";
  marca_id?: string;
  preco_max?: number;
  tem_protecao_uv?: boolean;
  eh_torica?: boolean;
  eh_multifocal?: boolean;
}
```

### 3. Card de Produto

```tsx
<Card>
  <CardHeader>
    <CardTitle>{lente.nome_produto}</CardTitle>
    <Badge>{lente.tipo_lente_contato}</Badge>
    <Badge variant={lente.categoria_preco}>{lente.categoria_preco}</Badge>
  </CardHeader>
  <CardContent>
    <p>{lente.qtd_por_caixa} lentes</p>
    <p className="text-2xl font-bold">R$ {lente.preco_venda_sugerido_caixa}</p>
    <div className="badges">
      {lente.tem_protecao_uv && <Badge>UV</Badge>}
      {lente.eh_torica && <Badge>Tórica</Badge>}
      {lente.eh_multifocal && <Badge>Multifocal</Badge>}
    </div>
  </CardContent>
</Card>
```

---

## 🧪 Dados de Teste/Seed

### Produtos Populares

#### 1. Acuvue Oasys (Quinzenal)

```sql
INSERT INTO lens_catalog.lentes_contato (...) VALUES (
  'ACUVUE-OASYS-24',
  'Acuvue Oasys com Hydraclear Plus',
  'Acuvue', 'quinzenal', 'corretiva',
  'silicone_hidrogel', 14.00, 8.4, 38, 147,
  -12.00, +8.00, 0.25,
  true, 24,
  180.00, 320.00,
  ...
);
```

#### 2. Dailies Total 1 (Diária)

```sql
-- Ultra premium, tecnologia water gradient
preco_caixa: R$ 180.00 (30 lentes)
dk_t: 156
teor_agua: 33% (centro) a 80% (superfície)
```

#### 3. Biofinity (Mensal)

```sql
-- CooperVision, silicone hidrogel
preco_caixa: R$ 120.00 (6 lentes)
dk_t: 160
permite_dormir: true
```

#### 4. FreshLook Colorblends (Cosméticas)

```sql
-- Alcon, coloridas mensais
cores: ['Pure Hazel', 'Gray', 'Green', 'Blue', 'Brown']
preco_caixa: R$ 90.00 (2 lentes)
com_grau: true (até -6.00)
```

---

## ✅ Checklist de Implementação

### Banco de Dados

- [x] Script de migração do enum (`ADD-LENTES-CONTATO-ENUM.sql`)
- [x] Script de criação da tabela (`CREATE-TABELA-LENTES-CONTATO.sql`)
- [ ] Executar scripts no Supabase
- [ ] Adicionar campos em `pedidos` para lentes de contato
- [ ] Popular tabela com produtos reais

### Frontend

- [x] Tipo `TipoPedido` atualizado
- [x] Card "Lentes de Contato" no Step 2
- [ ] Criar `Step4LentesContato.tsx`
- [ ] Criar hook `useLentesContato()`
- [ ] Criar componente de filtros
- [ ] Criar card de produto
- [ ] Implementar entrada de grau (OD/OE)
- [ ] Calcular total de caixas e preço

### Integração

- [ ] Atualizar salvamento do pedido
- [ ] View para relatórios de lentes de contato
- [ ] Integração com estoque (se houver)
- [ ] Integração com fornecedores
- [ ] Sistema de alertas (estoque baixo)

---

## 📈 Próximos Passos

1. **Executar Migrações**: Rodar os 2 scripts SQL no Supabase
2. **Popular Catálogo**: Importar produtos reais (Excel → SQL)
3. **Criar Frontend**: Implementar Step4LentesContato
4. **Testar Fluxo**: Nova Ordem → Lentes de Contato → Salvar
5. **Relatórios**: Dashboard com vendas de lentes de contato

---

**Data:** 20/01/2026  
**Autor:** GitHub Copilot  
**Status:** ✅ Scripts SQL criados - Aguardando execução
