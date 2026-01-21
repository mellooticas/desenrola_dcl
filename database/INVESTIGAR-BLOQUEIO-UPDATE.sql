-- ============================================================
-- INVESTIGAR O QUE ESTÁ BLOQUEANDO OS UPDATES
-- ============================================================

-- 1. Verificar TRIGGERS na tabela pedidos
SELECT 
    '=== TRIGGERS EM PEDIDOS ===' as secao,
    tgname as trigger_nome,
    tgenabled as ativo,
    CASE tgtype::int & 1
        WHEN 1 THEN 'BEFORE'
        ELSE 'AFTER'
    END as momento,
    CASE tgtype::int & 66
        WHEN 2 THEN 'INSERT'
        WHEN 4 THEN 'DELETE'
        WHEN 16 THEN 'UPDATE'
        WHEN 22 THEN 'INSERT/UPDATE'
        WHEN 28 THEN 'DELETE/UPDATE'
        ELSE 'MULTIPLE'
    END as evento,
    pg_get_functiondef(tgfoid) as funcao_codigo
FROM pg_trigger
WHERE tgrelid = 'pedidos'::regclass
AND tgisinternal = FALSE;

| secao                       | trigger_nome                          | ativo | momento | evento   | funcao_codigo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------- | ----- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| === TRIGGERS EM PEDIDOS === | pedidos_sync_os_sequencia             | O     | BEFORE  | MULTIPLE | CREATE OR REPLACE FUNCTION public.trigger_sync_os_sequencia_otimizado()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Quando insere ou atualiza um pedido com numero_os_fisica
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND 
     NEW.numero_os_fisica IS NOT NULL AND 
     NEW.numero_os_fisica ~ '^[0-9]+$' THEN
    
    -- Verificar se tabela os_sequencia existe antes de inserir
    BEGIN
      -- Apenas inserir o número atual (SEM preencher gaps)
      -- Gaps serão preenchidos por job separado, não em tempo real
      INSERT INTO os_sequencia (numero_os, loja_id, data_esperada, origem)
      VALUES (
        CAST(NEW.numero_os_fisica AS INTEGER),
        NEW.loja_id,
        COALESCE(NEW.created_at, NOW()),
        'trigger_otimizado'
      )
      ON CONFLICT (numero_os, loja_id) DO NOTHING;
    EXCEPTION
      WHEN undefined_table THEN
        -- Se tabela não existir, apenas ignora
        NULL;
      WHEN OTHERS THEN
        -- Log do erro mas não falha a operação
        RAISE WARNING 'Erro ao inserir em os_sequencia: %', SQLERRM;
    END;
    
  END IF;

  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| === TRIGGERS EM PEDIDOS === | trigger_atualizar_datas_pedido        | O     | BEFORE  | INSERT   | CREATE OR REPLACE FUNCTION public.trigger_atualizar_datas_pedido()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
              |
| === TRIGGERS EM PEDIDOS === | trigger_auto_enviar_montagem          | O     | BEFORE  | INSERT   | CREATE OR REPLACE FUNCTION public.trigger_auto_enviar_montagem()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| === TRIGGERS EM PEDIDOS === | trigger_calcular_margem_lente         | O     | BEFORE  | INSERT   | CREATE OR REPLACE FUNCTION public.calcular_margem_lente()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.preco_lente IS NOT NULL AND NEW.custo_lente IS NOT NULL AND NEW.custo_lente > 0 THEN
    NEW.margem_lente_percentual := ROUND(((NEW.preco_lente - NEW.custo_lente) / NEW.custo_lente * 100)::numeric, 2);
  END IF;
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| === TRIGGERS EM PEDIDOS === | trigger_controle_os                   | O     | BEFORE  | MULTIPLE | CREATE OR REPLACE FUNCTION public.sync_controle_os()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_numero_os INTEGER;
  v_min_os INTEGER;
  v_max_os INTEGER;
