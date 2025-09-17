-- ================================================================
-- CONSULTA PARA VERIFICAR ESTRUTURA ATUAL DO BANCO
-- Execute no Supabase SQL Editor e cole o resultado aqui
-- ================================================================

-- ================================================================
-- 1. VERIFICAR TODAS AS VIEWS EXISTENTES
-- ================================================================
SELECT 
  'VIEWS EXISTENTES' AS categoria,
  viewname AS nome,
  'VIEW' AS tipo
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ================================================================
-- 2. VERIFICAR TODAS AS TABELAS EXISTENTES
-- ================================================================
SELECT 
  'TABELAS EXISTENTES' AS categoria,
  table_name AS nome,
  table_type AS tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ================================================================
-- 3. VIEWS ESPERADAS PELAS APIS (que podem não existir)
-- ================================================================
SELECT 'VIEWS ESPERADAS PELAS APIS' AS categoria, unnest(ARRAY[
  'v_kpis_dashboard',
  'v_ranking_laboratorios', 
  'v_evolucao_mensal',
  'v_analise_financeira',
  'v_alertas_criticos',
  'v_heatmap_sla',
  'v_analise_sazonalidade',
  'v_insights_automaticos',
  'v_projecoes',
  'v_correlacoes',
  'v_dashboard_resumo',
  'v_pedidos_kanban',
  'v_dashboard_bi',
  'v_pedido_timeline_completo',
  'v_lead_time_comparativo',
  'v_dashboard_kpis_full'
]) AS nome, 'ESPERADA' AS tipo;

-- ================================================================
-- 4. TABELAS ESPERADAS PELOS HOOKS (que podem não existir)
-- ================================================================  
SELECT 'TABELAS ESPERADAS PELOS HOOKS' AS categoria, unnest(ARRAY[
  'pedidos',
  'laboratorios',
  'lojas', 
  'classes_lente',
  'alertas',
  'notificacoes',
  'role_permissions',
  'pedido_eventos',
  'usuarios'
]) AS nome, 'ESPERADA' AS tipo;

-- ================================================================
-- 5. VERIFICAR SE VIEWS ESPERADAS EXISTEM
-- ================================================================
WITH views_esperadas AS (
  SELECT unnest(ARRAY[
    'v_kpis_dashboard',
    'v_ranking_laboratorios', 
    'v_evolucao_mensal',
    'v_analise_financeira',
    'v_alertas_criticos',
    'v_heatmap_sla',
    'v_analise_sazonalidade',
    'v_insights_automaticos',
    'v_projecoes',
    'v_correlacoes',
    'v_dashboard_resumo',
    'v_pedidos_kanban',
    'v_dashboard_bi',
    'v_pedido_timeline_completo',
    'v_lead_time_comparativo',
    'v_dashboard_kpis_full'
  ]) AS view_esperada
),
views_existentes AS (
  SELECT viewname AS view_existente
  FROM pg_views 
  WHERE schemaname = 'public'
)
SELECT 
  'STATUS DAS VIEWS' AS categoria,
  ve.view_esperada AS nome,
  CASE 
    WHEN vx.view_existente IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END AS status
FROM views_esperadas ve
LEFT JOIN views_existentes vx ON ve.view_esperada = vx.view_existente
ORDER BY ve.view_esperada;

-- ================================================================
-- 6. VERIFICAR SE TABELAS ESPERADAS EXISTEM
-- ================================================================
WITH tabelas_esperadas AS (
  SELECT unnest(ARRAY[
    'pedidos',
    'laboratorios',
    'lojas', 
    'classes_lente',
    'alertas',
    'notificacoes',
    'role_permissions',
    'pedido_eventos',
    'usuarios'
  ]) AS tabela_esperada
),
tabelas_existentes AS (
  SELECT table_name AS tabela_existente
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
SELECT 
  'STATUS DAS TABELAS' AS categoria,
  te.tabela_esperada AS nome,
  CASE 
    WHEN tx.tabela_existente IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END AS status
FROM tabelas_esperadas te
LEFT JOIN tabelas_existentes tx ON te.tabela_esperada = tx.tabela_existente
ORDER BY te.tabela_esperada;

-- ================================================================
-- 7. VERIFICAR DADOS NAS TABELAS PRINCIPAIS  
-- ================================================================
SELECT 
  'DADOS NAS TABELAS' AS categoria,
  'pedidos' AS tabela,
  COUNT(*) AS total_registros
FROM pedidos
UNION ALL
SELECT 
  'DADOS NAS TABELAS' AS categoria,
  'laboratorios' AS tabela,
  COUNT(*) AS total_registros
FROM laboratorios
UNION ALL  
SELECT 
  'DADOS NAS TABELAS' AS categoria,
  'lojas' AS tabela,
  COUNT(*) AS total_registros
FROM lojas
UNION ALL
SELECT 
  'DADOS NAS TABELAS' AS categoria,
  'usuarios' AS tabela,
  COUNT(*) AS total_registros
FROM usuarios;

-- ================================================================
-- 8. ESTRUTURA DA TABELA PEDIDOS (campos críticos)
-- ================================================================
SELECT 
  'ESTRUTURA PEDIDOS' AS categoria,
  column_name AS nome,
  data_type AS tipo,
  is_nullable AS permite_nulo
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pedidos'
  AND column_name IN (
    'id', 'status', 'data_pedido', 'data_entregue', 'data_prometida',
    'valor_pedido', 'laboratorio_id', 'loja_id', 'classe_lente_id'
  )
ORDER BY ordinal_position;

-- ================================================================
-- RESUMO: Execute todas essas consultas e cole os resultados
-- ================================================================