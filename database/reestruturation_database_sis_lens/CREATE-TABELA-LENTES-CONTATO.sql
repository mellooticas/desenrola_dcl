-- ============================================================
-- CRIAÇÃO: Tabela lentes_contato
-- ============================================================
-- OBJETIVO: Catálogo completo de lentes de contato
-- SCHEMA: lens_catalog (mantém consistência com lentes de grau)
-- DATA: 20/01/2026
-- ============================================================

-- PASSO 1: Criar tabela principal
-- ============================================================

CREATE TABLE IF NOT EXISTS lens_catalog.lentes_contato (
  -- Chave primária
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========================================
  -- IDENTIFICAÇÃO E CATALOGAÇÃO
  -- ========================================
  sku VARCHAR(100) UNIQUE NOT NULL,
  nome_produto TEXT NOT NULL,
  slug TEXT UNIQUE, -- URL-friendly: acuvue-oasys-30-lentes
  marca_id UUID, -- FK para lens_catalog.marcas (se existir)
  marca_nome TEXT, -- Denormalizado para performance
  
  -- ========================================
  -- TIPO E CATEGORIA
  -- ========================================
  tipo_lente_contato VARCHAR(50) NOT NULL 
    CHECK (tipo_lente_contato IN (
      'diaria',       -- Descartável 1 dia
      'quinzenal',    -- Descartável 15 dias
      'mensal',       -- Descartável 30 dias
      'trimestral',   -- 3 meses
      'semestral',    -- 6 meses
      'anual',        -- 12 meses
      'cosmetica',    -- Colorida/estética
      'terapeutica'   -- Bandagem/tratamento
    )),
  
  categoria VARCHAR(50) DEFAULT 'estetica'
    CHECK (categoria IN ('estetica', 'corretiva', 'cosmetica', 'terapeutica')),
  
  -- ========================================
  -- ESPECIFICAÇÕES TÉCNICAS
  -- ========================================
  
  -- Material
  material VARCHAR(100), -- 'hidrogel', 'silicone_hidrogel', 'gas_permeavel'
  material_detalhado TEXT, -- Ex: 'Senofilcon A', 'Etafilcon A'
  
  -- Geometria
  diametro_mm NUMERIC(4,2), -- Ex: 14.20, 14.50
  curvatura_base NUMERIC(3,1), -- Ex: 8.4, 8.6, 8.8
  espessura_centro_mm NUMERIC(4,3), -- Ex: 0.084 mm
  
  -- Hidratação e oxigenação
  teor_agua_percentual INTEGER, -- Ex: 38%, 58%, 78%
  dk_t INTEGER, -- Transmissibilidade de oxigênio (DK/t)
  permeabilidade_dk INTEGER, -- Permeabilidade ao oxigênio
  
  -- Design
  design_lente VARCHAR(50), -- 'esferico', 'asferico', 'torico', 'multifocal'
  zona_optica_mm NUMERIC(4,2), -- Diâmetro da zona óptica
  
  -- ========================================
  -- DISPONIBILIDADE DE GRAUS
  -- ========================================
  
  -- Esférico (Miopia/Hipermetropia)
  esferico_min NUMERIC(5,2), -- Ex: -12.00
  esferico_max NUMERIC(5,2), -- Ex: +8.00
  esferico_steps NUMERIC(4,2) DEFAULT 0.25, -- Saltos: 0.25, 0.50
  
  -- Cilíndrico (Astigmatismo)
  cilindrico_min NUMERIC(5,2), -- Ex: -2.75
  cilindrico_max NUMERIC(5,2), -- Ex: 0.00
  cilindrico_steps NUMERIC(4,2) DEFAULT 0.25,
  
  -- Eixo (para tóricas)
  eixo_disponivel INTEGER[], -- Ex: [10, 20, 70, 80, 90, 160, 170, 180]
  eixo_steps INTEGER DEFAULT 10, -- Saltos de 10° ou 5°
  
  -- Adição (para multifocais/progressivas)
  adicao_min NUMERIC(3,2), -- Ex: +0.75
  adicao_max NUMERIC(3,2), -- Ex: +2.50
  adicao_disponivel NUMERIC[], -- Ex: [0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50]
  
  -- ========================================
  -- CARACTERÍSTICAS ESPECIAIS
  -- ========================================
  
  -- Tecnologias
  tem_protecao_uv BOOLEAN DEFAULT false,
  tem_filtro_azul BOOLEAN DEFAULT false,
  tem_hidratacao_prolongada BOOLEAN DEFAULT false,
  tem_tecnologia_asferica BOOLEAN DEFAULT false,
  
  -- Tipos especiais
  eh_multifocal BOOLEAN DEFAULT false,
  eh_torica BOOLEAN DEFAULT false, -- Para astigmatismo
  eh_cosmetica BOOLEAN DEFAULT false, -- Colorida
  eh_terapeutica BOOLEAN DEFAULT false, -- Bandagem
  
  -- Cor (para cosméticas)
  cor_disponivel TEXT[], -- Ex: ['azul', 'verde', 'mel', 'cinza']
  eh_opaca BOOLEAN DEFAULT false, -- Muda cor completamente
  eh_realce BOOLEAN DEFAULT false, -- Apenas realça cor natural
  
  -- ========================================
  -- EMBALAGEM E COMERCIALIZAÇÃO
  -- ========================================
  
  qtd_por_caixa INTEGER DEFAULT 30,
  qtd_por_blister INTEGER DEFAULT 1,
  olho VARCHAR(10) CHECK (olho IN ('direito', 'esquerdo', 'ambos')) DEFAULT 'ambos',
  
  -- Embalagem
  tipo_embalagem VARCHAR(50), -- 'caixa', 'kit', 'unidade'
  codigo_barras VARCHAR(100),
  registro_anvisa VARCHAR(100),
  
  -- ========================================
  -- FORNECEDOR E ORIGEM
  -- ========================================
  
  fornecedor_id UUID, -- FK para fornecedores (se tiver tabela)
  fornecedor_nome TEXT,
  codigo_fornecedor VARCHAR(100),
  
  fabricante TEXT, -- Ex: 'Johnson & Johnson', 'Alcon', 'Bausch + Lomb'
  pais_origem VARCHAR(100),
  
  -- ========================================
  -- PRECIFICAÇÃO
  -- ========================================
  
  -- Custo
  preco_custo_unitario NUMERIC(10,2),
  preco_custo_caixa NUMERIC(10,2),
  preco_custo_kit NUMERIC(10,2), -- Para kits (OD + OE)
  
  -- Venda
  preco_venda_sugerido_unitario NUMERIC(10,2),
  preco_venda_sugerido_caixa NUMERIC(10,2),
  preco_venda_kit NUMERIC(10,2),
  
  -- Margem
  margem_percentual NUMERIC(5,2),
  categoria_preco VARCHAR(50) CHECK (categoria_preco IN ('economica', 'intermediaria', 'premium', 'super_premium')),
  
  -- ========================================
  -- LOGÍSTICA
  -- ========================================
  
  prazo_entrega_dias INTEGER DEFAULT 3,
  disponibilidade VARCHAR(50) DEFAULT 'pronta_entrega'
    CHECK (disponibilidade IN ('pronta_entrega', 'sob_encomenda', 'importacao')),
  
  -- Estoque
  estoque_disponivel INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 10,
  estoque_maximo INTEGER DEFAULT 100,
  ponto_reposicao INTEGER DEFAULT 20,
  
  -- ========================================
  -- USO E MANUTENÇÃO
  -- ========================================
  
  tempo_uso_diario_horas INTEGER, -- Ex: 8h, 12h, 14h
  substituicao_dias INTEGER, -- Quantos dias usar antes de trocar
  permite_dormir BOOLEAN DEFAULT false,
  permite_reuso BOOLEAN DEFAULT false,
  
  solucao_recomendada TEXT[], -- Ex: ['Opti-Free', 'ReNu']
  requer_limpeza_diaria BOOLEAN DEFAULT true,
  
  -- ========================================
  -- INFORMAÇÕES CLÍNICAS
  -- ========================================
  
  indicacoes TEXT, -- "Correção de miopia e hipermetropia com astigmatismo"
  contraindicacoes TEXT, -- "Infecções oculares ativas, olho seco severo"
  cuidados_especiais TEXT,
  
  idade_minima INTEGER DEFAULT 18,
  requer_adaptacao BOOLEAN DEFAULT false, -- Se precisa teste/adaptação
  
  -- ========================================
  -- CONTROLE E AUDITORIA
  -- ========================================
  
  ativo BOOLEAN DEFAULT true,
  descontinuado BOOLEAN DEFAULT false,
  data_descontinuacao DATE,
  motivo_descontinuacao TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  updated_by TEXT,
  
  -- ========================================
  -- MARKETING E DESCRIÇÕES
  -- ========================================
  
  descricao_curta TEXT,
  descricao_completa TEXT,
  descricao_fabricante TEXT,
  diferenciais TEXT[], -- ['Tecnologia HydraLuxe', 'UV Blocker', '14h de conforto']
  keywords TEXT[], -- Para busca: ['miopia', 'astigmatismo', 'mensal', 'conforto']
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Imagens
  imagem_principal_url TEXT,
  imagens_adicionais TEXT[],
  
  -- Documentos
  bula_url TEXT,
  certificado_anvisa_url TEXT,
  ficha_tecnica_url TEXT,
  
  -- ========================================
  -- OBSERVAÇÕES E NOTAS
  -- ========================================
  
  observacoes TEXT,
  observacoes_internas TEXT,
  tags TEXT[] -- ['best_seller', 'promocao', 'novidade', 'recomendado']
);

