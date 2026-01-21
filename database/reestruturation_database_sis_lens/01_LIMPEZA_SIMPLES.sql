-- ============================================================================
-- SCRIPT 1: LIMPEZA SIMPLES - SIS LENS
-- ============================================================================
-- Abordagem simples: usar CASCADE e recriar depois
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER TUDO COM CASCADE
-- ============================================================================

-- 1.1 - Remover tabelas canônicas
DROP TABLE IF EXISTS lens_catalog.lentes_canonicas CASCADE;
DROP TABLE IF EXISTS lens_catalog.premium_canonicas CASCADE;

-- 1.2 - Remover backups
DROP TABLE IF EXISTS lens_catalog.grupos_canonicos_backup_old CASCADE;
DROP TABLE IF EXISTS lens_catalog.lentes_grupos_backup_old CASCADE;

-- 1.3 - REMOVER COLUNAS COM CASCADE (isso vai dropar todas as views/funções)
ALTER TABLE lens_catalog.lentes
  DROP COLUMN lente_canonica_id CASCADE;

ALTER TABLE lens_catalog.lentes
  DROP COLUMN premium_canonica_id CASCADE;

-- 1.4 - Remover schema compras
DROP SCHEMA IF EXISTS compras CASCADE;

-- ============================================================================
-- PARTE 2: RECRIAR VIEWS ESSENCIAIS
-- ============================================================================

-- 2.1 - View principal vw_lentes_catalogo
CREATE VIEW public.vw_lentes_catalogo AS
SELECT
  l.id,
  l.marca_id,
  l.fornecedor_id,
  l.grupo_canonico_id,
  l.sku_fornecedor,
  l.codigo_original,
  l.nome_comercial,
  m.nome AS marca_nome,
  m.slug AS marca_slug,
  m.is_premium AS marca_premium,
  l.tipo_lente,
  l.categoria,
  l.material,
  l.indice_refracao,
  l.linha_produto,
  l.diametro,
  l.espessura_central,
  l.peso_aproximado,
  l.esferico_min,
  l.esferico_max,
  l.cilindrico_min,
  l.cilindrico_max,
  l.adicao_min,
  l.adicao_max,
  l.dnp_min,
  l.dnp_max,
  l.ar,
  l.antirrisco,
  l.hidrofobico,
  l.antiembaçante,
  l.blue,
  l.uv400,
  l.fotossensivel,
  l.polarizado,
  l.digital,
  l.free_form,
  l.indoor,
  l.drive,
  l.custo_base,
  l.preco_fabricante,
  l.preco_tabela,
  l.prazo_entrega,
  l.obs_prazo,
  l.peso_frete,
  l.exige_receita_especial,
  l.descricao_curta,
  l.descricao_completa,
  l.beneficios,
  l.indicacoes,
  l.contraindicacoes,
  l.observacoes,
  l.status,
  l.disponivel,
  l.destaque,
  l.novidade,
  l.data_lancamento,
  l.data_descontinuacao,
  l.created_at,
  l.updated_at
FROM lens_catalog.lentes l
LEFT JOIN lens_catalog.marcas m ON l.marca_id = m.id
WHERE l.status = 'ativo'
ORDER BY l.created_at DESC;

-- 2.2 - Função buscar_lentes_por_receita
CREATE FUNCTION public.buscar_lentes_por_receita(
  p_esferico NUMERIC,
  p_cilindrico NUMERIC,
  p_adicao NUMERIC DEFAULT NULL,
  p_tipo_lente TEXT DEFAULT NULL
)
RETURNS SETOF vw_lentes_catalogo
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.vw_lentes_catalogo v
  WHERE v.disponivel = true
    AND (p_tipo_lente IS NULL OR v.tipo_lente::TEXT = p_tipo_lente)
    AND p_esferico BETWEEN v.esferico_min AND v.esferico_max
    AND p_cilindrico BETWEEN v.cilindrico_min AND v.cilindrico_max
    AND (p_adicao IS NULL OR (p_adicao BETWEEN v.adicao_min AND v.adicao_max))
  ORDER BY v.preco_tabela;
END;
$$;

-- ============================================================================
-- VERIFICAÇÕES
-- ============================================================================

-- Tabelas restantes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'lens_catalog'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Colunas removidas (deve retornar 0)
SELECT COUNT(*) as colunas_antigas
FROM information_schema.columns
WHERE table_schema = 'lens_catalog'
  AND table_name = 'lentes'
  AND column_name IN ('lente_canonica_id', 'premium_canonica_id');

-- Schema compras removido (deve retornar 0)
SELECT COUNT(*) as schema_compras
FROM information_schema.schemata
WHERE schema_name = 'compras';

-- ============================================================================
-- PRONTO!
-- ============================================================================
