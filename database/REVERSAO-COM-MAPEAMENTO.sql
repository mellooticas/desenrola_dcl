-- ============================================================
-- REVERSÃO COM MAPEAMENTO: Corrigir status obsoletos
-- ============================================================
-- OBJETIVO: Reverter usando mapeamento para status válidos
-- MAPEAMENTO:
--   CHEGOU → ENTREGUE (pedido já chegou, está entregue)
--   PRONTO → PRODUCAO (pedido pronto no lab, em produção)
--   ENVIADO → PRODUCAO (pedido enviado pelo lab, em produção)
--   AG_PAGAMENTO → PENDENTE (aguardando pagamento = pendente)
-- ============================================================

DO $$
DECLARE
    pedido_rec RECORD;
    v_status_mapeado TEXT;
    v_total_revertidos INTEGER := 0;
    v_total_analisados INTEGER := 0;
    v_total_erros INTEGER := 0;
        
BEGIN
    RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║       REVERSÃO COM MAPEAMENTO - Status Obsoletos        ║';
    RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Mapeamentos aplicados:';
    RAISE NOTICE '  CHEGOU → ENTREGUE (já chegou = entregue)';
    RAISE NOTICE '  PRONTO → PRODUCAO (pronto no lab = em produção)';
    RAISE NOTICE '  ENVIADO → PRODUCAO (enviado pelo lab = em produção)';
    RAISE NOTICE '  AG_PAGAMENTO → PENDENTE (aguardando pagamento)';
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
        
        -- Mapear status obsoleto para válido
        v_status_mapeado := CASE pedido_rec.status_correto
            WHEN 'CHEGOU' THEN 'ENTREGUE'
            WHEN 'PRONTO' THEN 'PRODUCAO'
            WHEN 'ENVIADO' THEN 'PRODUCAO'
            WHEN 'AG_PAGAMENTO' THEN 'PENDENTE'
            WHEN 'REGISTRADO' THEN 'PENDENTE'
            -- Status válidos mantém
            WHEN 'PENDENTE' THEN 'PENDENTE'
            WHEN 'PAGO' THEN 'PAGO'
            WHEN 'PRODUCAO' THEN 'PRODUCAO'
            WHEN 'ENTREGUE' THEN 'ENTREGUE'
            WHEN 'FINALIZADO' THEN 'FINALIZADO'
            WHEN 'CANCELADO' THEN 'CANCELADO'
            ELSE pedido_rec.status_correto  -- Mantém original se não mapear
        END;
        
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
                v_status_mapeado,
                '00000000-0000-0000-0000-000000000000'::uuid
            );
            
            -- Reverter o status
            UPDATE pedidos 
            SET 
                status = v_status_mapeado,
                updated_at = NOW()
            WHERE id = pedido_rec.pedido_id;
            
            v_total_revertidos := v_total_revertidos + 1;
            
            IF pedido_rec.status_correto != v_status_mapeado THEN
                RAISE NOTICE '✓ #OS % - % → % (era %)', 
                    pedido_rec.numero_sequencial,
                    pedido_rec.status_atual,
                    v_status_mapeado,
                    pedido_rec.status_correto;
            ELSE
                RAISE NOTICE '✓ #OS % - % → %', 
                    pedido_rec.numero_sequencial,
                    pedido_rec.status_atual,
                    v_status_mapeado;
            END IF;
                
        EXCEPTION WHEN OTHERS THEN
            v_total_erros := v_total_erros + 1;
            RAISE WARNING '✗ ERRO #OS %: % (tentou status: %)', 
                pedido_rec.numero_sequencial, 
                SQLERRM,
                v_status_mapeado;
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
        RAISE NOTICE '✓ SUCESSO! % pedidos revertidos com mapeamento.', v_total_revertidos;
        RAISE NOTICE '';
        RAISE NOTICE 'IMPORTANTE:';
        RAISE NOTICE '• Status obsoletos foram mapeados para válidos';
        RAISE NOTICE '• CHEGOU/PRONTO/ENVIADO → Confira no Kanban se fazem sentido';
        RAISE NOTICE '• AG_PAGAMENTO → Virou PENDENTE (revisar se pagos)';
    ELSE
        RAISE NOTICE 'ℹ Nenhum pedido precisava ser revertido.';
    END IF;
    
END $$;

-- ============================================================
-- VALIDAÇÃO PÓS-REVERSÃO
-- ============================================================
SELECT 
    '=== VALIDAÇÃO FINAL ===' as secao,
    COUNT(*) as total_checados,
    COUNT(CASE WHEN p.status IN ('PENDENTE', 'PAGO', 'PRODUCAO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO') THEN 1 END) as com_status_valido,
    COUNT(CASE WHEN p.status NOT IN ('PENDENTE', 'PAGO', 'PRODUCAO', 'ENTREGUE', 'FINALIZADO', 'CANCELADO') THEN 1 END) as com_status_invalido
FROM pedidos p
WHERE p.id IN (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
);

| secao                   | total_checados | com_status_valido | com_status_invalido |
| ----------------------- | -------------- | ----------------- | ------------------- |
| === VALIDAÇÃO FINAL === | 39             | 38                | 1                   |


-- Distribuição atual dos status após reversão
SELECT 
    '=== DISTRIBUIÇÃO APÓS REVERSÃO ===' as secao,
    p.status,
    COUNT(*) as quantidade
FROM pedidos p
WHERE p.id IN (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
)
GROUP BY p.status
ORDER BY quantidade DESC;


| secao                              | status   | quantidade |
| ---------------------------------- | -------- | ---------- |
| === DISTRIBUIÇÃO APÓS REVERSÃO === | ENTREGUE | 31         |
| === DISTRIBUIÇÃO APÓS REVERSÃO === | PRODUCAO | 7          |
| === DISTRIBUIÇÃO APÓS REVERSÃO === | RASCUNHO | 1          |
