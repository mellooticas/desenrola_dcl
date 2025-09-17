-- ================================================================
-- SCRIPT DE EXECUÇÃO E TESTE DAS VIEWS DO DASHBOARD
-- Execute este script no Supabase SQL Editor
-- ================================================================

-- ================================================================
-- PARTE 1: EXECUÇÃO DAS VIEWS
-- Execute os scripts anteriores primeiro:
-- 1. 01-create-views-dashboard.sql
-- 2. 02-create-views-dashboard-part2.sql
-- ================================================================

-- ================================================================
-- PARTE 2: TESTE DAS VIEWS CRIADAS
-- ================================================================

-- Teste 1: Verificar se todas as views foram criadas
SELECT 
  schemaname,
  viewname,
  definition IS NOT NULL AS has_definition
FROM pg_views 
WHERE viewname IN (
  'v_kpis_dashboard',
  'v_ranking_laboratorios', 
  'v_evolucao_mensal',
  'v_analise_financeira',
  'v_alertas_criticos'
)
ORDER BY viewname;

-- ================================================================
-- Teste 2: Testar v_kpis_dashboard
-- ================================================================
SELECT 'v_kpis_dashboard' AS view_name, 'TESTE' AS status;
SELECT * FROM v_kpis_dashboard LIMIT 1;

-- ================================================================
-- Teste 3: Testar v_ranking_laboratorios
-- ================================================================
SELECT 'v_ranking_laboratorios' AS view_name, 'TESTE' AS status;
SELECT 
  posicao,
  laboratorio_nome,
  total_pedidos,
  sla_compliance,
  lead_time_medio,
  score_geral,
  status_risco
FROM v_ranking_laboratorios 
LIMIT 5;

-- ================================================================
-- Teste 4: Testar v_evolucao_mensal
-- ================================================================
SELECT 'v_evolucao_mensal' AS view_name, 'TESTE' AS status;
SELECT 
  ano_mes,
  total_pedidos,
  sla_compliance,
  lead_time_medio,
  faturamento_total
FROM v_evolucao_mensal 
ORDER BY periodo DESC
LIMIT 6;

-- ================================================================
-- Teste 5: Testar v_analise_financeira
-- ================================================================
SELECT 'v_analise_financeira' AS view_name, 'TESTE' AS status;
SELECT 
  categoria,
  volume_pedidos,
  faturamento_total,
  ticket_medio,
  sla_compliance
FROM v_analise_financeira
ORDER BY faturamento_total DESC;

-- ================================================================
-- Teste 6: Testar v_alertas_criticos
-- ================================================================
SELECT 'v_alertas_criticos' AS view_name, 'TESTE' AS status;
SELECT 
  tipo_alerta,
  prioridade,
  laboratorio_nome,
  problema,
  acao_sugerida
FROM v_alertas_criticos
ORDER BY 
  CASE prioridade 
    WHEN 'CRÍTICA' THEN 1 
    WHEN 'ALTA' THEN 2 
    ELSE 3 
  END,
  indicador_numerico DESC
LIMIT 10;

-- ================================================================
-- PARTE 3: DIAGNÓSTICO DO BANCO
-- ================================================================

-- Verificar quantidade de dados nas tabelas principais
SELECT 'DIAGNÓSTICO DO BANCO' AS titulo;

SELECT 
  'pedidos' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(*) FILTER (WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days') AS ultimos_30_dias,
  MIN(data_pedido) AS data_mais_antiga,
  MAX(data_pedido) AS data_mais_recente
FROM pedidos
UNION ALL
SELECT 
  'laboratorios' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(*) FILTER (WHERE ativo = true) AS ativos,
  NULL AS data_mais_antiga,
  NULL AS data_mais_recente
FROM laboratorios
UNION ALL
SELECT 
  'lojas' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(*) FILTER (WHERE ativo = true) AS ativos,
  NULL AS data_mais_antiga,
  NULL AS data_mais_recente
FROM lojas;

-- Verificar distribuição de status dos pedidos
SELECT 
  'DISTRIBUIÇÃO DE STATUS' AS titulo,
  status,
  COUNT(*) AS quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentual
FROM pedidos
GROUP BY status
ORDER BY quantidade DESC;

-- Verificar se há valores nulos em campos críticos
SELECT 'VERIFICAÇÃO DE DADOS CRÍTICOS' AS titulo;
SELECT 
  'Pedidos sem laboratório' AS problema,
  COUNT(*) AS quantidade
FROM pedidos WHERE laboratorio_id IS NULL
UNION ALL
SELECT 
  'Pedidos sem loja' AS problema,
  COUNT(*) AS quantidade
FROM pedidos WHERE loja_id IS NULL
UNION ALL
SELECT 
  'Pedidos sem valor' AS problema,
  COUNT(*) AS quantidade
FROM pedidos WHERE valor_pedido IS NULL OR valor_pedido <= 0
UNION ALL
SELECT 
  'Pedidos entregues sem data_entregue' AS problema,
  COUNT(*) AS quantidade
FROM pedidos WHERE status = 'ENTREGUE' AND data_entregue IS NULL;

-- ================================================================
-- PARTE 4: PERMISSÕES DAS VIEWS (se necessário)
-- ================================================================

-- Garantir que as views são acessíveis para anon/authenticated
-- (Descomente se necessário)

/*
GRANT SELECT ON v_kpis_dashboard TO anon, authenticated;
GRANT SELECT ON v_ranking_laboratorios TO anon, authenticated;
GRANT SELECT ON v_evolucao_mensal TO anon, authenticated;
GRANT SELECT ON v_analise_financeira TO anon, authenticated;
GRANT SELECT ON v_alertas_criticos TO anon, authenticated;
*/

-- ================================================================
-- RESULTADO ESPERADO
-- ================================================================
/*
Se todas as views foram criadas com sucesso, você deve ver:
1. Lista de 5 views criadas
2. Dados de KPIs (1 linha)
3. Top 5 laboratórios com ranking
4. Últimos 6 meses de evolução
5. Análise financeira por categoria
6. Lista de alertas críticos
7. Diagnóstico mostrando quantidade de dados reais

Se alguma view retornar erro, verifique:
- Se as tabelas referenciadas existem
- Se os nomes dos campos estão corretos
- Se há dados suficientes para os cálculos
*/

SELECT 'EXECUÇÃO CONCLUÍDA - VIEWS CRIADAS E TESTADAS!' AS resultado;