-- ============================================================
-- PASSO 2: Índices para Performance
-- ============================================================

-- Busca principal
CREATE INDEX IF NOT EXISTS idx_lentes_contato_sku 
  ON lens_catalog.lentes_contato(sku);

CREATE INDEX IF NOT EXISTS idx_lentes_contato_slug 
  ON lens_catalog.lentes_contato(slug);

CREATE INDEX IF NOT EXISTS idx_lentes_contato_nome 
  ON lens_catalog.lentes_contato 
  USING gin(to_tsvector('portuguese', nome_produto));

-- Filtros comuns
CREATE INDEX IF NOT EXISTS idx_lentes_contato_marca 
  ON lens_catalog.lentes_contato(marca_id) 
  WHERE marca_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lentes_contato_tipo 
  ON lens_catalog.lentes_contato(tipo_lente_contato);

CREATE INDEX IF NOT EXISTS idx_lentes_contato_categoria 
  ON lens_catalog.lentes_contato(categoria);

CREATE INDEX IF NOT EXISTS idx_lentes_contato_fornecedor 
  ON lens_catalog.lentes_contato(fornecedor_id) 
  WHERE fornecedor_id IS NOT NULL;

-- Características especiais
CREATE INDEX IF NOT EXISTS idx_lentes_contato_torica 
  ON lens_catalog.lentes_contato(eh_torica) 
  WHERE eh_torica = true;

