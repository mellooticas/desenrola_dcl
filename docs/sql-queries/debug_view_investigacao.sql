-- ================================================================
-- DEBUG COMPLETO: INVESTIGAR CADEIA HOOK → API → DASHBOARD
-- ================================================================
-- Vamos rastrear cada passo desde o frontend até o banco
-- ================================================================

-- 1. VERIFICAR SE A VIEW ESTÁ REALMENTE CORRIGIDA
SELECT 
    'VIEW_ATUAL' as fonte,
    total_pedidos,
    valor_total_vendas,
    ticket_medio,
    labs_ativos
FROM v_kpis_dashboard;

-- 2. VERIFICAR DADOS DIRETOS DA TABELA PEDIDOS
SELECT 
    'TABELA_DIRETA' as fonte,
    COUNT(*) as total_pedidos,
    SUM(valor_pedido) as valor_total_vendas,
    AVG(valor_pedido) as ticket_medio,
    COUNT(DISTINCT laboratorio_id) as labs_distintos
FROM pedidos;

-- 3. VERIFICAR SE EXISTEM MÚLTIPLAS VIEWS COM NOMES SIMILARES
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname LIKE '%kpi%' 
   OR viewname LIKE '%dashboard%';

-- 4. VERIFICAR SE HÁ CACHE/MATERIALIZAÇÃO
SELECT 
    schemaname,
    matviewname as nome,
    hasindexes,
    ispopulated
FROM pg_matviews 
WHERE matviewname LIKE '%kpi%' 
   OR matviewname LIKE '%dashboard%';

-- 5. VERIFICAR DEFINIÇÃO COMPLETA DA VIEW ATUAL
SELECT pg_get_viewdef('v_kpis_dashboard', true) as definicao_view;

-- ================================================================
-- INVESTIGAÇÃO DE POSSÍVEIS PROBLEMAS:
-- ================================================================

-- A. Verificar se há views com nomes diferentes sendo usadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%kpi%' OR table_name LIKE '%dashboard%')
ORDER BY table_name;