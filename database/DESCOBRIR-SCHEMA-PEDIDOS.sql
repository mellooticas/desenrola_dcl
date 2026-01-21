-- ============================================================
-- DIAGNÓSTICO: Descobrir schema da tabela pedidos
-- ============================================================

-- 1. Listar todos os schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema_name;

-- 2. Procurar tabela pedidos em todos os schemas
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'pedidos'
ORDER BY table_schema;

-- 3. Ver estrutura da coluna status (em qualquer schema)
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type,
  udt_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name = 'status';

-- 4. Ver constraints da tabela pedidos (em qualquer schema)
SELECT 
  n.nspname as schema_name,
  c.conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'pedidos'
  AND c.contype = 'c'; -- CHECK constraints

-- ============================================================
-- ✅ EXECUTAR ESTE SCRIPT PRIMEIRO
-- ============================================================
