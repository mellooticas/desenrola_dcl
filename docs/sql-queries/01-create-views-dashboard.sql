-- ================================================================
-- VIEWS PARA DASHBOARD POWERBI - DADOS REAIS
-- ================================================================
-- Base: Estrutura real do banco com tabelas: pedidos, lojas, laboratorios, classes_lente, etc.
-- Sistema: PostgreSQL/Supabase
-- ================================================================

-- ================================================================
-- 1. VIEW v_kpis_dashboard
-- Métricas principais do dashboard com comparações temporais
-- ================================================================

CREATE OR REPLACE VIEW v_kpis_dashboard AS
WITH periodo_atual AS (
  SELECT 
    COUNT(*) AS total_pedidos,
    COUNT(*) FILTER (WHERE status = 'ENTREGUE') AS entregues,
    AVG(valor_pedido) FILTER (WHERE valor_pedido > 0) AS ticket_medio,
    SUM(valor_pedido) FILTER (WHERE valor_pedido > 0) AS valor_total_vendas,
    COUNT(*) FILTER (WHERE status IN ('REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU') 
                     AND data_prometida < CURRENT_DATE) AS pedidos_atrasados,
    COUNT(DISTINCT laboratorio_id) AS labs_ativos,
    
    -- Cálculo de SLA Compliance
    ROUND(
      COUNT(*) FILTER (WHERE status = 'ENTREGUE' AND data_entregue <= data_prometida) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE status = 'ENTREGUE' AND data_prometida IS NOT NULL), 0),
      2
    ) AS sla_compliance,
    
    -- Lead Time Médio (em dias)
    ROUND(
      AVG(EXTRACT(EPOCH FROM (data_entregue - data_pedido))/86400)
      FILTER (WHERE status = 'ENTREGUE' AND data_entregue IS NOT NULL),
      1
    ) AS lead_time_medio
    
  FROM pedidos 
  WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days'
),

periodo_anterior AS (
  SELECT 
    COUNT(*) AS total_pedidos_anterior,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'ENTREGUE' AND data_entregue <= data_prometida) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE status = 'ENTREGUE' AND data_prometida IS NOT NULL), 0),
      2
    ) AS sla_anterior,
    ROUND(
      AVG(EXTRACT(EPOCH FROM (data_entregue - data_pedido))/86400)
      FILTER (WHERE status = 'ENTREGUE' AND data_entregue IS NOT NULL),
      1
    ) AS lead_time_anterior
    
  FROM pedidos 
  WHERE data_pedido >= CURRENT_DATE - INTERVAL '60 days'
    AND data_pedido < CURRENT_DATE - INTERVAL '30 days'
)

SELECT 
  pa.total_pedidos,
  pa.entregues,
  pa.ticket_medio,
  pa.valor_total_vendas,
  pa.pedidos_atrasados,
  pa.labs_ativos,
  pa.sla_compliance,
  pa.lead_time_medio,
  
  -- Dados do período anterior
  COALESCE(pan.total_pedidos_anterior, 0) AS total_pedidos_anterior,
  COALESCE(pan.sla_anterior, 0) AS sla_anterior,
  COALESCE(pan.lead_time_anterior, 0) AS lead_time_anterior,
  
  -- Variações percentuais
  CASE 
    WHEN pan.total_pedidos_anterior > 0 THEN
      ROUND((pa.total_pedidos - pan.total_pedidos_anterior) * 100.0 / pan.total_pedidos_anterior, 1)
    ELSE 0
  END AS variacao_pedidos_percent,
  
  CASE 
    WHEN pan.sla_anterior > 0 THEN
      ROUND(pa.sla_compliance - pan.sla_anterior, 1)
    ELSE 0
  END AS variacao_sla_percent,
  
  CASE 
    WHEN pan.lead_time_anterior > 0 THEN
      ROUND((pa.lead_time_medio - pan.lead_time_anterior) * 100.0 / pan.lead_time_anterior, 1)
    ELSE 0
  END AS variacao_lead_time_percent

FROM periodo_atual pa
CROSS JOIN periodo_anterior pan;

-- ================================================================
-- 2. VIEW v_ranking_laboratorios  
-- Ranking de laboratórios por performance e volume
-- ================================================================

