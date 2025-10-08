-- ================================================================
-- FIX: Alterar security_type da função alterar_status_pedido
-- ================================================================

-- Primeiro, vamos descobrir a assinatura exata da função
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'alterar_status_pedido'
  AND n.nspname = 'public';

-- ================================================================
-- Com base na assinatura correta, execute o ALTER FUNCTION
-- ================================================================

-- Tente estas variações (uma delas deve funcionar):

-- Opção 1: Com VARCHAR
ALTER FUNCTION public.alterar_status_pedido(uuid, varchar, text, text) SECURITY DEFINER;

-- Opção 2: Sem schema
ALTER FUNCTION alterar_status_pedido(pedido_uuid uuid, novo_status varchar, observacao text, usuario text) SECURITY DEFINER;

-- Opção 3: Com nomes dos parâmetros
ALTER FUNCTION public.alterar_status_pedido(pedido_uuid uuid, novo_status varchar, observacao text, usuario text) SECURITY DEFINER;

-- ================================================================
-- VERIFICAR SE FUNCIONOU
-- ================================================================
SELECT 
  routine_name,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'alterar_status_pedido';

-- Deve retornar: security_type = 'DEFINER'
-- ================================================================
