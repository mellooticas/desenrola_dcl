-- CORREÇÃO DEFINITIVA DOS TRIGGERS
-- Corrigir ambos os triggers para usar SECURITY INVOKER

-- 1. Corrigir trigger_atualizar_datas_pedido (que acessava laboratorio_sla)
ALTER FUNCTION trigger_atualizar_datas_pedido SECURITY INVOKER;

-- 2. Corrigir trigger_criar_evento_timeline (que acessa pedido_eventos)
ALTER FUNCTION trigger_criar_evento_timeline SECURITY INVOKER;

-- 3. Verificar se as correções foram aplicadas
SELECT 
  p.proname,
  p.prosecdef  -- Deve ser FALSE (INVOKER) para ambos
FROM pg_proc p 
WHERE p.proname IN ('trigger_atualizar_datas_pedido', 'trigger_criar_evento_timeline');

-- 4. Reabilitar todos os triggers
ALTER TABLE pedidos ENABLE TRIGGER trigger_atualizar_datas_pedido;
ALTER TABLE pedidos ENABLE TRIGGER trigger_criar_evento_timeline;
ALTER TABLE pedidos ENABLE TRIGGER trigger_pedidos_timeline;

-- 5. Verificar se todos foram reabilitados
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 6. Comentários explicativos
COMMENT ON FUNCTION trigger_atualizar_datas_pedido IS 
  'Trigger que calcula datas do pedido. Corrigido para SECURITY INVOKER.';
  
COMMENT ON FUNCTION trigger_criar_evento_timeline IS 
  'Trigger que cria eventos na timeline. Corrigido para SECURITY INVOKER.';

  | trigger_name                   | status  |
| ------------------------------ | ------- |
| trigger_atualizar_datas_pedido | enabled |
| trigger_criar_evento_timeline  | enabled |
| trigger_pedidos_timeline       | enabled |