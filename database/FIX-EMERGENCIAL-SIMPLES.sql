-- ============================================================
-- 🚨 REVERSÃO SIMPLES E SEGURA
-- ============================================================
-- Apenas garante permissões básicas para salvar pedidos
-- ============================================================

-- 1. GARANTIR GRANTS EM PEDIDOS
GRANT ALL ON public.pedidos TO anon;
GRANT ALL ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. GARANTIR GRANTS EM TABELAS RELACIONADAS
GRANT ALL ON public.laboratorios TO anon, authenticated;
GRANT ALL ON public.lojas TO anon, authenticated;
GRANT ALL ON public.classe_lente TO anon, authenticated;
GRANT ALL ON public.pedidos_timeline TO anon, authenticated;
GRANT ALL ON public.os_sequencia TO anon, authenticated;

-- 3. GARANTIR GRANTS EM SEQUENCES
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. HABILITAR RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 5. REMOVER POLICIES ANTIGAS
DROP POLICY IF EXISTS anon_all_access ON public.pedidos;
DROP POLICY IF EXISTS authenticated_all_access ON public.pedidos;

-- 6. CRIAR POLICIES PERMISSIVAS
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
  SELECT id INTO v_classe_id FROM classe_lente LIMIT 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTANDO INSERT...';
  RAISE NOTICE '📍 Loja ID: %', v_loja_id;
  RAISE NOTICE '📍 Lab ID: %', v_lab_id;
  RAISE NOTICE '📍 Classe ID: %', v_classe_id;
  RAISE NOTICE '';
  
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
    
    RAISE NOTICE '✅ INSERT FUNCIONOU!';
    RAISE NOTICE '✅ Pedido criado com ID: %', v_test_id;
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '✅ SISTEMA RESTAURADO COM SUCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    
    -- Deletar pedido de teste
    DELETE FROM pedidos WHERE id = v_test_id;
    RAISE NOTICE '✅ Pedido de teste removido';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO AO INSERIR PEDIDO:';
    RAISE NOTICE '   Mensagem: %', SQLERRM;
    RAISE NOTICE '   Código: %', SQLSTATE;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  O problema ainda existe. Execute:';
    RAISE NOTICE '   database/DIAGNOSTICO-COMPLETO-URGENTE.sql';
    RAISE NOTICE '';
  END;
  
END $$;

-- ============================================================
-- ✅ EXECUTE E VEJA O RESULTADO
-- ============================================================
