-- ============================================================
-- DIAGNÓSTICO EMERGÊNCIA: O que aconteceu HOJE às 10:49h?
-- ============================================================
-- URGENTE: Identificar modificações em massa que bagunçaram pedidos
-- ============================================================

-- QUERY 1: Resumo das modificações de HOJE 21/01 às 10:49h
SELECT 
    '=== MODIFICAÇÕES EM MASSA HOJE 10:49h ===' as secao,
    pt.status_anterior,
    pt.status_novo,
    COUNT(*) as quantidade,
    STRING_AGG(DISTINCT p.numero_sequencial::text, ', ' ORDER BY p.numero_sequencial::text) as pedidos_afetados
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
GROUP BY pt.status_anterior, pt.status_novo
ORDER BY quantidade DESC;

| secao                                     | status_anterior | status_novo | quantidade | pedidos_afetados                                                                                                          |
| ----------------------------------------- | --------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| === MODIFICAÇÕES EM MASSA HOJE 10:49h === | CHEGOU          | ENTREGUE    | 25         | 269, 278, 390, 453, 461, 485, 496, 510, 544, 57, 578, 594, 596, 605, 61, 616, 617, 619, 621, 622, 626, 629, 646, 661, 665 |
| === MODIFICAÇÕES EM MASSA HOJE 10:49h === | AG_PAGAMENTO    | PRODUCAO    | 7          | 614, 615, 631, 650, 655, 660, 683                                                                                         |
| === MODIFICAÇÕES EM MASSA HOJE 10:49h === | ENVIADO         | ENTREGUE    | 5          | 624, 627, 630, 671, 672                                                                                                   |
| === MODIFICAÇÕES EM MASSA HOJE 10:49h === | PRONTO          | ENTREGUE    | 1          | 506                                                                                                                       |
| === MODIFICAÇÕES EM MASSA HOJE 10:49h === | REGISTRADO      | RASCUNHO    | 1          | 684                                                                                                                       |


