-- ============================================================================
-- CONSOLIDAÇÃO: Views de Grupos Canônicos
-- ============================================================================
-- Objetivo: Substituir 6 views por apenas 1 view completa
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- VIEWS A SEREM REMOVIDAS (6 views fragmentadas)
-- ============================================================================
-- 1. v_grupos_canonicos (básica)
-- 2. v_grupos_canonicos_completos (com fornecedores)
-- 3. v_grupos_melhor_margem (com margem)
-- 4. v_grupos_por_faixa_preco (agrupado por preço)
-- 5. v_grupos_por_receita_cliente (por receita)
-- 6. v_grupos_premium (só premium)
-- ============================================================================

-- Remover todas as views antigas
DROP VIEW IF EXISTS public.v_grupos_premium CASCADE;
DROP VIEW IF EXISTS public.v_grupos_por_receita_cliente CASCADE;
DROP VIEW IF EXISTS public.v_grupos_por_faixa_preco CASCADE;
DROP VIEW IF EXISTS public.v_grupos_melhor_margem CASCADE;
DROP VIEW IF EXISTS public.v_grupos_canonicos_completos CASCADE;
DROP VIEW IF EXISTS public.v_grupos_canonicos CASCADE;

-- ============================================================================
-- VIEW ÚNICA CONSOLIDADA: v_grupos_canonicos
-- ============================================================================
-- Contém TODOS os dados necessários das 6 views antigas
-- ============================================================================

CREATE OR REPLACE VIEW public.v_grupos_canonicos AS
SELECT 
  -- ========== IDENTIFICAÇÃO ==========
  gc.id,
  gc.slug,
  gc.nome_grupo,
  
  -- ========== CARACTERÍSTICAS DA LENTE ==========
  gc.tipo_lente,
  gc.material,
  gc.indice_refracao,
  gc.categoria_predominante,
  
  -- ========== RANGES DE GRAU ==========
  gc.grau_esferico_min,
  gc.grau_esferico_max,
  gc.grau_cilindrico_min,
  gc.grau_cilindrico_max,
  gc.adicao_min,
  gc.adicao_max,
  gc.descricao_ranges,
  
  -- ========== TRATAMENTOS ==========
  gc.tratamento_antirreflexo AS tem_antirreflexo,
  gc.tratamento_antirrisco AS tem_antirrisco,
  gc.tratamento_uv AS tem_uv,
  gc.tratamento_blue_light AS tem_blue_light,
  gc.tratamento_fotossensiveis AS tratamento_foto,
  
  -- ========== PREÇOS ==========
  gc.preco_minimo,
  gc.preco_medio,
  gc.preco_maximo,
  
  -- ========== ESTATÍSTICAS ==========
  gc.total_lentes,
  gc.total_marcas,
  gc.peso,
  gc.is_premium,
  
  -- ========== CÁLCULOS DE MARGEM (da v_grupos_melhor_margem) ==========
  AVG(l.preco_custo) AS custo_medio,
  MIN(l.preco_custo) AS custo_minimo,
  MAX(l.preco_custo) AS custo_maximo,
  CASE
    WHEN AVG(l.preco_custo) > 0 THEN
      ROUND(((gc.preco_medio - AVG(l.preco_custo)) / AVG(l.preco_custo) * 100)::NUMERIC, 2)
    ELSE 0
  END AS margem_percentual,
  ROUND((gc.preco_medio - AVG(l.preco_custo))::NUMERIC, 2) AS lucro_unitario,
  CASE
    WHEN AVG(l.preco_custo) > 0 THEN
      ROUND((gc.preco_medio / AVG(l.preco_custo))::NUMERIC, 2)
    ELSE NULL
  END AS markup,
  
  -- ========== CLASSIFICAÇÕES (da v_grupos_por_faixa_preco) ==========
  CASE
    WHEN gc.preco_medio < 150 THEN '< R$150'
    WHEN gc.preco_medio >= 150 AND gc.preco_medio < 300 THEN 'R$150-300'
    WHEN gc.preco_medio >= 300 AND gc.preco_medio < 500 THEN 'R$300-500'
    WHEN gc.preco_medio >= 500 AND gc.preco_medio < 800 THEN 'R$500-800'
    ELSE 'R$800+'
  END AS faixa_preco,
  CASE
    WHEN gc.preco_medio < 150 THEN 'Entrada'
    WHEN gc.preco_medio >= 150 AND gc.preco_medio < 300 THEN 'Básico'
    WHEN gc.preco_medio >= 300 AND gc.preco_medio < 500 THEN 'Intermediário'
    WHEN gc.preco_medio >= 500 AND gc.preco_medio < 800 THEN 'Premium'
    ELSE 'Super Premium'
  END AS categoria_preco,
  
  -- ========== FORNECEDORES (da v_grupos_canonicos_completos) ==========
  COUNT(DISTINCT l.fornecedor_id) AS total_fornecedores,
  JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
    'id', f.id,
    'nome', f.nome,
    'prazo_visao_simples', COALESCE(f.prazo_visao_simples, 0),
    'prazo_multifocal', COALESCE(f.prazo_multifocal, 0)
  )) FILTER (WHERE f.id IS NOT NULL) AS fornecedores_disponiveis,
  
  -- ========== MARCAS (da v_grupos_premium) ==========
  JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
    'marca_id', m.id,
    'marca_nome', m.nome,
    'marca_slug', m.slug,
    'is_premium', m.is_premium
  )) FILTER (WHERE m.id IS NOT NULL) AS marcas_disponiveis,
  STRING_AGG(DISTINCT m.nome::TEXT, ', ' ORDER BY m.nome::TEXT) AS marcas_nomes,
  
  -- ========== PRAZO MÉDIO (da v_grupos_por_receita_cliente) ==========
  ROUND(AVG(
    CASE gc.tipo_lente
      WHEN 'visao_simples' THEN COALESCE(f.prazo_visao_simples, 7)
      WHEN 'multifocal' THEN COALESCE(f.prazo_multifocal, 10)
      WHEN 'bifocal' THEN COALESCE(f.prazo_multifocal, 10)
      WHEN 'leitura' THEN COALESCE(f.prazo_visao_simples, 7)
      WHEN 'ocupacional' THEN COALESCE(f.prazo_multifocal, 10)
      ELSE 10
    END
  ))::INTEGER AS prazo_medio_dias,
  
  -- ========== METADADOS ==========
  gc.ativo,
  gc.created_at,
  gc.updated_at
  
