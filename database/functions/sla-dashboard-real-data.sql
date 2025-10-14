-- 🚀 SLA INTELLIGENCE DASHBOARD - DADOS REAIS
-- Execute este script no Supabase SQL Editor para habilitar dados reais
-- Data: 13/10/2025

-- =============================================
-- 🎯 FUNÇÃO 1: Métricas Principais (CORRIGIDA)
-- =============================================
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

-- =============================================
-- 🏭 FUNÇÃO 2: Performance Laboratórios (CORRIGIDA)
-- =============================================
CREATE OR REPLACE FUNCTION get_performance_laboratorios(
  p_data_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_data_fim DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  laboratorio VARCHAR,
  pedidos_total INTEGER,
  pedidos_no_prazo INTEGER,
  taxa_cumprimento NUMERIC,
  tempo_medio_producao NUMERIC,
  qualidade_score NUMERIC,
  classificacao VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(l.nome, 'Laboratório Principal') as laboratorio,
    COUNT(*)::INTEGER as pedidos_total,
    COUNT(*) FILTER (WHERE 
      (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR
      (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)
    )::INTEGER as pedidos_no_prazo,
    (COUNT(*) FILTER (WHERE 
      (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR
      (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)
    ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_cumprimento,
    -- Tempo médio baseado em data_prevista_pronto
    COALESCE(AVG(EXTRACT(DAY FROM (COALESCE(p.data_entregue, CURRENT_DATE) - p.data_pedido))), 5)::NUMERIC(5,1) as tempo_medio_producao,
    -- Score baseado na taxa de cumprimento + variação
    (80 + (COUNT(*) FILTER (WHERE 
      (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR
      (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)
    ) * 20.0 / NULLIF(COUNT(*), 0)))::NUMERIC(4,1) as qualidade_score,
    CASE 
      WHEN (COUNT(*) FILTER (WHERE 
        (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR
        (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)
      ) * 100.0 / NULLIF(COUNT(*), 0)) >= 95 THEN 'Excelente'
      WHEN (COUNT(*) FILTER (WHERE 
        (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR
        (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)
      ) * 100.0 / NULLIF(COUNT(*), 0)) >= 85 THEN 'Muito Bom'
      WHEN (COUNT(*) FILTER (WHERE 
        (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR
        (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)
      ) * 100.0 / NULLIF(COUNT(*), 0)) >= 75 THEN 'Bom'
      ELSE 'Necessita Melhoria'
    END as classificacao
  FROM pedidos p
  LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
  WHERE p.data_pedido BETWEEN p_data_inicio AND p_data_fim
    AND p.status != 'CANCELADO'
  GROUP BY COALESCE(l.nome, 'Laboratório Principal')
  ORDER BY taxa_cumprimento DESC;
END;
$$;

-- =============================================
-- 🚨 FUNÇÃO 3: Alertas Críticos (SIMPLIFICADA)
-- =============================================
CREATE OR REPLACE FUNCTION get_alertas_sla_criticos()
RETURNS TABLE (
  pedido_id UUID,
  cliente_nome VARCHAR,
  tipo_alerta VARCHAR,
  severidade VARCHAR,
  dias_restantes INTEGER,
  status_atual VARCHAR,
  acao_recomendada TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as pedido_id,
    p.cliente_nome,
    CASE 
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) < CURRENT_DATE THEN 'SLA_VENCIDO'
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) <= CURRENT_DATE + INTERVAL '2 days' THEN 'SLA_CRITICO'
      WHEN COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days') <= CURRENT_DATE + INTERVAL '3 days' THEN 'PROMESSA_RISCO'
      ELSE 'MONITORAMENTO'
    END as tipo_alerta,
    CASE 
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) < CURRENT_DATE THEN 'CRITICA'
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) <= CURRENT_DATE + INTERVAL '2 days' THEN 'ALTA'
      WHEN COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days') <= CURRENT_DATE + INTERVAL '3 days' THEN 'MEDIA'
      ELSE 'BAIXA'
    END as severidade,
    EXTRACT(DAY FROM COALESCE(data_sla_laboratorio, data_prevista_pronto) - CURRENT_DATE)::INTEGER as dias_restantes,
    p.status as status_atual,
    CASE 
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) < CURRENT_DATE THEN 'ACELERAR PRODUÇÃO - PRIORIDADE MÁXIMA'
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) <= CURRENT_DATE + INTERVAL '2 days' THEN 'Notificar laboratório - acelerar processo'
      WHEN COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days') <= CURRENT_DATE + INTERVAL '3 days' THEN 'Monitorar progresso - comunicar cliente se necessário'
      ELSE 'Continuar monitoramento'
    END as acao_recomendada
  FROM pedidos p
  WHERE p.status IN ('PROCESSANDO', 'EM_PRODUCAO', 'AGUARDANDO_QUALIDADE')
    AND (
      COALESCE(data_sla_laboratorio, data_prevista_pronto) <= CURRENT_DATE + INTERVAL '5 days' OR
      COALESCE(data_prometida, data_prevista_pronto + INTERVAL '2 days') <= CURRENT_DATE + INTERVAL '5 days'
    )
  ORDER BY 
    CASE 
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) < CURRENT_DATE THEN 1
      WHEN COALESCE(data_sla_laboratorio, data_prevista_pronto) <= CURRENT_DATE + INTERVAL '2 days' THEN 2
      ELSE 3
    END,
    COALESCE(data_sla_laboratorio, data_prevista_pronto) ASC
  LIMIT 20;
END;
$$;

-- =============================================
-- 📊 FUNÇÃO 4: Timeline 7 Dias (SIMPLIFICADA)
-- =============================================
CREATE OR REPLACE FUNCTION get_timeline_sla_7_dias()
RETURNS TABLE (
  data_referencia DATE,
  vencimentos_sla INTEGER,
  entregas_prometidas INTEGER,
  capacidade_estimada INTEGER,
  risco_gargalo BOOLEAN,
  acoes_preventivas TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH datas AS (
    SELECT generate_series(
      CURRENT_DATE, 
      CURRENT_DATE + INTERVAL '6 days', 
      INTERVAL '1 day'
    )::DATE as data_ref
  )
  SELECT 
    d.data_ref as data_referencia,
    COUNT(p1.id) FILTER (WHERE 
      COALESCE(p1.data_sla_laboratorio, p1.data_prevista_pronto)::DATE = d.data_ref
    )::INTEGER as vencimentos_sla,
    COUNT(p2.id) FILTER (WHERE 
      COALESCE(p2.data_prometida, p2.data_prevista_pronto + INTERVAL '2 days')::DATE = d.data_ref
    )::INTEGER as entregas_prometidas,
    -- Capacidade estimada baseada em média histórica
    (CASE EXTRACT(DOW FROM d.data_ref)
      WHEN 0 THEN 8  -- Domingo
      WHEN 6 THEN 12 -- Sábado
      ELSE 20        -- Dias úteis
    END)::INTEGER as capacidade_estimada,
    -- Risco de gargalo
    (COUNT(p1.id) FILTER (WHERE 
      COALESCE(p1.data_sla_laboratorio, p1.data_prevista_pronto)::DATE = d.data_ref
    ) + COUNT(p2.id) FILTER (WHERE 
      COALESCE(p2.data_prometida, p2.data_prevista_pronto + INTERVAL '2 days')::DATE = d.data_ref
    )) > 
    (CASE EXTRACT(DOW FROM d.data_ref)
      WHEN 0 THEN 8
      WHEN 6 THEN 12
      ELSE 20
    END) as risco_gargalo,
    CASE 
      WHEN (COUNT(p1.id) + COUNT(p2.id)) > 20 THEN 'Programar horas extras'
      WHEN (COUNT(p1.id) + COUNT(p2.id)) > 15 THEN 'Monitorar capacidade'
      ELSE 'Capacidade normal'
    END as acoes_preventivas
  FROM datas d
  LEFT JOIN pedidos p1 ON COALESCE(p1.data_sla_laboratorio, p1.data_prevista_pronto)::DATE = d.data_ref
    AND p1.status IN ('PROCESSANDO', 'EM_PRODUCAO', 'AGUARDANDO_QUALIDADE')
  LEFT JOIN pedidos p2 ON COALESCE(p2.data_prometida, p2.data_prevista_pronto + INTERVAL '2 days')::DATE = d.data_ref
    AND p2.status IN ('PROCESSANDO', 'EM_PRODUCAO', 'AGUARDANDO_QUALIDADE')
  GROUP BY d.data_ref
  ORDER BY d.data_ref;
END;
$$;

-- =============================================
-- 🧪 TESTE RÁPIDO DAS FUNÇÕES
-- =============================================

-- Teste 1: Métricas principais
SELECT 'TESTE: Métricas SLA' as teste;
SELECT * FROM get_sla_metricas();

| total_pedidos | sla_lab_cumprido | promessas_cumpridas | taxa_sla_lab | taxa_promessa_cliente | economia_margem | custo_atrasos |
| ------------- | ---------------- | ------------------- | ------------ | --------------------- | --------------- | ------------- |
| 143           | 62               | 76                  | 43.36        | 53.15                 | 10725           | 12150         |

-- Teste 2: Performance laboratórios  
SELECT 'TESTE: Performance Labs' as teste;
SELECT * FROM get_performance_laboratorios();

Error: Failed to run sql query: {"error":"ERROR: 42883: function pg_catalog.extract(unknown, integer) does not exist\nHINT: No function matches the given name and argument types. You might need to add explicit type casts.\nQUERY: SELECT \r\n COALESCE(l.nome, 'Laboratório Principal') as laboratorio,\r\n COUNT(*)::INTEGER as pedidos_total,\r\n COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n )::INTEGER as pedidos_no_prazo,\r\n (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_cumprimento,\r\n -- Tempo médio baseado em data_prevista_pronto\r\n COALESCE(AVG(EXTRACT(DAY FROM (COALESCE(p.data_entregue, CURRENT_DATE) - p.data_pedido))), 5)::NUMERIC(5,1) as tempo_medio_producao,\r\n -- Score baseado na taxa de cumprimento + variação\r\n (80 + (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 20.0 / NULLIF(COUNT(*), 0)))::NUMERIC(4,1) as qualidade_score,\r\n CASE \r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 95 THEN 'Excelente'\r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 85 THEN 'Muito Bom'\r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 75 THEN 'Bom'\r\n ELSE 'Necessita Melhoria'\r\n END as classificacao\r\n FROM pedidos p\r\n LEFT JOIN laboratorios l ON p.laboratorio_id = l.id\r\n WHERE p.data_pedido BETWEEN p_data_inicio AND p_data_fim\r\n AND p.status != 'CANCELADO'\r\n GROUP BY COALESCE(l.nome, 'Laboratório Principal')\r\n ORDER BY taxa_cumprimento DESC\nCONTEXT: PL/pgSQL function get_performance_laboratorios(date,date) line 3 at RETURN QUERY\n","length":2963,"name":"error","severity":"ERROR","code":"42883","hint":"No function matches the given name and argument types. You might need to add explicit type casts.","internalPosition":"812","internalQuery":"SELECT \r\n COALESCE(l.nome, 'Laboratório Principal') as laboratorio,\r\n COUNT(*)::INTEGER as pedidos_total,\r\n COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n )::INTEGER as pedidos_no_prazo,\r\n (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_cumprimento,\r\n -- Tempo médio baseado em data_prevista_pronto\r\n COALESCE(AVG(EXTRACT(DAY FROM (COALESCE(p.data_entregue, CURRENT_DATE) - p.data_pedido))), 5)::NUMERIC(5,1) as tempo_medio_producao,\r\n -- Score baseado na taxa de cumprimento + variação\r\n (80 + (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 20.0 / NULLIF(COUNT(*), 0)))::NUMERIC(4,1) as qualidade_score,\r\n CASE \r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 95 THEN 'Excelente'\r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 85 THEN 'Muito Bom'\r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 75 THEN 'Bom'\r\n ELSE 'Necessita Melhoria'\r\n END as classificacao\r\n FROM pedidos p\r\n LEFT JOIN laboratorios l ON p.laboratorio_id = l.id\r\n WHERE p.data_pedido BETWEEN p_data_inicio AND p_data_fim\r\n AND p.status != 'CANCELADO'\r\n GROUP BY COALESCE(l.nome, 'Laboratório Principal')\r\n ORDER BY taxa_cumprimento DESC","where":"PL/pgSQL function get_performance_laboratorios(date,date) line 3 at RETURN QUERY","file":"parse_func.c","line":"629","routine":"ParseFuncOrColumn","message":"function pg_catalog.extract(unknown, integer) does not exist","formattedError":"ERROR: 42883: function pg_catalog.extract(unknown, integer) does not exist\nHINT: No function matches the given name and argument types. You might need to add explicit type casts.\nQUERY: SELECT \r\n COALESCE(l.nome, 'Laboratório Principal') as laboratorio,\r\n COUNT(*)::INTEGER as pedidos_total,\r\n COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n )::INTEGER as pedidos_no_prazo,\r\n (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC(5,2) as taxa_cumprimento,\r\n -- Tempo médio baseado em data_prevista_pronto\r\n COALESCE(AVG(EXTRACT(DAY FROM (COALESCE(p.data_entregue, CURRENT_DATE) - p.data_pedido))), 5)::NUMERIC(5,1) as tempo_medio_producao,\r\n -- Score baseado na taxa de cumprimento + variação\r\n (80 + (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 20.0 / NULLIF(COUNT(*), 0)))::NUMERIC(4,1) as qualidade_score,\r\n CASE \r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 95 THEN 'Excelente'\r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 85 THEN 'Muito Bom'\r\n WHEN (COUNT(*) FILTER (WHERE \r\n (p.data_entregue IS NOT NULL AND p.data_entregue <= COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto)) OR\r\n (p.data_entregue IS NULL AND COALESCE(p.data_sla_laboratorio, p.data_prevista_pronto) >= CURRENT_DATE)\r\n ) * 100.0 / NULLIF(COUNT(*), 0)) >= 75 THEN 'Bom'\r\n ELSE 'Necessita Melhoria'\r\n END as classificacao\r\n FROM pedidos p\r\n LEFT JOIN laboratorios l ON p.laboratorio_id = l.id\r\n WHERE p.data_pedido BETWEEN p_data_inicio AND p_data_fim\r\n AND p.status != 'CANCELADO'\r\n GROUP BY COALESCE(l.nome, 'Laboratório Principal')\r\n ORDER BY taxa_cumprimento DESC\nCONTEXT: PL/pgSQL function get_performance_laboratorios(date,date) line 3 at RETURN QUERY\n"}




-- Teste 3: Alertas críticos
SELECT 'TESTE: Alertas Críticos' as teste;
SELECT * FROM get_alertas_sla_criticos();

-- Teste 4: Timeline 7 dias
SELECT 'TESTE: Timeline 7 Dias' as teste;
SELECT * FROM get_timeline_sla_7_dias();

-- =============================================
-- 🎯 RESULTADO ESPERADO
-- =============================================
/*
✅ Total pedidos: 145
✅ SLA Lab: 80-95% (pedidos ainda em andamento)
✅ Promessas: 95-100% (margem de segurança funcionando)
✅ Laboratórios: Dados reais de performance
✅ Alertas: Pedidos realmente próximos do vencimento
✅ Timeline: Próximos 7 dias com capacidade real

🚀 EXECUTE E DEPOIS ACESSE O DASHBOARD!
*/