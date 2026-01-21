-- ============================================================
-- HABILITAR triggers de pedidos novamente
-- ============================================================
-- Execute este script DEPOIS de testar com triggers desabilitados
-- ============================================================

DO $$
DECLARE
  schema_pedidos TEXT;
  trigger_rec RECORD;
BEGIN
  -- Descobrir schema da tabela pedidos
  SELECT table_schema INTO schema_pedidos
  FROM information_schema.tables
  WHERE table_name = 'pedidos' 
  LIMIT 1;
  
  IF schema_pedidos IS NULL THEN
    RAISE EXCEPTION 'Tabela pedidos não encontrada!';
  END IF;
  
  RAISE NOTICE '📍 Tabela encontrada: %.pedidos', schema_pedidos;
  RAISE NOTICE '';
  RAISE NOTICE '▶️  HABILITANDO TRIGGERS...';
  RAISE NOTICE '';
  
  -- Listar e habilitar todos os triggers
  FOR trigger_rec IN
    SELECT t.tgname AS trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relname = 'pedidos'
      AND n.nspname = schema_pedidos
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('ALTER TABLE %I.pedidos ENABLE TRIGGER %I',
      schema_pedidos, trigger_rec.trigger_name);
    
    RAISE NOTICE '  ▶️  Habilitado: %', trigger_rec.trigger_name;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Triggers habilitados novamente';
END $$;

-- ============================================================
-- ✅ EXECUTAR APÓS DIAGNOSTICAR O PROBLEMA
-- ============================================================
