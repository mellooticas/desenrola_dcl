-- INVESTIGAR MAIS TRIGGERS - Ainda há problemas
-- Mesmo com service role está dando erro, deve haver outros triggers

-- 1. Verificar TODOS os triggers que mencionam laboratorio_sla 
SELECT DISTINCT
  p.proname,
  p.prosecdef,
  p.prosrc
FROM pg_proc p
WHERE p.prosrc ILIKE '%laboratorio_sla%'
  AND p.prosecdef = true;  -- Só as que são SECURITY DEFINER

  Success. No rows returned




-- 2. Verificar se há RLS policies problemáticas
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'laboratorio_sla';

| policyname                | cmd | qual |
| ------------------------- | --- | ---- |
| Allow all laboratorio_sla | ALL | true |

-- 3. Verificar se há outros triggers ativos que podem estar interferindo
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  p.prosecdef
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal  
  AND p.prosecdef = true  -- Só as SECURITY DEFINER
ORDER BY t.tgname;

Success. No rows returned




-- 4. Verificar se há constraints ou foreign keys problemáticos
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'pedidos' OR ccu.table_name = 'laboratorio_sla');


  | constraint_name              | table_name | column_name     | foreign_table_name | foreign_column_name |
| ---------------------------- | ---------- | --------------- | ------------------ | ------------------- |
| pedidos_loja_id_fkey         | pedidos    | loja_id         | lojas              | id                  |
| pedidos_laboratorio_id_fkey  | pedidos    | laboratorio_id  | laboratorios       | id                  |
| pedidos_classe_lente_id_fkey | pedidos    | classe_lente_id | classes_lente      | id                  |
| pedidos_montador_id_fkey     | pedidos    | montador_id     | montadores         | id                  |
| pedidos_vendedor_id_fkey     | pedidos    | vendedor_id     | colaboradores      | id                  |