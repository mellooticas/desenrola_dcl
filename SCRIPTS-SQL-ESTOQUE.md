# 🗄️ SCRIPTS SQL: Integração Estoque no Desenrola DCL

**Data:** 17 de Janeiro de 2026  
**Propósito:** Scripts SQL prontos para expandir o banco Desenrola com tabelas de estoque

---

## 📊 DIAGRAMA ER SIMPLIFICADO

```
┌──────────────────┐          ┌──────────────────┐
│    LOJAS         │          │    PRODUTOS      │
├──────────────────┤          ├──────────────────┤
│ id (PK)          │◄─┐       │ id (PK)          │
│ nome             │  │       │ sku (UNIQUE)     │
│ cnpj             │  │       │ tipo             │
│ cidade           │  │   ┌──►│ tamanho          │
│ ativo            │  │   │   │ descricao        │
└──────────────────┘  │   │   │ preco_custo      │
                      │   │   │ preco_venda      │
                      │   │   │ marca_id (FK)    │
                      │   │   │ categoria_id (FK)│
                      │   │   │ ativo            │
                      │   │   └──────────────────┘
                      │   │
                      │   │   ┌──────────────────┐
                      │   └──►│ ESTOQUE_PRODUTO  │
                      │       ├──────────────────┤
                      │       │ id (PK)          │
                      │       │ produto_id (FK)  │
                      │       │ loja_id (FK)     │
                      └──────►│ quantidade       │
                              │ valor_unitario   │
                              │ localizacao      │
                              └──────────────────┘
                                      ▲
                                      │
                              ┌───────┴────────┐
                              │                │
                    ┌─────────────────────┐   ┌──────────────────┐
                    │ ESTOQUE_MOVIMENTO   │   │  PEDIDOS         │
                    ├─────────────────────┤   ├──────────────────┤
                    │ id (PK)             │   │ id (PK)          │
                    │ produto_id (FK)     │   │ armacao_id (FK)  │
                    │ loja_id (FK)        │   │ tipo_pedido      │
                    │ tipo                │   │ pecas_ids (ARRAY)│
                    │ quantidade          │   │ estoque_saida_id │
                    │ documento_ref (FK)  │───│ status           │
                    │ data_movimento      │   └──────────────────┘
                    │ usuario_id          │
                    └─────────────────────┘
```

---

## 🛠️ SCRIPT 1: Tabelas Base (Execute Primeiro)

