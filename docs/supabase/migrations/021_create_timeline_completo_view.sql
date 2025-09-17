-- View para timeline de pedidos com dados otimizados
-- Esta view fornece dados de timeline completos com cálculos de tempo entre etapas

CREATE OR REPLACE VIEW v_pedido_timeline_completo AS
WITH timeline_with_lag AS (
  -- Timeline com dados da etapa anterior
  SELECT 
    pt.*,
    COALESCE(u.nome, 'Sistema') as responsavel_nome,
    u.email as responsavel_email,
    LAG(pt.created_at) OVER (PARTITION BY pt.pedido_id ORDER BY pt.created_at) as etapa_anterior_data,
    LAG(pt.status_novo) OVER (PARTITION BY pt.pedido_id ORDER BY pt.created_at) as status_anterior_real,
    ROW_NUMBER() OVER (PARTITION BY pt.pedido_id ORDER BY pt.created_at) as ordem_etapa
  FROM pedidos_timeline pt
  LEFT JOIN usuarios u ON pt.responsavel_id = u.id
)
SELECT 
  twl.*,
  -- Cálculo de tempo na etapa anterior em horas
  CASE 
    WHEN twl.etapa_anterior_data IS NOT NULL THEN
      EXTRACT(EPOCH FROM (twl.created_at - twl.etapa_anterior_data)) / 3600.0
    ELSE 0
  END as tempo_etapa_anterior_horas,
  
  -- Cálculo de tempo na etapa anterior em dias
  CASE 
    WHEN twl.etapa_anterior_data IS NOT NULL THEN
      EXTRACT(EPOCH FROM (twl.created_at - twl.etapa_anterior_data)) / 86400.0
    ELSE 0
  END as tempo_etapa_anterior_dias,
  
  -- Status formatado para exibição
  CASE UPPER(TRIM(twl.status_novo))
    WHEN 'REGISTRADO' THEN 'Registrado'
    WHEN 'AG_PAGAMENTO' THEN 'Aguardando Pagamento'
    WHEN 'PAGO' THEN 'Pago'
    WHEN 'PRODUCAO' THEN 'Em Produção'
    WHEN 'PRONTO' THEN 'Pronto no DCL'
    WHEN 'ENVIADO' THEN 'Enviado para Loja'
    WHEN 'CHEGOU' THEN 'Chegou na Loja'
    WHEN 'ENTREGUE' THEN 'Entregue ao Cliente'
    WHEN 'CANCELADO' THEN 'Cancelado'
    ELSE COALESCE(twl.status_novo, 'Indefinido')
  END as status_label,
  
  -- Cor do status para UI
  CASE UPPER(TRIM(twl.status_novo))
    WHEN 'REGISTRADO' THEN '#6B7280'
    WHEN 'AG_PAGAMENTO' THEN '#EAB308'
    WHEN 'PAGO' THEN '#3B82F6'
    WHEN 'PRODUCAO' THEN '#8B5CF6'
    WHEN 'PRONTO' THEN '#6366F1'
    WHEN 'ENVIADO' THEN '#06B6D4'
    WHEN 'CHEGOU' THEN '#F97316'
    WHEN 'ENTREGUE' THEN '#10B981'
    WHEN 'CANCELADO' THEN '#EF4444'
    ELSE '#6B7280'
  END as status_color

FROM timeline_with_lag twl
ORDER BY twl.pedido_id, twl.created_at;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_v_timeline_completo_pedido_ordem 
ON pedidos_timeline(pedido_id, created_at);

CREATE INDEX IF NOT EXISTS idx_v_timeline_completo_responsavel 
ON pedidos_timeline(responsavel_id) WHERE responsavel_id IS NOT NULL;

-- Comentários de documentação
COMMENT ON VIEW v_pedido_timeline_completo IS 'View otimizada para timeline de pedidos com cálculos de tempo entre etapas, nomes de responsáveis e formatação para UI';