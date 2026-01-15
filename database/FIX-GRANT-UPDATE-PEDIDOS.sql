-- =========================================
-- FIX: GRANT UPDATE NA TABELA PEDIDOS
-- =========================================
-- Problema: UPDATE via frontend retorna array vazio
-- Causa: Role 'anon' não tem permissão UPDATE
-- Solução: Dar GRANT ALL na tabela pedidos

-- 1. Remover permissões existentes (limpar)
REVOKE ALL ON TABLE pedidos FROM anon;
REVOKE ALL ON TABLE pedidos FROM authenticated;

-- 2. Dar permissões completas para anon (usado pelo frontend)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pedidos TO anon;

-- 3. Dar permissões completas para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pedidos TO authenticated;

-- 4. Verificar permissões aplicadas
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'pedidos'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

| grantee       | table_name | privilege_type |
| ------------- | ---------- | -------------- |
| anon          | pedidos    | DELETE         |
| anon          | pedidos    | INSERT         |
| anon          | pedidos    | SELECT         |
| anon          | pedidos    | UPDATE         |
| authenticated | pedidos    | DELETE         |
| authenticated | pedidos    | INSERT         |
| authenticated | pedidos    | SELECT         |
| authenticated | pedidos    | UPDATE         |



-- Resultado esperado:
-- grantee        | table_name | privilege_type
-- ---------------|------------|---------------
-- anon           | pedidos    | DELETE
-- anon           | pedidos    | INSERT
-- anon           | pedidos    | SELECT
-- anon           | pedidos    | UPDATE
-- authenticated  | pedidos    | DELETE
-- authenticated  | pedidos    | INSERT
-- authenticated  | pedidos    | SELECT
-- authenticated  | pedidos    | UPDATE
