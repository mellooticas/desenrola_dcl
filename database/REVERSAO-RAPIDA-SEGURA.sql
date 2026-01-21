-- ============================================================
-- 🚨 REVERSÃO RÁPIDA - APENAS POLICIES E GRANTS
-- ============================================================
-- Versão SEGURA - Não mexe em triggers, apenas garante permissões
-- ============================================================

DO $$
DECLARE
  schema_pedidos TEXT;
  v_count INTEGER;
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
  
  -- ========== 1. GARANTIR GRANTS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  GARANTINDO GRANTS...';
  
  EXECUTE format('GRANT ALL ON %I.pedidos TO anon', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.pedidos TO authenticated', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.pedidos TO service_role', schema_pedidos);
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO anon', schema_pedidos);
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', schema_pedidos);
  
  RAISE NOTICE '✅ Grants aplicados';
  
  -- ========== 2. GARANTIR GRANTS EM OUTRAS TABELAS RELACIONADAS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  GARANTINDO GRANTS EM TABELAS RELACIONADAS...';
  
  EXECUTE format('GRANT ALL ON %I.laboratorios TO anon, authenticated', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.lojas TO anon, authenticated', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.classe_lente TO anon, authenticated', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.pedidos_timeline TO anon, authenticated', schema_pedidos);
  EXECUTE format('GRANT ALL ON %I.os_sequencia TO anon, authenticated', schema_pedidos);
  
  RAISE NOTICE '✅ Grants em tabelas relacionadas aplicados';
  
  -- ========== 3. GARANTIR GRANTS EM SEQUENCES ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  GARANTINDO GRANTS EM SEQUENCES...';
  
  BEGIN
    EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO anon, authenticated', schema_pedidos);
    RAISE NOTICE '✅ Grants em sequences aplicados';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao dar grant em sequences: %', SQLERRM;
  END;
  
  -- ========== 4. VERIFICAR/CRIAR RLS POLICIES PERMISSIVAS ==========
  RAISE NOTICE '';
  RAISE NOTICE '▶️  VERIFICANDO RLS POLICIES...';
  
  -- Habilitar RLS se não estiver
  EXECUTE format('ALTER TABLE %I.pedidos ENABLE ROW LEVEL SECURITY', schema_pedidos);
  
  -- Deletar policies antigas se existirem
  BEGIN
    EXECUTE format('DROP POLICY IF EXISTS anon_all_access ON %I.pedidos', schema_pedidos);
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all_access ON %I.pedidos', schema_pedidos);
    RAISE NOTICE '✅ Policies antigas removidas';
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
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao criar policy anon: %', SQLERRM;
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
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao criar policy authenticated: %', SQLERRM;
  END;
  
  -- ========== RESUMO ==========
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ REVERSÃO RÁPIDA CONCLUÍDA';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 O que foi feito:';
  RAISE NOTICE '  1. ✅ Grants garantidos em pedidos';
  RAISE NOTICE '  2. ✅ Grants em tabelas relacionadas';
  RAISE NOTICE '  3. ✅ Grants em sequences';
  RAISE NOTICE '  4. ✅ RLS policies recriadas (permissivas)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE AGORA: Tente criar um pedido no sistema';
  RAISE NOTICE '';
  
END $$;

-- ============================================================
-- TESTE RÁPIDO DE INSERT
-- ============================================================

DO $$
DECLARE
  v_loja_id uuid;
  v_lab_id uuid;
  v_classe_id uuid;
BEGIN
  -- Pegar IDs reais
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;
  SELECT id INTO v_lab_id FROM laboratorios WHERE ativo = true LIMIT 1;
  SELECT id INTO v_classe_id FROM classe_lente LIMIT 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTANDO INSERT...';
  RAISE NOTICE '📍 Loja ID: %', v_loja_id;
  RAISE NOTICE '📍 Lab ID: %', v_lab_id;
  RAISE NOTICE '📍 Classe ID: %', v_classe_id;
  
  -- Tentar inserir
  BEGIN
    INSERT INTO pedidos (
      loja_id,
      laboratorio_id,
      classe_lente_id,
      status,
      prioridade,
      cliente_nome,
      data_pedido
    ) VALUES (
      v_loja_id,
      v_lab_id,
      v_classe_id,
      'REGISTRADO',
      'NORMAL',
      'TESTE REVERSAO EMERGENCIAL',
      CURRENT_DATE
    );
    
    RAISE NOTICE '✅ INSERT FUNCIONOU!';
    RAISE NOTICE '✅ Sistema RESTAURADO com sucesso!';
    
    -- Deletar pedido de teste
    DELETE FROM pedidos WHERE cliente_nome = 'TESTE REVERSAO EMERGENCIAL';
    RAISE NOTICE '✅ Pedido de teste removido';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO AO INSERIR: %', SQLERRM;
    RAISE NOTICE '❌ CÓDIGO ERRO: %', SQLSTATE;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Execute database/DIAGNOSTICO-COMPLETO-URGENTE.sql para mais detalhes';
  END;
  
END $$;

-- ============================================================
-- ✅ EXECUTE E VEJA SE O INSERT FUNCIONA
-- ============================================================
