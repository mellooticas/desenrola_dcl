-- ============================================================
-- DESABILITAR APENAS TRIGGERS PESADOS (TESTE ISOLADO)
-- ============================================================
-- Desabilita apenas os triggers que podem causar timeout
-- Mantém os críticos para exibição (timeline, etc)
-- ============================================================

DO $$
DECLARE
  schema_pedidos TEXT;
BEGIN
  SELECT table_schema INTO schema_pedidos
  FROM information_schema.tables
  WHERE table_name = 'pedidos'
  LIMIT 1;
  
  RAISE NOTICE '📍 Tabela: %.pedidos', schema_pedidos;
  RAISE NOTICE '';
  RAISE NOTICE '⏸️  DESABILITANDO TRIGGERS PESADOS...';
  RAISE NOTICE '';
  
  -- Desabilitar apenas os triggers suspeitos de causar timeout
  
  -- 1. trigger_controle_os (pode ser muito pesado)
  BEGIN
    EXECUTE format('ALTER TABLE %I.pedidos DISABLE TRIGGER trigger_controle_os', schema_pedidos);
    RAISE NOTICE '  ⏸️  Desabilitado: trigger_controle_os';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '  ⚠️  Não encontrado: trigger_controle_os';
  END;
  
  -- 2. trigger_pedido_adicionar_os_sequencia (duplicado do otimizado)
  BEGIN
    EXECUTE format('ALTER TABLE %I.pedidos DISABLE TRIGGER trigger_pedido_adicionar_os_sequencia', schema_pedidos);
    RAISE NOTICE '  ⏸️  Desabilitado: trigger_pedido_adicionar_os_sequencia';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '  ⚠️  Não encontrado: trigger_pedido_adicionar_os_sequencia';
  END;
  
  -- 3. trigger_populate_data_prometida (pode fazer cálculos complexos)
  BEGIN
    EXECUTE format('ALTER TABLE %I.pedidos DISABLE TRIGGER trigger_populate_data_prometida', schema_pedidos);
    RAISE NOTICE '  ⏸️  Desabilitado: trigger_populate_data_prometida';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '  ⚠️  Não encontrado: trigger_populate_data_prometida';
  END;
  
  -- 4. trigger_calcular_margem_lente (pode ser pesado)
  BEGIN
    EXECUTE format('ALTER TABLE %I.pedidos DISABLE TRIGGER trigger_calcular_margem_lente', schema_pedidos);
    RAISE NOTICE '  ⏸️  Desabilitado: trigger_calcular_margem_lente';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '  ⚠️  Não encontrado: trigger_calcular_margem_lente';
  END;
  
  -- 5. trigger_atualizar_datas_pedido (pode ser pesado)
  BEGIN
    EXECUTE format('ALTER TABLE %I.pedidos DISABLE TRIGGER trigger_atualizar_datas_pedido', schema_pedidos);
    RAISE NOTICE '  ⏸️  Desabilitado: trigger_atualizar_datas_pedido';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '  ⚠️  Não encontrado: trigger_atualizar_datas_pedido';
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Triggers pesados desabilitados';
  RAISE NOTICE 'ℹ️  Mantidos ativos: timeline e eventos (para exibir kanban)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE criar pedido agora';
  RAISE NOTICE '🔄 Para habilitar: database/HABILITAR-TRIGGERS-PEDIDOS.sql';
END $$;

-- ============================================================
-- ✅ EXECUTAR APÓS REABILITAR TODOS OS TRIGGERS
-- ============================================================