```sql
-- =========================================================
-- SCRIPT 1: Tabelas de Estoque Base
-- Ordem de execução: 1
-- =========================================================

-- 1. Criar schema para estoque (opcional, se preferir organizadoVersão inline: sem schema novo)
-- CRIANDO NA SCHEMA PUBLIC PARA SIMPLICIDADE

-- 2. Tabela: PRODUTOS (Catálogo)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  sku VARCHAR(100) UNIQUE NOT NULL,
  sku_visual VARCHAR(50) UNIQUE,
  cod VARCHAR(50),

  -- Descrição e tipo
  descricao VARCHAR(500) NOT NULL,
  tipo VARCHAR(50),  -- 'armacao', 'acessorio', 'lente', 'servico'

  -- Características físicas
  tamanho VARCHAR(50),  -- ex: '52-18-140' para armações
  material VARCHAR(100),

  -- Identificadores de catálogo
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
  modelo_id UUID REFERENCES modelos(id) ON DELETE SET NULL,
  cor_id UUID REFERENCES cores(id) ON DELETE SET NULL,
  familia_id UUID,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,

  -- Preços
  custo DECIMAL(12, 2),
  markup DECIMAL(5, 2),
  preco_venda DECIMAL(12, 2),

  -- Flags
  pode_lente_grau BOOLEAN DEFAULT false,
  is_exclusivo BOOLEAN DEFAULT false,
  is_pre_venda BOOLEAN DEFAULT false,
  is_novidade BOOLEAN DEFAULT false,

  -- Controle
  classificacao_fiscal VARCHAR(50),  -- NCM
  status VARCHAR(50),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,

  -- Gestão
  nivel_critico INT DEFAULT 0,
  nivel_ideal INT DEFAULT 0,
  lead_time INT,  -- dias
  giro_medio DECIMAL(5, 2),

  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_produtos_sku ON produtos(sku);
CREATE INDEX idx_produtos_tipo ON produtos(tipo);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_produtos_fornecedor ON produtos(fornecedor_id);

-- 3. Tabela: ESTOQUE_PRODUTO (Saldo por Loja)
CREATE TABLE IF NOT EXISTS estoque_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,

  -- Tamanho específico (pode variar por loja)
  tamanho VARCHAR(50),

  -- Quantidades
  quantidade INT DEFAULT 0,
  quantidade_minima INT DEFAULT 0,
  quantidade_maxima INT DEFAULT 100,

  -- Valor para cálculo de estoque
  valor_unitario DECIMAL(12, 2),

  -- Localização física
  localizacao VARCHAR(255),  -- ex: 'Prateleira A5', 'Caixa 001'

  -- Auditoria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Chave única (mesmo produto com tamanho diferente = registros diferentes)
  CONSTRAINT uk_estoque_produto_tamanho
    UNIQUE (produto_id, loja_id, COALESCE(tamanho, 'NULL'))
);

CREATE INDEX idx_estoque_produto_loja ON estoque_produto(loja_id);
CREATE INDEX idx_estoque_produto_quantidade ON estoque_produto(quantidade);

-- 4. Tabela: ESTOQUE_MOVIMENTACOES (Histórico de Movimentações)
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES lojas(id) ON DELETE SET NULL,

  -- Tipo de movimentação
  tipo VARCHAR(20) NOT NULL,  -- 'entrada', 'saida'
  tipo_movimentacao VARCHAR(50),  -- 'compra', 'venda', 'ajuste', 'perda', 'dano', 'devolucao'

  -- Quantidades
  quantidade INT NOT NULL,
  quantidade_anterior INT,
  quantidade_atual INT,

  -- Valores
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(14, 2),

  -- Referências
  tamanho VARCHAR(50),
  lote VARCHAR(100),
  documento_referencia UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  nota_fiscal VARCHAR(50),
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,

  -- Observações
  motivo VARCHAR(255),
  observacao TEXT,
  status VARCHAR(50),

  -- Auditoria
  usuario_id UUID,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_estoque_movimentacoes_produto ON estoque_movimentacoes(produto_id);
CREATE INDEX idx_estoque_movimentacoes_loja ON estoque_movimentacoes(loja_id);
CREATE INDEX idx_estoque_movimentacoes_documento ON estoque_movimentacoes(documento_referencia);
CREATE INDEX idx_estoque_movimentacoes_data ON estoque_movimentacoes(data_movimentacao);

-- Confirmar criação
SELECT 'Tabelas de estoque criadas com sucesso!' AS status;
```

---

## 🔄 SCRIPT 2: Tabelas Lookup (Marcas, Categorias, Cores)

```sql
-- =========================================================
-- SCRIPT 2: Tabelas Lookup de Produtos
-- Ordem de execução: 2 (Depois do Script 1)
-- =========================================================

-- 1. CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(50),
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nome, codigo) VALUES
  ('Armações', 'ARM'),
  ('Acessórios', 'ACC'),
  ('Lentes', 'LEN'),
  ('Serviços', 'SRV')
ON CONFLICT DO NOTHING;

-- 2. MARCAS
CREATE TABLE IF NOT EXISTS marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(50),
  markup DECIMAL(5, 2) DEFAULT 1.5,
  logo_url VARCHAR(500),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO marcas (nome, codigo) VALUES
  ('Mello Óptica', 'MELLO'),
  ('Vogue', 'VOGUE'),
  ('Ray-Ban', 'RB')
ON CONFLICT DO NOTHING;

-- 3. MODELOS
CREATE TABLE IF NOT EXISTS modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(50),
  marca_id UUID REFERENCES marcas(id) ON DELETE CASCADE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_modelo_marca UNIQUE (nome, marca_id)
);

INSERT INTO modelos (nome, codigo, marca_id)
SELECT 'Cat Eye', 'CAT', id FROM marcas WHERE nome = 'Mello Óptica'
ON CONFLICT DO NOTHING;

-- 4. CORES
CREATE TABLE IF NOT EXISTS cores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  codigo_hex VARCHAR(7),  -- #000000
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cores (nome, codigo_hex) VALUES
  ('Preto', '#000000'),
  ('Ouro', '#FFD700'),
  ('Prata', '#C0C0C0'),
  ('Marrom', '#8B4513'),
  ('Azul', '#0000FF')
ON CONFLICT DO NOTHING;

-- 5. FAMILIAS (Agrupamento maior que marca/modelo)
CREATE TABLE IF NOT EXISTS familias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO familias (nome) VALUES
  ('Casual'),
  ('Esporta'),
  ('Premium'),
  ('Infantil')
ON CONFLICT DO NOTHING;

SELECT 'Tabelas lookup criadas com sucesso!' AS status;
```

