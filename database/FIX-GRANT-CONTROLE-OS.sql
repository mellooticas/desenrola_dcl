-- =========================================
-- FIX: PERMISSÕES PARA TABELA CONTROLE_OS
-- =========================================

-- 1. Dar GRANT completo para anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE controle_os TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE controle_os TO authenticated;

-- 2. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'controle_os';

-- 3. Se RLS estiver ativo, criar policies permissivas
DROP POLICY IF EXISTS anon_all_access ON controle_os;
DROP POLICY IF EXISTS authenticated_all_access ON controle_os;

CREATE POLICY anon_all_access ON controle_os
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY authenticated_all_access ON controle_os
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Verificar GRANT aplicado
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'controle_os'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;


| grantee       | table_name  | privilege_type |
| ------------- | ----------- | -------------- |
| anon          | controle_os | DELETE         |
| anon          | controle_os | INSERT         |
| anon          | controle_os | SELECT         |
| anon          | controle_os | UPDATE         |
| authenticated | controle_os | DELETE         |
| authenticated | controle_os | INSERT         |
| authenticated | controle_os | SELECT         |
| authenticated | controle_os | UPDATE         |



-- 5. Verificar policies aplicadas
SELECT 
  policyname,
  roles,
  cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'controle_os'
ORDER BY roles, cmd;


| policyname                                 | roles           | operacao |
| ------------------------------------------ | --------------- | -------- |
| anon_all_access                            | {anon}          | ALL      |
| authenticated_all_access                   | {authenticated} | ALL      |
| Usuarios podem ver controle_os de sua loja | {authenticated} | SELECT   |
