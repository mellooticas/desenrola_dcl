-- ============================================================================
-- FIX DEFINITIVO: Corrigir Controle OS e Prevenir Reversão
-- ============================================================================
-- Problema: Trigger está marcando TODAS as OSs como lançadas incorretamente
-- Solução: Corrigir dados e recriar trigger correto
-- ============================================================================

-- 1. Ver triggers ativos na tabela controle_os
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'controle_os'
ORDER BY trigger_name;

-- 2. Corrigir os dados: marcar como NÃO lançadas apenas OSs SEM pedido
UPDATE controle_os co
SET 
  lancado = FALSE,
  data_lancamento = NULL
WHERE NOT EXISTS (
  SELECT 1 
  FROM pedidos p 
  WHERE CAST(p.numero_os_fisica AS INTEGER) = co.numero_os 
    AND p.loja_id = co.loja_id
);

-- 3. Verificar resultado
SELECT 
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE lancado = TRUE) as lancadas,
  COUNT(*) FILTER (WHERE lancado = FALSE) as nao_lancadas
FROM controle_os;

| total_registros | lancadas | nao_lancadas |
| --------------- | -------- | ------------ |
| 2006            | 549      | 1457         |



-- 5. Ver as funções de trigger atuais
SELECT 
  p.proname,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname LIKE '%controle_os%'
ORDER BY p.proname;


| proname          | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sync_controle_os | CREATE OR REPLACE FUNCTION public.sync_controle_os()
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

-- 6SELECT 1 FROM pedidos p WHERE p.id = co.pedido_id
  );

-- 5. Ver as funções de trigger atuais
SELECT 
  p.proname,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname LIKE '%controle_os%'
ORDER BY p.proname;


| proname          | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sync_controle_os | CREATE OR REPLACE FUNCTION public.sync_controle_os()
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


-- 5. Recriar o trigger de sincronização CORRIGIDO
CREATE OR REPLACE FUNCTION sync_controle_os_from_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só processa se numero_os_fisica foi preenchido
  IF NEW.numero_os_fisica IS NOT NULL AND NEW.numero_os_fisica ~ '^[0-9]+$' THEN
    
    -- Apenas marca como LANÇADA se inserir/atualizar pedido com OS
    INSERT INTO controle_os (
      numero_os,
      loja_id,
      lancado,
      data_lancamento,
      pedido_id
    ) VALUES (
      CAST(NEW.numero_os_fisica AS INTEGER),
      NEW.loja_id,
      TRUE, -- Marca como lançada pois TEM pedido
      COALESCE(NEW.updated_at, NEW.created_at),
      NEW.id
    )
    ON CONFLICT (numero_os, loja_id) 
    DO UPDATE SET
      lancado = TRUE,
      data_lancamento = COALESCE(NEW.updated_at, NEW.created_at),
      pedido_id = NEW.id,
      updated_at = NOW();
      
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. Verificar estatísticas finais
SELECT * FROM view_controle_os_estatisticas;

| loja_id                              | loja_nome | total_os_esperadas | total_lancadas | total_nao_lancadas | total_justificadas | total_pendentes | total_precisa_atencao | percentual_lancamento |
| ------------------------------------ | --------- | ------------------ | -------------- | ------------------ | ------------------ | --------------- | --------------------- | --------------------- |
| e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | Suzano    | 2006               | 549            | 1457               | 0                  | 0               | 1457                  | 27.37                 |

ARRUNMOU

-- 8. Ver alguns gaps
SELECT 
  numero_os,
  lancado,
  precisa_atencao,
  pedido_id
FROM view_controle_os_gaps
WHERE precisa_atencao = TRUE
ORDER BY numero_os DESC
LIMIT 10;


Error: Failed to run sql query: ERROR: 42703: column "pedido_id" does not exist LINE 6: pedido_id ^




-- ============================================================================
-- EXPLICAÇÃO:
-- ============================================================================
-- O trigger estava marcando TODAS as OSs como lançadas ao criar a sequência
-- Agora ele só marca como lançada quando um PEDIDO com OS é criado/atualizado
-- As OSs da sequência que não têm pedido ficam corretamente como "nao_lancadas"
-- ============================================================================
