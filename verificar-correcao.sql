-- VERIFICAR SE A CORREÇÃO FOI APLICADA
-- O erro voltou, vamos verificar o que aconteceu

-- 1. Verificar se as funções estão realmente como SECURITY INVOKER
SELECT 
  p.proname,
  p.prosecdef,  -- Deve ser FALSE (INVOKER)
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type
FROM pg_proc p 
WHERE p.proname IN ('trigger_atualizar_datas_pedido', 'trigger_criar_evento_timeline', 'inserir_timeline_pedido')
ORDER BY p.proname;

| proname                        | prosecdef | security_type    |
| ------------------------------ | --------- | ---------------- |
| inserir_timeline_pedido        | false     | SECURITY INVOKER |
| trigger_atualizar_datas_pedido | false     | SECURITY INVOKER |
| trigger_criar_evento_timeline  | false     | SECURITY INVOKER |

-- 2. Verificar status dos triggers
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

| trigger_name                   | status  |
| ------------------------------ | ------- |
| trigger_atualizar_datas_pedido | enabled |
| trigger_criar_evento_timeline  | enabled |
| trigger_pedidos_timeline       | enabled |

-- 3. FORÇAR a correção novamente (talvez não tenha sido aplicada)
ALTER FUNCTION trigger_atualizar_datas_pedido SECURITY INVOKER;
ALTER FUNCTION trigger_criar_evento_timeline SECURITY INVOKER;

-- 4. Verificar novamente após forçar
SELECT 
  p.proname,
  p.prosecdef,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type
FROM pg_proc p 
WHERE p.proname IN ('trigger_atualizar_datas_pedido', 'trigger_criar_evento_timeline')
ORDER BY p.proname;

| proname                        | prosecdef | security_type    |
| ------------------------------ | --------- | ---------------- |
| trigger_atualizar_datas_pedido | false     | SECURITY INVOKER |
| trigger_criar_evento_timeline  | false     | SECURITY INVOKER |