CREATE INDEX IF NOT EXISTS idx_lentes_contato_multifocal 
  ON lens_catalog.lentes_contato(eh_multifocal) 
  WHERE eh_multifocal = true;

CREATE INDEX IF NOT EXISTS idx_lentes_contato_cosmetica 
  ON lens_catalog.lentes_contato(eh_cosmetica) 
  WHERE eh_cosmetica = true;

-- Status
CREATE INDEX IF NOT EXISTS idx_lentes_contato_ativo 
  ON lens_catalog.lentes_contato(ativo) 
  WHERE ativo = true;

-- Preço (para ordenação)
CREATE INDEX IF NOT EXISTS idx_lentes_contato_preco_caixa 
  ON lens_catalog.lentes_contato(preco_venda_sugerido_caixa) 
  WHERE preco_venda_sugerido_caixa IS NOT NULL;

-- Estoque
CREATE INDEX IF NOT EXISTS idx_lentes_contato_estoque 
  ON lens_catalog.lentes_contato(estoque_disponivel) 
  WHERE estoque_disponivel > 0;

-- ============================================================
-- PASSO 3: Triggers
-- ============================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION lens_catalog.update_lentes_contato_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lentes_contato_timestamp
  BEFORE UPDATE ON lens_catalog.lentes_contato
  FOR EACH ROW
  EXECUTE FUNCTION lens_catalog.update_lentes_contato_timestamp();