BEGIN
  -- Só processa se tiver numero_os_fisica válido
  IF NEW.numero_os_fisica IS NULL OR NEW.numero_os_fisica !~ '^[0-9]+$' THEN
    RETURN NEW;
  END IF;

  v_numero_os := CAST(NEW.numero_os_fisica AS INTEGER);

  -- Buscar range atual da loja
  SELECT 
    COALESCE(MIN(CAST(numero_os_fisica AS INTEGER)), v_numero_os),
    COALESCE(MAX(CAST(numero_os_fisica AS INTEGER)), v_numero_os)
  INTO v_min_os, v_max_os
  FROM pedidos
  WHERE loja_id = NEW.loja_id
    AND numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$';

  -- Preencher sequência completa do MIN ao MAX
  INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
  SELECT 
    num,
    NEW.loja_id,
    EXISTS(
      SELECT 1 FROM pedidos 
      WHERE loja_id = NEW.loja_id 
        AND numero_os_fisica = num::TEXT
    ),
    CASE 
      WHEN EXISTS(
        SELECT 1 FROM pedidos 
        WHERE loja_id = NEW.loja_id 
          AND numero_os_fisica = num::TEXT
      ) THEN NEW.created_at
      ELSE NULL
    END
  FROM generate_series(v_min_os, v_max_os) AS num
  ON CONFLICT (numero_os, loja_id) 
  DO UPDATE SET 
    lancado = TRUE,
    data_lancamento = COALESCE(controle_os.data_lancamento, NEW.created_at),
    updated_at = NOW();

  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                            |
