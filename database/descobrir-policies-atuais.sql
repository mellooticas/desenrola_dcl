-- ========================================
-- DESCOBRIR: Qual é o estado REAL das policies?
-- ========================================

-- 1. Listar TODAS as policies na tabela pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;

-- 2. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'pedidos';

-- 3. Verificar permissões GRANT na tabela
SELECT 
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'pedidos'
  AND grantee IN ('authenticated', 'anon')
GROUP BY grantee;

-- 4. Testar contexto do usuário atual
SELECT 
  current_user as usuario_atual,
  current_setting('role') as role_atual;

-- 5. Verificar triggers que podem interferir
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND event_manipulation = 'UPDATE';
