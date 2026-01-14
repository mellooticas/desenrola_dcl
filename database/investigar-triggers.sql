-- ========================================
-- INVESTIGAR: Código dos triggers que podem interferir
-- ========================================

-- 1. Ver código do trigger que atualiza datas
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'trigger_atualizar_datas_pedido';

-- 2. Ver código do trigger de timeline
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'trigger_criar_evento_timeline';

-- 3. Ver código do outro trigger de timeline
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'inserir_timeline_pedido';

-- 4. Ver código do trigger de controle OS
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'sync_controle_os';

-- 5. Ver código do trigger de OS sequencia
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'trigger_auto_adicionar_os_sequencia';

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
