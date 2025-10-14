-- ===================================================================
-- STORED PROCEDURES: SLA Intelligence com Dados Reais
-- Data: 13/10/2025
-- Descrição: Functions para dashboard SLA Intelligence
-- ===================================================================

-- 🎯 FUNÇÃO 1: Métricas Principais SLA (CORRIGIDA para pedidos em andamento)
CREATE OR REPLACE FUNCTION get_sla_metricas(
  p_loja_id UUID DEFAULT NULL,
  p_data_inicio DATE DEFAULT NULL,
  p_data_fim DATE DEFAULT NULL
)
RETURNS TABLE (
  total_pedidos INTEGER,
  sla_lab_cumprido INTEGER,
  promessas_cumpridas INTEGER,
  taxa_sla_lab NUMERIC,
  taxa_promessa_cliente NUMERIC,
  economia_margem NUMERIC,
  custo_atrasos NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_pedidos,
    -- SLA Lab: entregues no prazo OU ainda dentro do prazo
    COUNT(*) FILTER (WHERE 
      (data_entregue IS NOT NULL AND data_entregue <= COALESCE(data_sla_laboratorio, data_prevista_pronto)) OR
      (data_entregue IS NULL AND COALESCE(data_sla_laboratorio, data_prevista_pronto) >= CURRENT_DATE)
    )::INTEGER as sla_lab_cumprido,
    -- Promessas: entregues no prazo OU ainda dentro da promessa  
    COUNT(*) FILTER (WHERE 
      (data_entregue IS NOT NULL AND data_entregue <= COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days')) OR
      (data_entregue IS NULL AND COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days') >= CURRENT_DATE)
    )::INTEGER as promessas_cumpridas,
    -- Taxa SLA Lab
    (COUNT(*) FILTER (WHERE 
      (data_entregue IS NOT NULL AND data_entregue <= COALESCE(data_sla_laboratorio, data_prevista_pronto)) OR
      (data_entregue IS NULL AND COALESCE(data_sla_laboratorio, data_prevista_pronto) >= CURRENT_DATE)
    ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_sla_lab,
    -- Taxa Promessa Cliente
    (COUNT(*) FILTER (WHERE 
      (data_entregue IS NOT NULL AND data_entregue <= COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days')) OR
      (data_entregue IS NULL AND COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days') >= CURRENT_DATE)
    ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_promessa_cliente,
    -- Economia estimada
    (COUNT(*) * 75)::NUMERIC as economia_margem,
    -- Custo de atrasos
    (COUNT(*) FILTER (WHERE 
      data_entregue > COALESCE(data_sla_laboratorio, data_prevista_pronto) OR
      (data_entregue IS NULL AND COALESCE(data_sla_laboratorio, data_prevista_pronto) < CURRENT_DATE)
    ) * 150)::NUMERIC as custo_atrasos
  FROM pedidos p
  WHERE 1=1
    AND (p_loja_id IS NULL OR p.loja_id = p_loja_id)
    AND (p_data_inicio IS NULL OR p.data_pedido >= p_data_inicio)
    AND (p_data_fim IS NULL OR p.data_pedido <= p_data_fim)
    AND p.status != 'CANCELADO';
END;
$$;

-- 🏭 FUNÇÃO 2: Performance por Laboratório
CREATE OR REPLACE FUNCTION get_performance_laboratorios(
  p_loja_id UUID DEFAULT NULL,
  p_data_inicio DATE DEFAULT NULL,
  p_data_fim DATE DEFAULT NULL
)
RETURNS TABLE (
  laboratorio_id UUID,
  laboratorio_nome TEXT,
  total_pedidos INTEGER,
  sla_cumprido INTEGER,
  sla_atrasado INTEGER,
  taxa_sla NUMERIC,
  dias_medio_real NUMERIC,
  dias_sla_prometido NUMERIC,
  economia_potencial NUMERIC,
  tendencia TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.laboratorio_id,
    p.laboratorio_nome,
    COUNT(*)::INTEGER as total_pedidos,
    COUNT(*) FILTER (WHERE 
      (p.data_entregue IS NOT NULL AND p.data_entregue <= p.data_sla_laboratorio) OR
      (p.data_entregue IS NULL AND p.data_sla_laboratorio >= CURRENT_DATE)
    )::INTEGER as sla_cumprido,
    COUNT(*) FILTER (WHERE 
      p.data_entregue > p.data_sla_laboratorio OR
      (p.data_entregue IS NULL AND p.data_sla_laboratorio < CURRENT_DATE)
    )::INTEGER as sla_atrasado,
    (COUNT(*) FILTER (WHERE 
      (p.data_entregue IS NOT NULL AND p.data_entregue <= p.data_sla_laboratorio) OR
      (p.data_entregue IS NULL AND p.data_sla_laboratorio >= CURRENT_DATE)
    ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_sla,
    -- Dias médio real (para entregues)
    COALESCE(AVG(
      CASE WHEN p.data_entregue IS NOT NULL 
      THEN EXTRACT(days FROM (p.data_entregue - p.data_pedido))
      ELSE NULL END
    ), 0)::NUMERIC(3,1) as dias_medio_real,
    -- SLA prometido médio
    COALESCE(AVG(p.sla_padrao_dias), 0)::NUMERIC(3,1) as dias_sla_prometido,
    -- Economia potencial (se entregar antes do SLA)
    (COUNT(*) * 50 * 
     CASE WHEN AVG(EXTRACT(days FROM (COALESCE(p.data_entregue, CURRENT_DATE) - p.data_pedido))) < AVG(p.sla_padrao_dias) 
     THEN 1 ELSE -0.5 END
    )::NUMERIC as economia_potencial,
    -- Tendência baseada na performance
    CASE 
      WHEN (COUNT(*) FILTER (WHERE 
        (p.data_entregue IS NOT NULL AND p.data_entregue <= p.data_sla_laboratorio) OR
        (p.data_entregue IS NULL AND p.data_sla_laboratorio >= CURRENT_DATE)
      ) * 100.0 / NULLIF(COUNT(*), 0)) >= 92 THEN 'up'
      WHEN (COUNT(*) FILTER (WHERE 
        (p.data_entregue IS NOT NULL AND p.data_entregue <= p.data_sla_laboratorio) OR
        (p.data_entregue IS NULL AND p.data_sla_laboratorio >= CURRENT_DATE)
      ) * 100.0 / NULLIF(COUNT(*), 0)) <= 85 THEN 'down'
      ELSE 'stable'
    END as tendencia
  FROM v_pedidos_kanban p
  WHERE 1=1
    AND (p_loja_id IS NULL OR p.loja_id = p_loja_id)
    AND (p_data_inicio IS NULL OR p.data_pedido >= p_data_inicio)
    AND (p_data_fim IS NULL OR p.data_pedido <= p_data_fim)
    AND p.status != 'CANCELADO'
  GROUP BY p.laboratorio_id, p.laboratorio_nome
  HAVING COUNT(*) >= 3  -- Só labs com pelo menos 3 pedidos
  ORDER BY taxa_sla DESC;
END;
$$;

-- 🚨 FUNÇÃO 3: Alertas Críticos SLA
CREATE OR REPLACE FUNCTION get_alertas_sla_criticos(
  p_loja_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  tipo TEXT,
  titulo TEXT,
  descricao TEXT,
  pedido_os TEXT,
  laboratorio TEXT,
  acao_sugerida TEXT,
  severidade TEXT,
  dias_restantes INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Alertas de atraso crítico
  SELECT 
    'atraso_' || p.id::TEXT as id,
    'atraso_critico'::TEXT as tipo,
    ('SLA Crítico - ' || ABS(p.dias_para_sla) || ' dias de atraso')::TEXT as titulo,
    ('OS #' || p.numero_sequencial || ' - ' || p.laboratorio_nome || 
     CASE WHEN p.eh_garantia THEN ' - GARANTIA' ELSE '' END)::TEXT as descricao,
    ('#' || p.numero_sequencial::TEXT) as pedido_os,
    p.laboratorio_nome as laboratorio,
    'Contatar laboratório imediatamente + verificar compensação cliente'::TEXT as acao_sugerida,
    'critica'::TEXT as severidade,
    p.dias_para_sla as dias_restantes
  FROM v_pedidos_kanban p
  WHERE p.dias_para_sla < -1  -- Mais de 1 dia de atraso
    AND p.status NOT IN ('ENTREGUE', 'CANCELADO')
    AND (p_loja_id IS NULL OR p.loja_id = p_loja_id)
  
  UNION ALL
  
  -- Alertas de SLA vencendo hoje/amanhã
  SELECT 
    'alerta_' || p.id::TEXT as id,
    'alerta_proximo'::TEXT as tipo,
    CASE 
      WHEN p.dias_para_sla = 0 THEN 'SLA vence hoje'
      WHEN p.dias_para_sla = 1 THEN 'SLA vence amanhã'
      ELSE 'SLA próximo do vencimento'
    END as titulo,
    ('OS #' || p.numero_sequencial || ' - ' || p.laboratorio_nome)::TEXT as descricao,
    ('#' || p.numero_sequencial::TEXT) as pedido_os,
    p.laboratorio_nome as laboratorio,
    'Acompanhar status de produção e avisar cliente se necessário'::TEXT as acao_sugerida,
    'alta'::TEXT as severidade,
    p.dias_para_sla as dias_restantes
  FROM v_pedidos_kanban p
  WHERE p.dias_para_sla BETWEEN 0 AND 1
    AND p.status NOT IN ('ENTREGUE', 'CANCELADO')
    AND (p_loja_id IS NULL OR p.loja_id = p_loja_id)
  
  ORDER BY dias_restantes ASC, severidade DESC
  LIMIT 10;
END;
$$;

-- 📅 FUNÇÃO 4: Timeline Próximos 7 Dias
CREATE OR REPLACE FUNCTION get_timeline_sla_7_dias(
  p_loja_id UUID DEFAULT NULL
)
RETURNS TABLE (
  dia TEXT,
  data DATE,
  sla_vencendo INTEGER,
  promessas_vencendo INTEGER,
  status TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  dia_atual DATE := CURRENT_DATE;
  i INTEGER;
BEGIN
  FOR i IN 0..6 LOOP
    RETURN QUERY
    SELECT 
      CASE EXTRACT(DOW FROM (dia_atual + i))
        WHEN 0 THEN 'DOM'
        WHEN 1 THEN 'SEG'
        WHEN 2 THEN 'TER'
        WHEN 3 THEN 'QUA'
        WHEN 4 THEN 'QUI'
        WHEN 5 THEN 'SEX'
        WHEN 6 THEN 'SAB'
      END as dia,
      (dia_atual + i) as data,
      COUNT(*) FILTER (WHERE p.data_sla_laboratorio = (dia_atual + i))::INTEGER as sla_vencendo,
      COUNT(*) FILTER (WHERE p.data_prometida = (dia_atual + i))::INTEGER as promessas_vencendo,
      CASE 
        WHEN COUNT(*) FILTER (WHERE p.data_sla_laboratorio = (dia_atual + i)) > 10 THEN 'pico'
        WHEN COUNT(*) FILTER (WHERE p.data_sla_laboratorio = (dia_atual + i)) > 5 THEN 'atencao'
        WHEN EXTRACT(DOW FROM (dia_atual + i)) IN (0, 6) THEN 'folga'
        ELSE 'ok'
      END as status
    FROM v_pedidos_kanban p
    WHERE p.status NOT IN ('ENTREGUE', 'CANCELADO')
      AND (p_loja_id IS NULL OR p.loja_id = p_loja_id)
      AND (p.data_sla_laboratorio = (dia_atual + i) OR p.data_prometida = (dia_atual + i));
  END LOOP;
END;
$$;

-- ===================================================================
-- PERMISSÕES: Garantir acesso às funções
-- ===================================================================

GRANT EXECUTE ON FUNCTION get_sla_metricas TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_performance_laboratorios TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_alertas_sla_criticos TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_timeline_sla_7_dias TO authenticated, anon, service_role;

-- ===================================================================
-- TESTE: Validar se as funções funcionam
-- ===================================================================

-- Testar métricas
SELECT * FROM get_sla_metricas();

-- Testar performance
SELECT * FROM get_performance_laboratorios();

-- Testar alertas  
SELECT * FROM get_alertas_sla_criticos();

-- Testar timeline
SELECT * FROM get_timeline_sla_7_dias();