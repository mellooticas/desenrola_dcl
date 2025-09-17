-- Teste da primeira view: v_kpis_dashboard
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