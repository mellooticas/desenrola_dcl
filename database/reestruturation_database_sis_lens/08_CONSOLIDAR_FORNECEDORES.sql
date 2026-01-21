-- ============================================================================
-- CONSOLIDAÇÃO: Views de Fornecedores
-- ============================================================================
-- Objetivo: Consolidar v_fornecedores_catalogo + v_fornecedores_por_lente → v_fornecedores
-- Data: 20/01/2026
-- ============================================================================

-- Remover views antigas
DROP VIEW IF EXISTS public.v_fornecedores_por_lente CASCADE;
DROP VIEW IF EXISTS public.v_fornecedores_catalogo CASCADE;

-- ============================================================================
-- VIEW CONSOLIDADA: v_fornecedores
-- ============================================================================
CREATE OR REPLACE VIEW public.v_fornecedores AS
SELECT 
  -- ========== IDENTIFICAÇÃO ==========
  f.id,
  f.nome,
  f.razao_social,
  f.cnpj,
  
  -- ========== PRAZOS DE ENTREGA ==========
  f.prazo_visao_simples,
  f.prazo_multifocal,
  f.prazo_surfacada,
  f.prazo_free_form,
  
  -- ========== BADGE DE PRAZO ==========
  CASE
    WHEN f.prazo_visao_simples <= 3 THEN 'express'
    WHEN f.prazo_visao_simples <= 7 THEN 'normal'
    ELSE 'economico'
  END AS badge_prazo,
  
  -- ========== ESTATÍSTICAS DE LENTES ==========
  COUNT(DISTINCT l.id) AS total_lentes,
  COUNT(DISTINCT l.marca_id) AS total_marcas,
  MIN(l.preco_venda_sugerido) AS preco_minimo,
  MAX(l.preco_venda_sugerido) AS preco_maximo,
  ROUND(AVG(l.preco_venda_sugerido)::NUMERIC, 2) AS preco_medio,
  
  -- ========== CONTAGEM POR TIPO ==========
  COUNT(*) FILTER (WHERE l.tipo_lente = 'visao_simples') AS total_visao_simples,
  COUNT(*) FILTER (WHERE l.tipo_lente = 'multifocal') AS total_multifocal,
  COUNT(*) FILTER (WHERE l.tipo_lente = 'bifocal') AS total_bifocal,
  
  -- ========== CONTAGEM POR TRATAMENTO ==========
  COUNT(*) FILTER (WHERE l.tratamento_antirreflexo = true) AS total_com_ar,
  COUNT(*) FILTER (WHERE l.tratamento_blue_light = true) AS total_com_blue,
  COUNT(*) FILTER (WHERE l.tratamento_fotossensiveis IS NOT NULL 
                   AND l.tratamento_fotossensiveis != 'nenhum') AS total_fotossensiveis,
  
  -- ========== CONFIGURAÇÃO DE FRETE (JSON) ==========
  (f.frete_config -> 'contato' ->> 'email')::TEXT AS email_contato,
  (f.frete_config -> 'contato' ->> 'telefone')::TEXT AS telefone_contato,
  JSONB_BUILD_OBJECT(
    'tipo', f.frete_config ->> 'tipo',
    'frete_gratis_acima', f.frete_config ->> 'frete_gratis_acima',
    'taxa_fixa', f.frete_config ->> 'taxa_fixa'
  ) AS config_frete,
  
  -- ========== STATUS ==========
  f.ativo,
  f.created_at,
  f.deleted_at
  
FROM core.fornecedores f
LEFT JOIN lens_catalog.lentes l ON l.fornecedor_id = f.id AND l.ativo = true
WHERE f.ativo = true AND f.deleted_at IS NULL
GROUP BY f.id, f.nome, f.razao_social, f.cnpj, 
         f.prazo_visao_simples, f.prazo_multifocal, 
         f.prazo_surfacada, f.prazo_free_form,
         f.frete_config, f.ativo, f.created_at, f.deleted_at
ORDER BY f.prazo_visao_simples, f.nome;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT ON public.v_fornecedores TO anon, authenticated;

-- ============================================================================
-- COMENTÁRIO
-- ============================================================================
COMMENT ON VIEW public.v_fornecedores IS 
'View consolidada de fornecedores com estatísticas completas.
Substitui v_fornecedores_catalogo e v_fornecedores_por_lente.
Inclui: prazos, estatísticas de lentes, preços, contato e frete.';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- SELECT nome, total_lentes, preco_medio, badge_prazo, total_com_ar
-- FROM public.v_fornecedores
-- ORDER BY prazo_visao_simples
-- LIMIT 10;
