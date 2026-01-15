-- ============================================================
-- DEBUG: Distribuição de pedidos por status
-- Objetivo: Entender onde estão os 103 pedidos
-- ============================================================

-- 1. Contar pedidos por status (todos)
SELECT 
  status,
  COUNT(*) as total_pedidos
FROM pedidos
GROUP BY status
ORDER BY total_pedidos DESC;

| status       | total_pedidos |
| ------------ | ------------- |
| ENTREGUE     | 401           |
| PRODUCAO     | 36            |
| CHEGOU       | 33            |
| ENVIADO      | 24            |
| CANCELADO    | 20            |
| AG_PAGAMENTO | 5             |
| PRONTO       | 4             |
| PAGO         | 1             |


-- 2. Verificar quais status NÃO são ENTREGUE/CANCELADO (operacionais)
SELECT 
  status,
  COUNT(*) as total_pedidos
FROM pedidos
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')
GROUP BY status
ORDER BY total_pedidos DESC;


| status       | total_pedidos |
| ------------ | ------------- |
| PRODUCAO     | 36            |
| CHEGOU       | 33            |
| ENVIADO      | 24            |
| AG_PAGAMENTO | 5             |
| PRONTO       | 4             |
| PAGO         | 1             |


-- 3. Ver total operacional
SELECT 
  'OPERACIONAIS (sem ENTREGUE/CANCELADO)' as tipo,
  COUNT(*) as total
FROM pedidos
WHERE status NOT IN ('ENTREGUE', 'CANCELADO')

UNION ALL

SELECT 
  'FINALIZADOS (ENTREGUE + CANCELADO)' as tipo,
  COUNT(*) as total
FROM pedidos
WHERE status IN ('ENTREGUE', 'CANCELADO')

UNION ALL

SELECT 
  'TOTAL GERAL' as tipo,
  COUNT(*) as total
FROM pedidos;

| tipo                                  | total |
| ------------------------------------- | ----- |
| OPERACIONAIS (sem ENTREGUE/CANCELADO) | 103   |
| FINALIZADOS (ENTREGUE + CANCELADO)    | 421   |
| TOTAL GERAL                           | 524   |


-- 4. Verificar se temos PAGO e PRONTO
SELECT 
  CASE 
    WHEN status = 'PAGO' THEN '✅ PAGO existe'
    WHEN status = 'PRONTO' THEN '✅ PRONTO existe'
    ELSE status
  END as status_info,
  COUNT(*) as qtd
FROM pedidos
WHERE status IN ('PAGO', 'PRONTO')
GROUP BY status;

| status_info     | qtd |
| --------------- | --- |
| ✅ PAGO existe   | 1   |
| ✅ PRONTO existe | 4   |