---

## 🔗 SCRIPT 3: Expandir Tabela PEDIDOS

```sql
-- =========================================================
-- SCRIPT 3: Campos para Integração de Estoque em PEDIDOS
-- Ordem de execução: 3
-- =========================================================

-- Verificar se tabela pedidos existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'pedidos'
) AS tabela_existe;

-- Adicionar coluna de tipo_pedido
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS tipo_pedido VARCHAR(50)
DEFAULT 'completo'
CHECK (tipo_pedido IN ('completo', 'concerto', 'armacao_branca', 'servico'));

-- Adicionar coluna de armacao
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS armacao_id UUID
REFERENCES produtos(id) ON DELETE SET NULL;

-- Adicionar array de peças (para concertos)
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS pecas_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Adicionar array de saídas de estoque
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS estoque_saida_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Adicionar observações de armação
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS obs_armacao TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_armacao ON pedidos(armacao_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo ON pedidos(tipo_pedido);

-- Criar trigger de validação
CREATE OR REPLACE FUNCTION fn_validar_pedido_armacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar armacao_id obrigatório para certos tipos
  IF NEW.tipo_pedido IN ('completo', 'armacao_branca') THEN
    IF NEW.armacao_id IS NULL THEN
      RAISE EXCEPTION 'Armação é obrigatória para tipo de pedido: %', NEW.tipo_pedido;
    END IF;
  END IF;

  -- Validar concerto tem pelo menos 1 peça
  IF NEW.tipo_pedido = 'concerto' THEN
    IF array_length(NEW.pecas_ids, 1) IS NULL OR array_length(NEW.pecas_ids, 1) = 0 THEN
      RAISE EXCEPTION 'Concerto deve ter pelo menos 1 peça para substituição';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validar_pedido_armacao ON pedidos;
CREATE TRIGGER tr_validar_pedido_armacao
BEFORE INSERT OR UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION fn_validar_pedido_armacao();

SELECT 'Tabela PEDIDOS expandida com sucesso!' AS status;
```

---

## 📊 SCRIPT 4: Views para Consulta Rápida

