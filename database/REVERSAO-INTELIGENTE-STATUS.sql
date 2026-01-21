-- ============================================================
-- 🔧 REVERSÃO INTELIGENTE - RESTAURAR STATUS CORRETOS
-- ============================================================
-- Usar a timeline para restaurar o último status válido de cada pedido
-- ============================================================

DO $$
DECLARE
  v_pedido RECORD;
  v_count_registrado INTEGER := 0;
  v_count_outros INTEGER := 0;
  v_count_sem_historico INTEGER := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 INICIANDO REVERSÃO INTELIGENTE DE STATUS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Processar cada pedido em PRODUCAO
  FOR v_pedido IN
    SELECT 
      p.id,
      p.numero_sequencial,
      p.status as status_atual,
      (
        SELECT pt.status_novo
        FROM pedidos_timeline pt
        WHERE pt.pedido_id = p.id
          AND pt.created_at < (CURRENT_DATE + INTERVAL '10 hours 30 minutes')
          AND pt.evento_tipo = 'mudanca_status'
        ORDER BY pt.created_at DESC
        LIMIT 1
      ) as ultimo_status_antes_1030
    FROM pedidos p
    WHERE p.status = 'PRODUCAO'
  LOOP
    -- Se encontrou status anterior na timeline, restaurar
    IF v_pedido.ultimo_status_antes_1030 IS NOT NULL THEN
      UPDATE pedidos
      SET 
        status = v_pedido.ultimo_status_antes_1030,
        updated_at = NOW()
      WHERE id = v_pedido.id;
      
      IF v_pedido.ultimo_status_antes_1030 = 'REGISTRADO' THEN
        v_count_registrado := v_count_registrado + 1;
      ELSE
        v_count_outros := v_count_outros + 1;
        RAISE NOTICE '  OS #% restaurado para: %', v_pedido.numero_sequencial, v_pedido.ultimo_status_antes_1030;
      END IF;
      
    ELSE
      -- Sem histórico, manter como REGISTRADO (seguro)
      UPDATE pedidos
      SET 
        status = 'REGISTRADO',
        updated_at = NOW()
      WHERE id = v_pedido.id;
      
      v_count_sem_historico := v_count_sem_historico + 1;
      RAISE NOTICE '  ⚠️  OS #% sem histórico, definido como REGISTRADO', v_pedido.numero_sequencial;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ REVERSÃO CONCLUÍDA';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumo:';
  RAISE NOTICE '  - % pedidos restaurados para REGISTRADO', v_count_registrado;
  RAISE NOTICE '  - % pedidos restaurados para outros status', v_count_outros;
  RAISE NOTICE '  - % pedidos sem histórico (definidos como REGISTRADO)', v_count_sem_historico;
  RAISE NOTICE '';
  
END $$;

-- REMOVER PEDIDOS COM STATUS RASCUNHO (não deveria existir)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🗑️  REMOVENDO STATUS RASCUNHO INVÁLIDO';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  UPDATE pedidos
  SET 
    status = 'REGISTRADO',
    updated_at = NOW()
  WHERE status = 'RASCUNHO';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ % pedidos com status RASCUNHO convertidos para REGISTRADO', v_count;
  ELSE
    RAISE NOTICE '✅ Nenhum pedido com status RASCUNHO encontrado';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- CORRIGIR OS 3 PEDIDOS SEM LABORATÓRIO
DO $$
DECLARE
  v_default_lab_id uuid;
  v_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 CORRIGINDO PEDIDOS SEM LABORATÓRIO';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Pegar laboratório padrão (Essilor, ou o primeiro ativo)
  SELECT id INTO v_default_lab_id
  FROM laboratorios
  WHERE ativo = true
    AND (nome ILIKE '%essilor%' OR nome ILIKE '%zeiss%')
  ORDER BY 
    CASE 
      WHEN nome ILIKE '%essilor%' THEN 1
      WHEN nome ILIKE '%zeiss%' THEN 2
      ELSE 3
    END
  LIMIT 1;
  
  -- Se não encontrou, pega qualquer um ativo
  IF v_default_lab_id IS NULL THEN
    SELECT id INTO v_default_lab_id
    FROM laboratorios
    WHERE ativo = true
    LIMIT 1;
  END IF;
  
  IF v_default_lab_id IS NULL THEN
    RAISE NOTICE '❌ ERRO: Nenhum laboratório ativo encontrado!';
  ELSE
    UPDATE pedidos
    SET 
      laboratorio_id = v_default_lab_id,
      updated_at = NOW()
    WHERE laboratorio_id IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RAISE NOTICE '✅ % pedidos sem laboratório corrigidos', v_count;
    RAISE NOTICE '📍 Laboratório atribuído: %', v_default_lab_id;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- VERIFICAÇÃO FINAL COMPLETA
SELECT 
  '✅ VERIFICAÇÃO FINAL' as tipo,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'REGISTRADO') as registrado,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'PENDENTE') as pendente,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'AG_PAGAMENTO') as ag_pagamento,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'PAGO') as pago,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'PRODUCAO') as producao,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'PRONTO') as pronto,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'ENVIADO') as enviado,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'CHEGOU') as chegou,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'ENTREGUE') as entregue,
  (SELECT COUNT(*) FROM pedidos WHERE laboratorio_id IS NULL) as sem_lab;

-- RESUMO POR STATUS
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial DESC) 
    FILTER (WHERE status IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU'))
    as exemplos_pedidos_kanban
FROM pedidos
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'PENDENTE' THEN 1
    WHEN 'REGISTRADO' THEN 2
    WHEN 'AG_PAGAMENTO' THEN 3
    WHEN 'PAGO' THEN 4
    WHEN 'PRODUCAO' THEN 5
    WHEN 'PRONTO' THEN 6
    WHEN 'ENVIADO' THEN 7
    WHEN 'CHEGOU' THEN 8
    WHEN 'ENTREGUE' THEN 9
    WHEN 'FINALIZADO' THEN 10
    WHEN 'CANCELADO' THEN 11
    ELSE 99
  END;

-- ============================================================
-- ✅ EXECUTE E VEJA SE OS PEDIDOS FORAM RESTAURADOS
-- ============================================================
