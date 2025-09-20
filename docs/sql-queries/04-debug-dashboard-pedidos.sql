-- ============================================
-- CONSULTA: INVESTIGAÇÃO DASHBOARD PEDIDOS
-- ============================================
-- Arquivo: docs/sql-queries/04-debug-dashboard-pedidos.sql
-- Objetivo: Investigar por que dashboard não mostra todos os pedidos
-- Data: 19/09/2025

-- 1. CONTAGEM TOTAL DE PEDIDOS NA TABELA
-- ======================================
SELECT 
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN status = 'AG_PAGAMENTO' THEN 1 END) as aguardando_pagamento,
    COUNT(CASE WHEN status = 'PAGO' THEN 1 END) as pagos,
    COUNT(CASE WHEN status = 'EM_PRODUCAO' THEN 1 END) as em_producao,
    COUNT(CASE WHEN status = 'PRONTO' THEN 1 END) as prontos,
    COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END) as entregues,
    COUNT(CASE WHEN status = 'CANCELADO' THEN 1 END) as cancelados
FROM pedidos;

-- 2. PEDIDOS POR DATA DE CRIAÇÃO (ÚLTIMOS 7 DIAS)
-- ===============================================
SELECT 
    DATE(created_at) as data_criacao,
    COUNT(*) as pedidos_criados,
    STRING_AGG(status, ', ' ORDER BY created_at) as status_list
FROM pedidos 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data_criacao DESC;

-- 3. DETALHES DOS PEDIDOS RECENTES
-- ================================
SELECT 
    id,
    status,
    valor_pedido,
    data_pedido,
    created_at,
    updated_at,
    loja_id,
    cliente_nome
FROM pedidos 
ORDER BY created_at DESC
LIMIT 10;

-- 4. VERIFICAR SE EXISTEM VIEWS PARA DASHBOARD
-- ============================================
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname LIKE '%dashboard%' 
   OR viewname LIKE '%kpi%'
   OR viewname LIKE '%pedido%';

-- 5. VERIFICAR TABELA DE CONTROLE DE ATUALIZAÇÃO
-- ==============================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name LIKE '%cache%' 
   OR table_name LIKE '%dashboard%'
   OR table_name LIKE '%kpi%'
ORDER BY table_name, ordinal_position;

-- 6. PEDIDOS COM DADOS CALCULÁVEIS PARA KPI
-- =========================================
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END) as entregues,
    AVG(CASE WHEN valor_pedido IS NOT NULL THEN valor_pedido END) as ticket_medio,
    SUM(CASE WHEN valor_pedido IS NOT NULL THEN valor_pedido END) as valor_total,
    COUNT(CASE WHEN data_prevista_pronto IS NOT NULL 
               AND data_prevista_pronto < CURRENT_DATE 
               AND status NOT IN ('ENTREGUE', 'CANCELADO') 
               THEN 1 END) as atrasados
FROM pedidos;

-- 7. VERIFICAR INTEGRIDADE DOS DADOS DE PEDIDOS
-- =============================================
SELECT 
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as sem_status,
    COUNT(CASE WHEN valor_pedido IS NULL THEN 1 END) as sem_valor,
    COUNT(CASE WHEN data_pedido IS NULL THEN 1 END) as sem_data_pedido,
    COUNT(CASE WHEN loja_id IS NULL THEN 1 END) as sem_loja,
    COUNT(CASE WHEN created_at IS NULL THEN 1 END) as sem_created_at
FROM pedidos;

-- 8. COMPARAR DADOS RECENTES VS ANTIGOS
-- =====================================
SELECT 
    'Pedidos Hoje' as periodo,
    COUNT(*) as quantidade
FROM pedidos 
WHERE DATE(created_at) = CURRENT_DATE

UNION ALL

SELECT 
    'Pedidos Ontem',
    COUNT(*)
FROM pedidos 
WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'

UNION ALL

SELECT 
    'Pedidos Últimos 7 dias',
    COUNT(*)
FROM pedidos 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
    'Total Geral',
    COUNT(*)
FROM pedidos;

-- 9. VERIFICAR SE HÁ CACHE OU MATERIALIZED VIEWS
-- ==============================================
SELECT 
    schemaname,
    matviewname,
    definition
FROM pg_matviews 
WHERE matviewname LIKE '%dashboard%' 
   OR matviewname LIKE '%kpi%'
   OR matviewname LIKE '%pedido%';

-- 10. TESTAR CÁLCULO MANUAL DE KPIs COMO NO CÓDIGO
-- ================================================
SELECT 
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END) as entregues,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND(COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END) * 100.0 / COUNT(*), 2)
        ELSE 0 
    END as percentual_entrega,
    CASE 
        WHEN COUNT(CASE WHEN valor_pedido IS NOT NULL THEN 1 END) > 0 THEN
            ROUND(AVG(CASE WHEN valor_pedido IS NOT NULL THEN valor_pedido END), 2)
        ELSE 0
    END as ticket_medio,
    COALESCE(SUM(CASE WHEN valor_pedido IS NOT NULL THEN valor_pedido END), 0) as valor_total
FROM pedidos;