```sql
-- =========================================================
-- SCRIPT 4: Views para Estoque (Leitura Otimizada)
-- Ordem de execução: 4
-- =========================================================

-- 1. View: Estoque Completo (usado no frontend)
CREATE OR REPLACE VIEW vw_estoque_completo AS
SELECT
  p.id AS produto_id,
  p.sku,
  p.sku_visual,
  p.descricao,
  p.tipo AS tipo_produto,
  c.nome AS categoria,
  p.custo,
  p.preco_venda,
  p.codigo_barras,
  ep.loja_id,
  ep.quantidade AS quantidade_atual,
  p.nivel_critico AS estoque_minimo,
  p.nivel_ideal AS estoque_maximo,
  p.ativo,
  CASE
    WHEN ep.quantidade <= 0 THEN 'sem_estoque'
    WHEN p.nivel_critico > 0 AND ep.quantidade <= p.nivel_critico THEN 'critico'
    ELSE 'normal'
  END AS status_estoque,
  ROUND((ep.quantidade::DECIMAL / NULLIF(p.nivel_critico, 0)) * 100, 2)
    AS percentual_nivel_critico,
  (ep.quantidade * p.custo) AS valor_total,
  (ep.quantidade * p.custo) AS custo_total,
  p.is_exclusivo,
  p.is_novidade,
  p.categoria_id,
  p.modelo_id,
  p.cor_id,
  p.marca_id,
  p.familia_id
FROM produtos p
LEFT JOIN estoque_produto ep ON p.id = ep.produto_id
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.ativo = true;

-- 2. View: Estoque Atual (Lightweight)
CREATE OR REPLACE VIEW vw_estoque_atual AS
SELECT
  ep.id,
  ep.produto_id,
  ep.loja_id,
  ep.quantidade,
  p.sku,
  p.sku_visual,
  p.descricao,
  ep.updated_at
FROM estoque_produto ep
JOIN produtos p ON ep.produto_id = p.id
WHERE p.ativo = true;

-- 3. View: Movimentações com Detalhes
CREATE OR REPLACE VIEW vw_movimentacoes_lista AS
SELECT
  em.id,
  em.produto_id,
  em.loja_id,
  em.tipo,
  em.tipo_movimentacao,
  em.quantidade,
  em.quantidade_anterior,
  em.quantidade_atual,
  em.valor_unitario,
  em.valor_total,
  em.data_movimentacao,
  em.motivo,
  em.lote,
  em.documento_referencia,
  p.sku,
  p.descricao AS nome_produto,
  l.nome AS nome_loja,
  jsonb_build_object(
    'id', p.id,
    'sku', p.sku,
    'nome', p.descricao
  ) AS produto
FROM estoque_movimentacoes em
LEFT JOIN produtos p ON em.produto_id = p.id
LEFT JOIN lojas l ON em.loja_id = l.id
ORDER BY em.data_movimentacao DESC;

-- 4. View: Produtos com Estoque Crítico
CREATE OR REPLACE VIEW vw_estoque_critico AS
SELECT
  p.id,
  p.sku,
  p.descricao,
  ep.loja_id,
  l.nome AS loja_nome,
  ep.quantidade,
  p.nivel_critico,
  (p.nivel_critico - ep.quantidade) AS quantidade_faltante,
  p.lead_time
FROM produtos p
JOIN estoque_produto ep ON p.id = ep.produto_id
JOIN lojas l ON ep.loja_id = l.id
WHERE p.ativo = true
  AND ep.quantidade <= p.nivel_critico
  AND ep.quantidade > 0
ORDER BY quantidade_faltante DESC;

SELECT 'Views criadas com sucesso!' AS status;
```

---

## ⚙️ SCRIPT 5: RPCs (Remote Procedure Calls)

