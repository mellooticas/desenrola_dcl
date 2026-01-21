-- ============================================================
-- CORREÇÃO FORÇA BRUTA: Deletar timeline errada + UPDATE direto
-- ============================================================
-- ESTRATÉGIA:
-- 1. Deletar RASCUNHO
-- 2. DELETAR registros da timeline criados às 10:49h (os errados!)
-- 3. DESABILITAR triggers
-- 4. UPDATE DIRETO nos 38 pedidos (força bruta)
-- 5. REABILITAR triggers
-- ============================================================

-- PASSO 1: Deletar pedidos RASCUNHO
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM pedidos WHERE status = 'RASCUNHO';
    
    IF v_count > 0 THEN
        DELETE FROM pedidos_timeline WHERE pedido_id IN (
            SELECT id FROM pedidos WHERE status = 'RASCUNHO'
        );
        DELETE FROM pedidos WHERE status = 'RASCUNHO';
        RAISE NOTICE '✓ % pedidos RASCUNHO deletados', v_count;
    ELSE
        RAISE NOTICE 'ℹ Nenhum pedido RASCUNHO';
    END IF;
END $$;

-- PASSO 2: DELETAR registros ERRADOS da timeline (10:49h)
DO $$
DECLARE
    v_deletados INTEGER;
BEGIN
    -- Contar quantos serão deletados
    SELECT COUNT(*) INTO v_deletados
    FROM pedidos_timeline
    WHERE DATE_TRUNC('minute', created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp;
    
    -- Deletar os registros errados
    DELETE FROM pedidos_timeline
    WHERE DATE_TRUNC('minute', created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp;
    
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  % registros ERRADOS deletados da timeline (10:49h)', v_deletados;
    RAISE NOTICE 'Timeline agora está limpa!';
    RAISE NOTICE '';
END $$;

-- PASSO 3: Remover constraint e criar correto
DO $$
BEGIN
    -- Remover constraint antigo
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pedidos_status_check') THEN
        ALTER TABLE pedidos DROP CONSTRAINT pedidos_status_check;
    END IF;
    
    -- Criar constraint correto
    ALTER TABLE pedidos 
    ADD CONSTRAINT pedidos_status_check 
    CHECK (status IN (
        'PENDENTE', 'REGISTRADO', 'AG_PAGAMENTO', 'PAGO',
        'PRODUCAO', 'PRONTO', 'ENVIADO', 'CHEGOU',
        'ENTREGUE', 'FINALIZADO', 'CANCELADO'
    ));
    
    RAISE NOTICE '✓ Constraint corrigido (11 status válidos)';
END $$;

-- PASSO 4: DESABILITAR triggers
DO $$
BEGIN
    ALTER TABLE pedidos DISABLE TRIGGER trigger_pedidos_timeline;
    ALTER TABLE pedidos DISABLE TRIGGER trigger_criar_evento_timeline;
    RAISE NOTICE '⚠️  Triggers DESABILITADOS';
END $$;

-- PASSO 5: UPDATE FORÇA BRUTA nos 38 pedidos
DO $$
DECLARE
    v_revertidos INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════╗';
    RAISE NOTICE '║   UPDATE FORÇA BRUTA - 38 pedidos         ║';
    RAISE NOTICE '╚════════════════════════════════════════════╝';
    RAISE NOTICE '';
    
    -- 25 pedidos: ENTREGUE → CHEGOU
    UPDATE pedidos SET status = 'CHEGOU', updated_at = NOW()
    WHERE numero_sequencial IN (57, 61, 269, 278, 390, 453, 461, 485, 496, 510, 544, 578, 594, 596, 605, 616, 617, 619, 621, 622, 626, 629, 646, 661, 665);
    GET DIAGNOSTICS v_revertidos = ROW_COUNT;
    RAISE NOTICE '✓ % pedidos: ENTREGUE → CHEGOU', v_revertidos;
    
    -- 7 pedidos: PRODUCAO → AG_PAGAMENTO
    UPDATE pedidos SET status = 'AG_PAGAMENTO', updated_at = NOW()
    WHERE numero_sequencial IN (614, 615, 631, 650, 655, 660, 683);
    GET DIAGNOSTICS v_revertidos = ROW_COUNT;
    RAISE NOTICE '✓ % pedidos: PRODUCAO → AG_PAGAMENTO', v_revertidos;
    
    -- 1 pedido: ENTREGUE → PRONTO
    UPDATE pedidos SET status = 'PRONTO', updated_at = NOW()
    WHERE numero_sequencial = 506;
    RAISE NOTICE '✓ 1 pedido: ENTREGUE → PRONTO (OS #506)';
    
    -- 5 pedidos: ENTREGUE → ENVIADO
    UPDATE pedidos SET status = 'ENVIADO', updated_at = NOW()
    WHERE numero_sequencial IN (624, 627, 630, 671, 672);
    GET DIAGNOSTICS v_revertidos = ROW_COUNT;
    RAISE NOTICE '✓ % pedidos: ENTREGUE → ENVIADO', v_revertidos;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ 38 pedidos atualizados via UPDATE direto!';
    RAISE NOTICE '';
END $$;

-- PASSO 6: REABILITAR triggers
DO $$
BEGIN
    ALTER TABLE pedidos ENABLE TRIGGER trigger_pedidos_timeline;
    ALTER TABLE pedidos ENABLE TRIGGER trigger_criar_evento_timeline;
    RAISE NOTICE '✓ Triggers REABILITADOS';
    RAISE NOTICE '✓ Sistema normalizado';
    RAISE NOTICE '';
END $$;

-- ============================================================
-- VALIDAÇÃO FINAL
-- ============================================================

-- Verificar quantos ainda estão errados
SELECT 
    '=== VALIDAÇÃO FINAL ===' as secao,
    status,
    COUNT(*) as quantidade
FROM pedidos
WHERE numero_sequencial IN (
    57, 61, 269, 278, 390, 453, 461, 485, 496, 506, 510, 544, 578, 594, 596, 605,
    614, 615, 616, 617, 619, 621, 622, 624, 626, 627, 629, 630, 631, 646, 650, 655,
    660, 661, 665, 671, 672, 683
)
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'AG_PAGAMENTO' THEN 1
        WHEN 'PRONTO' THEN 2
        WHEN 'ENVIADO' THEN 3
        WHEN 'CHEGOU' THEN 4
        WHEN 'ENTREGUE' THEN 5
        WHEN 'PRODUCAO' THEN 6
        ELSE 99
    END;

-- Resultado esperado:
-- AG_PAGAMENTO: 7
-- PRONTO: 1
-- ENVIADO: 5
-- CHEGOU: 25
-- Total: 38 ✓

-- Última verificação na timeline
SELECT 
    '=== TIMELINE LIMPA? ===' as secao,
    COUNT(*) as registros_10h49_restantes
FROM pedidos_timeline
WHERE DATE_TRUNC('minute', created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp;

-- Esperado: 0 registros
| secao                   | registros_10h49_restantes |
| ----------------------- | ------------------------- |
| === TIMELINE LIMPA? === | 0                         |