CREATE OR REPLACE VIEW v_ranking_laboratorios AS
WITH stats_laboratorio AS (
  SELECT 
    l.id,
    l.nome AS laboratorio_nome,
    l.codigo AS laboratorio_codigo,
    
    -- Volume de pedidos
    COUNT(*) AS total_pedidos,
    COUNT(*) FILTER (WHERE p.data_pedido >= CURRENT_DATE - INTERVAL '7 days') AS pedidos_ultima_semana,
    COUNT(*) FILTER (WHERE p.data_pedido >= CURRENT_DATE - INTERVAL '30 days') AS pedidos_mes_atual,
    
    -- Performance SLA
    ROUND(
      COUNT(*) FILTER (WHERE p.status = 'ENTREGUE' AND p.data_entregue <= p.data_prometida) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE p.status = 'ENTREGUE' AND p.data_prometida IS NOT NULL), 0),
      2
    ) AS sla_compliance,
    
    -- Lead Time e Produção
    ROUND(
      AVG(EXTRACT(EPOCH FROM (p.data_entregue - p.data_pedido))/86400)
      FILTER (WHERE p.status = 'ENTREGUE'),
      1
    ) AS lead_time_medio,
    
    ROUND(
      AVG(p.lead_time_producao_horas) FILTER (WHERE p.lead_time_producao_horas > 0),
      1
    ) AS tempo_producao_medio,
    
    -- Financeiro
    ROUND(AVG(p.valor_pedido) FILTER (WHERE p.valor_pedido > 0), 2) AS ticket_medio,
    SUM(p.valor_pedido) FILTER (WHERE p.valor_pedido > 0) AS faturamento_total,
    
    -- Pedidos Problemáticos
    COUNT(*) FILTER (WHERE p.status IN ('REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU') 
                     AND p.data_prometida < CURRENT_DATE) AS pedidos_atrasados,
    COUNT(*) FILTER (WHERE p.requer_atencao = true) AS pedidos_risco,
    
    -- Tipos de Lentes
    COUNT(*) FILTER (WHERE cl.categoria = 'monofocal') AS monofocais,
    COUNT(*) FILTER (WHERE cl.categoria = 'multifocal') AS multifocais,
    COUNT(*) FILTER (WHERE cl.categoria = 'transitions') AS transitions,
    
    -- Último pedido
    MAX(p.created_at) AS ultimo_pedido,
    
    -- Tempo de resposta médio (horas entre criação e início produção)
    ROUND(
      AVG(EXTRACT(EPOCH FROM (p.data_inicio_producao - p.created_at))/3600)
      FILTER (WHERE p.data_inicio_producao IS NOT NULL),
      1
    ) AS tempo_resposta_horas
    
  FROM laboratorios l
  LEFT JOIN pedidos p ON l.id = p.laboratorio_id 
  LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  WHERE l.ativo = true
  GROUP BY l.id, l.nome, l.codigo
),

ranking_calculado AS (
  SELECT 
    *,
    -- Score geral (ponderado)
    ROUND(
      (COALESCE(sla_compliance, 0) * 0.4) +  -- 40% SLA
      (CASE WHEN lead_time_medio > 0 THEN (10 - LEAST(lead_time_medio, 10)) * 10 ELSE 0 END * 0.3) +  -- 30% Lead Time
      (LEAST(total_pedidos, 200) / 200 * 100 * 0.2) +  -- 20% Volume
      (CASE WHEN tempo_resposta_horas > 0 THEN (24 - LEAST(tempo_resposta_horas, 24)) / 24 * 100 ELSE 0 END * 0.1), -- 10% Tempo Resposta
      1
    ) AS score_geral,
    
    -- Status de risco
    CASE 
      WHEN COALESCE(sla_compliance, 0) < 80 OR COALESCE(lead_time_medio, 0) > 7 THEN 'ALTO'
      WHEN COALESCE(sla_compliance, 0) < 90 OR COALESCE(lead_time_medio, 0) > 5 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END AS status_risco,
    
    -- Tendência (comparando com semana anterior)
    CASE 
      WHEN pedidos_ultima_semana > pedidos_mes_atual / 4 THEN 'SUBINDO'
      WHEN pedidos_ultima_semana < pedidos_mes_atual / 5 THEN 'DESCENDO'
      ELSE 'ESTÁVEL'
    END AS tendencia
    
  FROM stats_laboratorio
)

SELECT 
  ROW_NUMBER() OVER (ORDER BY score_geral DESC) AS posicao,
  *
FROM ranking_calculado
ORDER BY score_geral DESC;

-- ================================================================
-- COMENTÁRIO: Continua no próximo bloco com as outras views...
-- ================================================================