-- =========================================
-- FIX: ADICIONAR POLICY UPDATE PARA ANON
-- =========================================

-- Remover policy antiga que só permite SELECT
DROP POLICY IF EXISTS anon_select_only ON pedidos;

-- Criar policy ALL para anon (igual à authenticated)
CREATE POLICY anon_all_access ON pedidos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Verificar policies aplicadas
SELECT 
  policyname,
  roles,
  cmd as operacao,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'pedidos'
ORDER BY roles, cmd;

| policyname               | roles           | operacao | using_expression | check_expression |
| ------------------------ | --------------- | -------- | ---------------- | ---------------- |
| anon_all_access          | {anon}          | ALL      | true             | true             |
| authenticated_all_access | {authenticated} | ALL      | true             | true             |


-- Resultado esperado:
-- policyname               | roles           | operacao | using_expression | check_expression
-- -------------------------|-----------------|----------|------------------|------------------
-- anon_all_access          | {anon}          | ALL      | true             | true
-- authenticated_all_access | {authenticated} | ALL      | true             | true
