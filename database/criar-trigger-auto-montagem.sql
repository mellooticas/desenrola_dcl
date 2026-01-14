-- CRIAR TRIGGER AUTOMÁTICA PARA ENVIO DE MONTAGEM
-- Quando montador_id é atribuído, preencher automaticamente data_envio_montagem

CREATE OR REPLACE FUNCTION trigger_auto_enviar_montagem()
RETURNS TRIGGER AS $$
BEGIN
  -- Se montador_id foi preenchido pela primeira vez (de NULL para valor)
  IF NEW.montador_id IS NOT NULL 
     AND (OLD.montador_id IS NULL OR OLD.montador_id IS DISTINCT FROM NEW.montador_id) 
     AND NEW.data_envio_montagem IS NULL THEN
    
    -- Preencher data de envio automaticamente
    NEW.data_envio_montagem := CURRENT_DATE;
    
    -- Calcular data prevista (+3 dias corridos, simplificado)
    NEW.data_prevista_montagem := CURRENT_DATE + INTERVAL '3 days';
    
    -- Atualizar status se ainda não estiver em montagem
    IF NEW.status NOT IN ('MONTAGEM', 'ENVIADO', 'CHEGOU', 'ENTREGUE') THEN
      NEW.status := 'ENVIADO';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger BEFORE UPDATE para preencher datas automaticamente
DROP TRIGGER IF EXISTS trigger_auto_enviar_montagem ON pedidos;
CREATE TRIGGER trigger_auto_enviar_montagem
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_enviar_montagem();

-- Testar com os pedidos existentes (preencher retroativamente)
UPDATE pedidos
SET 
  data_envio_montagem = CURRENT_DATE - INTERVAL '1 day',
  data_prevista_montagem = (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '3 days'
WHERE montador_id IS NOT NULL
  AND data_envio_montagem IS NULL;

-- Verificar resultado
SELECT 
    numero_sequencial,
    montador_id,
    data_envio_montagem,
    data_prevista_montagem,
    status
FROM pedidos
WHERE montador_id IS NOT NULL
ORDER BY numero_sequencial DESC
LIMIT 5;
