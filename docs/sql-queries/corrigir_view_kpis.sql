-- ================================================================
-- CORRIGIR VIEW v_kpis_dashboard - DESENROLA DCL
-- ================================================================
-- Esta view está usando campos que não existem na tabela pedidos real
-- Vamos corrigir para usar apenas os campos que existem
-- ================================================================

-- PRIMEIRO: Verificar a estrutura real da tabela pedidos
-- Execute esta query no Supabase SQL Editor para verificar os campos:
/*
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND table_schema = 'public'
ORDER BY ordinal_position;
*/

-- ================================================================
-- VIEW CORRIGIDA v_kpis_dashboard - BASEADA NOS DADOS REAIS
-- ================================================================

-- Remover view existente (se houver)
DROP VIEW IF EXISTS v_kpis_dashboard;

-- Criar view corrigida baseada na estrutura real da tabela
CREATE OR REPLACE VIEW v_kpis_dashboard AS
WITH dados_atuais AS (
  SELECT 
    -- Contadores básicos
    COUNT(*) AS total_pedidos,
    COUNT(*) FILTER (WHERE status = 'ENTREGUE') AS entregues,
    
    -- Valores financeiros
    COALESCE(AVG(valor_pedido), 0) AS ticket_medio,
    COALESCE(SUM(valor_pedido), 0) AS valor_total_vendas,
    COALESCE(SUM(custo_lentes), 0) AS custo_total_lentes,
    
    -- Pedidos atrasados (baseado em created_at + 7 dias como estimativa)
    COUNT(*) FILTER (
      WHERE status NOT IN ('ENTREGUE', 'CANCELADO') 
      AND created_at < (CURRENT_DATE - INTERVAL '7 days')
    ) AS pedidos_atrasados,
    
    -- Lead time médio em dias (se tivermos o campo lead_time_total_horas)
    COALESCE(
      AVG(lead_time_total_horas) FILTER (WHERE lead_time_total_horas > 0) / 24, 
      0
    ) AS lead_time_medio,
    
    -- SLA compliance básico (entregues / total não cancelados)
    CASE 
      WHEN COUNT(*) FILTER (WHERE status != 'CANCELADO') > 0 
      THEN ROUND(
        COUNT(*) FILTER (WHERE status = 'ENTREGUE') * 100.0 / 
        COUNT(*) FILTER (WHERE status != 'CANCELADO'), 
        2
      )
      ELSE 0
    END AS sla_compliance
    
  FROM pedidos
),

dados_laboratorios AS (
  SELECT COUNT(*) FILTER (WHERE ativo = true) AS labs_ativos
  FROM laboratorios
)

SELECT 
  -- KPIs principais
  da.total_pedidos,
  da.entregues,
  da.lead_time_medio,
  da.pedidos_atrasados,
  da.ticket_medio,
  da.sla_compliance,
  dl.labs_ativos,
  da.valor_total_vendas,
  da.custo_total_lentes,
  
  -- Margem percentual
  CASE 
    WHEN da.valor_total_vendas > 0 
    THEN ROUND((da.valor_total_vendas - da.custo_total_lentes) * 100.0 / da.valor_total_vendas, 2)
    ELSE 100
  END AS margem_percentual,
  
  -- Campos para compatibilidade (usando valores atuais como base)
  da.total_pedidos AS total_pedidos_anterior,
  da.sla_compliance AS sla_anterior,
  da.lead_time_medio AS lead_time_anterior,
  
  -- Variações (zeradas por enquanto, até termos dados históricos)
  0.0 AS variacao_pedidos,
  0.0 AS variacao_lead_time,
  0.0 AS variacao_sla

FROM dados_atuais da
CROSS JOIN dados_laboratorios dl;

-- ================================================================
-- COMENTÁRIO SOBRE CAMPOS USADOS:
-- ================================================================
-- Esta view corrigida usa apenas campos que sabemos que existem:
-- - id, status, valor_pedido, custo_lentes, created_at, lead_time_total_horas
-- - Não usa: data_pedido, data_entregue, data_prometida, laboratorio_id
-- 
-- Se esses campos existirem, podemos melhorar a view posteriormente
-- ================================================================

-- TESTE: Executar a view para verificar se funciona
SELECT * FROM v_kpis_dashboard;