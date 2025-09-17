-- View para lead time comparativo
-- Esta view calcula médias de lead time por laboratório, classe e geral
-- para permitir comparação de performance individual vs. médias

CREATE OR REPLACE VIEW v_lead_time_comparativo AS
WITH timeline_data AS (
  -- Dados de timeline agrupados por pedido com primeira e última entrada
  SELECT 
    pt.pedido_id,
    MIN(pt.created_at) as inicio_timeline,
    MAX(CASE WHEN pt.status_novo = 'ENTREGUE' THEN pt.created_at END) as fim_timeline
  FROM pedidos_timeline pt 
  GROUP BY pt.pedido_id
),
lead_times AS (
  -- Cálculo de lead time por pedido
  SELECT 
    p.id,
    p.laboratorio_id,
    p.classe_lente_id,
    p.created_at,
    p.status,
    td.inicio_timeline,
    td.fim_timeline,
    CASE 
      WHEN td.fim_timeline IS NOT NULL THEN
        EXTRACT(EPOCH FROM (td.fim_timeline - p.created_at)) / 86400.0 -- dias
      WHEN p.status = 'ENTREGUE' THEN
        EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 86400.0 -- fallback para updated_at
      ELSE
        EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400.0 -- dias até agora para pedidos em andamento
    END as lead_time_dias
  FROM pedidos p
  LEFT JOIN timeline_data td ON p.id = td.pedido_id
  WHERE p.status != 'CANCELADO'
    AND p.created_at >= NOW() - INTERVAL '1 year' -- último ano para relevância
    AND p.created_at IS NOT NULL
),
medias_por_combinacao AS (
  -- Médias agrupadas por laboratório e classe
  SELECT 
    lt.laboratorio_id,
    lt.classe_lente_id,
    AVG(lt.lead_time_dias) as media_combinacao,
    COUNT(*) as total_pedidos_combinacao
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365 -- filtrar outliers
  GROUP BY lt.laboratorio_id, lt.classe_lente_id
),
medias_laboratorio AS (
  -- Médias por laboratório
  SELECT 
    lt.laboratorio_id,
    AVG(lt.lead_time_dias) as media_laboratorio,
    COUNT(*) as total_pedidos_laboratorio
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
  GROUP BY lt.laboratorio_id
),
medias_classe AS (
  -- Médias por classe de lente
  SELECT 
    lt.classe_lente_id,
    AVG(lt.lead_time_dias) as media_classe,
    COUNT(*) as total_pedidos_classe
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
  GROUP BY lt.classe_lente_id
),
media_geral_calc AS (
  -- Média geral
  SELECT 
    AVG(lt.lead_time_dias) as media_geral,
    COUNT(*) as total_pedidos_geral
  FROM lead_times lt
  WHERE lt.lead_time_dias > 0 AND lt.lead_time_dias < 365
)
SELECT 
  mpc.laboratorio_id,
  mpc.classe_lente_id,
  COALESCE(ml.media_laboratorio, 5.0) as media_laboratorio,
  COALESCE(mc.media_classe, 5.0) as media_classe,
  COALESCE(mgc.media_geral, 5.0) as media_geral,
  COALESCE(ml.total_pedidos_laboratorio, 0) as pedidos_laboratorio,
  COALESCE(mc.total_pedidos_classe, 0) as pedidos_classe,
  COALESCE(mgc.total_pedidos_geral, 0) as total_pedidos
FROM medias_por_combinacao mpc
LEFT JOIN medias_laboratorio ml ON mpc.laboratorio_id = ml.laboratorio_id
LEFT JOIN medias_classe mc ON mpc.classe_lente_id = mc.classe_lente_id
CROSS JOIN media_geral_calc mgc;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_v_lead_time_comparativo_lab_classe 
ON pedidos(laboratorio_id, classe_lente_id) 
WHERE status != 'CANCELADO';

CREATE INDEX IF NOT EXISTS idx_pedidos_timeline_pedido_status 
ON pedidos_timeline(pedido_id, status_novo, created_at);

-- Comentários de documentação
COMMENT ON VIEW v_lead_time_comparativo IS 'View otimizada para comparação de lead times por laboratório e classe de lente, fornecendo médias comparativas para análise de performance';