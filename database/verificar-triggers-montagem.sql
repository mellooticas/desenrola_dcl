-- VERIFICAR TRIGGERS DE MONTAGEM
-- Execute e me envie os resultados

-- Query 1: Listar triggers na tabela pedidos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
ORDER BY trigger_name;


| trigger_name                          | event_manipulation | action_timing |
| ------------------------------------- | ------------------ | ------------- |
| trigger_atualizar_datas_pedido        | INSERT             | BEFORE        |
| trigger_atualizar_datas_pedido        | UPDATE             | BEFORE        |
| trigger_calcular_margem_lente         | INSERT             | BEFORE        |
| trigger_calcular_margem_lente         | UPDATE             | BEFORE        |
| trigger_controle_os                   | INSERT             | AFTER         |
| trigger_controle_os                   | UPDATE             | AFTER         |
| trigger_criar_evento_timeline         | INSERT             | AFTER         |
| trigger_criar_evento_timeline         | UPDATE             | AFTER         |
| trigger_pedido_adicionar_os_sequencia | INSERT             | AFTER         |
| trigger_pedido_adicionar_os_sequencia | UPDATE             | AFTER         |
| trigger_pedidos_timeline              | INSERT             | AFTER         |
| trigger_pedidos_timeline              | UPDATE             | AFTER         |
| trigger_populate_data_prometida       | INSERT             | BEFORE        |
| trigger_populate_data_prometida       | UPDATE             | BEFORE        |


-- Query 2: Ver código dos triggers relacionados a montagem/montador
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    p.proname LIKE '%montag%' 
    OR p.proname LIKE '%montador%'
  )
ORDER BY p.proname;


| function_name                   | function_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| criar_laboratorio_para_montador | CREATE OR REPLACE FUNCTION public.criar_laboratorio_para_montador()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  novo_lab_id uuid;
begin
  -- Se já houver laboratório, não cria outro
  if NEW.laboratorio_id is not null then
    return NEW;
  end if;

  -- Cria laboratório automaticamente
  insert into public.laboratorios (nome, codigo)
  values (NEW.nome || ' - Laboratório', substring(NEW.nome from 1 for 3))
  returning id into novo_lab_id;

  -- Liga o montador ao laboratório recém-criado
  update public.montadores
  set laboratorio_id = novo_lab_id
  where id = NEW.id;

  return NEW;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| criar_montador_para_laboratorio | CREATE OR REPLACE FUNCTION public.criar_montador_para_laboratorio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  insert into public.montadores (nome, tipo, laboratorio_id)
  values (NEW.nome || ' - Montador', 'LABORATORIO', NEW.id);

  return NEW;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| enviar_para_montagem            | CREATE OR REPLACE FUNCTION public.enviar_para_montagem(p_pedido_id uuid, p_montador_id uuid, p_usuario text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_data_prevista DATE;
  v_montador_nome TEXT;
  v_montador_tipo TEXT;
BEGIN
  -- Calcular data prevista (+3 dias úteis)
  v_data_prevista := calcular_dias_uteis(CURRENT_DATE, 3);
  
  -- Buscar dados do montador
  SELECT nome, tipo 
  INTO v_montador_nome, v_montador_tipo
  FROM montadores 
  WHERE id = p_montador_id;
  
  -- Atualizar pedido
  UPDATE pedidos SET
    status = 'MONTAGEM',
    montador_id = p_montador_id,
    data_envio_montagem = CURRENT_DATE,
    data_prevista_montagem = v_data_prevista,
    updated_at = NOW(),
    updated_by = p_usuario
  WHERE id = p_pedido_id;
  
  -- Registrar evento na timeline
  INSERT INTO pedido_eventos (
    pedido_id, tipo, titulo, descricao, usuario, automatico
  ) VALUES (
    p_pedido_id, 
    'ENVIO_MONTAGEM', 
    'Enviado para montagem',
    format('Enviado para %s (%s). Prazo: %s', 
           v_montador_nome, 
           v_montador_tipo, 
           v_data_prevista::TEXT
    ),
    p_usuario, 
    false
  );
  
  RETURN TRUE;
END;
$function$
 |




-- Query 3: Verificar se existe trigger para data_envio_montagem
SELECT 
    t.trigger_name,
    t.event_manipulation,
    p.proname as function_name
FROM information_schema.triggers t
JOIN pg_trigger tg ON tg.tgname = t.trigger_name
JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE t.event_object_table = 'pedidos'
  AND (
    p.proname LIKE '%montag%' 
    OR p.proname LIKE '%data%'
    OR p.proname LIKE '%envio%'
  )
ORDER BY t.trigger_name;


| trigger_name                    | event_manipulation | function_name                  |
| ------------------------------- | ------------------ | ------------------------------ |
| trigger_atualizar_datas_pedido  | UPDATE             | trigger_atualizar_datas_pedido |
| trigger_atualizar_datas_pedido  | INSERT             | trigger_atualizar_datas_pedido |
| trigger_populate_data_prometida | UPDATE             | populate_data_prometida        |
| trigger_populate_data_prometida | INSERT             | populate_data_prometida        |
