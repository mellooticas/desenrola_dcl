-- ============================================================================
-- UPDATE-DASHBOARD-KPIS-COM-ARMACOES.sql
-- ============================================================================
-- Adiciona KPIs de armações na view_dashboard_kpis
-- Inclui: volume, margens, ticket médio separado por armações e lentes
-- ============================================================================

-- 1. RECRIAR VIEW COM MÉTRICAS DE ARMAÇÕES E LENTES
-- ============================================================================
DROP VIEW IF EXISTS view_dashboard_kpis CASCADE;

CREATE OR REPLACE VIEW view_dashboard_kpis AS
SELECT
  -- ========================================
  -- CONTADORES GERAIS (status)
  -- ========================================
  COUNT(*) FILTER (WHERE status IN ('RASCUNHO', 'PRODUCAO', 'ENTREGUE')) AS pedidos_ativos,
  COUNT(*) FILTER (WHERE status = 'RASCUNHO') AS aguardando_lente,
  COUNT(*) FILTER (WHERE status = 'PRODUCAO') AS em_producao,
  COUNT(*) FILTER (WHERE status = 'ENTREGUE') AS aguardando_retirada,
  COUNT(*) FILTER (WHERE status = 'FINALIZADO' AND updated_at >= CURRENT_DATE - INTERVAL '30 days') AS finalizados_mes,
  COUNT(*) FILTER (WHERE status = 'CANCELADO') AS cancelados,
  
  -- ========================================
  -- CONTADORES POR TIPO DE PEDIDO
  -- ========================================
  COUNT(*) FILTER (WHERE tipo_pedido = 'COMPLETO') AS pedidos_completo,
  COUNT(*) FILTER (WHERE tipo_pedido = 'ARMACAO') AS pedidos_armacao,
  COUNT(*) FILTER (WHERE tipo_pedido = 'LENTES') AS pedidos_lentes,
  COUNT(*) FILTER (WHERE tipo_pedido = 'SERVICO') AS pedidos_servico,
  
  -- ========================================
  -- VALORES FINANCEIROS - ARMAÇÕES
  -- ========================================
  -- Volume total de armações (pedidos ARMACAO + COMPLETO)
  SUM(preco_armacao) FILTER (WHERE 
    tipo_pedido IN ('ARMACAO', 'COMPLETO') 
    AND status = 'FINALIZADO'
    AND preco_armacao IS NOT NULL
  ) AS volume_armacoes,
  
  -- Custo total de armações
  SUM(custo_armacao) FILTER (WHERE 
    tipo_pedido IN ('ARMACAO', 'COMPLETO') 
    AND status = 'FINALIZADO'
    AND custo_armacao IS NOT NULL
  ) AS custo_armacoes,
  
  -- Margem média de armações (em %)
  ROUND(
    AVG(margem_armacao_percentual) FILTER (WHERE 
      tipo_pedido IN ('ARMACAO', 'COMPLETO')
      AND status = 'FINALIZADO'
      AND margem_armacao_percentual IS NOT NULL
    ),
    2
  ) AS margem_media_armacoes_percent,
  
  -- Ticket médio de armações
  ROUND(
    AVG(preco_armacao) FILTER (WHERE 
      tipo_pedido IN ('ARMACAO', 'COMPLETO')
      AND status = 'FINALIZADO'
      AND preco_armacao IS NOT NULL
    ),
    2
  ) AS ticket_medio_armacoes,
  
  -- ========================================
  -- VALORES FINANCEIROS - LENTES
  -- ========================================
  -- Volume total de lentes (pedidos LENTES + COMPLETO)
  SUM(preco_lente) FILTER (WHERE 
    tipo_pedido IN ('LENTES', 'COMPLETO') 
    AND status = 'FINALIZADO'
    AND preco_lente IS NOT NULL
  ) AS volume_lentes,
  
  -- Custo total de lentes
  SUM(custo_lente) FILTER (WHERE 
    tipo_pedido IN ('LENTES', 'COMPLETO') 
    AND status = 'FINALIZADO'
    AND custo_lente IS NOT NULL
  ) AS custo_lentes,
  
  -- Margem média de lentes (em %)
  ROUND(
    AVG(margem_lente_percentual) FILTER (WHERE 
      tipo_pedido IN ('LENTES', 'COMPLETO')
      AND status = 'FINALIZADO'
      AND margem_lente_percentual IS NOT NULL
    ),
    2
  ) AS margem_media_lentes_percent,
  
  -- Ticket médio de lentes
  ROUND(
    AVG(preco_lente) FILTER (WHERE 
      tipo_pedido IN ('LENTES', 'COMPLETO')
      AND status = 'FINALIZADO'
      AND preco_lente IS NOT NULL
    ),
    2
  ) AS ticket_medio_lentes,
  
  -- ========================================
  -- VALORES FINANCEIROS - TOTAIS
  -- ========================================
  -- Ticket médio geral (apenas finalizados)
  ROUND(
    AVG(valor_pedido) FILTER (WHERE status = 'FINALIZADO'),
    2
  ) AS ticket_medio,
  
  -- Volume total (armações + lentes)
  SUM(valor_pedido) FILTER (WHERE status = 'FINALIZADO') AS volume_total,
  
  -- ========================================
  -- MÉTRICAS DE PERFORMANCE (SLA e Tempo)
  -- ========================================
  -- SLA (pedidos entregues no prazo) - Simplificado
  ROUND(
    COUNT(*) FILTER (WHERE 
      status IN ('FINALIZADO', 'ENTREGUE')
    )::numeric * 100.0 / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('FINALIZADO', 'ENTREGUE', 'PRODUCAO', 'RASCUNHO')), 0),
    2
  ) AS sla_compliance_percent,
  
  -- Tempo médio no sistema (dias desde criação)
  ROUND(
    AVG(CURRENT_DATE - created_at::date) 
    FILTER (WHERE status IN ('PRODUCAO', 'ENTREGUE'))::numeric,
    1
  ) AS tempo_medio_producao_dias,
  
  -- ========================================
  -- MARGENS CONSOLIDADAS
  -- ========================================
  -- Margem real consolidada (considerando armações e lentes)
  ROUND(
    (
      COALESCE(SUM(preco_armacao + preco_lente) FILTER (WHERE status = 'FINALIZADO'), 0) - 
      COALESCE(SUM(custo_armacao + custo_lente) FILTER (WHERE status = 'FINALIZADO'), 0)
    ) * 100.0 / 
    NULLIF(COALESCE(SUM(preco_armacao + preco_lente) FILTER (WHERE status = 'FINALIZADO'), 0), 0),
    2
  ) AS margem_real_consolidada_percent
  
