-- ================================================================
-- VIEWS PARA DASHBOARD POWERBI - CONTINUAÇÃO
-- Views: v_evolucao_mensal e v_analise_financeira
-- ================================================================

-- ================================================================
-- 3. VIEW v_evolucao_mensal
-- Dados históricos mensais para análise de tendências
-- ================================================================

CREATE OR REPLACE VIEW v_evolucao_mensal AS
WITH meses_base AS (
  -- Gerar série de meses para garantir continuidade
  SELECT 
    generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '12 months'),
      date_trunc('month', CURRENT_DATE),
      INTERVAL '1 month'
    )::date AS periodo
),

dados_mensais AS (
  SELECT 
    date_trunc('month', p.data_pedido)::date AS periodo,
    EXTRACT(YEAR FROM p.data_pedido) AS ano,
    EXTRACT(MONTH FROM p.data_pedido) AS mes,
    
    -- Métricas básicas
    COUNT(*) AS total_pedidos,
    COUNT(*) FILTER (WHERE p.status = 'ENTREGUE') AS entregues,
    ROUND(AVG(p.valor_pedido) FILTER (WHERE p.valor_pedido > 0), 2) AS ticket_medio,
    SUM(p.valor_pedido) FILTER (WHERE p.valor_pedido > 0) AS faturamento_total,
    
    -- Performance
    ROUND(
      COUNT(*) FILTER (WHERE p.status = 'ENTREGUE' AND p.data_entregue <= p.data_prometida) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE p.status = 'ENTREGUE' AND p.data_prometida IS NOT NULL), 0),
      2
    ) AS sla_compliance,
    
    ROUND(
      AVG(EXTRACT(EPOCH FROM (p.data_entregue - p.data_pedido))/86400)
      FILTER (WHERE p.status = 'ENTREGUE'),
      1
    ) AS lead_time_medio,
    
    -- Pedidos problemáticos
    COUNT(*) FILTER (WHERE p.status IN ('REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU') 
                     AND p.data_prometida < CURRENT_DATE) AS pedidos_atrasados,
    COUNT(*) FILTER (WHERE p.requer_atencao = true) AS pedidos_risco,
    
    -- Contadores operacionais
    COUNT(DISTINCT p.laboratorio_id) AS labs_ativos,
    COUNT(DISTINCT p.loja_id) AS lojas_ativas,
    COUNT(*) FILTER (WHERE p.prioridade = 'URGENTE') AS pedidos_urgentes,
    
    -- Tempo de produção médio em horas
    ROUND(
      AVG(p.lead_time_producao_horas) FILTER (WHERE p.lead_time_producao_horas > 0),
      1
    ) AS horas_producao_media
    
  FROM pedidos p
  WHERE p.data_pedido >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY date_trunc('month', p.data_pedido)
)

SELECT 
  mb.periodo,
  EXTRACT(YEAR FROM mb.periodo) AS ano,
  EXTRACT(MONTH FROM mb.periodo) AS mes,
  to_char(mb.periodo, 'YYYY-MM') AS ano_mes,
  
  -- Usar COALESCE para meses sem dados
  COALESCE(dm.total_pedidos, 0) AS total_pedidos,
  COALESCE(dm.entregues, 0) AS entregues,
  COALESCE(dm.ticket_medio, 0) AS ticket_medio,
  COALESCE(dm.lead_time_medio, 0) AS lead_time_medio,
  COALESCE(dm.sla_compliance, 0) AS sla_compliance,
  COALESCE(dm.pedidos_atrasados, 0) AS pedidos_atrasados,
  COALESCE(dm.pedidos_risco, 0) AS pedidos_risco,
  COALESCE(dm.faturamento_total, 0) AS faturamento_total,
  COALESCE(dm.labs_ativos, 0) AS labs_ativos,
  COALESCE(dm.lojas_ativas, 0) AS lojas_ativas,
  COALESCE(dm.pedidos_urgentes, 0) AS pedidos_urgentes,
  COALESCE(dm.horas_producao_media, 0) AS horas_producao_media

FROM meses_base mb
LEFT JOIN dados_mensais dm ON mb.periodo = dm.periodo
ORDER BY mb.periodo;

-- ================================================================
-- 4. VIEW v_analise_financeira
-- Análise financeira por categoria de produtos
-- ================================================================

CREATE OR REPLACE VIEW v_analise_financeira AS
WITH categoria_stats AS (
  SELECT 
    COALESCE(cl.categoria, 'SEM_CATEGORIA') AS categoria,
    
    -- Volume
    COUNT(*) AS volume_pedidos,
    COUNT(*) FILTER (WHERE p.status = 'ENTREGUE') AS pedidos_entregues,
    
    -- Financeiro
    SUM(p.valor_pedido) FILTER (WHERE p.valor_pedido > 0) AS faturamento_total,
    ROUND(AVG(p.valor_pedido) FILTER (WHERE p.valor_pedido > 0), 2) AS ticket_medio,
    
    -- Performance
    ROUND(
      AVG(EXTRACT(EPOCH FROM (p.data_entregue - p.data_pedido))/86400)
      FILTER (WHERE p.status = 'ENTREGUE'),
      1
    ) AS lead_time_medio,
    
    ROUND(
      COUNT(*) FILTER (WHERE p.status = 'ENTREGUE' AND p.data_entregue <= p.data_prometida) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE p.status = 'ENTREGUE' AND p.data_prometida IS NOT NULL), 0),
      2
    ) AS sla_compliance,
    
    -- Status dos pedidos
    COUNT(*) FILTER (WHERE p.status = 'REGISTRADO') AS registrados,
    COUNT(*) FILTER (WHERE p.status = 'AG_PAGAMENTO') AS aguardando_pagamento,
    COUNT(*) FILTER (WHERE p.status IN ('PRODUCAO', 'PRONTO')) AS em_producao,
    COUNT(*) FILTER (WHERE p.status = 'ENTREGUE') AS entregues,
    
    -- Idade média dos pedidos em aberto (dias)
    ROUND(
      AVG(EXTRACT(EPOCH FROM (CURRENT_DATE - p.data_pedido))/86400)
      FILTER (WHERE p.status NOT IN ('ENTREGUE', 'CANCELADO')),
      1
    ) AS idade_media_dias,
    
    -- Laboratório mais usado nesta categoria
    MODE() WITHIN GROUP (ORDER BY l.nome) AS laboratorio_mais_usado
    
  FROM pedidos p
  LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
  WHERE p.data_pedido >= CURRENT_DATE - INTERVAL '90 days'  -- Últimos 3 meses
  GROUP BY cl.categoria
)

