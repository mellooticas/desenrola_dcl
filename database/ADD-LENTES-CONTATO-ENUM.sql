-- ============================================================
-- MIGRAÇÃO: Adicionar LENTES_CONTATO ao tipo_pedido_enum
-- ============================================================
-- OBJETIVO: Suportar venda de lentes de contato no sistema
-- DATA: 20/01/2026
-- ============================================================

-- IMPORTANTE: O enum está no schema PUBLIC
-- DEVE ser executado em transação SEPARADA (commit antes de usar)

-- ============================================================
-- PASSO 1: Adicionar valor ao enum
-- ============================================================

DO $$
BEGIN
  -- Verificar se o valor já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'LENTES_CONTATO' 
    AND enumtypid = 'public.tipo_pedido_enum'::regtype
  ) THEN
    -- Adicionar novo valor
    ALTER TYPE public.tipo_pedido_enum ADD VALUE 'LENTES_CONTATO';
    RAISE NOTICE '✅ Valor LENTES_CONTATO adicionado ao enum';
  ELSE
    RAISE NOTICE '⚠️ Valor LENTES_CONTATO já existe no enum';
  END IF;
END $$;

-- ============================================================
-- IMPORTANTE: Execute COMMIT aqui antes de usar o novo valor!
-- ============================================================
-- No Supabase SQL Editor: basta executar este script sozinho
-- e depois executar qualquer INSERT/UPDATE que use LENTES_CONTATO
-- ============================================================

-- ============================================================
-- PASSO 2: Verificar valores do enum (executar APÓS commit)
-- ============================================================

SELECT 
  enumlabel as enum_value,
  enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = 'public.tipo_pedido_enum'::regtype
ORDER BY enumsortorder;


| enum_value     | sort_order |
| -------------- | ---------- |
| LENTES         | 1          |
| ARMACAO        | 2          |
| COMPLETO       | 3          |
| SERVICO        | 4          |
| LENTE_AVULSA   | 5          |
| LENTES_CONTATO | 6          |


-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- enum_value      | sort_order
-- ----------------|-----------
-- LENTES          | 1
-- ARMACAO         | 2
-- COMPLETO        | 3
-- SERVICO         | 4
-- LENTE_AVULSA    | 5
-- LENTES_CONTATO  | 6  ← NOVO
-- ============================================================

-- ============================================================
-- PRÓXIMO PASSO: Criar estrutura para lentes de contato
-- ============================================================
-- Sugestão: Criar tabela dedicada em lens_catalog ou CRM_ERP

/*
CREATE TABLE IF NOT EXISTS lens_catalog.lentes_contato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  sku VARCHAR(100) UNIQUE NOT NULL,
  nome_produto TEXT NOT NULL,
  marca_id UUID REFERENCES lens_catalog.marcas(id),
  
  -- Tipo
  tipo_lente_contato VARCHAR(50) NOT NULL 
    CHECK (tipo_lente_contato IN ('diaria', 'quinzenal', 'mensal', 'trimestral', 'anual', 'cosmetica')),
  
  -- Especificações técnicas
  material VARCHAR(100), -- ex: 'hidrogel', 'silicone_hidrogel'
  diametro_mm NUMERIC(4,2), -- ex: 14.20
  curvatura_base NUMERIC(3,1), -- ex: 8.6
  teor_agua_percentual INTEGER, -- ex: 58 (%)
  dk_t INTEGER, -- Transmissibilidade de oxigênio
  
  -- Disponibilidade de graus
  esferico_min NUMERIC(5,2),
  esferico_max NUMERIC(5,2),
  esferico_steps NUMERIC(4,2) DEFAULT 0.25, -- Saltos: 0.25, 0.50
  
  cilindrico_min NUMERIC(5,2),
  cilindrico_max NUMERIC(5,2),
  cilindrico_steps NUMERIC(4,2) DEFAULT 0.25,
  
  eixo_disponivel INTEGER[], -- Array de eixos: [10, 20, 70, 80, 90, 160, 170, 180]
  adicao_disponivel NUMERIC[], -- Para multifocais: [0.75, 1.00, 1.25, ...]
  
  -- Características especiais
  tem_protecao_uv BOOLEAN DEFAULT false,
  tem_filtro_azul BOOLEAN DEFAULT false,
  eh_multifocal BOOLEAN DEFAULT false,
  eh_torica BOOLEAN DEFAULT false, -- Para astigmatismo
  eh_cosmetica BOOLEAN DEFAULT false,
  
  -- Embalagem
  qtd_por_caixa INTEGER DEFAULT 30,
  olho VARCHAR(10) CHECK (olho IN ('direito', 'esquerdo', 'ambos')),
  
  -- Fornecedor/Distribuidor
  fornecedor_id UUID,
  codigo_fornecedor VARCHAR(100),
  
  -- Preços
  preco_custo_unitario NUMERIC(10,2),
  preco_custo_caixa NUMERIC(10,2),
  preco_venda_sugerido_unitario NUMERIC(10,2),
  preco_venda_sugerido_caixa NUMERIC(10,2),
  
  -- Prazo
  prazo_entrega_dias INTEGER DEFAULT 3,
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  estoque_disponivel INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 10,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  
  -- Observações
  descricao_fabricante TEXT,
  indicacoes TEXT,
  contraindicacoes TEXT,
  observacoes TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lentes_contato_marca ON lens_catalog.lentes_contato(marca_id);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_tipo ON lens_catalog.lentes_contato(tipo_lente_contato);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_sku ON lens_catalog.lentes_contato(sku);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_fornecedor ON lens_catalog.lentes_contato(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_lentes_contato_ativo ON lens_catalog.lentes_contato(ativo) WHERE ativo = true;

-- Comentários
COMMENT ON TABLE lens_catalog.lentes_contato IS 
'Catálogo de lentes de contato: diárias, mensais, cosméticas, etc.';

COMMENT ON COLUMN lens_catalog.lentes_contato.dk_t IS 
'Transmissibilidade de oxigênio (DK/t) - quanto maior, melhor a oxigenação da córnea';

COMMENT ON COLUMN lens_catalog.lentes_contato.tipo_lente_contato IS 
'Tipos: diaria (descartável), quinzenal, mensal, trimestral, anual, cosmetica (colorida)';
*/

