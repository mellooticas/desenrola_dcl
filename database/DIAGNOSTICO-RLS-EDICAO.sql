-- =====================================================
-- 🔍 DIAGNÓSTICO: Verificar RLS de UPDATE em pedidos
-- =====================================================
-- Execute este script primeiro para entender o problema
-- =====================================================

-- 1. Verificar todas as policies na tabela pedidos
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


| schemaname | tablename | policyname                 | permissive | roles           | cmd    | qual                                                                                                                                                                                                                                                           | with_check                                                                                                                                                                                                                                                     |
| ---------- | --------- | -------------------------- | ---------- | --------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | pedidos   | policy_universal_pedidos   | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                                                                                                                           | true                                                                                                                                                                                                                                                           |
| public     | pedidos   | policy_anon_select_pedidos | PERMISSIVE | {anon}          | SELECT | true                                                                                                                                                                                                                                                           | null                                                                                                                                                                                                                                                           |
| public     | pedidos   | pedidos_update_policy      | PERMISSIVE | {authenticated} | UPDATE | ((loja_id IN ( SELECT usuarios.loja_id
   FROM usuarios
  WHERE (usuarios.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = ANY (ARRAY['gestor'::text, 'dcl'::text, 'financeiro'::text])))))) | ((loja_id IN ( SELECT usuarios.loja_id
   FROM usuarios
  WHERE (usuarios.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = ANY (ARRAY['gestor'::text, 'dcl'::text, 'financeiro'::text])))))) |



-- 2. Verificar se a tabela tem RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'pedidos';

| schemaname | tablename | rowsecurity |
| ---------- | --------- | ----------- |
| public     | pedidos   | true        |


-- 3. Verificar o usuário autenticado atual e suas permissões
SELECT 
  id,
  email,
  role,
  loja_id
FROM usuarios
WHERE id = auth.uid();

Success. No rows returned





-- 4. Testar se o pedido específico é visível para UPDATE
-- Substitua o ID do pedido que você está tentando editar
SELECT 
  id,
  numero_sequencial,
  loja_id,
  laboratorio_id,
  status,
  cliente_nome
FROM pedidos
WHERE id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';

| id                                   | numero_sequencial | loja_id                              | laboratorio_id                       | status | cliente_nome         |
| ------------------------------------ | ----------------- | ------------------------------------ | ------------------------------------ | ------ | -------------------- |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | CHEGOU | LAURA VIANA DA SILVA |



-- =====================================================
-- 📋 RESULTADO ESPERADO
-- =====================================================
/*
Se você não consegue editar, provavelmente:

1. A policy "pedidos_update_policy" não existe
2. A policy existe mas tem condições muito restritivas
3. Seu usuário não tem role 'gestor', 'dcl' ou 'financeiro'
4. Seu usuário não tem loja_id que bate com o pedido

SOLUÇÃO: Execute o script de correção após este diagnóstico
*/
