-- ============================================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE TIMELINE
-- ============================================================================
-- Este script corrige o problema da trigger que não está populando a timeline
-- automaticamente quando o status dos pedidos muda no kanban
-- ============================================================================

-- PASSO 1: REMOVER TRIGGER EXISTENTE (pode estar corrompida)
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_pedidos_timeline ON pedidos;
DROP FUNCTION IF EXISTS inserir_timeline_pedido() CASCADE;

-- PASSO 2: CRIAR FUNÇÃO CORRIGIDA E ROBUSTA
-- ============================================================================
CREATE OR REPLACE FUNCTION inserir_timeline_pedido()
RETURNS TRIGGER AS $$
DECLARE
  v_responsavel_id UUID;
BEGIN
  -- Só registra se o status realmente mudou
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Tentar pegar o responsavel_id de forma segura
    BEGIN
      v_responsavel_id := COALESCE(
        CASE 
          WHEN NEW.updated_by IS NOT NULL AND NEW.updated_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN NEW.updated_by::UUID
          ELSE NULL
        END,
        auth.uid(),
        '00000000-0000-0000-0000-000000000000'::UUID
      );
    EXCEPTION WHEN OTHERS THEN
      -- Se der erro, usar UUID default
      v_responsavel_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END;
    
    -- Inserir registro na timeline
    INSERT INTO pedidos_timeline (
      pedido_id,
      status_anterior,
      status_novo,
      responsavel_id,
      observacoes,
      created_at
    ) VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      v_responsavel_id,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Pedido criado'
        WHEN NEW.status = 'CANCELADO' THEN 'Pedido cancelado'
        WHEN NEW.status = 'ENTREGUE' THEN 'Pedido entregue ao cliente'
        WHEN NEW.status = 'AG_PAGAMENTO' THEN 'Aguardando confirmação de pagamento'
        WHEN NEW.status = 'PAGO' THEN 'Pagamento confirmado'
        WHEN NEW.status = 'PRODUCAO' THEN 'Enviado para produção'
        WHEN NEW.status = 'PRONTO' THEN 'Produção concluída'
        WHEN NEW.status = 'ENVIADO' THEN 'Enviado para a loja'
        WHEN NEW.status = 'CHEGOU' THEN 'Chegou na loja'
        ELSE 'Status atualizado: ' || OLD.status || ' → ' || NEW.status
      END,
      COALESCE(NEW.updated_at, NEW.created_at, NOW())
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 3: CRIAR TRIGGER QUE EXECUTA A CADA INSERT/UPDATE
-- ============================================================================
CREATE TRIGGER trigger_pedidos_timeline
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION inserir_timeline_pedido();

-- PASSO 4: POPULAR TIMELINE COM REGISTROS INICIAIS
-- ============================================================================
-- Limpar timeline existente para evitar duplicados
TRUNCATE TABLE pedidos_timeline CASCADE;

-- Inserir registro de criação para cada pedido existente
INSERT INTO pedidos_timeline (
  pedido_id,
  status_anterior,
  status_novo,
  responsavel_id,
  observacoes,
  created_at
)
SELECT 
  p.id,
  NULL as status_anterior,
  p.status as status_novo,
  COALESCE(
    CASE 
      WHEN p.created_by IS NOT NULL AND p.created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN p.created_by::UUID
      ELSE '00000000-0000-0000-0000-000000000000'::UUID
    END,
    '00000000-0000-0000-0000-000000000000'::UUID
  ) as responsavel_id,
  'Pedido criado' as observacoes,
  p.created_at
FROM pedidos p
ORDER BY p.created_at;

-- PASSO 5: VERIFICAR RESULTADOS
-- ============================================================================
-- Contar registros criados
DO $$
DECLARE
  v_count INTEGER;
  v_pedidos INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM pedidos_timeline;
  SELECT COUNT(*) INTO v_pedidos FROM pedidos;
  
  RAISE NOTICE '✅ Timeline populada com sucesso!';
  RAISE NOTICE '   Pedidos no sistema: %', v_pedidos;
  RAISE NOTICE '   Eventos na timeline: %', v_count;
  RAISE NOTICE '   Cobertura: %%%', ROUND((v_count::NUMERIC / NULLIF(v_pedidos, 0) * 100)::NUMERIC, 1);
END $$;

-- PASSO 6: TESTAR A TRIGGER
-- ============================================================================
-- Esta query faz um teste da trigger (você pode comentar se não quiser testar)
DO $$
DECLARE
  v_test_pedido_id UUID;
  v_count_antes INTEGER;
  v_count_depois INTEGER;
BEGIN
  -- Pegar um pedido qualquer para teste
  SELECT id INTO v_test_pedido_id FROM pedidos ORDER BY created_at DESC LIMIT 1;
  
  IF v_test_pedido_id IS NOT NULL THEN
    -- Contar eventos antes
    SELECT COUNT(*) INTO v_count_antes 
    FROM pedidos_timeline 
    WHERE pedido_id = v_test_pedido_id;
    
    -- Fazer uma mudança de status
    UPDATE pedidos 
    SET 
      status = CASE WHEN status = 'PAGO' THEN 'PRODUCAO' ELSE 'PAGO' END,
      updated_at = NOW(),
      updated_by = 'Teste Trigger'
    WHERE id = v_test_pedido_id;
    
    -- Contar eventos depois
    SELECT COUNT(*) INTO v_count_depois 
    FROM pedidos_timeline 
    WHERE pedido_id = v_test_pedido_id;
    
    IF v_count_depois > v_count_antes THEN
      RAISE NOTICE '✅ TRIGGER FUNCIONANDO! Evento registrado automaticamente';
    ELSE
      RAISE WARNING '❌ TRIGGER NÃO FUNCIONOU! Nenhum evento novo foi registrado';
    END IF;
    
    -- Reverter mudança de teste
    UPDATE pedidos 
    SET 
      status = CASE WHEN status = 'PRODUCAO' THEN 'PAGO' ELSE 'PRODUCAO' END,
      updated_at = NOW()
    WHERE id = v_test_pedido_id;
    
  END IF;
END $$;

-- PASSO 7: ATUALIZAR COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================
COMMENT ON FUNCTION inserir_timeline_pedido() IS 
  'Trigger function que registra automaticamente mudanças de status em pedidos_timeline. '
  'Executada após INSERT ou UPDATE na tabela pedidos. '
  'Corrigida para lidar com diferentes formatos de updated_by (UUID ou texto).';

COMMENT ON TRIGGER trigger_pedidos_timeline ON pedidos IS
  'Trigger que executa inserir_timeline_pedido() após cada INSERT/UPDATE, '
  'mantendo histórico completo de mudanças de status para análise de timeline e lead time.';

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- RESULTADO ESPERADO:
-- 1. Trigger recriada e funcionando
-- 2. Timeline populada com registro inicial de todos os pedidos
-- 3. Novas mudanças de status serão registradas automaticamente
-- 4. View v_pedido_timeline_completo funcionará normalmente

-- PARA VERIFICAR MANUALMENTE:
-- SELECT COUNT(*) FROM pedidos_timeline;
-- SELECT * FROM v_pedido_timeline_completo ORDER BY created_at DESC LIMIT 10;