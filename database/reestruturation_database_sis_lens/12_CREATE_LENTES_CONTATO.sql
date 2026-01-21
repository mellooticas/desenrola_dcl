-- ============================================================
-- CRIAÇÃO: Tabela lentes_contato (SEM grupos canônicos)
-- ============================================================
-- OBJETIVO: Catálogo de lentes de contato por marca/referência
-- SCHEMA: lens_catalog (sis_lens)
-- DATA: 20/01/2026
-- ============================================================
-- IMPORTANTE: Cada produto é único - sem agrupamento canônico
-- ============================================================

-- PASSO 1: Criar tabela principal
-- ============================================================

-- Limpar estrutura antiga se necessário
DROP TABLE IF EXISTS lens_catalog.lentes_contato CASCADE;

CREATE TABLE lens_catalog.lentes_contato (
  -- Chave primária
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========================================
  -- IDENTIFICAÇÃO
  -- ========================================
  sku VARCHAR(100) UNIQUE NOT NULL,
  nome_produto TEXT NOT NULL,
  
  -- Marca
  marca_id UUID, -- Referência lógica a lens_catalog.marcas(id)
  marca_nome TEXT NOT NULL,
  
  -- ========================================
  -- TIPO E CATEGORIA
  -- ========================================
  tipo_lente_contato VARCHAR(50) NOT NULL 
    CHECK (tipo_lente_contato IN (
      'diaria', 'quinzenal', 'mensal', 'trimestral', 
      'semestral', 'anual', 'cosmetica', 'terapeutica'
    )),
  
  design_lente VARCHAR(50) DEFAULT 'esferico'
    CHECK (design_lente IN ('esferico', 'asferico', 'torico', 'multifocal')),
  
  -- ========================================
  -- ESPECIFICAÇÕES TÉCNICAS
  -- ========================================
  
  -- Material
  material VARCHAR(100), -- 'hidrogel', 'silicone_hidrogel', 'gas_permeavel'
  
  -- Geometria
  diametro_mm NUMERIC(4,2),
  curvatura_base NUMERIC(3,1),
  
  -- Oxigenação
  teor_agua_percentual INTEGER,
  dk_t INTEGER, -- Transmissibilidade O2
  
  -- ========================================
  -- DISPONIBILIDADE DE GRAUS
  -- ========================================
  
  -- Esférico
  esferico_min NUMERIC(5,2),
  esferico_max NUMERIC(5,2),
  esferico_steps NUMERIC(4,2) DEFAULT 0.25,
  
  -- Cilíndrico (astigmatismo)
  cilindrico_min NUMERIC(5,2),
  cilindrico_max NUMERIC(5,2),
  cilindrico_steps NUMERIC(4,2) DEFAULT 0.25,
  
  -- Eixo (tóricas)
  eixo_disponivel INTEGER[],
  
  -- Adição (multifocais)
  adicao_disponivel NUMERIC[],
  
  -- ========================================
  -- CARACTERÍSTICAS
  -- ========================================
  
  tem_protecao_uv BOOLEAN DEFAULT false,
  tem_filtro_azul BOOLEAN DEFAULT false,
  
  eh_multifocal BOOLEAN DEFAULT false,
  eh_torica BOOLEAN DEFAULT false,
  eh_cosmetica BOOLEAN DEFAULT false,
  
  cor_disponivel TEXT[],
  
  -- ========================================
  -- EMBALAGEM
  -- ========================================
  
  qtd_por_caixa INTEGER DEFAULT 30,
  olho VARCHAR(10) CHECK (olho IN ('direito', 'esquerdo', 'ambos')) DEFAULT 'ambos',
  
  codigo_barras VARCHAR(100),
  registro_anvisa VARCHAR(100),
  
  -- ========================================
  -- FORNECEDOR
  -- ========================================
  
  fornecedor_id UUID, -- Referência lógica a lens_catalog.fornecedores(id)
  fornecedor_nome TEXT,
  codigo_fornecedor VARCHAR(100),
  
  fabricante TEXT,
  
  -- ========================================
  -- PREÇOS
  -- ========================================
  
  preco_custo_caixa NUMERIC(10,2),
  preco_venda_sugerido_caixa NUMERIC(10,2),
  margem_percentual NUMERIC(5,2),
  
  -- ========================================
  -- LOGÍSTICA
  -- ========================================
  
  prazo_entrega_dias INTEGER DEFAULT 3,
  estoque_disponivel INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  
  -- ========================================
  -- DESCRIÇÃO
  -- ========================================
  
  descricao_curta TEXT,
  descricao_completa TEXT,
  
  -- ========================================
  -- CONTROLE
  -- ========================================
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PASSO 2: Índices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_lentes_contato_sku ON lens_catalog.lentes_contato(sku);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_marca ON lens_catalog.lentes_contato(marca_id);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_tipo ON lens_catalog.lentes_contato(tipo_lente_contato);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_fornecedor ON lens_catalog.lentes_contato(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_ativo ON lens_catalog.lentes_contato(ativo) WHERE ativo = true;

-- ============================================================
-- PASSO 3: Trigger updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION lens_catalog.update_lentes_contato_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lentes_contato_timestamp ON lens_catalog.lentes_contato;

CREATE TRIGGER trigger_update_lentes_contato_timestamp
  BEFORE UPDATE ON lens_catalog.lentes_contato
  FOR EACH ROW
  EXECUTE FUNCTION lens_catalog.update_lentes_contato_timestamp();

-- ============================================================
-- PASSO 4: View em PUBLIC para consumo do frontend
-- ============================================================

CREATE OR REPLACE VIEW public.v_lentes_contato AS
SELECT 
  lc.id,
  lc.sku,
  lc.nome_produto,
  
  -- Marca
  lc.marca_id,
  lc.marca_nome,
  
  -- Tipo
  lc.tipo_lente_contato,
  lc.design_lente,
  
  -- Specs
  lc.material,
  lc.diametro_mm,
  lc.curvatura_base,
  lc.teor_agua_percentual,
  lc.dk_t,
  
  -- Graus
  lc.esferico_min,
  lc.esferico_max,
  lc.esferico_steps,
  lc.cilindrico_min,
  lc.cilindrico_max,
  lc.eixo_disponivel,
  lc.adicao_disponivel,
  
  -- Características
  lc.tem_protecao_uv,
  lc.tem_filtro_azul,
  lc.eh_multifocal,
  lc.eh_torica,
  lc.eh_cosmetica,
  lc.cor_disponivel,
  
  -- Embalagem
  lc.qtd_por_caixa,
  lc.olho,
  
  -- Fornecedor
  lc.fornecedor_id,
  lc.fornecedor_nome,
  lc.fabricante,
  
  -- Preços
  lc.preco_custo_caixa,
  lc.preco_venda_sugerido_caixa,
  lc.margem_percentual,
  
  -- Logística
  lc.prazo_entrega_dias,
  lc.estoque_disponivel,
  lc.ativo,
  
  -- Descrição
  lc.descricao_curta,
  lc.descricao_completa
  
FROM lens_catalog.lentes_contato lc
WHERE lc.ativo = true
ORDER BY lc.marca_nome, lc.nome_produto;

-- ============================================================
-- PASSO 5: Comentários
-- ============================================================

COMMENT ON TABLE lens_catalog.lentes_contato IS 
'Catálogo de lentes de contato - cada produto único por marca/referência';

COMMENT ON VIEW public.v_lentes_contato IS 
'View pública para consumo do frontend - lentes de contato ativas';

-- ============================================================
-- PASSO 6: Exemplo de dado
-- ============================================================

INSERT INTO lens_catalog.lentes_contato (
  sku, nome_produto, marca_nome, tipo_lente_contato,
  material, diametro_mm, curvatura_base, teor_agua_percentual, dk_t,
  esferico_min, esferico_max, esferico_steps,
  tem_protecao_uv, qtd_por_caixa,
  preco_custo_caixa, preco_venda_sugerido_caixa,
  prazo_entrega_dias, fabricante,
  descricao_curta, ativo
) VALUES (
  'ACUVUE-OASYS-24',
  'Acuvue Oasys com Hydraclear Plus',
  'Acuvue',
  'quinzenal',
  'silicone_hidrogel',
  14.00,
  8.4,
  38,
  147,
  -12.00,
  +8.00,
  0.25,
  true,
  24,
  180.00,
  320.00,
  3,
  'Johnson & Johnson',
  'Lente quinzenal com máxima hidratação e proteção UV',
  true
)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- ✅ Estrutura simplificada criada
-- ✅ View public.v_lentes_contato disponível
-- ✅ Sem grupos canônicos - cada produto é único
-- ============================================================
