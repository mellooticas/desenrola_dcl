-- ========================================
-- DIAGNÓSTICO: Por que UPDATE montador_id não funciona?
-- ========================================

-- 1. Verificar se o pedido existe
SELECT 
  id,
  numero_sequencial,
  status,
  montador_id,
  loja_id,
  usuario_id
FROM pedidos
WHERE id = '0df4535e-e39c-4b1c-9a83-4985158cf0ba';

-- 2. Verificar RLS policies na tabela pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY cmd, policyname;

-- 3. Verificar contexto do usuário atual
SELECT 
  current_user,
  session_user,
  current_setting('role'),
  current_setting('request.jwt.claims', true) as jwt_claims;

-- 4. Testar UPDATE diretamente
-- (Execute este comando manualmente para ver se funciona)
/*
UPDATE pedidos
SET montador_id = '56d71159-70ce-403b-8362-ebe44b18d882',
    updated_at = NOW()
WHERE id = '0df4535e-e39c-4b1c-9a83-4985158cf0ba'
RETURNING id, numero_sequencial, montador_id;
*/

-- 5. Verificar se há triggers que podem estar interferindo
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND event_manipulation = 'UPDATE';

-- 6. Verificar permissões da role 'authenticated' na tabela
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'pedidos'
  AND grantee = 'authenticated';

-- ========================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS para testar
-- ========================================
-- ATENÇÃO: Execute apenas em desenvolvimento!
-- ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
-- 
-- Após testar, reabilitar:
-- ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
