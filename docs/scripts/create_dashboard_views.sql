-- ============================================================================
-- VIEW: v_kpis_dashboard
-- Cria view com KPIs principais para o dashboard
-- ============================================================================

CREATE OR REPLACE VIEW v_kpis_dashboard AS
WITH periodo_atual AS (
  SELECT 
    COUNT(*) as total_pedidos,
    COUNT(*) FILTER (WHERE status = 'ENTREGUE') as entregues,
    SUM(valor_pedido) as valor_total_vendas,
    AVG(valor_pedido) as ticket_medio,
    COUNT(*) FILTER (WHERE status NOT IN ('ENTREGUE', 'CANCELADO') AND data_prevista_pronto < NOW()) as pedidos_atrasados,
    COUNT(DISTINCT laboratorio_id) as labs_ativos,
    AVG(
      CASE 
        WHEN status = 'ENTREGUE' AND data_prevista_pronto IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0
      END
    ) as lead_time_medio,
    COUNT(*) FILTER (
      WHERE status = 'ENTREGUE' 
      AND data_prevista_pronto IS NOT NULL 
      AND updated_at <= data_prevista_pronto
    ) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status = 'ENTREGUE'), 0) as sla_compliance
  FROM pedidos 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND status != 'CANCELADO'
),
periodo_anterior AS (
  SELECT 
    COUNT(*) as total_pedidos_anterior,
    AVG(
      CASE 
        WHEN status = 'ENTREGUE' AND data_prevista_pronto IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0
      END
    ) as lead_time_anterior,
    COUNT(*) FILTER (
      WHERE status = 'ENTREGUE' 
      AND data_prevista_pronto IS NOT NULL 
      AND updated_at <= data_prevista_pronto
    ) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status = 'ENTREGUE'), 0) as sla_anterior
  FROM pedidos 
  WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'
    AND created_at < CURRENT_DATE - INTERVAL '30 days'
    AND status != 'CANCELADO'
)
SELECT 
  -- Dados atuais
  pa.total_pedidos,
  pa.entregues,
  pa.valor_total_vendas,
  pa.ticket_medio,
  pa.lead_time_medio,
  pa.pedidos_atrasados,
  pa.sla_compliance,
  pa.labs_ativos,
  
  -- Dados período anterior
  pan.total_pedidos_anterior,
  pan.lead_time_anterior,
  pan.sla_anterior,
  
  -- Variações percentuais
  CASE 
    WHEN pan.total_pedidos_anterior > 0 
    THEN (pa.total_pedidos - pan.total_pedidos_anterior) * 100.0 / pan.total_pedidos_anterior
    ELSE 0
  END as variacao_pedidos,
  
  CASE 
    WHEN pan.lead_time_anterior > 0 
    THEN (pa.lead_time_medio - pan.lead_time_anterior) * 100.0 / pan.lead_time_anterior
    ELSE 0
  END as variacao_lead_time,
  
  CASE 
    WHEN pan.sla_anterior > 0 
    THEN (pa.sla_compliance - pan.sla_anterior) * 100.0 / pan.sla_anterior
    ELSE 0
  END as variacao_sla

FROM periodo_atual pa
CROSS JOIN periodo_anterior pan;

-- ============================================================================
-- VIEW: v_evolucao_mensal
-- Evolução mensal de pedidos e faturamento
-- ============================================================================

CREATE OR REPLACE VIEW v_evolucao_mensal AS
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as periodo,
  DATE_TRUNC('month', created_at) as data_periodo,
  COUNT(*) as total_pedidos,
  COUNT(*) FILTER (WHERE status = 'ENTREGUE') as pedidos_entregues,
  SUM(valor_pedido) as faturamento_total,
  AVG(valor_pedido) as ticket_medio,
  COUNT(DISTINCT laboratorio_id) as labs_ativos,
  AVG(
    CASE 
      WHEN status = 'ENTREGUE' AND data_prevista_pronto IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0
    END
  ) as lead_time_medio
FROM pedidos 
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
  AND status != 'CANCELADO'
GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'YYYY-MM')
ORDER BY data_periodo;

-- ============================================================================
-- VIEW: v_ranking_laboratorios  
-- Ranking de laboratórios por performance
-- ============================================================================

CREATE OR REPLACE VIEW v_ranking_laboratorios AS
WITH lab_stats AS (
  SELECT 
    l.id,
    l.nome as laboratorio_nome,
    COUNT(p.id) as total_pedidos,
    COUNT(*) FILTER (WHERE p.status = 'ENTREGUE') as pedidos_entregues,
    SUM(p.valor_pedido) as faturamento_total,
    AVG(p.valor_pedido) as ticket_medio,
    AVG(
      CASE 
        WHEN p.status = 'ENTREGUE' AND p.data_prevista_pronto IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 86400.0
      END
    ) as lead_time_medio,
    COUNT(*) FILTER (
      WHERE p.status = 'ENTREGUE' 
      AND p.data_prevista_pronto IS NOT NULL 
      AND p.updated_at <= p.data_prevista_pronto
    ) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE p.status = 'ENTREGUE'), 0) as sla_compliance
  FROM laboratorios l
  LEFT JOIN pedidos p ON l.id = p.laboratorio_id 
    AND p.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND p.status != 'CANCELADO'
  WHERE l.ativo = true
  GROUP BY l.id, l.nome
)
SELECT 
  *,
  -- Score geral (fórmula pode ser ajustada)
  (
    COALESCE(sla_compliance, 0) * 0.4 + 
    CASE WHEN lead_time_medio > 0 THEN (10 - LEAST(lead_time_medio, 10)) * 10 ELSE 0 END * 0.3 +
    LEAST(total_pedidos, 100) * 0.3
  ) as score_geral,
  ROW_NUMBER() OVER (ORDER BY faturamento_total DESC NULLS LAST) as posicao_faturamento,
  ROW_NUMBER() OVER (ORDER BY sla_compliance DESC NULLS LAST) as posicao_sla,
  ROW_NUMBER() OVER (ORDER BY lead_time_medio ASC NULLS LAST) as posicao_lead_time
FROM lab_stats
ORDER BY score_geral DESC;

-- ============================================================================
-- VIEW: v_alertas_criticos
-- Alertas que precisam de atenção
-- ============================================================================

CREATE OR REPLACE VIEW v_alertas_criticos AS
-- Pedidos atrasados
SELECT 
  'PEDIDOS_ATRASADOS' as tipo_alerta,
  'ALTO' as criticidade,
  'Pedidos em Atraso' as titulo,
  CONCAT(COUNT(*), ' pedidos estão atrasados') as descricao,
  COUNT(*) as quantidade,
  NOW() as created_at
FROM pedidos 
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')
  AND data_prevista_pronto < NOW()
  AND COUNT(*) > 0

UNION ALL

-- SLA baixo por laboratório
SELECT 
  'SLA_BAIXO' as tipo_alerta,
  CASE WHEN sla_compliance < 80 THEN 'ALTO' ELSE 'MEDIO' END as criticidade,
  CONCAT('SLA Baixo - ', laboratorio_nome) as titulo,
  CONCAT('SLA de ', ROUND(sla_compliance, 1), '% nos últimos 30 dias') as descricao,
  1 as quantidade,
  NOW() as created_at
FROM v_ranking_laboratorios
WHERE sla_compliance < 90 AND total_pedidos > 5

UNION ALL

-- Lead time alto
SELECT 
  'LEAD_TIME_ALTO' as tipo_alerta,
  'MEDIO' as criticidade,
  CONCAT('Lead Time Alto - ', laboratorio_nome) as titulo,
  CONCAT('Tempo médio de ', ROUND(lead_time_medio, 1), ' dias') as descricao,
  1 as quantidade,
  NOW() as created_at
FROM v_ranking_laboratorios
WHERE lead_time_medio > 10 AND total_pedidos > 5

