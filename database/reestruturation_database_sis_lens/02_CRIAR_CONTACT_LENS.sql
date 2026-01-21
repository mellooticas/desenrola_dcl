-- ============================================================================
-- SCRIPT 2: ESTRUTURA COMPLETA PARA LENTES DE CONTATO
-- ============================================================================
-- Objetivo: Criar estrutura separada para lentes de contato (diferente de óculos)
-- Executar APÓS o script 01_LIMPEZA_BANCO.sql
-- ============================================================================

-- ============================================================================
-- PARTE 1: TIPOS CUSTOMIZADOS (ENUMs)
-- ============================================================================

-- Tipo de lente de contato
CREATE TYPE contact_lens.tipo_lente_contato AS ENUM (
  'diaria',              -- Descartável diária
  'quinzenal',           -- Descartável quinzenal
  'mensal',              -- Descartável mensal
  'trimestral',          -- Trimestral
  'anual',               -- Anual
  'rgp',                 -- Rígida gás permeável
  'escleral'             -- Escleral
);

-- Material da lente de contato
CREATE TYPE contact_lens.material_contato AS ENUM (
  'hidrogel',            -- Hidrogel convencional
  'silicone_hidrogel',   -- Silicone hidrogel (mais oxigênio)
  'rgp_gas_perm',        -- Rígida gás permeável
  'pmma'                 -- Polimetilmetacrilato (antiga)
);

-- Finalidade/Design
CREATE TYPE contact_lens.finalidade AS ENUM (
  'visao_simples',       -- Miopia/Hipermetropia
  'torica',              -- Astigmatismo
  'multifocal',          -- Presbiopia
  'cosmetica',           -- Cosmética (colorida)
  'terapeutica',         -- Terapêutica (pós-cirurgia)
  'orto_k'               -- Ortoqueratologia (uso noturno)
);

-- Status
CREATE TYPE contact_lens.status_produto AS ENUM (
  'ativo',
  'inativo',
  'descontinuado',
  'pre_lancamento'
);

-- ============================================================================
-- PARTE 2: TABELA DE MARCAS (específica para contato)
-- ============================================================================

CREATE TABLE contact_lens.marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  fabricante VARCHAR(200), -- Ex: Alcon, Johnson & Johnson, Bausch+Lomb
  pais_origem VARCHAR(100),
  website TEXT,
  logo_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTE 3: TABELA DE LENTES DE CONTATO
-- ============================================================================

CREATE TABLE contact_lens.lentes (
  -- IDs e Relacionamentos
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID NOT NULL REFERENCES core.fornecedores(id) ON DELETE CASCADE,
  marca_id UUID REFERENCES contact_lens.marcas(id) ON DELETE SET NULL,

  -- Identificação
  nome_produto TEXT NOT NULL,
  nome_canonizado TEXT, -- Nome normalizado para busca
  slug TEXT UNIQUE,
  sku VARCHAR(100),
  codigo_fornecedor VARCHAR(100),

  -- Classificação
  tipo_lente contact_lens.tipo_lente_contato NOT NULL,
  material contact_lens.material_contato NOT NULL,
  finalidade contact_lens.finalidade NOT NULL,

  -- Especificações Técnicas
  diametro NUMERIC(4,2), -- Ex: 14.20 mm
  curva_base NUMERIC(4,2), -- Ex: 8.60 mm
  dk_t INTEGER, -- Transmissibilidade de oxigênio (Dk/t)
  conteudo_agua INTEGER, -- % de água (38%, 55%, etc)
  espessura_central NUMERIC(5,3), -- mm

  -- Parâmetros Ópticos
  esferico_min NUMERIC(5,2), -- Ex: -12.00
  esferico_max NUMERIC(5,2), -- Ex: +8.00
  cilindrico_min NUMERIC(4,2) DEFAULT 0.00,
  cilindrico_max NUMERIC(4,2) DEFAULT 0.00,
  eixo_min INTEGER, -- 0-180 graus
  eixo_max INTEGER,
  adicao_min NUMERIC(3,2) DEFAULT 0.00, -- Para multifocais
  adicao_max NUMERIC(3,2) DEFAULT 0.00,

  -- Características
  protecao_uv BOOLEAN DEFAULT false,
  colorida BOOLEAN DEFAULT false,
  cor_disponivel VARCHAR(100), -- "Azul", "Verde", "Cinza", etc
  resistente_depositos BOOLEAN DEFAULT false,
  hidratacao_prolongada BOOLEAN DEFAULT false,

  -- Uso e Manutenção
  dias_uso INTEGER, -- 1, 15, 30, 90, 365
  horas_uso_diario INTEGER, -- Recomendado
  pode_dormir_com_lente BOOLEAN DEFAULT false,
  solucao_recomendada TEXT,

  -- Preços e Comercial
  preco_custo NUMERIC(10,2) DEFAULT 0,
  preco_tabela NUMERIC(10,2) DEFAULT 0,
  preco_fabricante NUMERIC(10,2),
  unidades_por_caixa INTEGER DEFAULT 1, -- Quantas lentes vem na caixa

  -- Disponibilidade
  estoque_disponivel INTEGER DEFAULT 0,
  lead_time_dias INTEGER DEFAULT 7,
  disponivel BOOLEAN DEFAULT true,

  -- Marketing
  destaque BOOLEAN DEFAULT false,
  novidade BOOLEAN DEFAULT false,
  data_lancamento DATE,
  data_descontinuacao DATE,
  descricao_curta TEXT,
  descricao_completa TEXT,
  beneficios TEXT[], -- Array de strings
  indicacoes TEXT[],
  contraindicacoes TEXT,

  -- Metadados
  status contact_lens.status_produto DEFAULT 'ativo',
  metadata JSONB DEFAULT '{}',
  observacoes TEXT,

  -- Auditoria
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT check_diametro CHECK (diametro BETWEEN 8.0 AND 16.0),
  CONSTRAINT check_curva_base CHECK (curva_base BETWEEN 7.0 AND 10.0),
  CONSTRAINT check_conteudo_agua CHECK (conteudo_agua BETWEEN 0 AND 100),
  CONSTRAINT check_dias_uso CHECK (dias_uso > 0)
);