FROM pedidos
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';

COMMENT ON VIEW view_dashboard_kpis IS 
  'KPIs do dashboard com métricas detalhadas de armações e lentes (margens reais, volumes, tickets médios)';

-- ============================================================================
-- 2. CRIAR VIEW ESPECÍFICA PARA DETALHES DE PEDIDO
-- ============================================================================
DROP VIEW IF EXISTS view_pedido_detalhes_completo CASCADE;

CREATE OR REPLACE VIEW view_pedido_detalhes_completo AS
SELECT
  p.id,
  p.numero_sequencial,
  p.numero_os_fisica,
  p.numero_pedido_laboratorio,
  p.status,
  p.tipo_pedido,
  p.prioridade,
  
  -- Cliente
  p.cliente_nome,
  p.cliente_telefone,
  
  -- Valores de Armação
  p.preco_armacao,
  p.custo_armacao,
  p.margem_armacao_percentual,
  CASE 
    WHEN p.preco_armacao > 0 AND p.custo_armacao > 0 
    THEN p.preco_armacao - p.custo_armacao 
  END AS lucro_armacao,
  
  -- Valores de Lente
  p.preco_lente,
  p.custo_lente,
  p.margem_lente_percentual,
  CASE 
    WHEN p.preco_lente > 0 AND p.custo_lente > 0 
    THEN p.preco_lente - p.custo_lente 
  END AS lucro_lente,
  
  -- Valores Consolidados
  p.valor_pedido,
  COALESCE(p.preco_armacao, 0) + COALESCE(p.preco_lente, 0) AS valor_calculado,
  COALESCE(p.custo_armacao, 0) + COALESCE(p.custo_lente, 0) AS custo_total,
  COALESCE(p.preco_armacao - p.custo_armacao, 0) + COALESCE(p.preco_lente - p.custo_lente, 0) AS lucro_total,
  
  -- Margem consolidada
  CASE 
    WHEN (COALESCE(p.preco_armacao, 0) + COALESCE(p.preco_lente, 0)) > 0
    THEN ROUND(
      (
        (COALESCE(p.preco_armacao, 0) + COALESCE(p.preco_lente, 0)) - 
        (COALESCE(p.custo_armacao, 0) + COALESCE(p.custo_lente, 0))
      ) * 100.0 / 
      (COALESCE(p.preco_armacao, 0) + COALESCE(p.preco_lente, 0)),
      2
    )
  END AS margem_consolidada_percent,
  
  -- Relacionamentos
  l.nome AS laboratorio_nome,
  lj.nome AS loja_nome,
  
  -- Datas
  p.created_at,
  p.updated_at,
  p.data_prometida
  
FROM pedidos p
LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
LEFT JOIN lojas lj ON p.loja_id = lj.id;

COMMENT ON VIEW view_pedido_detalhes_completo IS 
  'View completa para detalhes de pedido com cálculos de margens, lucros e valores consolidados';

-- ============================================================================
-- 3. GRANTS
-- ============================================================================
GRANT SELECT ON view_dashboard_kpis TO authenticated;
GRANT SELECT ON view_pedido_detalhes_completo TO authenticated;

-- ============================================================================
-- 4. VALIDAÇÃO
-- ============================================================================
-- Testar view do dashboard
SELECT 
  pedidos_ativos,
  pedidos_completo,
  pedidos_armacao,
  pedidos_lentes,
  volume_armacoes,
  margem_media_armacoes_percent,
  ticket_medio_armacoes,
  volume_lentes,
  margem_media_lentes_percent,
  ticket_medio_lentes,
  volume_total,
  margem_real_consolidada_percent
FROM view_dashboard_kpis;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================


| pedidos_ativos | pedidos_completo | pedidos_armacao | pedidos_lentes | volume_armacoes | margem_media_armacoes_percent | ticket_medio_armacoes | volume_lentes | margem_media_lentes_percent | ticket_medio_lentes | volume_total | margem_real_consolidada_percent |
| -------------- | ---------------- | --------------- | -------------- | --------------- | ----------------------------- | --------------------- | ------------- | --------------------------- | ------------------- | ------------ | ------------------------------- |
| 372            | 443              | 0               | 2              | null            | null                          | null                  | null          | null                        | null                | null         | null                            |
