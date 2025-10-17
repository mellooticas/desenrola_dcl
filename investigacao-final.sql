-- INVESTIGAÇÃO FINAL: POR QUE AINDA DÁ ERRO?
-- As funções estão SECURITY INVOKER mas o erro persiste

-- 1. Verificar o LOG específico do erro
-- Vamos ver exatamente onde está falhando

-- 2. Verificar RLS policies da tabela laboratorio_sla
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'laboratorio_sla';

| schemaname | tablename       | policyname                | permissive | roles    | cmd | qual | with_check |
| ---------- | --------------- | ------------------------- | ---------- | -------- | --- | ---- | ---------- |
| public     | laboratorio_sla | Allow all laboratorio_sla | PERMISSIVE | {public} | ALL | true | null       |

-- 3. Verificar se o usuário authenticator tem permissão na tabela laboratorio_sla
SELECT 
  t.table_name,
  p.privilege_type,
  p.grantee
FROM information_schema.table_privileges p
JOIN information_schema.tables t ON p.table_name = t.table_name
WHERE t.table_name = 'laboratorio_sla'
  AND t.table_schema = 'public'
ORDER BY p.grantee, p.privilege_type;

| table_name      | privilege_type | grantee  |
| --------------- | -------------- | -------- |
| laboratorio_sla | DELETE         | anon     |
| laboratorio_sla | INSERT         | anon     |
| laboratorio_sla | REFERENCES     | anon     |
| laboratorio_sla | SELECT         | anon     |
| laboratorio_sla | TRIGGER        | anon     |
| laboratorio_sla | TRUNCATE       | anon     |
| laboratorio_sla | UPDATE         | anon     |
| laboratorio_sla | DELETE         | postgres |
| laboratorio_sla | INSERT         | postgres |
| laboratorio_sla | REFERENCES     | postgres |
| laboratorio_sla | SELECT         | postgres |
| laboratorio_sla | TRIGGER        | postgres |
| laboratorio_sla | TRUNCATE       | postgres |
| laboratorio_sla | UPDATE         | postgres |

-- 4. Verificar quem está executando o trigger (usuário atual)
-- Isso vai nos mostrar qual usuário está tentando acessar laboratorio_sla
SELECT current_user, session_user, current_role;

| current_user | session_user | current_role |
| ------------ | ------------ | ------------ |
| postgres     | postgres     | postgres     |

-- 5. Testar acesso direto à tabela laboratorio_sla
SELECT COUNT(*) FROM laboratorio_sla LIMIT 1;


| count |
| ----- |
| 88    |

-- 6. SOLUÇÃO ALTERNATIVA: Simplificar o trigger para não usar laboratorio_sla
-- Se o problema persistir, vamos criar uma versão simplificada do trigger
-- que não acesse tabelas externas

-- Versão simplificada que só usa valores padrão:
/*
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
  
  -- Calcular data_prometida com SLA fixo de 5 dias (sem consultar laboratorio_sla)
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
*/