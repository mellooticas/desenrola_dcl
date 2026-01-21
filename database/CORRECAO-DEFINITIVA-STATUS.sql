-- ============================================================
-- CORREÇÃO DEFINITIVA: Remover constraint e restaurar status
-- ============================================================
-- DESCOBERTA: Todos os status (CHEGOU, PRONTO, ENVIADO, AG_PAGAMENTO, 
--             REGISTRADO) SÃO VÁLIDOS no fluxo do Kanban!
-- 
-- O problema é o check constraint que está mais restritivo que deveria.
-- 
-- SOLUÇÃO: 
-- 1. Remover o constraint restritivo
-- 2. Criar constraint correto com TODOS os status válidos
-- 3. Restaurar pedidos ao status original EXATO
-- ============================================================

-- PASSO 1: Remover constraint restritivo
DO $$
BEGIN
    -- Tentar dropar constraint se existir
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pedidos_status_check'
    ) THEN
        ALTER TABLE pedidos DROP CONSTRAINT pedidos_status_check;
        RAISE NOTICE '✓ Constraint restritivo removido';
    END IF;
END $$;

-- PASSO 2: Criar constraint CORRETO com TODOS os status do fluxo
DO $$
BEGIN
    ALTER TABLE pedidos 
    ADD CONSTRAINT pedidos_status_check 
    CHECK (status IN (
        'PENDENTE',
        'REGISTRADO',
        'AG_PAGAMENTO',
        'PAGO',
        'PRODUCAO',
        'PRONTO',
        'ENVIADO',
        'CHEGOU',
        'ENTREGUE',
        'FINALIZADO',
        'CANCELADO'
    ));

    RAISE NOTICE '✓ Novo constraint criado com todos os status válidos';
    RAISE NOTICE '';
    RAISE NOTICE 'Fluxo correto do Kanban:';
    RAISE NOTICE '  PENDENTE → REGISTRADO → AG_PAGAMENTO → PAGO';
    RAISE NOTICE '  → PRODUCAO → PRONTO → ENVIADO → CHEGOU';
    RAISE NOTICE '  → ENTREGUE → FINALIZADO';
    RAISE NOTICE '  (+ CANCELADO)';
    RAISE NOTICE '';
END $$;

-- PASSO 3: Agora reverter ao status EXATO de antes de 10:49h
DO $$
DECLARE
    pedido_rec RECORD;
    v_total_revertidos INTEGER := 0;
    v_total_analisados INTEGER := 0;
    v_total_erros INTEGER := 0;
        
BEGIN
    RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║     REVERSÃO DEFINITIVA - Status originais EXATOS       ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    
    -- Loop pelos pedidos que ainda estão errados
    FOR pedido_rec IN 
        WITH modificacoes_1049 AS (
            SELECT DISTINCT pt.pedido_id
            FROM pedidos_timeline pt
            WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
        ),
        status_correto_antes AS (
            SELECT DISTINCT ON (pedido_id)
                pedido_id,
                status_novo as status_correto
            FROM pedidos_timeline
            WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
            AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
            ORDER BY pedido_id, created_at DESC
        )
        SELECT 
            p.id as pedido_id,
            p.numero_sequencial,
            sc.status_correto,
            p.status as status_atual
        FROM pedidos p
        JOIN status_correto_antes sc ON sc.pedido_id = p.id
        WHERE sc.status_correto != p.status
        ORDER BY p.numero_sequencial
    LOOP
        v_total_analisados := v_total_analisados + 1;
        
        BEGIN
            -- Registrar na timeline
            INSERT INTO pedidos_timeline (
                pedido_id,
                status_anterior,
                status_novo,
                responsavel_id
            ) VALUES (
                pedido_rec.pedido_id,
                pedido_rec.status_atual,
                pedido_rec.status_correto,  -- Status EXATO original
                '00000000-0000-0000-0000-000000000000'::uuid
            );
            
            -- Reverter ao status EXATO
            UPDATE pedidos 
            SET 
                status = pedido_rec.status_correto,
                updated_at = NOW()
            WHERE id = pedido_rec.pedido_id;
            
            v_total_revertidos := v_total_revertidos + 1;
            
            RAISE NOTICE '✓ #OS % - % → %', 
                pedido_rec.numero_sequencial,
                pedido_rec.status_atual,
                pedido_rec.status_correto;
                
        EXCEPTION WHEN OTHERS THEN
            v_total_erros := v_total_erros + 1;
            RAISE WARNING '✗ ERRO #OS %: %', 
                pedido_rec.numero_sequencial, 
                SQLERRM;
        END;
        
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                    RESUMO DA REVERSÃO                     ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
    RAISE NOTICE 'Pedidos analisados:  %', v_total_analisados;
    RAISE NOTICE 'Pedidos revertidos:  %', v_total_revertidos;
    RAISE NOTICE 'Falhas:              %', v_total_erros;
    RAISE NOTICE '';
    
    IF v_total_revertidos > 0 THEN
        RAISE NOTICE '✓ SUCESSO! Pedidos revertidos aos status originais EXATOS.';
        RAISE NOTICE '';
        RAISE NOTICE 'Próximos passos:';
        RAISE NOTICE '1. Verifique o Kanban - todas as colunas devem aparecer';
        RAISE NOTICE '2. Pedidos devem estar nas posições corretas';
    ELSE
        RAISE NOTICE 'ℹ Nenhum pedido precisava ser revertido.';
    END IF;
    
END $$;

-- ============================================================
-- VALIDAÇÃO FINAL
-- ============================================================
SELECT 
    '=== VALIDAÇÃO FINAL ===' as secao,
    COUNT(*) as total_modificados_1049,
    COUNT(CASE 
        WHEN p.status IN ('PENDENTE','REGISTRADO','AG_PAGAMENTO','PAGO','PRODUCAO','PRONTO','ENVIADO','CHEGOU','ENTREGUE','FINALIZADO','CANCELADO') 
        THEN 1 
    END) as com_status_valido,
    COUNT(*) - COUNT(CASE 
        WHEN p.status IN ('PENDENTE','REGISTRADO','AG_PAGAMENTO','PAGO','PRODUCAO','PRONTO','ENVIADO','CHEGOU','ENTREGUE','FINALIZADO','CANCELADO') 
        THEN 1 
    END) as ainda_com_status_invalido
FROM pedidos p
WHERE p.id IN (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
);

-- Verificar se TODOS voltaram ao status correto
WITH modificacoes_1049 AS (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
),
status_correto_antes AS (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_correto
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
    AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
    ORDER BY pedido_id, created_at DESC
)
SELECT 
    '=== RESULTADO ===' as secao,
    CASE 
        WHEN COUNT(CASE WHEN sc.status_correto != p.status THEN 1 END) = 0 
        THEN '✓ TUDO CORRIGIDO! Todos os pedidos voltaram aos status originais.'
        ELSE '✗ Ainda há ' || COUNT(CASE WHEN sc.status_correto != p.status THEN 1 END) || ' pedidos errados.'
    END as status_final
FROM pedidos p
JOIN status_correto_antes sc ON sc.pedido_id = p.id;

-- Distribuição de status após correção
SELECT 
    '=== DISTRIBUIÇÃO PÓS-CORREÇÃO ===' as secao,
    p.status,
    COUNT(*) as quantidade
FROM pedidos p
WHERE p.id IN (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
)
GROUP BY p.status
ORDER BY 
    CASE p.status
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
