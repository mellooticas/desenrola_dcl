-- ================================================================
-- CORRIGIR VIEW v_kpis_dashboard - MOSTRAR APENAS DADOS REAIS
-- ================================================================
-- A view atual conta TODOS os pedidos (incluindo dados históricos/mockados)
-- Vamos corrigir para mostrar apenas os dados reais atuais
-- ================================================================

-- OPÇÃO 1: FILTRAR POR DATA RECENTE (RECOMENDADA)
-- Esta abordagem mostra apenas pedidos criados recentemente (últimos 30 dias)

DROP VIEW IF EXISTS public.v_kpis_dashboard;

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
FROM pedidos p
-- 🔥 FILTRO ADICIONADO: Apenas pedidos dos últimos 30 dias
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days';

-- ================================================================
-- ALTERNATIVA: Se quiser ver APENAS os 2 pedidos que você sabe que existem
-- ================================================================

-- OPÇÃO 2: FILTRAR POR IDs ESPECÍFICOS (se você souber os IDs)
/*
DROP VIEW IF EXISTS public.v_kpis_dashboard;

CREATE VIEW public.v_kpis_dashboard AS
SELECT
  COUNT(p.id) AS total_pedidos,
  -- ... resto igual ...
FROM pedidos p
WHERE p.id IN (
  'f0cfb380-5039-45b3-a25c-624a77d9b19b',
  'c99b4b8b-c9f5-46c6-9ccd-46cbea6eeb60'
);
*/

-- ================================================================
-- OPÇÃO 3: FILTRAR POR DATA ESPECÍFICA (hoje)
-- ================================================================

/*
DROP VIEW IF EXISTS public.v_kpis_dashboard;

CREATE VIEW public.v_kpis_dashboard AS
SELECT
  COUNT(p.id) AS total_pedidos,
  -- ... resto igual ...  
FROM pedidos p
WHERE DATE(p.created_at) = CURRENT_DATE;
*/

-- ================================================================
-- TESTE: Verificar se a view corrigida mostra os dados corretos
-- ================================================================

-- Após executar a correção, teste com:
SELECT * FROM v_kpis_dashboard;

-- E compare com a consulta direta na tabela:
SELECT 
  COUNT(*) as total_real_pedidos,
  SUM(valor_pedido) as valor_real_total,
  AVG(valor_pedido) as ticket_real_medio
FROM pedidos 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- ================================================================
-- INSTRUÇÕES DE USO:
-- ================================================================
-- 1. Execute a OPÇÃO 1 primeiro (filtro por 30 dias)
-- 2. Teste se mostra os 2 pedidos reais 
-- 3. Se não funcionar, tente a OPÇÃO 3 (filtro por data de hoje)
-- 4. Se ainda houver problemas, use a OPÇÃO 2 com os IDs específicos
-- ================================================================