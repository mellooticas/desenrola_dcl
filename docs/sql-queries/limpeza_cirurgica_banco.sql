-- ================================================================
-- LIMPEZA CIRÚRGICA DO BANCO - MANTER APENAS DADOS REAIS
-- ================================================================
-- CUIDADO: Execute passo a passo e teste entre cada etapa!
-- ================================================================

-- ================================================================
-- PASSO 1: VERIFICAR OS DADOS ATUAIS ANTES DE APAGAR
-- ================================================================

-- Primeiro, vamos confirmar quais são os 2 pedidos reais
SELECT 
    'PEDIDOS_REAIS' as tipo,
    id, 
    status, 
    valor_pedido, 
    created_at::date as data_criacao,
    cliente_nome
FROM pedidos 
WHERE created_at::date = '2025-09-18'  -- Pedidos de hoje
ORDER BY created_at DESC;

-- Verificar quantos pedidos históricos serão removidos
SELECT 
    'PEDIDOS_HISTORICOS' as tipo,
    COUNT(*) as total_para_remover,
    MIN(created_at::date) as data_mais_antiga,
    MAX(created_at::date) as data_mais_recente
FROM pedidos 
WHERE created_at::date != '2025-09-18';

-- ================================================================
-- PASSO 2: BACKUP DOS IDs DOS PEDIDOS REAIS (PRECAUÇÃO)
-- ================================================================

-- Confirmar os IDs que devemos MANTER
SELECT 
    'IDS_PARA_MANTER' as info,
    id,
    numero_sequencial,
    valor_pedido,
    status
FROM pedidos 
WHERE id IN (
    'f0cfb380-5039-45b3-a25c-624a77d9b19b',
    'c99b4b8b-c9f5-46c6-9ccd-46cbea6eeb60'
);

-- ================================================================
-- PASSO 3: REMOVER DADOS HISTÓRICOS/MOCKADOS (CUIDADO!)
-- ================================================================

-- 🚨 CUIDADO: Esta query irá DELETAR dados permanentemente!
-- Execute apenas após confirmar os IDs acima

DELETE FROM pedidos 
WHERE id NOT IN (
    'f0cfb380-5039-45b3-a25c-624a77d9b19b',
    'c99b4b8b-c9f5-46c6-9ccd-46cbea6eeb60'
);

-- Verificar se deu certo
SELECT 
    'APOS_LIMPEZA' as status,
    COUNT(*) as total_pedidos_restantes
FROM pedidos;

-- ================================================================
-- PASSO 4: CORRIGIR VIEW v_kpis_dashboard (SEM FILTROS HARDCODED)
-- ================================================================

-- Remover a view atual
DROP VIEW IF EXISTS public.v_kpis_dashboard;

-- Recriar a view SEM filtros hardcoded (como deve ser)
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
-- 🎯 SEM FILTROS HARDCODED - Como deve ser!

-- ================================================================
-- PASSO 5: VERIFICAR SE TUDO ESTÁ CORRETO
-- ================================================================

-- Testar a view corrigida
SELECT * FROM v_kpis_dashboard;

-- Deve mostrar agora:
-- total_pedidos: 2
-- valor_total_vendas: 601.00  
-- ticket_medio: 300.50
-- labs_ativos: (número de labs distintos dos 2 pedidos)

-- Comparar com consulta direta
SELECT 
    'VERIFICACAO_FINAL' as teste,
    COUNT(*) as pedidos_na_tabela,
    SUM(valor_pedido) as valor_total_tabela,
    AVG(valor_pedido) as ticket_medio_tabela
FROM pedidos;

-- ================================================================
-- PASSO 6: VERIFICAR OUTRAS TABELAS RELACIONADAS (OPCIONAL)
-- ================================================================

-- Verificar se há registros órfãos em outras tabelas
SELECT 'laboratorios' as tabela, COUNT(*) as total FROM laboratorios;
SELECT 'lojas' as tabela, COUNT(*) as total FROM lojas;
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios;

-- ================================================================
-- RESUMO DO QUE FOI FEITO:
-- ================================================================
-- 1. ✅ Mantidos apenas os 2 pedidos reais de hoje
-- 2. ✅ Removidos todos os dados históricos/mockados
-- 3. ✅ Corrigida a view v_kpis_dashboard SEM filtros hardcoded
-- 4. ✅ View agora mostra dados reais: 2 pedidos, R$ 601,00
-- 5. ✅ Filtros devem ser aplicados no frontend/API quando necessário
-- ================================================================

-- ⚠️  IMPORTANTE: Execute passo a passo e verifique cada etapa!
-- ⚠️  Faça backup se estiver em produção!