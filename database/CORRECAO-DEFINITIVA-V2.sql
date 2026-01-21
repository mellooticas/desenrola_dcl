-- ============================================================
-- CORREÇÃO DEFINITIVA V2: Limpar RASCUNHO e restaurar status
-- ============================================================
-- 1. Deletar pedidos RASCUNHO (obsoletos)
-- 2. Remover constraint restritivo
-- 3. Criar constraint correto com 11 status válidos
-- 4. Restaurar pedidos ao status original EXATO
-- ============================================================

-- PASSO 1: Deletar pedidos RASCUNHO (obsoletos)
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Contar quantos serão deletados
    SELECT COUNT(*) INTO v_count FROM pedidos WHERE status = 'RASCUNHO';
    
    IF v_count > 0 THEN
        -- Deletar da timeline primeiro (FK)
        DELETE FROM pedidos_timeline WHERE pedido_id IN (
            SELECT id FROM pedidos WHERE status = 'RASCUNHO'
        );
        
        -- Deletar os pedidos
        DELETE FROM pedidos WHERE status = 'RASCUNHO';
        
        RAISE NOTICE '✓ % pedidos RASCUNHO deletados (obsoletos)', v_count;
    ELSE
        RAISE NOTICE 'ℹ Nenhum pedido RASCUNHO encontrado';
    END IF;
END $$;

-- PASSO 2: Remover constraint restritivo
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pedidos_status_check'
    ) THEN
        ALTER TABLE pedidos DROP CONSTRAINT pedidos_status_check;
        RAISE NOTICE '✓ Constraint restritivo removido';
    END IF;
END $$;

-- PASSO 3: Criar constraint CORRETO com 11 status válidos
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

    RAISE NOTICE '✓ Novo constraint criado com 11 status válidos';
    RAISE NOTICE '';
    RAISE NOTICE 'Fluxo: PENDENTE → REGISTRADO → AG_PAGAMENTO → PAGO';
    RAISE NOTICE '       → PRODUCAO → PRONTO → ENVIADO → CHEGOU';
    RAISE NOTICE '       → ENTREGUE → FINALIZADO (+ CANCELADO)';
    RAISE NOTICE '';
END $$;

-- PASSO 4: Reverter pedidos ao status EXATO de antes de 10:49h
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
    
    FOR pedido_rec IN 
        WITH modificacoes_1049 AS (
            SELECT DISTINCT pt.pedido_id
            FROM pedidos_timeline pt
            WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
        ),
        ultimo_status_antes AS (
            SELECT 
                pedido_id,
                status_novo as status_correto,
                created_at,
                ROW_NUMBER() OVER (PARTITION BY pedido_id ORDER BY created_at DESC) as rn
            FROM pedidos_timeline
            WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
            AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
        ),
        status_correto_antes AS (
            SELECT pedido_id, status_correto
            FROM ultimo_status_antes
            WHERE rn = 1
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
            INSERT INTO pedidos_timeline (
                pedido_id,
                status_anterior,
                status_novo,
                responsavel_id
            ) VALUES (
                pedido_rec.pedido_id,
                pedido_rec.status_atual,
                pedido_rec.status_correto,
                '00000000-0000-0000-0000-000000000000'::uuid
            );
            
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
        RAISE NOTICE '✓ SUCESSO! Pedidos revertidos aos status originais.';
    ELSE
        RAISE NOTICE 'ℹ Nenhum pedido precisava ser revertido.';
    END IF;
    
END $$;

-- ============================================================
-- VALIDAÇÃO FINAL
-- ============================================================
WITH modificacoes_1049 AS (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
),
ultimo_status_antes AS (
    SELECT 
        pedido_id,
        status_novo as status_correto,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY pedido_id ORDER BY created_at DESC) as rn
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
    AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
),
status_correto_antes AS (
    SELECT pedido_id, status_correto
    FROM ultimo_status_antes
    WHERE rn = 1
)
SELECT 
    '=== RESULTADO FINAL ===' as secao,
    COUNT(*) as total_modificados,
    COUNT(CASE WHEN sc.status_correto = p.status THEN 1 END) as corretos,
    COUNT(CASE WHEN sc.status_correto != p.status THEN 1 END) as ainda_errados,
    CASE 
        WHEN COUNT(CASE WHEN sc.status_correto != p.status THEN 1 END) = 0 
        THEN '✓ TUDO CORRIGIDO!'
        ELSE '✗ Ainda há erros'
    END as status
FROM pedidos p
JOIN status_correto_antes sc ON sc.pedido_id = p.id;

| secao                   | total_modificados | corretos | ainda_errados | status           |
| ----------------------- | ----------------- | -------- | ------------- | ---------------- |
| === RESULTADO FINAL === | 38                | 0        | 38            | ✗ Ainda há erros |


-- Distribuição final
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


| secao                             | status   | quantidade |
| --------------------------------- | -------- | ---------- |
| === DISTRIBUIÇÃO PÓS-CORREÇÃO === | PRODUCAO | 7          |
| === DISTRIBUIÇÃO PÓS-CORREÇÃO === | ENTREGUE | 31         |