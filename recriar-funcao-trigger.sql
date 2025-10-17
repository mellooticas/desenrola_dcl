-- SOLUÇÃO RADICAL: RECRIAR A FUNÇÃO PROBLEMÁTICA
-- Se ALTER não funcionar, vamos recriar do zero

-- 1. Primeiro desabilitar o trigger
ALTER TABLE pedidos DISABLE TRIGGER trigger_atualizar_datas_pedido;

-- 2. Dropar e recriar a função com SECURITY INVOKER
DROP FUNCTION IF EXISTS trigger_atualizar_datas_pedido CASCADE;

-- 3. Recriar a função (pegue o código da investigação anterior)
CREATE OR REPLACE FUNCTION trigger_atualizar_datas_pedido()
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
  
  -- Calcular data_prometida quando pedido é criado ou pago
  IF (TG_OP = 'INSERT') OR 
     (NEW.status = 'PAGO' AND (OLD.status IS NULL OR OLD.status != 'PAGO')) THEN
    
    -- Buscar SLA do laboratório + classe
    DECLARE
      sla_dias INTEGER := 5; -- padrão
    BEGIN
      -- Tentar buscar SLA específico da combinação lab+classe
      SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, l.sla_padrao_dias, 5)
      INTO sla_dias
      FROM laboratorios l
      LEFT JOIN classes_lente cl ON cl.id = NEW.classe_lente_id
      LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = NEW.laboratorio_id 
        AND ls.classe_lente_id = NEW.classe_lente_id
      WHERE l.id = NEW.laboratorio_id;
      
      -- Ajustar por prioridade
      CASE NEW.prioridade
        WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
        WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
        WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
        ELSE -- NORMAL, manter SLA base
      END CASE;
      
      -- Calcular data prometida
      NEW.data_prometida = COALESCE(NEW.data_pagamento, NEW.data_pedido) + (sla_dias || ' days')::INTERVAL;
    END;
  END IF;
  
  -- Sempre atualizar updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;  -- IMPORTANTE: SECURITY INVOKER

-- 4. Recriar o trigger
CREATE TRIGGER trigger_atualizar_datas_pedido
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_datas_pedido();

-- 5. Verificar se foi criado corretamente
SELECT 
  p.proname,
  p.prosecdef,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type
FROM pg_proc p 
WHERE p.proname = 'trigger_atualizar_datas_pedido';


| proname                        | prosecdef | security_type    |
| ------------------------------ | --------- | ---------------- |
| trigger_atualizar_datas_pedido | false     | SECURITY INVOKER |