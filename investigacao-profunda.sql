-- INVESTIGAÇÃO MAIS PROFUNDA
-- Vamos verificar RLS e políticas que podem estar causando o problema

-- 1. Verificar Row Level Security (RLS) na tabela pedidos
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'pedidos';

| schemaname | tablename | rls_enabled |
| ---------- | --------- | ----------- |
| public     | pedidos   | true        |

-- 2. Verificar políticas RLS na tabela pedidos
SELECT 
  policyname,
  cmd,  -- SELECT, INSERT, UPDATE, DELETE, ALL
  permissive,  -- PERMISSIVE ou RESTRICTIVE
  roles,
  qual  -- WHERE condition
FROM pg_policies 
WHERE tablename = 'pedidos';

| policyname                        | cmd | permissive | roles           | qual |
| --------------------------------- | --- | ---------- | --------------- | ---- |
| Acesso completo para autenticados | ALL | PERMISSIVE | {authenticated} | true |
| allow_all_operations_pedidos      | ALL | PERMISSIVE | {public}        | true |

-- 3. Verificar se há triggers ou funções sendo executados durante INSERT
-- Buscar qualquer função que mencione laboratorio_sla
SELECT 
  p.proname,
  p.prosrc
FROM pg_proc p
WHERE p.prosrc ILIKE '%laboratorio_sla%';

| proname                        | prosrc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| calcular_datas_pos_pagamento   | 
declare
  v_lab uuid;
  v_classe uuid;
  v_pagto date;
  v_sla_base int;
  v_peso int;
  v_prazo int;
  v_prev_pronto date;
  v_prev_envio date;
  v_lead_transporte int := 0;
begin
  select laboratorio_id, classe_lente_id, data_pagamento
    into v_lab, v_classe, v_pagto
  from pedidos_lab where id = pedido_id;

  if v_pagto is null then
    return;
  end if;

  -- Buscar SLA
  select ls.sla_base_dias into v_sla_base
  from laboratorio_sla ls
  where ls.laboratorio_id = v_lab and ls.classe_lente_id = v_classe;

  if v_sla_base is null then
    v_sla_base := 5; -- default se não configurado
  end if;

  -- Peso da classe
  select coalesce(c.peso_sla, 0) into v_peso 
  from classes_lente c where c.id = v_classe;

  v_prazo := v_sla_base + v_peso;
  
  -- Calcular datas com dias úteis específicos do lab
  v_prev_pronto := add_business_days(v_pagto, greatest(v_prazo, 0), v_lab);

  -- Lead de transporte
  select coalesce(lead_transporte_dias, 0) into v_lead_transporte
  from laboratorios where id = v_lab;

  v_prev_envio := add_business_days(v_prev_pronto, 1 + v_lead_transporte, v_lab);

  -- Atualizar pedido
  update pedidos_lab
  set prazo_producao_dias = v_prazo,
      data_prevista_pronto = v_prev_pronto,
      data_prevista_envio = v_prev_envio
  where id = pedido_id;
  
  -- Log do recálculo
  insert into pedido_eventos (pedido_id, tipo, descricao, detalhes)
  values (
    pedido_id,
    'SLA_RECALC',
    'SLA recalculado após pagamento',
    jsonb_build_object(
      'prazo_dias', v_prazo,
      'data_pronto', v_prev_pronto,
      'data_envio', v_prev_envio
    )
  );
end                                   |
| trigger_atualizar_datas_pedido | 
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
 |
| recalcular_sla_pedido          | 
DECLARE
  pedido_rec RECORD;
  sla_dias INTEGER := 5;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, l.sla_padrao_dias, cl.sla_base_dias
  INTO pedido_rec
  FROM pedidos p
  LEFT JOIN laboratorios l ON p.laboratorio_id = l.id
  LEFT JOIN classes_lente cl ON p.classe_lente_id = cl.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Pedido % não encontrado', pedido_uuid;
    RETURN;
  END IF;
  
  -- Calcular SLA
  SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, l.sla_padrao_dias, 5)
  INTO sla_dias
  FROM laboratorios l
  LEFT JOIN classes_lente cl ON cl.id = pedido_rec.classe_lente_id
  LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = pedido_rec.laboratorio_id 
    AND ls.classe_lente_id = pedido_rec.classe_lente_id
  WHERE l.id = pedido_rec.laboratorio_id;
  
  -- Ajustar por prioridade
  CASE pedido_rec.prioridade
    WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
    WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
    WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
    ELSE -- NORMAL
  END CASE;
  
  -- Atualizar pedido
  UPDATE pedidos SET
    data_prometida = COALESCE(data_pagamento, data_pedido) + (sla_dias || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE id = pedido_uuid;
  
  RAISE NOTICE 'SLA recalculado para pedido %: % dias', pedido_uuid, sla_dias;
END;
                                                                                                                                                                                                                                                                                                                                  |
| calcular_sla_pedido            | 
DECLARE
  pedido_rec RECORD;
  sla_dias INT;
  data_base DATE;
BEGIN
  -- Buscar dados do pedido
  SELECT p.*, l.trabalha_sabado, l.sla_padrao_dias
  INTO pedido_rec
  FROM pedidos p
  JOIN laboratorios l ON p.laboratorio_id = l.id
  WHERE p.id = pedido_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Buscar SLA específico ou usar padrão
  SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, 5)
  INTO sla_dias
  FROM classes_lente cl
  LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = pedido_rec.laboratorio_id 
    AND ls.classe_lente_id = pedido_rec.classe_lente_id
  WHERE cl.id = pedido_rec.classe_lente_id;
  
  -- Ajustar SLA por prioridade
  CASE pedido_rec.prioridade
    WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
    WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
    WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
    ELSE -- NORMAL, manter SLA base
  END CASE;
  
  -- Definir data base para cálculo
  data_base := COALESCE(pedido_rec.data_pagamento, pedido_rec.data_pedido);
  
  -- Calcular datas previstas
  UPDATE pedidos SET
    data_prevista_pronto = calcular_dias_uteis(data_base, sla_dias),
    updated_at = NOW()
  WHERE id = pedido_uuid;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |


-- 4. Verificar se existe algum trigger especial no Supabase
-- (Triggers que começam com supabase_ ou auth_)
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

-- 5. Verificar se a tabela laboratorio_sla tem RLS que pode estar bloqueando
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'laboratorio_sla';

| schemaname | tablename       | rls_enabled |
| ---------- | --------------- | ----------- |
| public     | laboratorio_sla | false       |