| === TRIGGERS EM PEDIDOS === | trigger_criar_evento_timeline         | O     | BEFORE  | MULTIPLE | CREATE OR REPLACE FUNCTION public.trigger_criar_evento_timeline()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Se status mudou, criar evento
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (OLD.status IS NULL OR OLD.status != NEW.status)) THEN
    
    INSERT INTO pedido_eventos (
      pedido_id,
      tipo,
      titulo,
      descricao,
      status_anterior,
      status_novo,
      detalhes,
      usuario,
      automatico,
      created_at
    ) VALUES (
      NEW.id,
      'STATUS_CHANGE',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Pedido Criado'
        ELSE 'Status Alterado: ' || COALESCE(OLD.status, 'NULL') || ' → ' || NEW.status
      END,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Novo pedido registrado no sistema'
        ELSE 'Status alterado de ' || COALESCE(OLD.status, 'NULL') || ' para ' || NEW.status || ' automaticamente'
      END,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      jsonb_build_object(
        'trigger', 'automatico',
        'operacao', TG_OP,
        'numero_sequencial', NEW.numero_sequencial
      ),
      'sistema', -- Campo usuario - sempre 'sistema' para triggers automáticos
      true,
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| === TRIGGERS EM PEDIDOS === | trigger_pedido_adicionar_os_sequencia | O     | BEFORE  | MULTIPLE | CREATE OR REPLACE FUNCTION public.trigger_auto_adicionar_os_sequencia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_numero_os INTEGER;
BEGIN
  -- Validar se numero_os_fisica é um número válido
  IF NEW.numero_os_fisica IS NOT NULL 
     AND NEW.numero_os_fisica ~ '^[0-9]+$' THEN
    
    v_numero_os := CAST(NEW.numero_os_fisica AS INTEGER);
    
    -- Inserir na sequência se não existir
    INSERT INTO os_sequencia (numero_os, loja_id, origem)
    VALUES (v_numero_os, NEW.loja_id, 'auto')
    ON CONFLICT (numero_os) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| === TRIGGERS EM PEDIDOS === | trigger_pedidos_timeline              | O     | BEFORE  | MULTIPLE | CREATE OR REPLACE FUNCTION public.inserir_timeline_pedido()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      v_responsavel_id := NULL;
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
$function$
 |
| === TRIGGERS EM PEDIDOS === | trigger_populate_data_prometida       | O     | BEFORE  | INSERT   | CREATE OR REPLACE FUNCTION public.populate_data_prometida()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sla_lab INTEGER;
  v_margem_loja INTEGER;
BEGIN
  -- Se data_prometida não foi informada, calcular
  IF NEW.data_prometida IS NULL AND NEW.data_pedido IS NOT NULL THEN
    -- Buscar SLA do laboratório
    SELECT sla_padrao_dias INTO v_sla_lab
    FROM laboratorios
    WHERE id = NEW.laboratorio_id;
    
    -- Buscar margem de segurança da loja
    SELECT margem_seguranca_dias INTO v_margem_loja
    FROM lojas
    WHERE id = NEW.loja_id;
    
    -- Calcular data prometida
    NEW.data_prometida := NEW.data_pedido::date + 
                          COALESCE(v_sla_lab, 7) +
                          COALESCE(v_margem_loja, 2);
  END IF;
  
  -- Se data_sla_laboratorio não foi informada, calcular
  IF NEW.data_sla_laboratorio IS NULL AND NEW.data_pedido IS NOT NULL THEN
    SELECT sla_padrao_dias INTO v_sla_lab
    FROM laboratorios
    WHERE id = NEW.laboratorio_id;
    
    NEW.data_sla_laboratorio := NEW.data_pedido::date + COALESCE(v_sla_lab, 7);
  END IF;
  
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |



-- 2. Verificar RLS POLICIES em pedidos (especialmente UPDATE)
SELECT 
    '=== RLS POLICIES UPDATE ===' as secao,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as comando,
    qual as usando_expressao,
    with_check as check_expressao
FROM pg_policies
WHERE tablename = 'pedidos'
AND cmd IN ('UPDATE', 'ALL');


| secao                       | schemaname | tablename | policyname               | permissive | roles           | comando | usando_expressao | check_expressao |
| --------------------------- | ---------- | --------- | ------------------------ | ---------- | --------------- | ------- | ---------------- | --------------- |
| === RLS POLICIES UPDATE === | public     | pedidos   | anon_all_access          | PERMISSIVE | {anon}          | ALL     | true             | true            |
| === RLS POLICIES UPDATE === | public     | pedidos   | authenticated_all_access | PERMISSIVE | {authenticated} | ALL     | true             | true            |


-- 3. Tentar UPDATE DIRETO em 1 pedido específico (teste)
DO $$
DECLARE
    v_test_id uuid;
    v_status_atual text;
    v_status_novo text := 'CHEGOU';
BEGIN
    -- Pegar o primeiro pedido da lista dos 38
    SELECT id, status INTO v_test_id, v_status_atual
    FROM pedidos
    WHERE numero_sequencial = 57
    LIMIT 1;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== TESTE UPDATE DIRETO ===';
    RAISE NOTICE 'Pedido #57';
    RAISE NOTICE 'ID: %', v_test_id;
    RAISE NOTICE 'Status atual: %', v_status_atual;
    RAISE NOTICE 'Tentando mudar para: %', v_status_novo;
    RAISE NOTICE '';
    
    -- Tentar UPDATE com tratamento de erro
    BEGIN
        UPDATE pedidos 
        SET status = v_status_novo
        WHERE id = v_test_id;
        
        RAISE NOTICE '✓ UPDATE executado com sucesso!';
        
        -- Verificar se realmente mudou
        SELECT status INTO v_status_atual FROM pedidos WHERE id = v_test_id;
        RAISE NOTICE 'Status após UPDATE: %', v_status_atual;
        
        -- Desfazer para não afetar dados
        ROLLBACK;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ ERRO no UPDATE: %', SQLERRM;
        RAISE WARNING 'SQLSTATE: %', SQLSTATE;
    END;
    
END $$;


Success. No rows returned




-- 4. Verificar se existe função que altera status automaticamente
SELECT 
    '=== FUNÇÕES QUE MEXEM COM STATUS ===' as secao,
    n.nspname as schema,
    p.proname as funcao_nome,
    pg_get_functiondef(p.oid) as codigo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%pedidos%status%'
AND n.nspname NOT IN ('pg_catalog', 'information_schema')
LIMIT 10;

Error: Failed to run sql query: ERROR: 42809: "array_agg" is an aggregate function




-- 5. Verificar se RLS está ativo
SELECT 
    '=== STATUS RLS ===' as secao,
    relname as tabela,
    relrowsecurity as rls_ativo,
    relforcerowsecurity as rls_forcado
FROM pg_class
WHERE relname = 'pedidos';


| secao              | tabela  | rls_ativo | rls_forcado |
| ------------------ | ------- | --------- | ----------- |
| === STATUS RLS === | pedidos | true      | false       |
