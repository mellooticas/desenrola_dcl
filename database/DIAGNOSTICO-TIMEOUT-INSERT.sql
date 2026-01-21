-- ============================================================
-- DIAGNÓSTICO: Performance do INSERT em pedidos
-- ============================================================
-- Objetivo: Descobrir o que está causando timeout no INSERT
-- ============================================================

-- 1. LISTAR TRIGGERS ATIVOS na tabela pedidos
SELECT 
  n.nspname as schema_name,
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  CASE t.tgtype & 1 WHEN 1 THEN 'ROW' ELSE 'STATEMENT' END AS level,
  CASE t.tgtype & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END AS timing,
  CASE t.tgtype & 28
    WHEN 4 THEN 'INSERT'
    WHEN 8 THEN 'DELETE'
    WHEN 16 THEN 'UPDATE'
    WHEN 12 THEN 'INSERT OR DELETE'
    WHEN 20 THEN 'INSERT OR UPDATE'
    WHEN 24 THEN 'DELETE OR UPDATE'
    WHEN 28 THEN 'INSERT OR DELETE OR UPDATE'
  END AS event,
  t.tgenabled AS enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND NOT t.tgisinternal
ORDER BY timing, event;

| schema_name | trigger_name                          | table_name | function_name                       | level | timing | event            | enabled |
| ----------- | ------------------------------------- | ---------- | ----------------------------------- | ----- | ------ | ---------------- | ------- |
| public      | trigger_criar_evento_timeline         | pedidos    | trigger_criar_evento_timeline       | ROW   | AFTER  | INSERT OR UPDATE | O       |
| public      | trigger_pedido_adicionar_os_sequencia | pedidos    | trigger_auto_adicionar_os_sequencia | ROW   | AFTER  | INSERT OR UPDATE | O       |
| public      | trigger_pedidos_timeline              | pedidos    | inserir_timeline_pedido             | ROW   | AFTER  | INSERT OR UPDATE | O       |
| public      | trigger_controle_os                   | pedidos    | sync_controle_os                    | ROW   | AFTER  | INSERT OR UPDATE | O       |
| public      | trigger_populate_data_prometida       | pedidos    | populate_data_prometida             | ROW   | BEFORE | INSERT OR UPDATE | O       |
| public      | trigger_calcular_margem_lente         | pedidos    | calcular_margem_lente               | ROW   | BEFORE | INSERT OR UPDATE | O       |
| public      | trigger_atualizar_datas_pedido        | pedidos    | trigger_atualizar_datas_pedido      | ROW   | BEFORE | INSERT OR UPDATE | O       |
| public      | trigger_auto_enviar_montagem          | pedidos    | trigger_auto_enviar_montagem        | ROW   | BEFORE | UPDATE           | O       |



-- 2. LISTAR POLICIES RLS ATIVAS na tabela pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY cmd, policyname;


| schemaname | tablename | policyname               | permissive | roles           | cmd | using_expression | with_check_expression |
| ---------- | --------- | ------------------------ | ---------- | --------------- | --- | ---------------- | --------------------- |
| public     | pedidos   | anon_all_access          | PERMISSIVE | {anon}          | ALL | true             | true                  |
| public     | pedidos   | authenticated_all_access | PERMISSIVE | {authenticated} | ALL | true             | true                  |

-- 3. VERIFICAR ÍNDICES na tabela pedidos
SELECT 
  i.relname AS index_name,
  a.attname AS column_name,
  am.amname AS index_type,
  ix.indisunique AS is_unique,
  ix.indisprimary AS is_primary
FROM pg_index ix
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
JOIN pg_am am ON i.relam = am.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'pedidos'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY i.relname, a.attnum;


