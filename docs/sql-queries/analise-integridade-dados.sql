-- ================================================================
-- ANÁLISE DE INTEGRIDADE DOS DADOS - DESENROLA DCL
-- Data: 16 de setembro de 2025
-- ================================================================

-- 1. ANÁLISE GERAL DE VOLUME
SELECT 
  'VOLUME_GERAL' as categoria,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM laboratorios WHERE ativo = true) as labs_ativos,
  (SELECT COUNT(*) FROM lojas WHERE ativo = true) as lojas_ativas,
  (SELECT COUNT(*) FROM usuarios WHERE ativo = true) as usuarios_ativos,
  (SELECT COUNT(*) FROM classes_lente WHERE ativo = true) as classes_ativas;

-- 2. ANÁLISE TEMPORAL DOS PEDIDOS
SELECT 
  'DISTRIBUICAO_TEMPORAL' as categoria,
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as pedidos_mes,
  ROUND(AVG(valor_pedido), 2) as ticket_medio,
  COUNT(CASE WHEN status = 'entregue' THEN 1 END) as entregues,
  ROUND(
    COUNT(CASE WHEN status = 'entregue' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as taxa_entrega_percent
FROM pedidos 
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC
LIMIT 12;

-- 3. ANÁLISE DE QUALIDADE DOS DADOS
SELECT 
  'QUALIDADE_DADOS' as categoria,
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN cliente_nome IS NULL OR cliente_nome = '' THEN 1 END) as sem_nome_cliente,
  COUNT(CASE WHEN cliente_telefone IS NULL OR cliente_telefone = '' THEN 1 END) as sem_telefone,
  COUNT(CASE WHEN valor_pedido IS NULL OR valor_pedido <= 0 THEN 1 END) as valor_invalido,
  COUNT(CASE WHEN laboratorio_id IS NULL THEN 1 END) as sem_laboratorio,
  COUNT(CASE WHEN loja_id IS NULL THEN 1 END) as sem_loja,
  ROUND(
    (COUNT(*) - COUNT(CASE WHEN 
      cliente_nome IS NULL OR cliente_nome = '' OR
      cliente_telefone IS NULL OR cliente_telefone = '' OR
      valor_pedido IS NULL OR valor_pedido <= 0 OR
      laboratorio_id IS NULL OR
      loja_id IS NULL
    THEN 1 END)) * 100.0 / COUNT(*), 
    2
  ) as qualidade_percent
FROM pedidos;

-- 4. ANÁLISE FINANCEIRA
SELECT 
  'METRICAS_FINANCEIRAS' as categoria,
  COUNT(*) as total_pedidos,
  ROUND(SUM(valor_pedido), 2) as faturamento_total,
  ROUND(AVG(valor_pedido), 2) as ticket_medio,
  ROUND(MIN(valor_pedido), 2) as menor_pedido,
  ROUND(MAX(valor_pedido), 2) as maior_pedido,
  ROUND(STDDEV(valor_pedido), 2) as desvio_padrao_valor,
  COUNT(CASE WHEN eh_garantia = true THEN 1 END) as pedidos_garantia,
  ROUND(
    COUNT(CASE WHEN eh_garantia = true THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as percent_garantia
FROM pedidos;

-- 5. ANÁLISE DE PERFORMANCE POR LABORATÓRIO
SELECT 
  'PERFORMANCE_LABS' as categoria,
  l.nome as laboratorio,
  COUNT(p.id) as total_pedidos,
  ROUND(AVG(p.valor_pedido), 2) as ticket_medio,
  COUNT(CASE WHEN p.status = 'entregue' THEN 1 END) as entregues,
  ROUND(
    COUNT(CASE WHEN p.status = 'entregue' THEN 1 END) * 100.0 / COUNT(p.id), 
    2
  ) as taxa_entrega,
  ROUND(
    AVG(CASE 
      WHEN p.status = 'entregue' AND p.data_entrega IS NOT NULL 
      THEN EXTRACT(days FROM p.data_entrega - p.created_at)
      ELSE NULL 
    END), 
    1
  ) as lead_time_medio_dias
FROM laboratorios l
LEFT JOIN pedidos p ON l.id = p.laboratorio_id
WHERE l.ativo = true
GROUP BY l.id, l.nome
ORDER BY total_pedidos DESC;

-- 6. ANÁLISE DE STATUS DOS PEDIDOS
SELECT 
  'DISTRIBUICAO_STATUS' as categoria,
  status,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pedidos), 2) as porcentagem,
  ROUND(SUM(valor_pedido), 2) as valor_total_status
FROM pedidos
GROUP BY status
ORDER BY quantidade DESC;

-- 7. ANÁLISE DE DADOS ORFÃOS (INTEGRIDADE REFERENCIAL)
SELECT 
  'INTEGRIDADE_REFERENCIAL' as categoria,
  COUNT(CASE WHEN l.id IS NULL THEN 1 END) as pedidos_lab_inexistente,
  COUNT(CASE WHEN lj.id IS NULL THEN 1 END) as pedidos_loja_inexistente,
  COUNT(CASE WHEN cl.id IS NULL THEN 1 END) as pedidos_classe_inexistente,
  COUNT(*) as total_verificado
FROM pedidos p
LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
LEFT JOIN lojas lj ON p.loja_id = lj.id  
LEFT JOIN classes_lente cl ON p.classe_id = cl.id;

-- 8. ANÁLISE DE CRESCIMENTO (ÚLTIMOS 6 MESES)
WITH crescimento AS (
  SELECT 
    DATE_TRUNC('month', created_at) as mes,
    COUNT(*) as pedidos,
    SUM(valor_pedido) as faturamento,
    LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as pedidos_mes_anterior,
    LAG(SUM(valor_pedido)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as fat_mes_anterior
  FROM pedidos 
  WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
  'TENDENCIA_CRESCIMENTO' as categoria,
  mes,
  pedidos,
  ROUND(faturamento, 2) as faturamento,
  CASE 
    WHEN pedidos_mes_anterior IS NOT NULL 
    THEN ROUND((pedidos - pedidos_mes_anterior) * 100.0 / pedidos_mes_anterior, 2)
    ELSE NULL 
  END as crescimento_pedidos_percent,
  CASE 
    WHEN fat_mes_anterior IS NOT NULL 
    THEN ROUND((faturamento - fat_mes_anterior) * 100.0 / fat_mes_anterior, 2)
    ELSE NULL 
  END as crescimento_faturamento_percent
FROM crescimento
ORDER BY mes DESC;

-- 9. RESUMO EXECUTIVO
SELECT 
  'RESUMO_EXECUTIVO' as categoria,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos_sistema,
  (SELECT COUNT(*) FROM pedidos WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as pedidos_ultimo_mes,
  (SELECT ROUND(SUM(valor_pedido), 2) FROM pedidos) as faturamento_total_historico,
  (SELECT ROUND(SUM(valor_pedido), 2) FROM pedidos WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as faturamento_ultimo_mes,
  (SELECT COUNT(*) FROM laboratorios WHERE ativo = true) as laboratorios_ativos,
  (SELECT COUNT(*) FROM lojas WHERE ativo = true) as lojas_ativas,
  (SELECT COUNT(DISTINCT loja_id) FROM pedidos) as lojas_com_pedidos,
  (SELECT COUNT(DISTINCT laboratorio_id) FROM pedidos) as labs_com_pedidos,
  CURRENT_TIMESTAMP as data_analise;