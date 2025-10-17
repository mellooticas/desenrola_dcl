-- SOLUÇÃO DEFINITIVA: TRIGGER SIMPLIFICADO
-- Vamos criar um trigger que não acesse tabelas externas para evitar problemas de permissão

-- 1. Desabilitar o trigger atual
ALTER TABLE pedidos DISABLE TRIGGER trigger_atualizar_datas_pedido;

-- 2. Criar função simplificada (sem acessar laboratorio_sla)
CREATE OR REPLACE FUNCTION trigger_atualizar_datas_pedido_simples()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar data_entregue quando status muda para ENTREGUE
  IF NEW.status = 'ENTREGUE' AND (OLD.status IS NULL OR OLD.status != 'ENTREGUE') THEN
    NEW.data_entregue = CURRENT_DATE;
  END IF;
  
  -- Atualizar data_pagamento quando status muda para PAGO
  IF NEW.status = 'PAGO' AND (OLD.status IS NULL OR OLD.status != 'PAGO') THEN
    NEW.data_pagamento = CURRENT_DATE;
  END IF;
  
  -- Calcular data_prometida com SLA FIXO (sem consultar laboratorio_sla)
  IF (TG_OP = 'INSERT') OR 
     (NEW.status = 'PAGO' AND (OLD.status IS NULL OR OLD.status != 'PAGO')) THEN
    
    DECLARE
      sla_dias INTEGER := 5; -- SLA fixo para evitar problemas de permissão
    BEGIN
      -- Ajustar por prioridade
      CASE NEW.prioridade
        WHEN 'URGENTE' THEN sla_dias := 2;
        WHEN 'ALTA' THEN sla_dias := 4;
        WHEN 'BAIXA' THEN sla_dias := 7;
        ELSE sla_dias := 5; -- NORMAL
      END CASE;
      
      -- Calcular data prometida
      NEW.data_prometida = COALESCE(NEW.data_pagamento, NEW.data_pedido) + (sla_dias || ' days')::INTERVAL;
    END;
  END IF;
  
  -- Sempre atualizar updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 3. Criar o trigger simplificado
CREATE TRIGGER trigger_atualizar_datas_pedido_simples
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_datas_pedido_simples();

-- 4. Verificar se foi criado
SELECT 
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'pedidos'
  AND NOT t.tgisinternal
ORDER BY t.tgname;