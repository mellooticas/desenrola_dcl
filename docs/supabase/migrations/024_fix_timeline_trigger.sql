-- Fix trigger que estava tentando converter email para UUID
-- Remove a referência ao campo updated_by que pode conter email em vez de UUID

DROP TRIGGER IF EXISTS trigger_pedidos_timeline ON pedidos;

-- Função corrigida para inserir automaticamente na timeline quando status do pedido muda
CREATE OR REPLACE FUNCTION inserir_timeline_pedido()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir entrada na timeline quando o status muda
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO pedidos_timeline (
      pedido_id,
      status_anterior,
      status_novo,
      responsavel_id,
      observacoes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(), -- Usar apenas auth.uid() por enquanto
      CASE 
        WHEN NEW.status = 'CANCELADO' THEN 'Pedido cancelado'
        WHEN NEW.status = 'ENTREGUE' THEN 'Pedido entregue ao cliente'
        ELSE 'Status atualizado automaticamente'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger na tabela pedidos
CREATE TRIGGER trigger_pedidos_timeline
  AFTER UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION inserir_timeline_pedido();