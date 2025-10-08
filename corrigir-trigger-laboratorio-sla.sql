-- ============================================================================
-- CORRIGIR TRIGGER - PROBLEMA COM LABORATORIO_SLA
-- ============================================================================
-- O erro "permission denied for table laboratorio_sla" acontece porque
-- a função do trigger precisa de permissões especiais

-- 1. Verificar se há algum trigger ou constraint relacionado a laboratorio_sla
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'pedidos'
ORDER BY t.tgname;


| trigger_name                   | table_name | function_name                  |
| ------------------------------ | ---------- | ------------------------------ |
| RI_ConstraintTrigger_a_53634   | pedidos    | RI_FKey_cascade_del            |
| RI_ConstraintTrigger_a_53635   | pedidos    | RI_FKey_noaction_upd           |
| RI_ConstraintTrigger_a_53649   | pedidos    | RI_FKey_cascade_del            |
| RI_ConstraintTrigger_a_53650   | pedidos    | RI_FKey_noaction_upd           |
| RI_ConstraintTrigger_a_56022   | pedidos    | RI_FKey_cascade_del            |
| RI_ConstraintTrigger_a_56023   | pedidos    | RI_FKey_noaction_upd           |
| RI_ConstraintTrigger_a_62685   | pedidos    | RI_FKey_cascade_del            |
| RI_ConstraintTrigger_a_62686   | pedidos    | RI_FKey_noaction_upd           |
| RI_ConstraintTrigger_c_53609   | pedidos    | RI_FKey_check_ins              |
| RI_ConstraintTrigger_c_53610   | pedidos    | RI_FKey_check_upd              |
| RI_ConstraintTrigger_c_53614   | pedidos    | RI_FKey_check_ins              |
| RI_ConstraintTrigger_c_53615   | pedidos    | RI_FKey_check_upd              |
| RI_ConstraintTrigger_c_53619   | pedidos    | RI_FKey_check_ins              |
| RI_ConstraintTrigger_c_53620   | pedidos    | RI_FKey_check_upd              |
| RI_ConstraintTrigger_c_58961   | pedidos    | RI_FKey_check_ins              |
| RI_ConstraintTrigger_c_58962   | pedidos    | RI_FKey_check_upd              |
| RI_ConstraintTrigger_c_88991   | pedidos    | RI_FKey_check_ins              |
| RI_ConstraintTrigger_c_88992   | pedidos    | RI_FKey_check_upd              |
| trigger_atualizar_datas_pedido | pedidos    | trigger_atualizar_datas_pedido |
| trigger_criar_evento_timeline  | pedidos    | trigger_criar_evento_timeline  |
| trigger_pedidos_timeline       | pedidos    | inserir_timeline_pedido        |

-- 2. Recriar a função do trigger com SECURITY INVOKER em vez de DEFINER
-- Isso faz com que a função use as permissões do usuário que a executa
DROP TRIGGER IF EXISTS trigger_pedidos_timeline ON pedidos;
DROP FUNCTION IF EXISTS inserir_timeline_pedido() CASCADE;

CREATE OR REPLACE FUNCTION inserir_timeline_pedido()
RETURNS TRIGGER AS $$
DECLARE
  v_responsavel_id UUID;
BEGIN
  -- Só registra se o status realmente mudou
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Tentar pegar o responsavel_id de forma segura
    BEGIN
      v_responsavel_id := CASE 
        WHEN NEW.updated_by IS NOT NULL AND NEW.updated_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN NEW.updated_by::UUID
        ELSE auth.uid()
      END;
    EXCEPTION WHEN OTHERS THEN
      -- Se der erro, usar NULL (permite foreign key)
      v_responsavel_id := NULL;
    END;
    
    -- Inserir registro na timeline (apenas se ainda não existe)
    INSERT INTO pedidos_timeline (
      pedido_id,
      status_anterior,
      status_novo,
      responsavel_id,
      observacoes,
      created_at
    ) 
    SELECT
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
        ELSE 'Status atualizado: ' || COALESCE(OLD.status, 'NOVO') || ' → ' || NEW.status
      END,
      COALESCE(NEW.updated_at, NEW.created_at, NOW())
    WHERE NOT EXISTS (
      -- Evita duplicatas se o trigger rodar múltiplas vezes
      SELECT 1 FROM pedidos_timeline pt
      WHERE pt.pedido_id = NEW.id
        AND pt.status_novo = NEW.status
        AND pt.created_at > NOW() - INTERVAL '5 seconds'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER; -- MUDANÇA IMPORTANTE: INVOKER em vez de DEFINER

-- 3. Criar trigger
CREATE TRIGGER trigger_pedidos_timeline
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION inserir_timeline_pedido();

-- 4. Comentários
COMMENT ON FUNCTION inserir_timeline_pedido() IS 
  'Trigger function que registra automaticamente mudanças de status em pedidos_timeline. '
  'Usa SECURITY INVOKER para evitar problemas de permissão com outras tabelas.';

-- 5. Teste rápido
DO $$
DECLARE
  v_test_pedido RECORD;
  v_count_antes INTEGER;
  v_count_depois INTEGER;
BEGIN
  -- Pegar um pedido qualquer
  SELECT id, numero_sequencial, status INTO v_test_pedido 
  FROM pedidos 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_test_pedido.id IS NOT NULL THEN
    -- Contar eventos antes
    SELECT COUNT(*) INTO v_count_antes 
    FROM pedidos_timeline 
    WHERE pedido_id = v_test_pedido.id;
    
    RAISE NOTICE 'Testando trigger com pedido #%', v_test_pedido.numero_sequencial;
    RAISE NOTICE 'Eventos antes: %', v_count_antes;
    
    -- Fazer uma mudança simples de updated_at (sem mudar status)
    UPDATE pedidos 
    SET updated_at = NOW()
    WHERE id = v_test_pedido.id;
    
    -- Contar eventos depois (NÃO deve ter criado novo, pois status não mudou)
    SELECT COUNT(*) INTO v_count_depois 
    FROM pedidos_timeline 
    WHERE pedido_id = v_test_pedido.id;
    
    IF v_count_depois = v_count_antes THEN
      RAISE NOTICE '✅ Correto! Nenhum evento criado (status não mudou)';
    ELSE
      RAISE WARNING '⚠️  Eventos criados mesmo sem mudança de status';
    END IF;
    
  END IF;
END $$;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Trigger recriado com SECURITY INVOKER
-- - Não deve mais dar erro de permissão em laboratorio_sla
-- - Timeline continuará funcionando para novos pedidos e mudanças de status
-- ============================================================================