-- ============================================================================
-- PARTE 4: TABELA DE GRUPOS CANÔNICOS (como lentes de óculos)
-- ============================================================================

CREATE TABLE contact_lens.grupos_canonicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  nome_grupo TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,

  -- Características técnicas
  tipo_lente contact_lens.tipo_lente_contato NOT NULL,
  material contact_lens.material_contato NOT NULL,
  finalidade contact_lens.finalidade NOT NULL,

  -- Parâmetros
  diametro_padrao NUMERIC(4,2),
  curva_base_padrao NUMERIC(4,2),
  dias_uso INTEGER,

  -- Estatísticas (calculadas automaticamente)
  total_lentes INTEGER DEFAULT 0,
  total_marcas INTEGER DEFAULT 0,
  preco_minimo NUMERIC(10,2),
  preco_maximo NUMERIC(10,2),
  preco_medio NUMERIC(10,2),

  -- Flags
  is_premium BOOLEAN DEFAULT false,
  tem_uv BOOLEAN DEFAULT false,
  colorida BOOLEAN DEFAULT false,

  -- Controle
  peso INTEGER DEFAULT 50, -- Para ordenação
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTE 5: ADICIONAR RELACIONAMENTO COM GRUPOS
-- ============================================================================

ALTER TABLE contact_lens.lentes
  ADD COLUMN grupo_canonico_id UUID REFERENCES contact_lens.grupos_canonicos(id) ON DELETE SET NULL;

CREATE INDEX idx_contact_lentes_grupo ON contact_lens.lentes(grupo_canonico_id);

-- ============================================================================
-- PARTE 6: ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Busca principal
CREATE INDEX idx_contact_lentes_fornecedor ON contact_lens.lentes(fornecedor_id);
CREATE INDEX idx_contact_lentes_marca ON contact_lens.lentes(marca_id);
CREATE INDEX idx_contact_lentes_slug ON contact_lens.lentes(slug);
CREATE INDEX idx_contact_lentes_tipo ON contact_lens.lentes(tipo_lente);
CREATE INDEX idx_contact_lentes_finalidade ON contact_lens.lentes(finalidade);
CREATE INDEX idx_contact_lentes_status ON contact_lens.lentes(status);

-- Filtros
CREATE INDEX idx_contact_lentes_disponivel ON contact_lens.lentes(disponivel) WHERE disponivel = true;
CREATE INDEX idx_contact_lentes_ativo ON contact_lens.lentes(ativo) WHERE ativo = true;

-- Ranges de grau
CREATE INDEX idx_contact_lentes_esferico ON contact_lens.lentes(esferico_min, esferico_max);
CREATE INDEX idx_contact_lentes_cilindrico ON contact_lens.lentes(cilindrico_min, cilindrico_max);

-- Grupos
CREATE INDEX idx_contact_grupos_tipo ON contact_lens.grupos_canonicos(tipo_lente);
CREATE INDEX idx_contact_grupos_ativo ON contact_lens.grupos_canonicos(ativo) WHERE ativo = true;