-- QUERY 2: TODOS os pedidos modificados hoje às 10:49h com status ANTES e DEPOIS
WITH modificacoes_1049 AS (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
),
status_antes_1049 AS (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_correto_antes,
        created_at
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp  -- Antes das 10:49 SP
    AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
    ORDER BY pedido_id, created_at DESC
),
modificacao_1049 AS (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_anterior as status_que_estava,
        status_novo as status_que_colocaram
    FROM pedidos_timeline
    WHERE DATE_TRUNC('minute', created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
    ORDER BY pedido_id, created_at DESC
)
SELECT 
    '=== DETALHAMENTO: ANTES → 10:49h → AGORA ===' as secao,
    p.numero_sequencial as "#OS",
    sa.status_correto_antes as "Status CORRETO (antes 10:49h)",
    m.status_que_estava as "Status que ESTAVA às 10:49h",
    m.status_que_colocaram as "Status que COLOCARAM às 10:49h",
    p.status as "Status ATUAL",
    CASE 
        WHEN sa.status_correto_antes = p.status THEN '✓ OK (voltou ao correto)'
        WHEN m.status_que_colocaram = p.status THEN '✗ ERRADO (ainda no status de 10:49h)'
        ELSE '? MUDOU DEPOIS (investigar)'
    END as situacao,
    p.laboratorio_id,
    p.loja_id
FROM pedidos p
JOIN modificacao_1049 m ON m.pedido_id = p.id
LEFT JOIN status_antes_1049 sa ON sa.pedido_id = p.id
ORDER BY 
    CASE 
        WHEN sa.status_correto_antes = p.status THEN 2  -- OK no final
        WHEN m.status_que_colocaram = p.status THEN 0  -- ERRADO (prioridade máxima)
        ELSE 1  -- Mudou depois (média prioridade)
    END,
    p.numero_sequencial;

| secao                                        | #OS | Status CORRETO (antes 10:49h) | Status que ESTAVA às 10:49h | Status que COLOCARAM às 10:49h | Status ATUAL | situacao                             | laboratorio_id                       | loja_id                              |
| -------------------------------------------- | --- | ----------------------------- | --------------------------- | ------------------------------ | ------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 57  | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 61  | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 269 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 278 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 21e9cb25-ca46-42f9-b297-db1e693325ed | 534cba2b-932f-4d26-b003-ae1dcb903361 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 390 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 453 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 461 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 485 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 496 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 506 | PRONTO                        | PRONTO                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 510 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 544 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 578 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 594 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 596 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 605 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 614 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 615 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 616 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 617 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 619 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 621 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 622 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 624 | ENVIADO                       | ENVIADO                     | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 626 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 627 | ENVIADO                       | ENVIADO                     | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 629 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 630 | ENVIADO                       | ENVIADO                     | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 631 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 646 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 650 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 655 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 660 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 661 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 665 | CHEGOU                        | CHEGOU                      | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 671 | ENVIADO                       | ENVIADO                     | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 672 | ENVIADO                       | ENVIADO                     | ENTREGUE                       | ENTREGUE     | ✗ ERRADO (ainda no status de 10:49h) | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 683 | AG_PAGAMENTO                  | AG_PAGAMENTO                | PRODUCAO                       | PRODUCAO     | ✗ ERRADO (ainda no status de 10:49h) | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === DETALHAMENTO: ANTES → 10:49h → AGORA === | 684 | REGISTRADO                    | REGISTRADO                  | RASCUNHO                       | RASCUNHO     | ✗ ERRADO (ainda no status de 10:49h) | null                                 | bab835bc-2df1-4f54-87c3-8151c61ec642 |


-- QUERY 3: Quantos pedidos ainda estão ERRADOS?
WITH modificacoes_1049 AS (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
),
status_antes_1049 AS (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_correto_antes
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
    AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
    ORDER BY pedido_id, created_at DESC
)
SELECT 
    '=== RESUMO SITUAÇÃO ATUAL ===' as secao,
    COUNT(*) as total_modificados_1049h,
    COUNT(CASE WHEN sa.status_correto_antes = p.status THEN 1 END) as ja_voltaram_correto,
    COUNT(CASE WHEN sa.status_correto_antes != p.status THEN 1 END) as ainda_errados,
    ROUND(
        COUNT(CASE WHEN sa.status_correto_antes != p.status THEN 1 END) * 100.0 / COUNT(*),
        2
    ) as percentual_ainda_errado
FROM pedidos p
JOIN modificacoes_1049 m ON m.pedido_id = p.id
LEFT JOIN status_antes_1049 sa ON sa.pedido_id = p.id;

| secao                         | total_modificados_1049h | ja_voltaram_correto | ainda_errados | percentual_ainda_errado |
| ----------------------------- | ----------------------- | ------------------- | ------------- | ----------------------- |
| === RESUMO SITUAÇÃO ATUAL === | 39                      | 0                   | 39            | 100.00                  |


-- QUERY 4: Lista APENAS os pedidos que AINDA estão ERRADOS (para reverter)
WITH modificacoes_1049 AS (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
),
status_antes_1049 AS (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_correto_antes
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
    AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
    ORDER BY pedido_id, created_at DESC
)
SELECT 
    '=== PEDIDOS AINDA ERRADOS (PRECISA REVERTER) ===' as secao,
    p.id,
    p.numero_sequencial as "#OS",
    sa.status_correto_antes as "Status CORRETO",
    p.status as "Status ERRADO ATUAL",
    p.laboratorio_id,
    p.loja_id
FROM pedidos p
JOIN status_antes_1049 sa ON sa.pedido_id = p.id
WHERE sa.status_correto_antes != p.status
ORDER BY p.numero_sequencial;

| secao                                            | id                                   | #OS | Status CORRETO | Status ERRADO ATUAL | laboratorio_id                       | loja_id                              |
| ------------------------------------------------ | ------------------------------------ | --- | -------------- | ------------------- | ------------------------------------ | ------------------------------------ |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | 57  | CHEGOU         | ENTREGUE            | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | f1f8e925-b175-4eeb-aa20-1215447c98ca | 61  | CHEGOU         | ENTREGUE            | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | 269 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | 278 | CHEGOU         | ENTREGUE            | 21e9cb25-ca46-42f9-b297-db1e693325ed | 534cba2b-932f-4d26-b003-ae1dcb903361 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 557943b2-c234-447f-a654-d0786769a363 | 390 | CHEGOU         | ENTREGUE            | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 40c404fd-9257-4ce2-8a73-904972b330f1 | 453 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | f3b74358-a11d-4235-8539-aeb80bea404b | 461 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | b3bfc123-174e-41a8-a698-051a64501be8 | 485 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496 | CHEGOU         | ENTREGUE            | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506 | PRONTO         | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510 | CHEGOU         | ENTREGUE            | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | ff627e2c-b227-4d0a-b10f-4c915e98677e | 578 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | 594 | CHEGOU         | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 8859f85b-6641-4b78-a70b-c930752ff81c | 596 | CHEGOU         | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605 | CHEGOU         | ENTREGUE            | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | 614 | AG_PAGAMENTO   | PRODUCAO            | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | a309317e-1121-497f-91d3-57117e0ca4ed | 615 | AG_PAGAMENTO   | PRODUCAO            | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 3363e27f-bb2f-4f39-bf80-ec3216785613 | 616 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | 617 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | 619 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | 621 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622 | CHEGOU         | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624 | ENVIADO        | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626 | CHEGOU         | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | d12459a9-4495-4d51-af6b-3793c016bf77 | 627 | ENVIADO        | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 683660d7-25f5-4075-9e01-f20d89b4c294 | 629 | CHEGOU         | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630 | ENVIADO        | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 30b73620-1724-4303-90b2-2b63b6b6f488 | 631 | AG_PAGAMENTO   | PRODUCAO            | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646 | CHEGOU         | ENTREGUE            | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | 650 | AG_PAGAMENTO   | PRODUCAO            | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | fb650ea1-670f-4194-91f5-982710d15333 | 655 | AG_PAGAMENTO   | PRODUCAO            | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 1512d395-ccdb-415c-8379-e9f2077c9413 | 660 | AG_PAGAMENTO   | PRODUCAO            | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 6c042a43-c816-4555-a998-3f776badd662 | 661 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665 | CHEGOU         | ENTREGUE            | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | aeb9d187-491a-47db-afb1-828dcb760089 | 671 | ENVIADO        | ENTREGUE            | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672 | ENVIADO        | ENTREGUE            | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | d747b999-694c-4ad8-a9dc-519fb4d51579 | 683 | AG_PAGAMENTO   | PRODUCAO            | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS AINDA ERRADOS (PRECISA REVERTER) === | 501d27f7-47fb-46fb-af2f-a9bb29eb6f8d | 684 | REGISTRADO     | RASCUNHO            | null                                 | bab835bc-2df1-4f54-87c3-8151c61ec642 |


-- QUERY 5: Verificar se houve outras modificações DEPOIS de 10:49h
SELECT 
    '=== MODIFICAÇÕES DEPOIS DE 10:49h (hoje) ===' as secao,
    DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') as minuto_sp,
    COUNT(*) as quantidade_modificacoes,
    COUNT(DISTINCT pt.pedido_id) as pedidos_distintos,
    STRING_AGG(DISTINCT pt.status_anterior || '→' || pt.status_novo, ', ') as transicoes
FROM pedidos_timeline pt
WHERE pt.created_at AT TIME ZONE 'America/Sao_Paulo' > '2026-01-21 10:50:00'::timestamp
AND (pt.created_at AT TIME ZONE 'America/Sao_Paulo')::date = '2026-01-21'::date
GROUP BY DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo')
ORDER BY minuto_sp DESC;

Success. No rows returned




-- ============================================================
-- RESUMO EXECUTIVO
-- ============================================================
SELECT '=== RESUMO EXECUTIVO EMERGÊNCIA ===' as titulo;

SELECT 
    'Total modificado às 10:49h hoje:' as metrica,
    COUNT(DISTINCT pt.pedido_id)::text as valor
FROM pedidos_timeline pt
WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp

UNION ALL

SELECT 
    'Pedidos que ainda estão errados:' as metrica,
    COUNT(CASE WHEN sa.status_correto_antes != p.status THEN 1 END)::text as valor
FROM pedidos p
JOIN (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
) m ON m.pedido_id = p.id
LEFT JOIN (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_correto_antes
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
    ORDER BY pedido_id, created_at DESC
) sa ON sa.pedido_id = p.id

UNION ALL

SELECT 
    'Script que causou o problema:' as metrica,
    'Modificação em massa às 10:49:52 SP (provável script de reversão)' as valor;

| metrica                          | valor                                                             |
| -------------------------------- | ----------------------------------------------------------------- |
| Total modificado às 10:49h hoje: | 39                                                                |
| Pedidos que ainda estão errados: | 39                                                                |
| Script que causou o problema:    | Modificação em massa às 10:49:52 SP (provável script de reversão) |