ORDER BY 
  CASE criticidade 
    WHEN 'ALTO' THEN 1 
    WHEN 'MEDIO' THEN 2 
    ELSE 3 
  END,
  quantidade DESC;

-- ============================================================================
-- VIEW: v_analise_financeira
-- Análise financeira detalhada
-- ============================================================================

CREATE OR REPLACE VIEW v_analise_financeira AS
WITH financeiro_mensal AS (
  SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as periodo,
    SUM(valor_pedido) as faturamento_total,
    AVG(valor_pedido) as ticket_medio,
    COUNT(*) as total_pedidos,
    SUM(COALESCE(custo_lentes, valor_pedido * 0.6)) as custo_total,
    SUM(valor_pedido - COALESCE(custo_lentes, valor_pedido * 0.6)) as margem_bruta
  FROM pedidos 
  WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
    AND status != 'CANCELADO'
  GROUP BY TO_CHAR(created_at, 'YYYY-MM')
)
SELECT 
  periodo,
  faturamento_total,
  ticket_medio,
  total_pedidos,
  custo_total,
  margem_bruta,
  CASE WHEN faturamento_total > 0 THEN margem_bruta * 100.0 / faturamento_total ELSE 0 END as percentual_margem,
  LAG(faturamento_total) OVER (ORDER BY periodo) as faturamento_anterior,
  CASE 
    WHEN LAG(faturamento_total) OVER (ORDER BY periodo) > 0 
    THEN (faturamento_total - LAG(faturamento_total) OVER (ORDER BY periodo)) * 100.0 / LAG(faturamento_total) OVER (ORDER BY periodo)
    ELSE 0
  END as crescimento_percentual
FROM financeiro_mensal
ORDER BY periodo;

-- ============================================================================
-- VIEW: v_dashboard_resumo
-- Resumo geral para dashboard principal
-- ============================================================================

CREATE OR REPLACE VIEW v_dashboard_resumo AS
SELECT 
  (SELECT total_pedidos FROM v_kpis_dashboard) as total_pedidos,
  (SELECT entregues FROM v_kpis_dashboard) as pedidos_entregues,
  (SELECT valor_total_vendas FROM v_kpis_dashboard) as faturamento_atual,
  (SELECT ticket_medio FROM v_kpis_dashboard) as ticket_medio,
  (SELECT lead_time_medio FROM v_kpis_dashboard) as lead_time_medio,
  (SELECT sla_compliance FROM v_kpis_dashboard) as sla_compliance,
  (SELECT COUNT(*) FROM v_alertas_criticos WHERE criticidade = 'ALTO') as alertas_criticos,
  (SELECT COUNT(*) FROM v_ranking_laboratorios WHERE total_pedidos > 0) as labs_ativos;

-- ============================================================================
-- VIEW: v_heatmap_sla
-- Heatmap de SLA por laboratório e dia da semana
-- ============================================================================

CREATE OR REPLACE VIEW v_heatmap_sla AS
SELECT 
  l.nome as laboratorio_nome,
  EXTRACT(DOW FROM p.created_at) as dia_semana,
  CASE EXTRACT(DOW FROM p.created_at)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END as nome_dia,
  COUNT(*) as total_pedidos,
  COUNT(*) FILTER (WHERE p.status = 'ENTREGUE') as pedidos_entregues,
  COUNT(*) FILTER (
    WHERE p.status = 'ENTREGUE' 
    AND p.data_prevista_pronto IS NOT NULL 
    AND p.updated_at <= p.data_prevista_pronto
  ) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE p.status = 'ENTREGUE'), 0) as sla_compliance,
  AVG(
    CASE 
      WHEN p.status = 'ENTREGUE' AND p.data_prevista_pronto IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 86400.0
    END
  ) as lead_time_medio
FROM laboratorios l
JOIN pedidos p ON l.id = p.laboratorio_id
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND p.status != 'CANCELADO'
  AND l.ativo = true
GROUP BY l.id, l.nome, EXTRACT(DOW FROM p.created_at)
ORDER BY laboratorio_nome, dia_semana;