```sql
-- =========================================================
-- SCRIPT 5: RPCs para Movimentação de Estoque
-- Ordem de execução: 5
-- =========================================================

-- 1. RPC: Registrar Entrada de Estoque
CREATE OR REPLACE FUNCTION registrar_entrada_estoque(
  p_produto_id UUID,
  p_quantidade INT,
  p_loja_id UUID,
  p_tipo VARCHAR DEFAULT 'entrada_compra',
  p_motivo VARCHAR DEFAULT 'Entrada manual',
  p_observacao VARCHAR DEFAULT '',
  p_tamanho VARCHAR DEFAULT NULL,
  p_documento VARCHAR DEFAULT NULL,
  p_fornecedor UUID DEFAULT NULL,
  p_valor_unitario DECIMAL DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  quantidade_anterior INT,
  quantidade_atual INT
) AS $$
DECLARE
  v_movimentacao_id UUID;
  v_quantidade_anterior INT;
  v_quantidade_nova INT;
BEGIN
  -- Buscar quantidade anterior
  SELECT COALESCE(quantidade, 0) INTO v_quantidade_anterior
  FROM estoque_produto
  WHERE produto_id = p_produto_id
    AND loja_id = p_loja_id
    AND COALESCE(tamanho, 'NULL') = COALESCE(p_tamanho, 'NULL');

  v_quantidade_nova := v_quantidade_anterior + p_quantidade;

  -- Inserir movimentação
  INSERT INTO estoque_movimentacoes (
    produto_id, loja_id, tipo, tipo_movimentacao, quantidade,
    quantidade_anterior, quantidade_atual, valor_unitario,
    valor_total, motivo, observacao, tamanho, documento_referencia,
    fornecedor_id
  ) VALUES (
    p_produto_id, p_loja_id, 'entrada', p_tipo, p_quantidade,
    v_quantidade_anterior, v_quantidade_nova, p_valor_unitario,
    (p_quantidade * p_valor_unitario), p_motivo, p_observacao, p_tamanho,
    p_documento::UUID, p_fornecedor
  )
  RETURNING estoque_movimentacoes.id INTO v_movimentacao_id;

  -- Atualizar ou inserir em estoque_produto
  INSERT INTO estoque_produto (
    produto_id, loja_id, tamanho, quantidade, valor_unitario
  ) VALUES (
    p_produto_id, p_loja_id, p_tamanho, p_quantidade, p_valor_unitario
  )
  ON CONFLICT (produto_id, loja_id, COALESCE(tamanho, 'NULL'))
  DO UPDATE SET
    quantidade = estoque_produto.quantidade + p_quantidade,
    valor_unitario = COALESCE(p_valor_unitario, estoque_produto.valor_unitario),
    updated_at = CURRENT_TIMESTAMP;

  -- Retornar
  RETURN QUERY SELECT
    v_movimentacao_id,
    v_quantidade_anterior,
    v_quantidade_nova;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC: Registrar Saída de Estoque
CREATE OR REPLACE FUNCTION registrar_saida_estoque(
  p_produto_id UUID,
  p_quantidade INT,
  p_loja_id UUID,
  p_tipo VARCHAR DEFAULT 'saida_venda',
  p_motivo VARCHAR DEFAULT 'Saída manual',
  p_observacao VARCHAR DEFAULT '',
  p_tamanho VARCHAR DEFAULT NULL,
  p_documento VARCHAR DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  quantidade_anterior INT,
  quantidade_atual INT,
  sucesso BOOLEAN,
  mensagem TEXT
) AS $$
DECLARE
  v_movimentacao_id UUID;
  v_quantidade_anterior INT;
  v_quantidade_nova INT;
BEGIN
  -- Buscar quantidade atual
  SELECT COALESCE(quantidade, 0) INTO v_quantidade_anterior
  FROM estoque_produto
  WHERE produto_id = p_produto_id
    AND loja_id = p_loja_id
    AND COALESCE(tamanho, 'NULL') = COALESCE(p_tamanho, 'NULL');

  -- Validar estoque suficiente
  IF v_quantidade_anterior < p_quantidade THEN
    RETURN QUERY SELECT
      NULL::UUID,
      v_quantidade_anterior,
      v_quantidade_anterior,
      FALSE,
      format('Estoque insuficiente: tem %L, precisa %L',
             v_quantidade_anterior, p_quantidade);
    RETURN;
  END IF;

  v_quantidade_nova := v_quantidade_anterior - p_quantidade;

  -- Inserir movimentação
  INSERT INTO estoque_movimentacoes (
    produto_id, loja_id, tipo, tipo_movimentacao, quantidade,
    quantidade_anterior, quantidade_atual, motivo, observacao,
    tamanho, documento_referencia
  ) VALUES (
    p_produto_id, p_loja_id, 'saida', p_tipo, p_quantidade,
    v_quantidade_anterior, v_quantidade_nova, p_motivo, p_observacao,
    p_tamanho, p_documento::UUID
  )
  RETURNING estoque_movimentacoes.id INTO v_movimentacao_id;

  -- Atualizar estoque_produto
  UPDATE estoque_produto
  SET
    quantidade = v_quantidade_nova,
    updated_at = CURRENT_TIMESTAMP
  WHERE produto_id = p_produto_id
    AND loja_id = p_loja_id
    AND COALESCE(tamanho, 'NULL') = COALESCE(p_tamanho, 'NULL');

  -- Retornar sucesso
  RETURN QUERY SELECT
    v_movimentacao_id,
    v_quantidade_anterior,
    v_quantidade_nova,
    TRUE,
    'Saída registrada com sucesso';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: Transferir Produto entre Lojas
CREATE OR REPLACE FUNCTION transferir_produto(
  p_produto_id UUID,
  p_loja_origem UUID,
  p_loja_destino UUID,
  p_quantidade INT,
  p_observacao TEXT DEFAULT 'Transferência entre lojas'
)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT,
  saida_id UUID,
  entrada_id UUID
) AS $$
DECLARE
  v_saida_id UUID;
  v_entrada_id UUID;
  v_quantidade_origem INT;
BEGIN
  -- Validar estoque na origem
  SELECT COALESCE(quantidade, 0) INTO v_quantidade_origem
  FROM estoque_produto
  WHERE produto_id = p_produto_id AND loja_id = p_loja_origem;

  IF v_quantidade_origem < p_quantidade THEN
    RETURN QUERY SELECT FALSE, 'Estoque insuficiente na loja de origem', NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Registrar saída
  INSERT INTO estoque_movimentacoes (
    produto_id, loja_id, tipo, tipo_movimentacao, quantidade,
    quantidade_anterior, quantidade_atual, motivo, observacao
  ) VALUES (
    p_produto_id, p_loja_origem, 'saida', 'transferencia', p_quantidade,
    v_quantidade_origem, v_quantidade_origem - p_quantidade,
    'Transferência entre lojas', p_observacao
  ) RETURNING id INTO v_saida_id;

  -- Atualizar estoque origem
  UPDATE estoque_produto
  SET quantidade = quantidade - p_quantidade
  WHERE produto_id = p_produto_id AND loja_id = p_loja_origem;

  -- Registrar entrada
  INSERT INTO estoque_movimentacoes (
    produto_id, loja_id, tipo, tipo_movimentacao, quantidade,
    quantidade_anterior, quantidade_atual, motivo, observacao
  ) VALUES (
    p_produto_id, p_loja_destino, 'entrada', 'transferencia', p_quantidade,
    0, p_quantidade,
    'Transferência entre lojas', p_observacao
  ) RETURNING id INTO v_entrada_id;

  -- Atualizar estoque destino
  INSERT INTO estoque_produto (
    produto_id, loja_id, quantidade
  ) VALUES (p_produto_id, p_loja_destino, p_quantidade)
  ON CONFLICT (produto_id, loja_id, COALESCE(tamanho, 'NULL'))
  DO UPDATE SET quantidade = estoque_produto.quantidade + p_quantidade;

  RETURN QUERY SELECT TRUE, 'Transferência realizada com sucesso', v_saida_id, v_entrada_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'RPCs criadas com sucesso!' AS status;
```

