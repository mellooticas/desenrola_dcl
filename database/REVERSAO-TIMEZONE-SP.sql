-- ============================================================
-- 🔧 REVERSÃO COM HORÁRIO SÃO PAULO CORRETO
-- ============================================================
-- Restaurar pedidos usando timezone de São Paulo
-- ============================================================

DO $$
DECLARE
  v_pedido RECORD;
  v_count_total INTEGER := 0;
  v_count_restaurado INTEGER := 0;
  v_count_registrado_padrao INTEGER := 0;
  v_horario_corte TIMESTAMP;
BEGIN
  -- Definir horário de corte: hoje às 10:30 horário São Paulo
  -- Convertendo para o timezone do banco
  v_horario_corte := (CURRENT_DATE || ' 10:30:00')::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AT TIME ZONE current_setting('TIMEZONE');
  
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 REVERSÃO INTELIGENTE COM TIMEZONE SÃO PAULO';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📍 Timezone do banco: %', current_setting('TIMEZONE');
  RAISE NOTICE '📍 Horário de corte (banco): %', v_horario_corte;
  RAISE NOTICE '📍 Horário de corte (SP): % 10:30:00', CURRENT_DATE;
  RAISE NOTICE '';
  
  -- Processar pedidos modificados após 10:30h SP
  FOR v_pedido IN
    SELECT 
      p.id,
      p.numero_sequencial,
      p.status as status_atual,
      p.updated_at,
      p.updated_at AT TIME ZONE 'America/Sao_Paulo' as updated_at_sp,
      (
        SELECT pt.status_novo
        FROM pedidos_timeline pt
        WHERE pt.pedido_id = p.id
          AND pt.created_at < v_horario_corte
          AND pt.evento_tipo = 'mudanca_status'
        ORDER BY pt.created_at DESC
        LIMIT 1
      ) as ultimo_status_valido
    FROM pedidos p
    WHERE p.updated_at >= v_horario_corte
      AND p.status IN ('PRODUCAO', 'RASCUNHO')
    ORDER BY p.numero_sequencial
  LOOP
    v_count_total := v_count_total + 1;
    
    -- Se encontrou status anterior na timeline, restaurar
    IF v_pedido.ultimo_status_valido IS NOT NULL THEN
      UPDATE pedidos
      SET 
        status = v_pedido.ultimo_status_valido,
        updated_at = v_horario_corte - INTERVAL '1 minute' -- Volta para antes do corte
      WHERE id = v_pedido.id;
      
      v_count_restaurado := v_count_restaurado + 1;
      RAISE NOTICE '  ✅ OS #% restaurado: PRODUCAO → %', v_pedido.numero_sequencial, v_pedido.ultimo_status_valido;
      
    ELSE
      -- Sem histórico válido, definir como REGISTRADO
      UPDATE pedidos
      SET 
        status = 'REGISTRADO',
        updated_at = v_horario_corte - INTERVAL '1 minute'
      WHERE id = v_pedido.id;
      
      v_count_registrado_padrao := v_count_registrado_padrao + 1;
      RAISE NOTICE '  ⚠️  OS #% sem histórico → REGISTRADO (padrão)', v_pedido.numero_sequencial;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ REVERSÃO CONCLUÍDA';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumo:';
  RAISE NOTICE '  - % pedidos processados', v_count_total;
  RAISE NOTICE '  - % pedidos restaurados com histórico', v_count_restaurado;
  RAISE NOTICE '  - % pedidos sem histórico (→ REGISTRADO)', v_count_registrado_padrao;
  RAISE NOTICE '';
  
END $$;

-- CORRIGIR PEDIDOS SEM LABORATÓRIO
DO $$
DECLARE
  v_default_lab_id uuid;
  v_lab_nome TEXT;
  v_count INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔧 CORRIGINDO LABORATÓRIOS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Pegar laboratório padrão (Essilor primeiro, senão qualquer ativo)
  SELECT id, nome INTO v_default_lab_id, v_lab_nome
  FROM laboratorios
  WHERE ativo = true
  ORDER BY 
    CASE 
      WHEN nome ILIKE '%essilor%' THEN 1
      WHEN nome ILIKE '%zeiss%' THEN 2
      ELSE 3
    END,
    created_at
  LIMIT 1;
  
  IF v_default_lab_id IS NULL THEN
    RAISE NOTICE '❌ ERRO: Nenhum laboratório ativo encontrado!';
    RETURN;
  END IF;
  
  RAISE NOTICE '📍 Laboratório selecionado: % (ID: %)', v_lab_nome, v_default_lab_id;
  RAISE NOTICE '';
  
  -- Atualizar pedidos sem laboratório
  UPDATE pedidos
  SET 
    laboratorio_id = v_default_lab_id,
    updated_at = NOW()
  WHERE laboratorio_id IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RAISE NOTICE '✅ % pedidos corrigidos (laboratório atribuído)', v_count;
  RAISE NOTICE '';
  
END $$;

-- VERIFICAÇÃO FINAL
SELECT 
  '📊 VERIFICAÇÃO FINAL' as info,
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
  (SELECT COUNT(*) FROM pedidos WHERE status = 'CANCELADO') as cancelado,
  (SELECT COUNT(*) FROM pedidos WHERE laboratorio_id IS NULL) as sem_lab;

-- DISTRIBUIÇÃO DETALHADA
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual,
  CASE 
    WHEN status IN ('PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU')
    THEN STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial DESC)
    ELSE NULL
  END as pedidos_operacionais
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
-- ✅ EXECUTE E CONFIRA OS RESULTADOS
-- ============================================================
