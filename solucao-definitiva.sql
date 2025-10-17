-- SOLUÇÃO DEFINITIVA: Corrigir o trigger que está causando o problema
-- O trigger_atualizar_datas_pedido está acessando laboratorio_sla com SECURITY DEFINER

-- 1. Primeiro, verificar a configuração atual
SELECT 
  p.proname,
  p.prosecdef  -- true = DEFINER, false = INVOKER
FROM pg_proc p 
WHERE p.proname = 'trigger_atualizar_datas_pedido';

| proname                        | prosecdef |
| ------------------------------ | --------- |
| trigger_atualizar_datas_pedido | false     |

-- 2. Alterar para SECURITY INVOKER (a correção)
ALTER FUNCTION trigger_atualizar_datas_pedido SECURITY INVOKER;

Success. No rows returned




-- 3. Verificar se a alteração funcionou
SELECT 
  p.proname,
  p.prosecdef  -- Agora deve ser false (INVOKER)
FROM pg_proc p 
WHERE p.proname = 'trigger_atualizar_datas_pedido';

| proname                        | prosecdef |
| ------------------------------ | --------- |
| trigger_atualizar_datas_pedido | false     |

-- 4. Comentário explicativo
COMMENT ON FUNCTION trigger_atualizar_datas_pedido IS 
  'Trigger que calcula datas do pedido. Alterado para SECURITY INVOKER para evitar problemas de permissão com laboratorio_sla.';

-- 5. Teste opcional - simular criação de pedido para ver se funciona
-- (NÃO executar em produção, apenas para teste)
/*
DO $$
BEGIN
  RAISE NOTICE 'Trigger corrigido! Agora pode criar pedidos sem erro de permissão.';
END $$;
*/