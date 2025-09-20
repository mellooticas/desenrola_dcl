-- ================================================================
-- VERIFICAÇÃO COMPLETA DO BANCO DE DADOS - DESENROLA DCL
-- ================================================================

-- 1. VERIFICAR TABELA PEDIDOS
SELECT 
    'PEDIDOS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'REGISTRADO' THEN 1 END) as registrado,
    COUNT(CASE WHEN status = 'AG_PAGAMENTO' THEN 1 END) as ag_pagamento,
    COUNT(CASE WHEN status = 'PAGO' THEN 1 END) as pago,
    COUNT(CASE WHEN status = 'PRODUCAO' THEN 1 END) as producao,
    COUNT(CASE WHEN status = 'PRONTO' THEN 1 END) as pronto,
    COUNT(CASE WHEN status = 'SAIU_LAB' THEN 1 END) as saiu_lab,
    COUNT(CASE WHEN status = 'CHEGOU' THEN 1 END) as chegou,
    COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END) as entregue,
    COUNT(CASE WHEN status = 'CANCELADO' THEN 1 END) as cancelado,
    COALESCE(SUM(valor_pedido), 0) as valor_total,
    COALESCE(AVG(valor_pedido), 0) as ticket_medio
FROM pedidos;

-- 2. VERIFICAR TABELA LABORATORIOS
SELECT 
    'LABORATORIOS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM laboratorios;

-- 3. VERIFICAR TABELA LOJAS
SELECT 
    'LOJAS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativas,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativas
FROM lojas;

-- 4. VERIFICAR TABELA USUARIOS
SELECT 
    'USUARIOS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin,
    COUNT(CASE WHEN role = 'gestor' THEN 1 END) as gestor,
    COUNT(CASE WHEN role = 'dcl' THEN 1 END) as dcl,
    COUNT(CASE WHEN role = 'financeiro' THEN 1 END) as financeiro,
    COUNT(CASE WHEN role = 'loja' THEN 1 END) as loja,
    COUNT(CASE WHEN role = 'operador' THEN 1 END) as operador
FROM usuarios;

-- 5. VERIFICAR TABELA CLASSES
SELECT 
    'CLASSES' as tabela,
    COUNT(*) as total_registros
FROM classes;

-- 6. VERIFICAR VIEW v_kpis_dashboard (se existir)
SELECT 
    'VIEW_KPIS_DASHBOARD' as fonte,
    total_pedidos,
    entregues,
    lead_time_medio,
    pedidos_atrasados,
    ticket_medio,
    sla_compliance,
    labs_ativos,
    valor_total_vendas,
    margem_percentual
FROM v_kpis_dashboard
LIMIT 1;

-- 7. VERIFICAR ÚLTIMOS PEDIDOS (se houver)
SELECT 
    'ULTIMOS_PEDIDOS' as info,
    id,
    status,
    valor_pedido,
    created_at::date as data_criacao
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. RESUMO GERAL
SELECT 
    'RESUMO_GERAL' as info,
    (SELECT COUNT(*) FROM pedidos) as total_pedidos,
    (SELECT COUNT(*) FROM laboratorios WHERE ativo = true) as labs_ativos,
    (SELECT COUNT(*) FROM lojas WHERE ativo = true) as lojas_ativas,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COALESCE(SUM(valor_pedido), 0) FROM pedidos) as valor_total_pedidos;