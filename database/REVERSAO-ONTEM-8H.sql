-- ============================================================
-- 🔄 REVERSÃO: RESTAURAR PEDIDOS PARA ANTES DAS 8H DE ONTEM
-- ============================================================
-- Reverter todas mudanças feitas após 20/01/2026 08:00h SP
-- Usar pedidos_timeline para descobrir status corretos
-- ============================================================

DO $$
DECLARE
  v_horario_corte TIMESTAMPTZ;
  v_pedido RECORD;
  v_status_correto TEXT;
  v_total_revertidos INTEGER := 0;
  v_total_sem_mudanca INTEGER := 0;
  v_total_problemas INTEGER := 0;
BEGIN
  -- Calcular horário de corte: 20/01/2026 08:00h horário São Paulo
  v_horario_corte := ('2026-01-20 08:00:00'::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
  
  RAISE NOTICE '🕐 HORÁRIO DE CORTE: % (UTC)', v_horario_corte;
  RAISE NOTICE '🕐 HORÁRIO DE CORTE: % (SP)', v_horario_corte AT TIME ZONE 'America/Sao_Paulo';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 BUSCANDO PEDIDOS MODIFICADOS APÓS 8H DE ONTEM...';
  RAISE NOTICE '';
  
  -- Loop em TODOS os pedidos modificados após 8h de ontem (incluindo ENTREGUE)
  FOR v_pedido IN 
    SELECT 
      p.id,
      p.numero_sequencial,
      p.status as status_atual,
      p.updated_at,
      p.laboratorio_id
    FROM pedidos p
    WHERE p.updated_at >= v_horario_corte
    ORDER BY p.numero_sequencial
  LOOP
    -- Buscar último status válido ANTES das 8h na timeline
    SELECT pt.status_novo INTO v_status_correto
    FROM pedidos_timeline pt
    WHERE pt.pedido_id = v_pedido.id
      AND pt.created_at < v_horario_corte
    ORDER BY pt.created_at DESC
    LIMIT 1;
    
    -- Verificar se status é NULL antes de processar
    IF v_status_correto IS NULL THEN
      -- Será tratado no próximo bloco
      NULL;
    -- Mapear RASCUNHO que não existe no ENUM
    ELSIF v_status_correto = 'RASCUNHO' THEN
      v_status_correto := 'PENDENTE';
      RAISE NOTICE '🔄 Pedido #% - Mapeando RASCUNHO → PENDENTE', v_pedido.numero_sequencial;
    -- Mapear status antigos que devem ser unificados
    ELSIF v_status_correto IN ('CHEGOU', 'chegou', 'PRONTO', 'pronto') THEN
      v_status_correto := 'ENTREGUE';
      RAISE NOTICE '🔄 Pedido #% - Mapeando % → ENTREGUE', v_pedido.numero_sequencial, v_status_correto;
    ELSIF v_status_correto IN ('ENVIADO', 'enviado') THEN
      v_status_correto := 'PRODUCAO';
      RAISE NOTICE '🔄 Pedido #% - Mapeando % → PRODUCAO', v_pedido.numero_sequencial, v_status_correto;
    ELSIF v_status_correto IN ('pendente', 'pago', 'producao', 'entregue') THEN
      -- Converter minúsculas para MAIÚSCULAS
      v_status_correto := UPPER(v_status_correto);
      RAISE NOTICE '🔄 Pedido #% - Convertendo minúscula → MAIÚSCULA: %', v_pedido.numero_sequencial, v_status_correto;
    ELSIF v_status_correto IN ('REGISTRADO', 'registrado', 'AG_PAGAMENTO', 'ag_pagamento') THEN
      -- Converter para PENDENTE (status inicial)
      v_status_correto := 'PENDENTE';
      RAISE NOTICE '🔄 Pedido #% - Mapeando % → PENDENTE (status inicial)', v_pedido.numero_sequencial, v_status_correto;
    -- Status válidos finais: MONTAGEM, PENDENTE, PAGO, PRODUCAO, ENTREGUE, FINALIZADO, CANCELADO
    ELSIF v_status_correto IN (
      'MONTAGEM', 'PENDENTE', 'PAGO', 'PRODUCAO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO'
    ) THEN
      -- Status válido, manter
      NULL;
    ELSE
      -- Status completamente desconhecido
      RAISE NOTICE '⚠️  Pedido #% - Status inesperado "%" → PRODUCAO', v_pedido.numero_sequencial, v_status_correto;
      v_status_correto := 'PRODUCAO';
    END IF;
    
    -- Se não encontrou na timeline, significa que nunca teve mudança antes das 8h
    -- Vamos verificar se o pedido foi criado antes das 8h
    IF v_status_correto IS NULL THEN
      -- Verificar se pedido foi criado antes das 8h
      IF EXISTS (
        SELECT 1 FROM pedidos 
        WHERE id = v_pedido.id 
        AND created_at < v_horario_corte
      ) THEN
        -- Pedido antigo sem timeline: manter como está ou definir padrão
        RAISE NOTICE '⚠️  Pedido #% - SEM TIMELINE antes das 8h (criado antes, sem histórico)', v_pedido.numero_sequencial;
        v_total_problemas := v_total_problemas + 1;
        CONTINUE;
      ELSE
        -- Pedido criado APÓS as 8h: não devemos reverter, é legítimo
        RAISE NOTICE '✅ Pedido #% - Criado APÓS 8h (legítimo, não reverter)', v_pedido.numero_sequencial;
        v_total_sem_mudanca := v_total_sem_mudanca + 1;
        CONTINUE;
      END IF;
    END IF;
    
    -- Se o status atual é igual ao status correto, não precisa reverter
    IF v_pedido.status_atual = v_status_correto THEN
      RAISE NOTICE '✓ Pedido #% - Status já correto: %', v_pedido.numero_sequencial, v_status_correto;
      v_total_sem_mudanca := v_total_sem_mudanca + 1;
      CONTINUE;
    END IF;
    
    -- Reverter status
    RAISE NOTICE '🔄 Pedido #% - Revertendo % → %', 
      v_pedido.numero_sequencial, 
      v_pedido.status_atual, 
      v_status_correto;
    
    UPDATE pedidos
    SET 
      status = v_status_correto::status_pedido,
      updated_at = NOW()
    WHERE id = v_pedido.id;
    
    v_total_revertidos := v_total_revertidos + 1;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '📊 RESUMO DA REVERSÃO:';
  RAISE NOTICE '   ✅ Pedidos revertidos: %', v_total_revertidos;
  RAISE NOTICE '   ➖ Já estavam corretos: %', v_total_sem_mudanca;
  RAISE NOTICE '   ⚠️  Problemas (sem timeline): %', v_total_problemas;
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Corrigir pedidos sem laboratorio_id (se houver) - INCLUINDO ENTREGUE
  UPDATE pedidos
  SET laboratorio_id = (
    SELECT laboratorio_id 
    FROM pedidos_timeline pt
    WHERE pt.pedido_id = pedidos.id
      AND pt.laboratorio_id IS NOT NULL
    ORDER BY pt.created_at DESC
    LIMIT 1
  )
  WHERE laboratorio_id IS NULL
    AND EXISTS (
      SELECT 1 FROM pedidos_timeline pt2
      WHERE pt2.pedido_id = pedidos.id
        AND pt2.laboratorio_id IS NOT NULL
    );
  
  RAISE NOTICE '🔧 Corrigidos pedidos sem laboratorio_id';
  RAISE NOTICE '';
  
END $$;

-- ============================================================
-- ✅ VERIFICAÇÃO FINAL: DISTRIBUIÇÃO POR STATUS
-- ============================================================
SELECT 
  '📊 DISTRIBUIÇÃO FINAL' as info,
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM pedidos
GROUP BY status
ORDER BY total DESC;

-- ============================================================
-- ✅ VERIFICAÇÃO: PEDIDOS EM PRODUCAO
-- ============================================================
SELECT 
  '🏭 PEDIDOS EM PRODUCAO' as info,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos
FROM pedidos
WHERE status = 'PRODUCAO';

-- ============================================================
-- ✅ VERIFICAÇÃO: PEDIDOS EM AG_PAGAMENTO
-- ============================================================
SELECT 
  '💰 PEDIDOS EM AG_PAGAMENTO' as info,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos
FROM pedidos
WHERE status = 'AG_PAGAMENTO';

-- ============================================================
-- ✅ VERIFICAÇÃO: PEDIDOS EM RASCUNHO
-- ============================================================
SELECT 
  '📝 PEDIDOS EM RASCUNHO' as info,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos
FROM pedidos
WHERE status = 'RASCUNHO';

-- ============================================================
-- ✅ VERIFICAÇÃO: PEDIDOS SEM LABORATORIO
-- ============================================================
SELECT 
  '❌ PEDIDOS SEM LABORATORIO' as info,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos
FROM pedidos
WHERE laboratorio_id IS NULL;

-- ============================================================
-- 🎯 EXECUTE E VERIFIQUE OS RESULTADOS!
-- ============================================================
