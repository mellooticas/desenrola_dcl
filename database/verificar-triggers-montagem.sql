-- VERIFICAR TRIGGERS DE MONTAGEM
-- Execute e me envie os resultados

-- Query 1: Listar triggers na tabela pedidos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
ORDER BY trigger_name;

-- Query 2: Ver código dos triggers relacionados a montagem/montador
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    p.proname LIKE '%montag%' 
    OR p.proname LIKE '%montador%'
  )
ORDER BY p.proname;

-- Query 3: Verificar se existe trigger para data_envio_montagem
SELECT 
    t.trigger_name,
    t.event_manipulation,
    p.proname as function_name
FROM information_schema.triggers t
JOIN pg_trigger tg ON tg.tgname = t.trigger_name
JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE t.event_object_table = 'pedidos'
  AND (
    p.proname LIKE '%montag%' 
    OR p.proname LIKE '%data%'
    OR p.proname LIKE '%envio%'
  )
ORDER BY t.trigger_name;
