-- DESABILITAR TODOS OS TRIGGERS TEMPORARIAMENTE
-- Para testar se o problema é realmente nos triggers

-- 1. Listar todos os triggers ativos
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 2. Desabilitar TODOS os triggers da tabela pedidos
ALTER TABLE pedidos DISABLE TRIGGER ALL;

-- 3. Verificar se foram desabilitados
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' 
       WHEN t.tgenabled = 'D' THEN 'disabled' 
       ELSE 'other' END as status,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;