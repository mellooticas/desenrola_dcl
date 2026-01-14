-- ========================================
-- INVESTIGAR: Código dos triggers que podem interferir
-- ========================================

-- 1. Ver código do trigger que atualiza datas
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'trigger_atualizar_datas_pedido';


| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION public.trigger_atualizar_datas_pedido()
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



-- 2. Ver código do trigger de timeline
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'trigger_criar_evento_timeline';


| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION public.trigger_criar_evento_timeline()
 RETURNS trigger
 LANGUAGE plpgsql
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
        ELSE 'Status Alterado: ' || COALESCE(OLD.status, 'NOVO') || ' → ' || NEW.status
      END,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Pedido registrado no sistema'
        ELSE 'Status alterado de ' || COALESCE(OLD.status, 'NOVO') || ' para ' || NEW.status || ' automaticamente'
      END,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      jsonb_build_object(
        'operacao', TG_OP,
        'trigger', 'automatico',
        'numero_sequencial', NEW.numero_sequencial
      ),
      COALESCE(NEW.updated_by, 'sistema'),
      true, -- automatico = true
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$function$
 |


-- 3. Ver código do outro trigger de timeline
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'inserir_timeline_pedido';

| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION public.inserir_timeline_pedido()
 RETURNS trigger
 LANGUAGE plpgsql
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
$function$
 |


-- 4. Ver código do trigger de controle OS
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'sync_controle_os';


| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION public.sync_controle_os()
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


-- 5. Ver código do trigger de OS sequencia
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'trigger_auto_adicionar_os_sequencia';


| pg_get_functiondef                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE OR REPLACE FUNCTION public.trigger_auto_adicionar_os_sequencia()
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


-- ========================================
-- TESTE ALTERNATIVO: UPDATE direto para verificar se é problema de trigger
-- ========================================

-- Fazer UPDATE e monitorar o que acontece
DO $$
DECLARE
  v_antes UUID;
  v_depois UUID;
BEGIN
  -- Verificar valor antes
  SELECT montador_id INTO v_antes
  FROM pedidos
  WHERE numero_sequencial = 644;
  
  RAISE NOTICE 'Antes do UPDATE: montador_id = %', v_antes;
  
  -- Fazer UPDATE
  UPDATE pedidos
  SET montador_id = '56d71159-70ce-403b-8362-ebe44b18d882'
  WHERE numero_sequencial = 644;
  
  -- Verificar valor depois
  SELECT montador_id INTO v_depois
  FROM pedidos
  WHERE numero_sequencial = 644;
  
  RAISE NOTICE 'Depois do UPDATE: montador_id = %', v_depois;
  
  IF v_depois IS NULL THEN
    RAISE NOTICE '❌ PROBLEMA: montador_id foi RESETADO para NULL!';
  ELSIF v_depois = '56d71159-70ce-403b-8362-ebe44b18d882' THEN
    RAISE NOTICE '✅ SUCCESS: montador_id foi salvo corretamente!';
  END IF;
END $$;

-- Verificar resultado final
SELECT 
  numero_sequencial,
  montador_id,
  updated_at
FROM pedidos
WHERE numero_sequencial = 644;


| numero_sequencial | montador_id                          | updated_at                    |
| ----------------- | ------------------------------------ | ----------------------------- |
| 644               | 56d71159-70ce-403b-8362-ebe44b18d882 | 2026-01-13 21:22:17.375918+00 |