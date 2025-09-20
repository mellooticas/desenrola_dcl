-- ================================================================
-- DEBUG: Por que a view ainda mostra dados antigos?
-- ================================================================

-- PASSO 1: Verificar se a view existe e qual é sua definição atual
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'v_kpis_dashboard';

-- PASSO 2: Forçar recriação COMPLETA da view
DROP VIEW IF EXISTS public.v_kpis_dashboard CASCADE;

-- PASSO 3: Verificar se realmente não existe mais
SELECT * FROM pg_views WHERE viewname = 'v_kpis_dashboard';

-- PASSO 4: Recriar a view do zero
CREATE VIEW public.v_kpis_dashboard AS
SELECT
  COUNT(p.id) AS total_pedidos,
  COUNT(*) FILTER (
    WHERE p.status::text = 'ENTREGUE'::text
  ) AS entregues,
  ROUND(
    AVG(
      CASE
        WHEN p.status::text = 'ENTREGUE'::text
        AND p.data_entregue IS NOT NULL
        AND p.data_pedido IS NOT NULL 
        THEN p.data_entregue - p.data_pedido
        ELSE NULL::integer
      END
    ),
    1
  ) AS lead_time_medio,
  COUNT(*) FILTER (
    WHERE p.pagamento_atrasado = true
  ) AS pedidos_atrasados,
  ROUND(AVG(p.valor_pedido), 2) AS ticket_medio,
  ROUND(
    COUNT(*) FILTER (
      WHERE p.status::text = 'ENTREGUE'::text
      AND p.data_entregue <= p.data_prometida
    )::numeric * 100.0 / NULLIF(
      COUNT(*) FILTER (
        WHERE p.status::text = 'ENTREGUE'::text
      ),
      0
    )::numeric,
    2
  ) AS sla_compliance,
  COUNT(DISTINCT p.laboratorio_id) AS labs_ativos,
  COALESCE(SUM(p.valor_pedido), 0::numeric) AS valor_total_vendas,
  COALESCE(SUM(p.custo_lentes), 0::numeric) AS custo_total_lentes,
  CASE
    WHEN SUM(p.valor_pedido) > 0::numeric 
    THEN ROUND(
      (SUM(p.valor_pedido) - COALESCE(SUM(p.custo_lentes), 0::numeric)) / SUM(p.valor_pedido) * 100::numeric,
      2
    )
    ELSE 0::numeric
  END AS margem_percentual
FROM pedidos p;

-- PASSO 5: Verificar se foi criada corretamente
SELECT 'VIEW_CRIADA' as status, COUNT(*) as exists 
FROM pg_views WHERE viewname = 'v_kpis_dashboard';

-- PASSO 6: Testar a view imediatamente
SELECT 'TESTE_VIEW' as teste, * FROM v_kpis_dashboard;

-- PASSO 7: Comparar com dados diretos da tabela
SELECT 
    'DADOS_DIRETOS_TABELA' as fonte,
    COUNT(*) as total_pedidos,
    SUM(valor_pedido) as valor_total_vendas,
    AVG(valor_pedido) as ticket_medio
FROM pedidos;

-- PASSO 8: Verificar se há cache ou outras views com mesmo nome
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE viewname ILIKE '%kpi%';

-- PASSO 9: Forçar refresh completo (se necessário)
-- REFRESH MATERIALIZED VIEW IF EXISTS v_kpis_dashboard; -- Só se for materialized view

-- PASSO 10: Verificar permissões da view
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'v_kpis_dashboard';