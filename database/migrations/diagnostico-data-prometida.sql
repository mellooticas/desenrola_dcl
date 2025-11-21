-- 🔍 DIAGNÓSTICO: Verificar estado da data_prometida
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar quantos pedidos AG_PAGAMENTO existem
SELECT 
  'Total AG_PAGAMENTO' as tipo,
  COUNT(*) as quantidade
FROM pedidos
WHERE status = 'AG_PAGAMENTO';

-- 2. Verificar quantos têm data_prometida preenchida
SELECT 
  'AG_PAGAMENTO COM data_prometida' as tipo,
  COUNT(*) as quantidade
FROM pedidos
WHERE status = 'AG_PAGAMENTO' 
  AND data_prometida IS NOT NULL;

-- 3. Verificar quantos estão SEM data_prometida
SELECT 
  'AG_PAGAMENTO SEM data_prometida' as tipo,
  COUNT(*) as quantidade
FROM pedidos
WHERE status = 'AG_PAGAMENTO' 
  AND data_prometida IS NULL;

-- 4. Ver exemplos de pedidos AG_PAGAMENTO
SELECT 
  id,
  numero_os,
  status,
  data_pedido,
  data_prometida,
  data_sla_laboratorio,
  laboratorio_id
FROM pedidos
WHERE status = 'AG_PAGAMENTO'
ORDER BY data_pedido DESC
LIMIT 5;

-- 5. Verificar se a view v_pedidos_kanban tem data_prometida
SELECT 
  id,
  numero_os,
  status,
  data_prometida,
  data_sla_laboratorio
FROM v_pedidos_kanban
WHERE status = 'AG_PAGAMENTO'
LIMIT 5;
