-- ============================================================
-- 🚨 REVERSÃO DE EMERGÊNCIA - DESFAZER MUDANÇAS DE HOJE
-- ============================================================
-- Execute APENAS se confirmado que as mudanças de hoje quebraram o sistema
-- ============================================================

DO $$
DECLARE
  schema_pedidos TEXT;
BEGIN
  -- Descobrir schema da tabela pedidos
  SELECT table_schema INTO schema_pedidos
  FROM information_schema.tables
  WHERE table_name = 'pedidos' 
  LIMIT 1;
  
  IF schema_pedidos IS NULL THEN
    RAISE EXCEPTION 'Tabela pedidos não encontrada!';
  END IF;
  
  RAISE NOTICE '📍 Schema encontrado: %', schema_pedidos;
  
  -- ========== 1. GARANTIR QUE TODOS OS TRIGGERS ESTÃO HABILITADOS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  HABILITANDO TODOS OS TRIGGERS DE USUÁRIO...';
  
  -- Habilitar apenas triggers de usuário (não de sistema)
  DECLARE
    trigger_rec RECORD;
    v_count INTEGER := 0;
  BEGIN
    FOR trigger_rec IN
      SELECT t.tgname AS trigger_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = 'pedidos'
        AND n.nspname = schema_pedidos
        AND NOT t.tgisinternal  -- Apenas triggers de usuário
    LOOP
      EXECUTE format('ALTER TABLE %I.pedidos ENABLE TRIGGER %I',
        schema_pedidos, trigger_rec.trigger_name);
      
      v_count := v_count + 1;
      RAISE NOTICE '  ✅ Habilitado: %', trigger_rec.trigger_name;
    END LOOP;
    
    RAISE NOTICE '✅ % triggers habilitados', v_count;
  END;
  
  -- ========== 2. VERIFICAR/CRIAR RLS POLICIES BÁSICAS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  VERIFICANDO RLS POLICIES...';
  
  -- Deletar policies problemáticas se existirem
  BEGIN
    EXECUTE format('DROP POLICY IF EXISTS anon_all_access ON %I.pedidos', schema_pedidos);
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all_access ON %I.pedidos', schema_pedidos);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao deletar policies antigas: %', SQLERRM;
  END;
  
  -- Criar policies permissivas (emergencial)
  BEGIN
    EXECUTE format('
      CREATE POLICY anon_all_access ON %I.pedidos
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true)
    ', schema_pedidos);
    
    RAISE NOTICE '✅ Policy anon_all_access criada';
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE '⚠️  Policy anon_all_access já existe';
  END;
  
  BEGIN
    EXECUTE format('
      CREATE POLICY authenticated_all_access ON %I.pedidos
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)
    ', schema_pedidos);
    
    RAISE NOTICE '✅ Policy authenticated_all_access criada';
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE '⚠️  Policy authenticated_all_access já existe';
  END;
  
  -- ========== 3. GARANTIR GRANTS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  GARANTINDO GRANTS...';
  
  EXECUTE format('GRANT ALL ON %I.pedidos TO anon', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.pedidos TO authenticated', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.pedidos TO service_role', schema_pedidos);
  
  RAISE NOTICE '✅ Grants aplicados';
  
  -- ========== 4. GARANTIR QUE STATUS É TEXT (não ENUM) ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  VERIFICANDO TIPO DA COLUNA STATUS...';
  
  DECLARE
    v_data_type TEXT;
  BEGIN
    SELECT data_type INTO v_data_type
    FROM information_schema.columns
    WHERE table_name = 'pedidos'
      AND column_name = 'status';
    
    RAISE NOTICE '📍 Tipo atual de status: %', v_data_type;
    
    IF v_data_type = 'USER-DEFINED' THEN
      RAISE NOTICE '⚠️  Status é ENUM - convertendo para TEXT...';
      
      -- Converter ENUM para TEXT
      EXECUTE format('ALTER TABLE %I.pedidos ALTER COLUMN status TYPE TEXT', schema_pedidos);
      
      -- Adicionar constraint CHECK para validação
      EXECUTE format('
        ALTER TABLE %I.pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check
      ', schema_pedidos);
      
      EXECUTE format('
        ALTER TABLE %I.pedidos ADD CONSTRAINT pedidos_status_check
        CHECK (status IN (
          ''PENDENTE'', ''REGISTRADO'', ''AG_PAGAMENTO'', ''PAGO'',
          ''PRODUCAO'', ''PRONTO'', ''ENVIADO'', ''CHEGOU'',
          ''ENTREGUE'', ''FINALIZADO'', ''CANCELADO''
        ))
      ', schema_pedidos);
      
      RAISE NOTICE '✅ Status convertido para TEXT com CHECK constraint';
    ELSE
      RAISE NOTICE '✅ Status já é TEXT';
    END IF;
  END;
  
  -- ========== 5. GARANTIR SEQUENCE DE OS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  VERIFICANDO SEQUENCE DE OS...';
  
  BEGIN
    EXECUTE format('
      CREATE SEQUENCE IF NOT EXISTS %I.pedidos_numero_sequencial_seq
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1
    ', schema_pedidos);
    
    -- Ajustar sequence para próximo número disponível
    DECLARE
      v_max_seq INTEGER;
    BEGIN
      EXECUTE format('SELECT COALESCE(MAX(numero_sequencial), 0) FROM %I.pedidos', schema_pedidos)
        INTO v_max_seq;
      
      IF v_max_seq > 0 THEN
        EXECUTE format('ALTER SEQUENCE %I.pedidos_numero_sequencial_seq RESTART WITH %s', 
          schema_pedidos, v_max_seq + 1);
        RAISE NOTICE '✅ Sequence ajustada para próximo valor: %', v_max_seq + 1;
      END IF;
    END;
  END;
  
  -- ========== RESUMO ==========
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ REVERSÃO DE EMERGÊNCIA CONCLUÍDA';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 O que foi feito:';
  RAISE NOTICE '  1. ✅ Triggers habilitados';
  RAISE NOTICE '  2. ✅ RLS policies recriadas (permissivas)';
  RAISE NOTICE '  3. ✅ Grants garantidos';
  RAISE NOTICE '  4. ✅ Tipo de status verificado/corrigido';
  RAISE NOTICE '  5. ✅ Sequence verificada';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE AGORA: Tente criar um pedido no sistema';
  RAISE NOTICE '';
  
END $$;

-- ============================================================
-- ✅ EXECUTE E TESTE CRIAR UM PEDIDO
-- ============================================================