---

## 🔐 SCRIPT 6: Segurança (RLS - Row Level Security)

```sql
-- =========================================================
-- SCRIPT 6: Políticas de Segurança (RLS)
-- Ordem de execução: 6
-- =========================================================

-- Habilitar RLS nas tabelas
ALTER TABLE estoque_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Política para estoque_produto (ler própria loja)
CREATE POLICY "Usuários veem estoque de sua loja"
  ON estoque_produto FOR SELECT
  USING (
    loja_id = (SELECT loja_id FROM auth.users WHERE id = auth.uid())
  );

-- Política para estoque_movimentacoes (ler movimentações da loja)
CREATE POLICY "Usuários veem movimentações de sua loja"
  ON estoque_movimentacoes FOR SELECT
  USING (
    loja_id = (SELECT loja_id FROM auth.users WHERE id = auth.uid())
  );

-- Política para inserir movimentações (própria loja)
CREATE POLICY "Usuários podem inserir movimentações em sua loja"
  ON estoque_movimentacoes FOR INSERT
  WITH CHECK (
    loja_id = (SELECT loja_id FROM auth.users WHERE id = auth.uid())
  );

SELECT 'Políticas RLS configuradas!' AS status;
```

---

## ✅ SCRIPT 7: Dados de Teste

```sql
-- =========================================================
-- SCRIPT 7: Inserir Dados de Teste
-- Ordem de execução: 7
-- =========================================================

-- 1. Inserir marca de teste
INSERT INTO marcas (nome, codigo) VALUES ('Teste Brand', 'TEST')
ON CONFLICT (nome) DO NOTHING;

-- 2. Inserir categoria de teste
INSERT INTO categorias (nome, codigo) VALUES ('Teste', 'TST')
ON CONFLICT (nome) DO NOTHING;

-- 3. Inserir produto de teste (Armação)
INSERT INTO produtos (
  sku, sku_visual, descricao, tipo, tamanho, categoria_id,
  preco_custo, preco_venda, pode_lente_grau, ativo, nivel_critico
)
SELECT
  'SKU-TEST-001' AS sku,
  'TST-001' AS sku_visual,
  'Armação Teste Cat Eye Preta' AS descricao,
  'armacao' AS tipo,
  '52-18-140' AS tamanho,
  id AS category_id,
  100.00 AS preco_custo,
  300.00 AS preco_venda,
  TRUE AS pode_lente_grau,
  TRUE AS ativo,
  5 AS nivel_critico
FROM categorias WHERE codigo = 'TST'
ON CONFLICT (sku) DO NOTHING;

-- 4. Inserir estoque de teste
INSERT INTO estoque_produto (
  produto_id, loja_id, tamanho, quantidade, valor_unitario
)
SELECT
  p.id AS produto_id,
  l.id AS loja_id,
  '52-18-140' AS tamanho,
  10 AS quantidade,
  100.00 AS valor_unitario
FROM produtos p
CROSS JOIN lojas l
WHERE p.sku = 'SKU-TEST-001'
  AND l.ativo = TRUE
LIMIT 1
ON CONFLICT DO NOTHING;

-- 5. Testar RPC de entrada
-- SELECT registrar_entrada_estoque(
--   (SELECT id FROM produtos WHERE sku = 'SKU-TEST-001' LIMIT 1),
--   5,
--   (SELECT id FROM lojas LIMIT 1),
--   'entrada_compra',
--   'Teste de entrada'
-- );

SELECT 'Dados de teste inseridos!' AS status;

-- 6. Verificar
SELECT * FROM vw_estoque_completo LIMIT 5;
SELECT * FROM vw_estoque_critico LIMIT 5;
```