FROM lens_catalog.grupos_canonicos gc
LEFT JOIN lens_catalog.lentes l ON l.grupo_canonico_id = gc.id AND l.ativo = true
LEFT JOIN core.fornecedores f ON f.id = l.fornecedor_id
LEFT JOIN lens_catalog.marcas m ON m.id = l.marca_id AND m.ativo = true
WHERE gc.ativo = true
GROUP BY 
  gc.id, gc.slug, gc.nome_grupo, gc.tipo_lente, gc.material, gc.indice_refracao,
  gc.categoria_predominante, gc.grau_esferico_min, gc.grau_esferico_max,
  gc.grau_cilindrico_min, gc.grau_cilindrico_max, gc.adicao_min, gc.adicao_max,
  gc.descricao_ranges, gc.tratamento_antirreflexo, gc.tratamento_antirrisco,
  gc.tratamento_uv, gc.tratamento_blue_light, gc.tratamento_fotossensiveis,
  gc.preco_minimo, gc.preco_medio, gc.preco_maximo, gc.total_lentes,
  gc.total_marcas, gc.peso, gc.is_premium, gc.ativo, gc.created_at, gc.updated_at
ORDER BY gc.preco_medio;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT ON public.v_grupos_canonicos TO anon, authenticated;

-- ============================================================================
-- COMENTÁRIO DA VIEW
-- ============================================================================
COMMENT ON VIEW public.v_grupos_canonicos IS 
'View consolidada de grupos canônicos com TODOS os dados necessários.
Substitui 6 views antigas: v_grupos_canonicos, v_grupos_canonicos_completos, 
v_grupos_melhor_margem, v_grupos_por_faixa_preco, v_grupos_por_receita_cliente, v_grupos_premium.
Inclui: identificação, características, ranges, tratamentos, preços, margem, 
fornecedores, marcas, prazos e classificações.';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Teste a view consolidada:
-- SELECT id, nome_grupo, preco_medio, margem_percentual, faixa_preco, total_fornecedores
-- FROM public.v_grupos_canonicos
-- WHERE is_premium = false
-- LIMIT 10;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ 1 view única: v_grupos_canonicos
-- ❌ 6 views removidas
-- 🎯 Banco mais simples e performático
-- 📊 Todos os dados acessíveis em um único SELECT
-- ============================================================================
