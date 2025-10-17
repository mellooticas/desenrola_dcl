-- SOLUÇÃO TEMPORÁRIA: Desabilitar triggers problemáticos para teste
-- CUIDADO: Só fazer isso temporariamente para teste!

-- 1. Listar triggers ativos
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal;

  | trigger_name                   | status  |
| ------------------------------ | ------- |
| trigger_atualizar_datas_pedido | enabled |
| trigger_criar_evento_timeline  | enabled |
| trigger_pedidos_timeline       | enabled |

-- 2. TEMPORARIAMENTE desabilitar o trigger que acessa laboratorio_sla
-- (Vamos reabilitar depois)
ALTER TABLE pedidos DISABLE TRIGGER trigger_atualizar_datas_pedido;

Success. No rows returned




-- 3. Verificar se foi desabilitado
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND t.tgname = 'trigger_atualizar_datas_pedido';

  | trigger_name                   | status   |
| ------------------------------ | -------- |
| trigger_atualizar_datas_pedido | disabled |

-- 4. TESTE: Agora tente criar um pedido
-- Se funcionar, sabemos que é esse trigger o problema

-- 5. IMPORTANTE: Reabilitar depois do teste
-- ALTER TABLE pedidos ENABLE TRIGGER trigger_atualizar_datas_pedido;