-- ============================================================================
-- PARTE 7: TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION contact_lens.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_lentes_timestamp
  BEFORE UPDATE ON contact_lens.lentes
  FOR EACH ROW
  EXECUTE FUNCTION contact_lens.update_updated_at_column();

CREATE TRIGGER update_contact_marcas_timestamp
  BEFORE UPDATE ON contact_lens.marcas
  FOR EACH ROW
  EXECUTE FUNCTION contact_lens.update_updated_at_column();

CREATE TRIGGER update_contact_grupos_timestamp
  BEFORE UPDATE ON contact_lens.grupos_canonicos
  FOR EACH ROW
  EXECUTE FUNCTION contact_lens.update_updated_at_column();

-- Trigger para gerar slug automaticamente
CREATE OR REPLACE FUNCTION contact_lens.generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(
      unaccent(NEW.nome_produto),
      '[^a-zA-Z0-9]+', '-', 'g'
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_contact_lentes_slug
  BEFORE INSERT OR UPDATE ON contact_lens.lentes
  FOR EACH ROW
  EXECUTE FUNCTION contact_lens.generate_slug();

-- ============================================================================
-- PARTE 8: VIEWS PRINCIPAIS
-- ============================================================================

-- View completa de lentes de contato
CREATE OR REPLACE VIEW contact_lens.v_lentes_catalogo AS
SELECT
  l.id,
  l.slug,
  l.nome_produto,
  l.nome_canonizado,

  -- Fornecedor
  f.id as fornecedor_id,
  f.nome as fornecedor_nome,

  -- Marca
  m.id as marca_id,
  m.nome as marca_nome,
  m.is_premium as marca_premium,

  -- Grupo
  gc.id as grupo_id,
  gc.nome_grupo,

  -- Classificação
  l.tipo_lente,
  l.material,
  l.finalidade,

  -- Specs
  l.diametro,
  l.curva_base,
  l.dk_t,
  l.conteudo_agua,
  l.dias_uso,

  -- Parâmetros
  l.esferico_min,
  l.esferico_max,
  l.cilindrico_min,
  l.cilindrico_max,
  l.adicao_min,
  l.adicao_max,

  -- Características
  l.protecao_uv,
  l.colorida,
  l.cor_disponivel,
  l.pode_dormir_com_lente,

  -- Comercial
  l.preco_tabela,
  l.unidades_por_caixa,
  l.estoque_disponivel,
  l.disponivel,
  l.destaque,
  l.novidade,

  l.created_at,
  l.updated_at
FROM contact_lens.lentes l
JOIN core.fornecedores f ON l.fornecedor_id = f.id
LEFT JOIN contact_lens.marcas m ON l.marca_id = m.id
LEFT JOIN contact_lens.grupos_canonicos gc ON l.grupo_canonico_id = gc.id
WHERE l.ativo = true
ORDER BY l.destaque DESC, l.preco_tabela;

-- View de grupos canônicos
CREATE OR REPLACE VIEW contact_lens.v_grupos_canonicos AS
SELECT
  gc.id,
  gc.slug,
  gc.nome_grupo,
  gc.tipo_lente,
  gc.material,
  gc.finalidade,
  gc.diametro_padrao,
  gc.curva_base_padrao,
  gc.dias_uso,
  gc.total_lentes,
  gc.total_marcas,
  gc.preco_minimo,
  gc.preco_maximo,
  gc.preco_medio,
  gc.is_premium,
  gc.tem_uv,
  gc.colorida,
  gc.ativo
FROM contact_lens.grupos_canonicos gc
WHERE gc.ativo = true
  AND gc.total_lentes > 0
ORDER BY gc.preco_medio;

-- ============================================================================
-- PARTE 9: DADOS INICIAIS (marcas comuns)
-- ============================================================================

INSERT INTO contact_lens.marcas (nome, slug, fabricante, is_premium) VALUES
  ('Acuvue', 'acuvue', 'Johnson & Johnson', true),
  ('Air Optix', 'air-optix', 'Alcon', true),
  ('Biofinity', 'biofinity', 'CooperVision', true),
  ('Dailies', 'dailies', 'Alcon', true),
  ('Biosoft', 'biosoft', 'Bausch+Lomb', false),
  ('Soflens', 'soflens', 'Bausch+Lomb', false),
  ('Hidrocor', 'hidrocor', 'Solótica', false);

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Schema contact_lens completo com:
--   ✅ 5 tipos customizados (ENUMs)
--   ✅ 3 tabelas principais (lentes, marcas, grupos_canonicos)
--   ✅ Índices de performance
--   ✅ Triggers automáticos
--   ✅ 2 views prontas
--   ✅ 7 marcas iniciais
-- ============================================================================
