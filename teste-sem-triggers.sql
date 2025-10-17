-- TESTE RADICAL: Desabilitar TODOS os triggers temporariamente
-- Para isolar o problema

-- 1. Listar todos os triggers ativos
SELECT 
  t.tgname,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

| tgname                         | status  |
| ------------------------------ | ------- |
| trigger_atualizar_datas_pedido | enabled |
| trigger_criar_evento_timeline  | enabled |
| trigger_pedidos_timeline       | enabled |

-- 2. TEMPORARIAMENTE desabilitar TODOS os triggers
ALTER TABLE pedidos DISABLE TRIGGER ALL;


ERROR:  42501: permission denied: "RI_ConstraintTrigger_a_53634" is a system trigger

-- 3. Verificar se foram desabilitados
SELECT 
  t.tgname,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

| tgname                         | status  |
| ------------------------------ | ------- |
| trigger_atualizar_datas_pedido | enabled |
| trigger_criar_evento_timeline  | enabled |
| trigger_pedidos_timeline       | enabled |

-- 4. AGORA TESTE CRIAÇÃO DE PEDIDO
-- Se funcionar, sabemos que é um dos triggers

-- 5. IMPORTANTE: Reabilitar depois do teste
-- ALTER TABLE pedidos ENABLE TRIGGER ALL;