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
      THEN (p.data_entregue - p.data_pedido)::INTEGER
      ELSE NULL END
    ), 0)::NUMERIC(3,1) as dias_medio_real,
    -- SLA prometido médio
    COALESCE(AVG(p.sla_padrao_dias), 0)::NUMERIC(3,1) as dias_sla_prometido,
    -- Economia potencial (se entregar antes do SLA)
    (COUNT(*) * 50 * 
     CASE WHEN AVG((COALESCE(p.data_entregue, CURRENT_DATE) - p.data_pedido)::INTEGER) < AVG(p.sla_padrao_dias) 
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

GRANT EXECUTE ON FUNCTION get_sla_metricas(UUID, DATE, DATE) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_performance_laboratorios(UUID, DATE, DATE) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_alertas_sla_criticos(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_timeline_sla_7_dias(UUID) TO authenticated, anon, service_role;

-- ===================================================================
-- TESTE: Validar se as funções funcionam
-- ===================================================================

-- Testar métricas
SELECT * FROM get_sla_metricas();

| total_pedidos | sla_lab_cumprido | promessas_cumpridas | taxa_sla_lab | taxa_promessa_cliente | economia_margem | custo_atrasos |
| ------------- | ---------------- | ------------------- | ------------ | --------------------- | --------------- | ------------- |
| 299           | 99               | 134                 | 33.11        | 44.82                 | 22425           | 30000         |


-- Testar performance
SELECT * FROM get_performance_laboratorios(NULL, NULL, NULL);


| laboratorio_id                       | laboratorio_nome             | total_pedidos | sla_cumprido | sla_atrasado | taxa_sla | dias_medio_real | dias_sla_prometido | economia_potencial | tendencia |
| ------------------------------------ | ---------------------------- | ------------- | ------------ | ------------ | -------- | --------------- | ------------------ | ------------------ | --------- |
| 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           | 40            | 26           | 14           | 65.00    | 7.5             | 2.0                | -1000.0            | down      |
| 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | 63            | 26           | 37           | 41.27    | 16.4            | 7.0                | -1575.0            | down      |
| 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      | 5             | 2            | 3            | 40.00    | 11.6            | 3.0                | -125.0             | down      |
| d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | 14            | 5            | 9            | 35.71    | 10.5            | 10.0               | -350.0             | down      |
| 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      | 78            | 27           | 51           | 34.62    | 13.2            | 7.0                | -1950.0            | down      |
| 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        | 76            | 11           | 65           | 14.47    | 12.8            | 7.0                | -1900.0            | down      |
| 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | 17            | 1            | 16           | 5.88     | 14.1            | 7.0                | -425.0             | down      |
| 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | 5             | 0            | 5            | 0.00     | 15.0            | 2.0                | -125.0             | down      |



-- Testar alertas  
SELECT * FROM get_alertas_sla_criticos(NULL);

| id                                          | tipo           | titulo                          | descricao                 | pedido_os | laboratorio | acao_sugerida                                                      | severidade | dias_restantes |
| ------------------------------------------- | -------------- | ------------------------------- | ------------------------- | --------- | ----------- | ------------------------------------------------------------------ | ---------- | -------------- |
| atraso_069e36b5-dba4-4fdf-abb3-82f9e3d2ae1a | atraso_critico | SLA Crítico - 46 dias de atraso | OS #44 - Style - GARANTIA | #44       | Style       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -46            |
| atraso_64f3718c-dd2e-455a-af12-248e5b903b45 | atraso_critico | SLA Crítico - 45 dias de atraso | OS #53 - Sygma            | #53       | Sygma       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -45            |
| atraso_0635d170-35ab-44ce-9b8f-6b290184bcdb | atraso_critico | SLA Crítico - 45 dias de atraso | OS #51 - Sygma            | #51       | Sygma       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -45            |
| atraso_f1f8e925-b175-4eeb-aa20-1215447c98ca | atraso_critico | SLA Crítico - 44 dias de atraso | OS #61 - Braslentes       | #61       | Braslentes  | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -44            |
| atraso_b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | atraso_critico | SLA Crítico - 44 dias de atraso | OS #57 - Sygma            | #57       | Sygma       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -44            |
| atraso_db3526b7-c80d-49a3-99be-11a0f31f06fc | atraso_critico | SLA Crítico - 44 dias de atraso | OS #72 - Sygma            | #72       | Sygma       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -44            |
| atraso_fdd50d40-189a-4426-85a7-b134b0156a06 | atraso_critico | SLA Crítico - 42 dias de atraso | OS #13 - Style            | #13       | Style       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -42            |
| atraso_7375f8c3-6559-43d1-87f5-845d079bf2cf | atraso_critico | SLA Crítico - 30 dias de atraso | OS #179 - Brascor         | #179      | Brascor     | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -30            |
| atraso_f877833c-fbd7-4300-889c-28ca866e5ba3 | atraso_critico | SLA Crítico - 30 dias de atraso | OS #130 - Style           | #130      | Style       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -30            |
| atraso_fcbef31b-7be6-4bae-a00f-8afe0887264c | atraso_critico | SLA Crítico - 27 dias de atraso | OS #141 - Sygma           | #141      | Sygma       | Contatar laboratório imediatamente + verificar compensação cliente | critica    | -27            |

-- Testar timeline
SELECT * FROM get_timeline_sla_7_dias();


| dia | data       | sla_vencendo | promessas_vencendo | status  |
| --- | ---------- | ------------ | ------------------ | ------- |
| SEX | 2025-11-14 | 1            | 6                  | ok      |
| SAB | 2025-11-15 | 10           | 5                  | atencao |
| DOM | 2025-11-16 | 3            | 4                  | folga   |
| SEG | 2025-11-17 | 0            | 6                  | ok      |
| TER | 2025-11-18 | 3            | 2                  | ok      |
| QUA | 2025-11-19 | 1            | 0                  | ok      |
| QUI | 2025-11-20 | 0            | 3                  | ok      |