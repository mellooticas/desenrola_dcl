-- ============================================================
-- REVERSÃO DEFINITIVA: Desfazer bagunça de HOJE 21/01 10:49h
-- ============================================================
-- OBJETIVO: Reverter pedidos ao status correto ANTES de 10:49h
-- SEGURANÇA: Só reverte se status atual != status correto
-- ============================================================

DO $$
DECLARE
    pedido_rec RECORD;
    v_total_revertidos INTEGER := 0;
    v_total_analisados INTEGER := 0;
        
BEGIN
    RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  REVERSÃO DEFINITIVA - Desfazer bagunça de 10:49h hoje  ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    
    -- Loop pelos pedidos que precisam ser revertidos
    FOR pedido_rec IN 
        WITH modificacoes_1049 AS (
            -- Todos os pedidos modificados às 10:49h
            SELECT DISTINCT pt.pedido_id
            FROM pedidos_timeline pt
            WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
        ),
        status_correto_antes AS (
            -- Último status de cada pedido ANTES de 10:49h
            SELECT DISTINCT ON (pedido_id)
                pedido_id,
                status_novo as status_correto
            FROM pedidos_timeline
            WHERE created_at < '2026-01-21 13:49:00+00'::timestamp  -- 10:49 SP = 13:49 UTC
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
        WHERE sc.status_correto != p.status  -- Só os que ainda estão errados
        ORDER BY p.numero_sequencial
    LOOP
        v_total_analisados := v_total_analisados + 1;
        
        BEGIN
            -- Registrar na timeline ANTES de reverter
            INSERT INTO pedidos_timeline (
                pedido_id,
                status_anterior,
                status_novo,
                responsavel_id
            ) VALUES (
                pedido_rec.pedido_id,
                pedido_rec.status_atual,
                pedido_rec.status_correto,
                '00000000-0000-0000-0000-000000000000'::uuid  -- Sistema
            );
            
            -- Reverter o status
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
            RAISE WARNING '✗ ERRO ao reverter #OS %: %', pedido_rec.numero_sequencial, SQLERRM;
        END;
        
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                    RESUMO DA REVERSÃO                     ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
    RAISE NOTICE 'Pedidos analisados:  %', v_total_analisados;
    RAISE NOTICE 'Pedidos revertidos:  %', v_total_revertidos;
    RAISE NOTICE 'Falhas:              %', v_total_analisados - v_total_revertidos;
    RAISE NOTICE '';
    
    IF v_total_revertidos > 0 THEN
        RAISE NOTICE '✓ SUCESSO! Pedidos revertidos ao status correto.';
        RAISE NOTICE '';
        RAISE NOTICE 'Próximos passos:';
        RAISE NOTICE '1. Verifique o Kanban para confirmar que as colunas estão corretas';
        RAISE NOTICE '2. Execute DIAGNOSTICO-EMERGENCIA-HOJE.sql para validar';
    ELSE
        RAISE NOTICE 'ℹ Nenhum pedido precisava ser revertido (todos já corretos).';
    END IF;
    
END $$;

-- ============================================================
-- VALIDAÇÃO PÓS-REVERSÃO
-- ============================================================

-- Verificar se ainda tem algum pedido errado
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
    '=== VALIDAÇÃO PÓS-REVERSÃO ===' as secao,
    COUNT(*) as total_modificados_1049,
    COUNT(CASE WHEN sc.status_correto = p.status THEN 1 END) as corretos,
    COUNT(CASE WHEN sc.status_correto != p.status THEN 1 END) as ainda_errados,
    CASE 
        WHEN COUNT(CASE WHEN sc.status_correto != p.status THEN 1 END) = 0 
        THEN '✓ TUDO CORRIGIDO!'
        ELSE '✗ Ainda há erros - reexecutar script'
    END as status_final
FROM pedidos p
JOIN status_correto_antes sc ON sc.pedido_id = p.id;

-- Listar qualquer pedido que ainda esteja errado (se houver)
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
    '=== PEDIDOS AINDA ERRADOS (se houver) ===' as secao,
    p.numero_sequencial as "#OS",
    sc.status_correto as "Deveria estar",
    p.status as "Está em"
FROM pedidos p
JOIN status_correto_antes sc ON sc.pedido_id = p.id
WHERE sc.status_correto != p.status
ORDER BY p.numero_sequencial;


| secao                                     | #OS | Deveria estar | Está em  |
| ----------------------------------------- | --- | ------------- | -------- |
| === PEDIDOS AINDA ERRADOS (se houver) === | 57  | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 61  | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 269 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 278 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 390 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 453 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 461 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 485 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 496 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 506 | PRONTO        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 510 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 544 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 578 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 594 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 596 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 605 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 614 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 615 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 616 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 617 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 619 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 621 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 622 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 624 | ENVIADO       | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 626 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 627 | ENVIADO       | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 629 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 630 | ENVIADO       | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 631 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 646 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 650 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 655 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 660 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 661 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 665 | CHEGOU        | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 671 | ENVIADO       | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 672 | ENVIADO       | ENTREGUE |
| === PEDIDOS AINDA ERRADOS (se houver) === | 683 | AG_PAGAMENTO  | PRODUCAO |
| === PEDIDOS AINDA ERRADOS (se houver) === | 684 | REGISTRADO    | RASCUNHO |

