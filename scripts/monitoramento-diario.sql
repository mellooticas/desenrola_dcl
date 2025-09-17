-- 🚨 SCRIPT DE MONITORAMENTO - ALERTAS CRÍTICOS
-- Execute diariamente para monitorar a saúde do sistema

-- ======================================
-- 🎯 1. VERIFICAÇÃO SLA LABORATÓRIOS
-- ======================================
SELECT 
    '🚨 ALERTA SLA' as tipo,
    laboratorio_nome,
    sla_compliance || '%' as sla,
    total_pedidos,
    CASE 
        WHEN sla_compliance = 0 THEN 'CRÍTICO - SLA ZERO'
        WHEN sla_compliance < 70 THEN 'CRÍTICO - SLA MUITO BAIXO'
        WHEN sla_compliance < 85 THEN 'ALERTA - SLA BAIXO'
        ELSE 'OK'
    END as status_urgencia
FROM v_ranking_laboratorios
WHERE sla_compliance < 90 OR total_pedidos < 3
ORDER BY sla_compliance ASC;

-- ======================================
-- 📊 2. VOLUME DIÁRIO - ÚLTIMOS 7 DIAS
-- ======================================
SELECT 
    '📈 VOLUME DIÁRIO' as tipo,
    data_pedido,
    COUNT(*) as pedidos_dia,
    CASE 
        WHEN COUNT(*) = 0 THEN '🚨 ZERO PEDIDOS'
        WHEN COUNT(*) < 2 THEN '⚠️ VOLUME BAIXO'
        WHEN COUNT(*) < 5 THEN '📊 VOLUME NORMAL'
        ELSE '🚀 VOLUME ALTO'
    END as status_volume
FROM pedidos 
WHERE data_pedido >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY data_pedido
ORDER BY data_pedido DESC;

-- ======================================
-- ⏰ 3. PEDIDOS ATRASADOS URGENTES
-- ======================================
SELECT 
    '⏰ ATRASOS CRÍTICOS' as tipo,
    numero_sequencial,
    cliente_nome,
    laboratorio_nome,
    status,
    data_prevista_pronto,
    CURRENT_DATE - data_prevista_pronto as dias_atraso,
    CASE 
        WHEN CURRENT_DATE - data_prevista_pronto > 7 THEN '🚨 CRÍTICO'
        WHEN CURRENT_DATE - data_prevista_pronto > 3 THEN '⚠️ URGENTE'
        ELSE '📋 ATENÇÃO'
    END as nivel_urgencia
FROM v_pedidos_kanban
WHERE em_atraso = true
  AND status NOT IN ('ENTREGUE', 'CANCELADO')
ORDER BY dias_atraso DESC;

-- ======================================
-- 🏥 4. LABORATÓRIOS INATIVOS
-- ======================================
SELECT 
    '🏥 LABS INATIVOS' as tipo,
    l.nome as laboratorio,
    l.codigo,
    COALESCE(COUNT(p.id), 0) as pedidos_90_dias,
    CASE 
        WHEN COUNT(p.id) = 0 THEN '🚨 TOTALMENTE INATIVO'
        WHEN COUNT(p.id) < 3 THEN '⚠️ MUITO POUCO ATIVO'
        ELSE '✅ ATIVO'
    END as status_atividade
FROM laboratorios l
LEFT JOIN pedidos p ON l.id = p.laboratorio_id 
    AND p.data_pedido >= CURRENT_DATE - INTERVAL '90 days'
WHERE l.ativo = true
GROUP BY l.id, l.nome, l.codigo
ORDER BY pedidos_90_dias ASC;

-- ======================================
-- 💰 5. MONITORAMENTO FINANCEIRO
-- ======================================
SELECT 
    '💰 FINANCEIRO SEMANAL' as tipo,
    DATE_TRUNC('week', data_pedido) as semana,
    COUNT(*) as pedidos,
    SUM(valor_pedido) as faturamento_semana,
    AVG(valor_pedido) as ticket_medio,
    CASE 
        WHEN SUM(valor_pedido) < 10000 THEN '⚠️ FATURAMENTO BAIXO'
        WHEN SUM(valor_pedido) < 30000 THEN '📊 FATURAMENTO NORMAL' 
        ELSE '🚀 FATURAMENTO ALTO'
    END as status_financeiro
FROM pedidos 
WHERE data_pedido >= CURRENT_DATE - INTERVAL '4 weeks'
GROUP BY DATE_TRUNC('week', data_pedido)
ORDER BY semana DESC;

-- ======================================
-- 🚀 6. RESUMO EXECUTIVO
-- ======================================
WITH resumo AS (
    SELECT 
        (SELECT COUNT(*) FROM pedidos WHERE data_pedido >= CURRENT_DATE - INTERVAL '7 days') as pedidos_semana,
        (SELECT COUNT(*) FROM pedidos WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days') as pedidos_mes,
        (SELECT COUNT(*) FROM v_alertas_criticos) as alertas_ativos,
        (SELECT AVG(sla_compliance) FROM v_ranking_laboratorios) as sla_medio,
        (SELECT COUNT(*) FROM v_pedidos_kanban WHERE em_atraso = true) as pedidos_atrasados
)
SELECT 
    '📋 RESUMO EXECUTIVO' as secao,
    pedidos_semana || ' pedidos esta semana' as volume_semanal,
    pedidos_mes || ' pedidos este mês' as volume_mensal,
    alertas_ativos || ' alertas críticos ativos' as alertas,
    ROUND(sla_medio, 1) || '% SLA médio laboratórios' as performance,
    pedidos_atrasados || ' pedidos atrasados' as atrasos,
    CASE 
        WHEN pedidos_semana = 0 THEN '🚨 ATENÇÃO: ZERO PEDIDOS NA SEMANA'
        WHEN sla_medio < 50 THEN '🚨 ATENÇÃO: SLA MUITO BAIXO'
        WHEN alertas_ativos > 0 THEN '⚠️ VERIFICAR ALERTAS ATIVOS'
        ELSE '✅ SISTEMA OPERANDO NORMALMENTE'
    END as status_geral
FROM resumo;

-- ======================================
-- 📋 INSTRUÇÕES DE USO
-- ======================================
SELECT 
    '📋 INSTRUÇÕES' as secao,
    'Execute este script diariamente' as frequencia,
    'Verifique alertas 🚨 e ⚠️ primeiro' as prioridade,
    'SLA zero pode indicar problema no cálculo' as observacao;