| index_name                         | column_name            | index_type | is_unique | is_primary |
| ---------------------------------- | ---------------------- | ---------- | --------- | ---------- |
| idx_pedidos_armacao_id             | armacao_id             | btree      | false     | false      |
| idx_pedidos_classe_lente           | classe_lente           | btree      | false     | false      |
| idx_pedidos_classe_lente_id        | classe_lente_id        | btree      | false     | false      |
| idx_pedidos_created_at             | created_at             | btree      | false     | false      |
| idx_pedidos_data_os                | data_os                | btree      | false     | false      |
| idx_pedidos_data_pedido            | data_pedido            | btree      | false     | false      |
| idx_pedidos_data_prevista_pronto   | data_prevista_pronto   | btree      | false     | false      |
| idx_pedidos_fornecedor_catalogo_id | fornecedor_catalogo_id | btree      | false     | false      |
| idx_pedidos_fornecedor_lente       | fornecedor_lente_id    | btree      | false     | false      |
| idx_pedidos_fornecedor_lente_id    | fornecedor_lente_id    | btree      | false     | false      |
| idx_pedidos_fornecedor_nome        | fornecedor_nome        | btree      | false     | false      |
| idx_pedidos_garantia               | eh_garantia            | btree      | false     | false      |
| idx_pedidos_grupo_canonico         | grupo_canonico_id      | btree      | false     | false      |
| idx_pedidos_grupo_canonico_id      | grupo_canonico_id      | btree      | false     | false      |
| idx_pedidos_laboratorio            | laboratorio_id         | btree      | false     | false      |
| idx_pedidos_laboratorio_data       | laboratorio_id         | btree      | false     | false      |
| idx_pedidos_laboratorio_data       | data_pedido            | btree      | false     | false      |
| idx_pedidos_laboratorio_id         | laboratorio_id         | btree      | false     | false      |
| idx_pedidos_lente_catalogo_id      | lente_catalogo_id      | btree      | false     | false      |
| idx_pedidos_lente_selecionada      | lente_selecionada_id   | btree      | false     | false      |
| idx_pedidos_lente_selecionada_id   | lente_selecionada_id   | btree      | false     | false      |
| idx_pedidos_loja                   | loja_id                | btree      | false     | false      |
| idx_pedidos_loja_id                | loja_id                | btree      | false     | false      |
| idx_pedidos_numero_os              | numero_os_fisica       | btree      | false     | false      |
| idx_pedidos_numero_os_fisica       | numero_os_fisica       | btree      | false     | false      |
| idx_pedidos_os_fisica              | os_fisica              | btree      | false     | false      |
| idx_pedidos_os_laboratorio         | os_laboratorio         | btree      | false     | false      |
| idx_pedidos_selecao_automatica     | selecao_automatica     | btree      | false     | false      |
| idx_pedidos_status                 | status                 | btree      | false     | false      |
| idx_pedidos_status_data            | status                 | btree      | false     | false      |
| idx_pedidos_status_data            | data_pedido            | btree      | false     | false      |
| idx_pedidos_tipo_pedido            | tipo_pedido            | btree      | false     | false      |
| idx_pedidos_tratamentos_lente      | tratamentos_lente      | gin        | false     | false      |
| idx_pedidos_updated_at             | updated_at             | btree      | false     | false      |
| pedidos_numero_sequencial_key      | numero_sequencial      | btree      | true      | false      |
| pedidos_pkey                       | id                     | btree      | true      | true       |


-- 4. CONTAR PEDIDOS (para entender volume de dados)
DO $$
DECLARE
  schema_pedidos TEXT;
  total_pedidos INTEGER;
BEGIN
  SELECT table_schema INTO schema_pedidos
  FROM information_schema.tables
  WHERE table_name = 'pedidos'
  LIMIT 1;
  
  EXECUTE format('SELECT COUNT(*) FROM %I.pedidos', schema_pedidos)
  INTO total_pedidos;
  
  RAISE NOTICE 'Total de pedidos no banco: %', total_pedidos;
END $$;

Success. No rows returned



-- 5. VERIFICAR SE HÁ FOREIGN KEYS que podem causar locks
SELECT
  tc.constraint_name,
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'pedidos';


| constraint_name              | from_table | from_column     | to_table      | to_column |
| ---------------------------- | ---------- | --------------- | ------------- | --------- |
| pedidos_loja_id_fkey         | pedidos    | loja_id         | lojas         | id        |
| pedidos_laboratorio_id_fkey  | pedidos    | laboratorio_id  | laboratorios  | id        |
| pedidos_classe_lente_id_fkey | pedidos    | classe_lente_id | classes_lente | id        |
| pedidos_montador_id_fkey     | pedidos    | montador_id     | montadores    | id        |
| pedidos_vendedor_id_fkey     | pedidos    | vendedor_id     | colaboradores | id        |


-- ============================================================
-- ✅ EXECUTAR ESTE SCRIPT PARA DIAGNOSTICAR O TIMEOUT
-- ============================================================