---

## 🔍 SCRIPT 8: Verificação e Limpeza

```sql
-- =========================================================
-- SCRIPT 8: Verificação de Integridade
-- Ordem de execução: 8 (Após tudo)
-- =========================================================

-- 1. Verificar tabelas criadas
SELECT
  tablename,
  (SELECT count(*) FROM information_schema.columns
   WHERE table_name = tablename) AS num_colunas
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'produtos', 'estoque_produto', 'estoque_movimentacoes',
    'categorias', 'marcas', 'cores', 'modelos', 'familias'
  )
ORDER BY tablename;

-- 2. Verificar views
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE 'vw_%'
ORDER BY viewname;

-- 3. Verificar funções/RPCs
SELECT
  proname AS nome_funcao,
  pg_get_function_arguments(oid) AS argumentos
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname LIKE '%estoque%'
ORDER BY proname;

-- 4. Verificar índices
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'produtos', 'estoque_produto', 'estoque_movimentacoes'
  )
ORDER BY tablename, indexname;

-- 5. Verificar RLS
SELECT
  tablename,
  policyname,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'estoque_produto', 'estoque_movimentacoes'
  )
ORDER BY tablename, policyname;

SELECT 'Verificação completa! ✅' AS status;
```

---

## 📌 ORDEM DE EXECUÇÃO

```
1. SCRIPT 1: Tabelas Base (produtos, estoque_produto, estoque_movimentacoes)
   ↓
2. SCRIPT 2: Lookup Tables (categorias, marcas, cores, modelos)
   ↓
3. SCRIPT 3: Expand PEDIDOS (novos campos)
   ↓
4. SCRIPT 4: Views (vw_estoque_completo, vw_movimentacoes_lista, etc)
   ↓
5. SCRIPT 5: RPCs (registrar_entrada, registrar_saida, transferir)
   ↓
6. SCRIPT 6: RLS Policies (segurança por loja)
   ↓
7. SCRIPT 7: Dados de Teste (para validar)
   ↓
8. SCRIPT 8: Verificação (checklist final)
```

---

## 🚀 TESTE RÁPIDO

```sql
-- Teste de ponta a ponta
DO $$
DECLARE
  v_produto_id UUID;
  v_loja_id UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO v_produto_id FROM produtos WHERE tipo = 'armacao' LIMIT 1;
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;

  IF v_produto_id IS NOT NULL AND v_loja_id IS NOT NULL THEN
    -- Registrar entrada
    RAISE NOTICE 'Registrando entrada...';
    PERFORM registrar_entrada_estoque(
      v_produto_id, 10, v_loja_id, 'entrada_compra', 'Teste'
    );

    -- Registrar saída
    RAISE NOTICE 'Registrando saída...';
    PERFORM registrar_saida_estoque(
      v_produto_id, 3, v_loja_id, 'saida_venda', 'Teste venda'
    );

    RAISE NOTICE 'Teste concluído com sucesso!';
  ELSE
    RAISE NOTICE 'Não há produtos ou lojas para testar';
  END IF;
END;
$$;

-- Verificar resultado
SELECT * FROM vw_estoque_completo LIMIT 1;
SELECT * FROM vw_movimentacoes_lista LIMIT 5;
```

---

**Scripts SQL prontos para uso! ✅**  
Execute na ordem indicada e seu estoque estará funcional.
