-- ============================================
-- DEBUG: VERIFICAR VIEWS DO DASHBOARD
-- ============================================

-- 1. Verificar se existe v_dashboard_resumo
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('v_dashboard_resumo', 'v_kpis_dashboard')
    AND table_schema = 'public';

-- 2. Se existir v_dashboard_resumo, mostrar seus dados
SELECT 'v_dashboard_resumo' as origem, * FROM v_dashboard_resumo
UNION ALL
SELECT 'v_kpis_dashboard' as origem, 
       total_pedidos::text, 
       pedidos_garantia::text,
       '0' as other_fields
FROM v_kpis_dashboard;

-- 3. Comparar com dados reais da tabela
SELECT 'tabela_pedidos' as origem,
       COUNT(*)::text as total_pedidos,
       COUNT(*) FILTER (WHERE eh_garantia = true)::text as pedidos_garantia,
       '0' as other_fields
FROM pedidos;