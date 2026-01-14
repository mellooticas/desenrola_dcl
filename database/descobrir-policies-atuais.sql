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

| schemaname | tablename | policyname                 | permissive | roles           | cmd    | using_expression | with_check_expression |
| ---------- | --------- | -------------------------- | ---------- | --------------- | ------ | ---------------- | --------------------- |
| public     | pedidos   | policy_anon_select_pedidos | PERMISSIVE | {anon}          | SELECT | true             | null                  |
| public     | pedidos   | policy_universal_pedidos   | PERMISSIVE | {authenticated} | ALL    | true             | true                  |


-- 2. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'pedidos';

| schemaname | tablename | rowsecurity |
| ---------- | --------- | ----------- |
| public     | pedidos   | true        |



-- 3. Verificar permissões GRANT na tabela
SELECT 
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'pedidos'
  AND grantee IN ('authenticated', 'anon')
GROUP BY grantee;


| grantee       | privileges                                                    |
| ------------- | ------------------------------------------------------------- |
| anon          | INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER |
| authenticated | INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER |


-- 4. Testar contexto do usuário atual
SELECT 
  current_user as usuario_atual,
  current_setting('role') as role_atual;


| usuario_atual | role_atual |
| ------------- | ---------- |
| postgres      | none       |


-- 5. Verificar triggers que podem interferir
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND event_manipulation = 'UPDATE';


| trigger_name                          | event_manipulation | action_statement                                       |
| ------------------------------------- | ------------------ | ------------------------------------------------------ |
| trigger_atualizar_datas_pedido        | UPDATE             | EXECUTE FUNCTION trigger_atualizar_datas_pedido()      |
| trigger_calcular_margem_lente         | UPDATE             | EXECUTE FUNCTION calcular_margem_lente()               |
| trigger_controle_os                   | UPDATE             | EXECUTE FUNCTION sync_controle_os()                    |
| trigger_criar_evento_timeline         | UPDATE             | EXECUTE FUNCTION trigger_criar_evento_timeline()       |
| trigger_pedido_adicionar_os_sequencia | UPDATE             | EXECUTE FUNCTION trigger_auto_adicionar_os_sequencia() |
| trigger_pedidos_timeline              | UPDATE             | EXECUTE FUNCTION inserir_timeline_pedido()             |
| trigger_populate_data_prometida       | UPDATE             | EXECUTE FUNCTION populate_data_prometida()             |