SELECT 
  categoria,
  volume_pedidos,
  pedidos_entregues,
  faturamento_total,
  ticket_medio,
  lead_time_medio,
  sla_compliance,
  registrados,
  aguardando_pagamento,
  em_producao,
  entregues,
  idade_media_dias,
  laboratorio_mais_usado
FROM categoria_stats
ORDER BY faturamento_total DESC;

-- ================================================================
-- 5. VIEWS COMPLEMENTARES PARA ALERTAS E INSIGHTS
-- ================================================================

-- VIEW para alertas críticos
CREATE OR REPLACE VIEW v_alertas_criticos AS
SELECT 
  'SLA_BAIXO' AS tipo_alerta,
  CASE 
    WHEN sla_compliance < 70 THEN 'CRÍTICA'
    WHEN sla_compliance < 80 THEN 'ALTA'
    ELSE 'MÉDIA'
  END AS prioridade,
  laboratorio_nome,
  CONCAT('SLA de apenas ', sla_compliance, '%') AS problema,
  total_pedidos AS pedidos_afetados,
  faturamento_total AS valor_risco,
  sla_compliance AS indicador_numerico,
  'Revisar processo produtivo e comunicação' AS acao_sugerida,
  '48 horas' AS prazo_acao,
  'Gerente Operacional' AS responsavel
FROM v_ranking_laboratorios
WHERE sla_compliance < 85

UNION ALL

SELECT 
  'LEAD_TIME_ALTO' AS tipo_alerta,
  CASE 
    WHEN lead_time_medio > 7 THEN 'CRÍTICA'
    WHEN lead_time_medio > 5 THEN 'ALTA'
    ELSE 'MÉDIA'
  END AS prioridade,
  laboratorio_nome,
  CONCAT('Lead time de ', lead_time_medio, ' dias') AS problema,
  total_pedidos AS pedidos_afetados,
  faturamento_total AS valor_risco,
  lead_time_medio AS indicador_numerico,
  'Otimizar fluxo de produção' AS acao_sugerida,
  '72 horas' AS prazo_acao,
  'Coordenador de Laboratório' AS responsavel
FROM v_ranking_laboratorios
WHERE lead_time_medio > 4

UNION ALL

SELECT 
  'PEDIDOS_ATRASADOS' AS tipo_alerta,
  CASE 
    WHEN pedidos_atrasados > 20 THEN 'CRÍTICA'
    WHEN pedidos_atrasados > 10 THEN 'ALTA'
    ELSE 'MÉDIA'
  END AS prioridade,
  laboratorio_nome,
  CONCAT(pedidos_atrasados, ' pedidos em atraso') AS problema,
  pedidos_atrasados AS pedidos_afetados,
  pedidos_atrasados * ticket_medio AS valor_risco,
  pedidos_atrasados AS indicador_numerico,
  'Priorizar pedidos atrasados' AS acao_sugerida,
  '24 horas' AS prazo_acao,
  'Supervisor de Produção' AS responsavel
FROM v_ranking_laboratorios
WHERE pedidos_atrasados > 5;

-- ================================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================================

-- Índices para otimizar as consultas das views
CREATE INDEX IF NOT EXISTS idx_pedidos_data_pedido ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_laboratorio_id ON pedidos(laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_classe_lente_id ON pedidos(classe_lente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_entregue ON pedidos(data_entregue);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_prometida ON pedidos(data_prometida);

-- Índice composto para consultas de SLA
CREATE INDEX IF NOT EXISTS idx_pedidos_sla ON pedidos(status, data_entregue, data_prometida) 
WHERE status = 'ENTREGUE';

-- ================================================================
-- COMMENTS PARA DOCUMENTAÇÃO
-- ================================================================

COMMENT ON VIEW v_kpis_dashboard IS 'Métricas principais do dashboard com comparações temporais dos últimos 30 dias';
COMMENT ON VIEW v_ranking_laboratorios IS 'Ranking de laboratórios por performance, volume e score geral';
COMMENT ON VIEW v_evolucao_mensal IS 'Evolução histórica mensal dos últimos 12 meses para análise de tendências';
COMMENT ON VIEW v_analise_financeira IS 'Análise financeira por categoria de produtos dos últimos 3 meses';
COMMENT ON VIEW v_alertas_criticos IS 'Alertas automáticos baseados em thresholds de performance e SLA';