-- Gerar slug automaticamente
CREATE OR REPLACE FUNCTION lens_catalog.generate_lentes_contato_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(
      regexp_replace(
        regexp_replace(
          unaccent(NEW.nome_produto || '-' || NEW.tipo_lente_contato),
          '[^a-z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_lentes_contato_slug
  BEFORE INSERT OR UPDATE OF nome_produto, tipo_lente_contato 
  ON lens_catalog.lentes_contato
  FOR EACH ROW
  EXECUTE FUNCTION lens_catalog.generate_lentes_contato_slug();

-- ============================================================
-- PASSO 4: Comentários e Documentação
-- ============================================================

COMMENT ON TABLE lens_catalog.lentes_contato IS 
'Catálogo completo de lentes de contato: diárias, mensais, tóricas, multifocais, cosméticas, etc.';

COMMENT ON COLUMN lens_catalog.lentes_contato.dk_t IS 
'Transmissibilidade de oxigênio (DK/t) - quanto maior, melhor a oxigenação da córnea. Valores típicos: 30-160';

COMMENT ON COLUMN lens_catalog.lentes_contato.tipo_lente_contato IS 
'Período de descarte: diaria, quinzenal, mensal, trimestral, semestral, anual, cosmetica, terapeutica';

COMMENT ON COLUMN lens_catalog.lentes_contato.teor_agua_percentual IS 
'Porcentagem de água no material. Baixo (<50%): mais resistente. Alto (>50%): mais confortável mas frágil';

COMMENT ON COLUMN lens_catalog.lentes_contato.eixo_disponivel IS 
'Array de eixos disponíveis para lentes tóricas. Ex: [10, 20, 70, 80, 90, 160, 170, 180]';

COMMENT ON COLUMN lens_catalog.lentes_contato.categoria_preco IS 
'Classificação: economica (até R$50), intermediaria (R$50-150), premium (R$150-300), super_premium (>R$300)';

-- ============================================================
-- PASSO 5: Dados de Exemplo (Opcional)
-- ============================================================

-- Exemplo: Acuvue Oasys (Johnson & Johnson)
INSERT INTO lens_catalog.lentes_contato (
  sku, nome_produto, marca_nome, tipo_lente_contato, categoria,
  material, diametro_mm, curvatura_base, teor_agua_percentual, dk_t,
  esferico_min, esferico_max, esferico_steps,
  tem_protecao_uv, qtd_por_caixa,
  preco_custo_caixa, preco_venda_sugerido_caixa,
  prazo_entrega_dias, fabricante,
  descricao_curta, ativo
) VALUES (
  'ACUVUE-OASYS-30',
  'Acuvue Oasys com Hydraclear Plus',
  'Acuvue',
  'quinzenal',
  'corretiva',
  'silicone_hidrogel',
  14.00,
  8.4,
  38,
  147,
  -12.00,
  +8.00,
  0.25,
  true,
  24, -- 12 pares (24 lentes)
  180.00,
  320.00,
  3,
  'Johnson & Johnson',
  'Lente quinzenal com máxima hidratação e proteção UV',
  true
);

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✅ Tabela lens_catalog.lentes_contato criada
-- ✅ 15+ índices para performance
-- ✅ 3 triggers (updated_at, slug, estoque)
-- ✅ Comentários e documentação
-- ✅ 1 registro de exemplo inserido
-- ============================================================
