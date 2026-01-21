-- ============================================================
-- 🚨 FIX EMERGENCIAL - AUTO-DETECTA TABELAS
-- ============================================================
-- Descobre tabelas automaticamente e aplica permissões
-- ============================================================

DO $$
DECLARE
  v_table_name TEXT;
  v_tables TEXT[] := ARRAY['pedidos', 'laboratorios', 'lojas', 'pedidos_timeline', 'os_sequencia'];
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 APLICANDO GRANTS NAS TABELAS...';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Aplicar grants nas tabelas principais
  FOREACH v_table_name IN ARRAY v_tables
  LOOP
    BEGIN
      EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', v_table_name);
      RAISE NOTICE '✅ Grants aplicados em: %', v_table_name;
      v_count := v_count + 1;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE '⚠️  Tabela não existe: %', v_table_name;
    END;
  END LOOP;
  
  -- Tentar também com nomes alternativos para classe_lente
  BEGIN
    EXECUTE 'GRANT ALL ON public.classe_lente TO anon, authenticated, service_role';
    RAISE NOTICE '✅ Grants aplicados em: classe_lente';
  EXCEPTION WHEN undefined_table THEN
    BEGIN
      EXECUTE 'GRANT ALL ON public.classes_lente TO anon, authenticated, service_role';
      RAISE NOTICE '✅ Grants aplicados em: classes_lente';
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE '⚠️  Tabela classe_lente/classes_lente não encontrada';
    END;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total de tabelas com grants: %', v_count;
  
END $$;

-- Garantir USAGE no schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Garantir grants em sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Habilitar RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS anon_all_access ON public.pedidos;
DROP POLICY IF EXISTS authenticated_all_access ON public.pedidos;

-- Criar policies permissivas
CREATE POLICY anon_all_access ON public.pedidos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY authenticated_all_access ON public.pedidos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TESTE DE INSERT
-- ============================================================

DO $$
DECLARE
  v_loja_id uuid;
  v_lab_id uuid;
  v_classe_id uuid;
  v_test_id uuid;
BEGIN
  -- Pegar IDs reais
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;
  SELECT id INTO v_lab_id FROM laboratorios WHERE ativo = true LIMIT 1;
  
  -- Tentar pegar de classe_lente ou classes_lente
  BEGIN
    SELECT id INTO v_classe_id FROM classe_lente LIMIT 1;
  EXCEPTION WHEN undefined_table THEN
    BEGIN
      SELECT id INTO v_classe_id FROM classes_lente LIMIT 1;
    EXCEPTION WHEN undefined_table THEN
      v_classe_id := NULL;
    END;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🧪 TESTANDO INSERT DE PEDIDO...';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📍 Loja ID: %', v_loja_id;
  RAISE NOTICE '📍 Lab ID: %', v_lab_id;
  RAISE NOTICE '📍 Classe ID: %', v_classe_id;
  RAISE NOTICE '';
  
  IF v_loja_id IS NULL THEN
    RAISE NOTICE '❌ Nenhuma loja encontrada!';
    RETURN;
  END IF;
  
  IF v_lab_id IS NULL THEN
    RAISE NOTICE '❌ Nenhum laboratório ativo encontrado!';
    RETURN;
  END IF;
  
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
      'TESTE REVERSAO',
      CURRENT_DATE
    ) RETURNING id INTO v_test_id;
    
    RAISE NOTICE '✅✅✅ INSERT FUNCIONOU! ✅✅✅';
    RAISE NOTICE '✅ Pedido criado com ID: %', v_test_id;
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '🎉 SISTEMA RESTAURADO COM SUCESSO! 🎉';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Você já pode criar pedidos normalmente!';
    RAISE NOTICE '';
    
    -- Deletar pedido de teste
    DELETE FROM pedidos WHERE id = v_test_id;
    RAISE NOTICE '🗑️  Pedido de teste removido';
    RAISE NOTICE '';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌❌❌ ERRO AO INSERIR PEDIDO ❌❌❌';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Detalhes do erro:';
    RAISE NOTICE '   Mensagem: %', SQLERRM;
    RAISE NOTICE '   Código SQL: %', SQLSTATE;
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Próximo passo:';
    RAISE NOTICE '   Execute: database/DIAGNOSTICO-COMPLETO-URGENTE.sql';
    RAISE NOTICE '   E envie o resultado completo';
    RAISE NOTICE '';
  END;
  
END $$;

-- ============================================================
-- ✅ EXECUTE E VEJA O RESULTADO
-- ============================================================
