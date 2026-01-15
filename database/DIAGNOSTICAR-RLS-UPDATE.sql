-- =========================================
-- DIAGNOSTICAR POLICIES RLS NA TABELA PEDIDOS
-- =========================================

-- 1. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'pedidos';

  | schemaname | tablename | rls_ativo |
| ---------- | --------- | --------- |
| public     | pedidos   | true      |


-- 2. Listar TODAS as policies na tabela pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operacao,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'pedidos'
ORDER BY cmd, policyname;

| schemaname | tablename | policyname               | permissive | roles           | operacao | using_expression | check_expression |
| ---------- | --------- | ------------------------ | ---------- | --------------- | -------- | ---------------- | ---------------- |
| public     | pedidos   | authenticated_all_access | PERMISSIVE | {authenticated} | ALL      | true             | true             |
| public     | pedidos   | anon_select_only         | PERMISSIVE | {anon}          | SELECT   | true             | null             |


-- 3. Verificar loja_id do pedido que estamos tentando editar
SELECT 
  id,
  numero_sequencial,
  loja_id,
  cliente_nome
FROM pedidos
WHERE id = 'b9374462-ac98-4b4a-984d-8fe65aaa9194';

| id                                   | numero_sequencial | loja_id                              | cliente_nome                |
| ------------------------------------ | ----------------- | ------------------------------------ | --------------------------- |
| b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | MARIA ROMILDA SALES A SILVA |


-- 4. Verificar loja_id do usuário logado
SELECT 
  u.id as usuario_id,
  u.nome,
  u.email,
  u.role,
  u.loja_id
FROM usuarios u
WHERE u.id = 'f3d6c50a-1954-4698-8e48-bc8cbbebee9d';


| usuario_id                           | nome           | email                         | role   | loja_id |
| ------------------------------------ | -------------- | ----------------------------- | ------ | ------- |
| f3d6c50a-1954-4698-8e48-bc8cbbebee9d | Junior - Admin | junior@oticastatymello.com.br | gestor | null    |


-- 5. SOLUÇÃO: Criar policy permissiva para UPDATE
-- (Execute este bloco DEPOIS de ver os resultados acima)

/*
-- Remover policies antigas de UPDATE
DROP POLICY IF EXISTS authenticated_all_access ON pedidos;
DROP POLICY IF EXISTS pedidos_update_policy ON pedidos;

-- Criar policy permissiva: authenticated pode UPDATE em qualquer pedido
CREATE POLICY authenticated_update_all ON pedidos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar policy permissiva para anon também
CREATE POLICY anon_update_all ON pedidos
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
*/
