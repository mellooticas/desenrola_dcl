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

-- 4. Limpar registros órfãos (OSs que têm pedido_id mas o pedido não existe mais)
UPDATE controle_os co
SET 
  lancado = FALSE,
  data_lancamento = NULL,
  pedido_id = NULL
WHERE pedido_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM pedidos p WHERE p.id = co.pedido_id
  );

-- 5. Ver as funções de trigger atuais
SELECT 
  p.proname as nome_funcao,
  p.prosecdef as tem_security_definer
FROM pg_proc p
WHERE p.proname LIKE '%controle_os%'
ORDER BY p.proname;

-- 6. Recriar o trigger de sincronização CORRIGIDO
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

-- 8. Ver alguns gaps (sem usar a view, query direta)
SELECT 
  co.numero_os,
  co.lancado,
  co.pedido_id,
  CASE 
    WHEN co.lancado = FALSE AND co.justificativa IS NULL THEN TRUE
    ELSE FALSE
  END as precisa_atencao
FROM controle_os co
WHERE co.lancado = FALSE 
  AND co.justificativa IS NULL
ORDER BY co.numero_os DESC
LIMIT 10;

-- ============================================================================
-- EXPLICAÇÃO:
-- ============================================================================
-- O trigger estava marcando TODAS as OSs como lançadas ao criar a sequência
-- Agora ele só marca como lançada quando um PEDIDO com OS é criado/atualizado
-- As OSs da sequência que não têm pedido ficam corretamente como "nao_lancadas"
-- ============================================================================
