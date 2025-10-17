-- CORRIGIR TRIGGER - PROBLEMA COM LABORATORIO_SLA
-- Recriar a função do trigger com SECURITY INVOKER em vez de DEFINER
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

-- Criar trigger
CREATE TRIGGER trigger_pedidos_timeline
  AFTER INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION inserir_timeline_pedido();

-- Comentários
COMMENT ON FUNCTION inserir_timeline_pedido() IS 
  'Trigger function que registra automaticamente mudanças de status em pedidos_timeline. '
  'Usa SECURITY INVOKER para evitar problemas de permissão com outras tabelas.';