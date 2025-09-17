-- 🧪 SCRIPT DE VALIDAÇÃO DAS VIEWS
-- Execute este script no Supabase SQL Editor para testar todas as views

-- ======================================
-- ✅ TESTE 1: VERIFICAR SE TODAS AS VIEWS RESPONDEM
-- ======================================

-- Teste da view principal de KPIs
SELECT 'v_kpis_dashboard' as view_name, 'OK' as status
FROM v_kpis_dashboard 
LIMIT 1;

-- Teste do resumo do dashboard
SELECT 'v_dashboard_resumo' as view_name, 'OK' as status
FROM v_dashboard_resumo 
LIMIT 1;

-- Teste da evolução mensal
SELECT 'v_evolucao_mensal' as view_name, 'OK' as status
FROM v_evolucao_mensal 
LIMIT 1;

-- Teste do ranking de laboratórios
SELECT 'v_ranking_laboratorios' as view_name, 'OK' as status
FROM v_ranking_laboratorios 
LIMIT 1;

-- Teste do heatmap SLA
SELECT 'v_heatmap_sla' as view_name, 'OK' as status
FROM v_heatmap_sla 
LIMIT 1;

-- Teste da análise financeira
SELECT 'v_analise_financeira' as view_name, 'OK' as status
FROM v_analise_financeira 
LIMIT 1;

-- Teste dos alertas críticos
SELECT 'v_alertas_criticos' as view_name, 'OK' as status
FROM v_alertas_criticos 
LIMIT 1;

-- Teste da view de BI principal
SELECT 'v_dashboard_bi' as view_name, 'OK' as status
FROM v_dashboard_bi 
LIMIT 1;

-- Teste da sazonalidade
SELECT 'v_analise_sazonalidade' as view_name, 'OK' as status
FROM v_analise_sazonalidade 
LIMIT 1;

-- Teste das correlações
SELECT 'v_correlacoes' as view_name, 'OK' as status
FROM v_correlacoes 
LIMIT 1;

-- Teste do kanban
SELECT 'v_pedidos_kanban' as view_name, 'OK' as status
FROM v_pedidos_kanban 
LIMIT 1;

-- Teste da timeline completa
SELECT 'v_pedido_timeline_completo' as view_name, 'OK' as status
FROM v_pedido_timeline_completo 
LIMIT 1;

-- Teste do lead time comparativo
SELECT 'v_lead_time_comparativo' as view_name, 'OK' as status
FROM v_lead_time_comparativo 
LIMIT 1;

-- Teste dos insights automáticos
SELECT 'v_insights_automaticos' as view_name, 'OK' as status
FROM v_insights_automaticos 
LIMIT 1;

-- Teste das projeções
SELECT 'v_projecoes' as view_name, 'OK' as status
FROM v_projecoes 
LIMIT 1;

-- ======================================
-- 🔍 TESTE 2: VERIFICAR DADOS REAIS NAS VIEWS PRINCIPAIS
-- ======================================

-- KPIs Dashboard - deve ter dados
SELECT 
    'v_kpis_dashboard' as view_teste,
    total_pedidos,
    entregues,
    lead_time_medio,
    ticket_medio
FROM v_kpis_dashboard;

-- Dashboard Resumo - deve ter dados dos últimos 30 dias
SELECT 
    'v_dashboard_resumo' as view_teste,
    total_pedidos,
    registrados,
    entregues,
    em_producao
FROM v_dashboard_resumo;

-- Ranking Laboratórios - deve ter pelo menos 1 laboratório
SELECT 
    'v_ranking_laboratorios' as view_teste,
    COUNT(*) as total_laboratorios,
    MAX(total_pedidos) as max_pedidos_lab,
    AVG(sla_compliance) as sla_medio
FROM v_ranking_laboratorios;

-- Kanban - deve ter pedidos ativos
SELECT 
    'v_pedidos_kanban' as view_teste,
    COUNT(*) as total_pedidos_kanban,
    COUNT(DISTINCT status) as status_diferentes,
    COUNT(*) FILTER (WHERE em_atraso = true) as pedidos_atrasados
FROM v_pedidos_kanban;

-- ======================================
-- 📊 TESTE 3: VERIFICAR CONSISTÊNCIA DOS DADOS
-- ======================================

-- Comparar total de pedidos entre views
SELECT 
    'Consistência Total Pedidos' as teste,
    (SELECT COUNT(*) FROM pedidos) as total_tabela_pedidos,
    (SELECT COUNT(*) FROM v_pedidos_kanban) as total_view_kanban,
    (SELECT total_pedidos FROM v_kpis_dashboard) as total_view_kpis;

-- Verificar se os status estão corretos
SELECT 
    'Status Distribution' as teste,
    status,
    COUNT(*) as quantidade_real,
    (SELECT COUNT(*) FROM v_pedidos_kanban WHERE status = p.status) as quantidade_view
FROM pedidos p
GROUP BY status
ORDER BY quantidade_real DESC;

-- ======================================
-- ⚠️ TESTE 4: VERIFICAR POSSÍVEIS PROBLEMAS
-- ======================================

-- Views que podem estar vazias (verificar se é esperado)
SELECT 'Views Vazias - Verificar' as alerta;

SELECT 
    'v_alertas_criticos' as view_name,
    COUNT(*) as registros
FROM v_alertas_criticos;

SELECT 
    'v_lead_time_comparativo' as view_name,
    COUNT(*) as registros
FROM v_lead_time_comparativo;

-- Verificar se há dados NULL onde não deveria
SELECT 
    'Dados NULL em KPIs' as teste,
    CASE WHEN total_pedidos IS NULL THEN 'ERRO: total_pedidos NULL' 
         WHEN entregues IS NULL THEN 'ERRO: entregues NULL'
         WHEN ticket_medio IS NULL THEN 'ERRO: ticket_medio NULL'
         ELSE 'OK' END as validacao
FROM v_kpis_dashboard;

-- ======================================
-- 🎯 TESTE 5: PERFORMANCE DAS VIEWS
-- ======================================

-- Verificar tempo de resposta das views mais complexas
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM v_ranking_laboratorios LIMIT 5;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM v_alertas_criticos LIMIT 5;

-- ======================================
-- 📋 RESUMO DO TESTE
-- ======================================

SELECT 
    'RESUMO DOS TESTES' as secao,
    'Execute todas as queries acima' as instrucao,
    'Se todas retornarem dados, as views estão funcionando' as resultado,
    'Views vazias podem ser normais (ex: sem alertas críticos)' as observacao;