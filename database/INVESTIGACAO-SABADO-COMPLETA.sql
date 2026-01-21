-- ============================================================
-- INVESTIGAÇÃO COMPLETA: Mudanças desde SÁBADO 18/01/2026
-- ============================================================
-- Objetivo: Identificar pedidos MODIFICADOS vs CRIADOS no período
-- CUIDADO: NÃO tocar em pedidos criados no período (status correto)
-- Foco: Pedidos que podem estar na "coluna errada do kanban"
-- ============================================================

-- Período de investigação
-- Sábado 18/01/2026 00:00h São Paulo = 03:00h UTC
-- Até agora 21/01/2026

-- ============================================================
-- QUERY 1: Overview geral do período
-- ============================================================
SELECT 
    '=== OVERVIEW GERAL ===' as secao,
    (SELECT COUNT(DISTINCT pedido_id) 
     FROM pedidos_timeline 
     WHERE created_at >= '2026-01-18 03:00:00+00') as total_pedidos_com_eventos,
    
    (SELECT COUNT(*) 
     FROM pedidos_timeline 
     WHERE created_at >= '2026-01-18 03:00:00+00') as total_eventos,
    
    (SELECT COUNT(DISTINCT id)
     FROM pedidos
     WHERE created_at >= '2026-01-18 03:00:00+00') as pedidos_criados_no_periodo,
    
    (SELECT COUNT(DISTINCT pedido_id)
     FROM pedidos_timeline 
     WHERE created_at >= '2026-01-18 03:00:00+00'
     AND pedido_id NOT IN (
         SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
     )) as pedidos_modificados_no_periodo;

| secao                  | total_pedidos_com_eventos | total_eventos | pedidos_criados_no_periodo | pedidos_modificados_no_periodo |
| ---------------------- | ------------------------- | ------------- | -------------------------- | ------------------------------ |
| === OVERVIEW GERAL === | 85                        | 144           | 2                          | 84                             |


-- ============================================================
-- QUERY 2: Pedidos CRIADOS no período (NÃO MEXER NESTES!)
-- ============================================================
SELECT 
    '=== PEDIDOS CRIADOS NO PERÍODO (STATUS CORRETO) ===' as secao,
    p.id,
    p.numero_sequencial,
    p.status,
    p.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as criado_em_sp,
    p.laboratorio_id,
    p.loja_id
FROM pedidos p
WHERE p.created_at >= '2026-01-18 03:00:00+00'
ORDER BY p.created_at DESC;

| secao                                               | id                                   | numero_sequencial | status   | criado_em_sp                  | laboratorio_id | loja_id                              |
| --------------------------------------------------- | ------------------------------------ | ----------------- | -------- | ----------------------------- | -------------- | ------------------------------------ |
| === PEDIDOS CRIADOS NO PERÍODO (STATUS CORRETO) === | e51f2e04-7e86-422e-bcfd-3ba50a6d213b | 694               | RASCUNHO | 2026-01-21 17:06:02.778357+00 | null           | bab835bc-2df1-4f54-87c3-8151c61ec642 |
| === PEDIDOS CRIADOS NO PERÍODO (STATUS CORRETO) === | 501d27f7-47fb-46fb-af2f-a9bb29eb6f8d | 684               | RASCUNHO | 2026-01-19 18:43:54.612+00    | null           | bab835bc-2df1-4f54-87c3-8151c61ec642 |


-- ============================================================
-- QUERY 3: Pedidos MODIFICADOS no período (INVESTIGAR ESTES!)
-- ============================================================
WITH pedidos_modificados AS (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
)
SELECT 
    '=== PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) ===' as secao,
    p.id,
    p.numero_sequencial,
    p.status as status_atual,
    p.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as ultima_modificacao_sp,
    p.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as criado_em_sp,
    p.laboratorio_id,
    p.loja_id,
    (SELECT COUNT(*) 
     FROM pedidos_timeline pt 
     WHERE pt.pedido_id = p.id 
     AND pt.created_at >= '2026-01-18 03:00:00+00') as num_eventos_no_periodo
FROM pedidos p
WHERE p.id IN (SELECT pedido_id FROM pedidos_modificados)
ORDER BY p.updated_at DESC;


| secao                                               | id                                   | numero_sequencial | status_atual | ultima_modificacao_sp         | criado_em_sp                  | laboratorio_id                       | loja_id                              | num_eventos_no_periodo |
| --------------------------------------------------- | ------------------------------------ | ----------------- | ------------ | ----------------------------- | ----------------------------- | ------------------------------------ | ------------------------------------ | ---------------------- |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | d747b999-694c-4ad8-a9dc-519fb4d51579 | 683               | PRODUCAO     | 2026-01-21 17:43:14.603699+00 | 2026-01-17 17:50:07.612543+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | 278               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-11-01 16:42:58.71216+00  | 21e9cb25-ca46-42f9-b297-db1e693325ed | 534cba2b-932f-4d26-b003-ae1dcb903361 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 1512d395-ccdb-415c-8379-e9f2077c9413 | 660               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-13 16:49:29.941332+00 | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6c042a43-c816-4555-a998-3f776badd662 | 661               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-13 23:01:47.567076+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 4                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | b3bfc123-174e-41a8-a698-051a64501be8 | 485               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-11 17:59:28.646121+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-15 03:15:22.434113+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 7                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 04:11:33.992372+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 03:40:05.305371+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | aeb9d187-491a-47db-afb1-828dcb760089 | 671               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-15 03:01:30.489966+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-13 23:34:48.427725+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | bc5c0c78-cb20-4222-b790-369aacbc0104 | 618               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:30:30.18586+00  | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 4                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | 614               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:09:10.08217+00  | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | 650               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-12 21:58:21.928863+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-18 20:24:02.564579+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 4                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-05 18:31:51.295792+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | f1f8e925-b175-4eeb-aa20-1215447c98ca | 61                | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-09-24 19:55:17.01571+00  | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 683660d7-25f5-4075-9e01-f20d89b4c294 | 629               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 04:07:11.953504+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | d12459a9-4495-4d51-af6b-3793c016bf77 | 627               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 03:51:50.409973+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-11 19:33:09.664275+00 | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | a309317e-1121-497f-91d3-57117e0ca4ed | 615               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:14:29.058988+00 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 30b73620-1724-4303-90b2-2b63b6b6f488 | 631               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 04:44:31.388827+00 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | fb650ea1-670f-4194-91f5-982710d15333 | 655               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-13 16:37:16.733474+00 | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670               | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | 2026-01-15 02:59:29.436838+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 557943b2-c234-447f-a654-d0786769a363 | 390               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-11-22 22:33:18.678637+00 | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-15 02:41:50.611151+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 3                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | 617               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:27:08.260169+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | 619               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:44:00.121909+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | 594               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-30 22:46:43.755708+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | ff627e2c-b227-4d0a-b10f-4c915e98677e | 578               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-26 23:10:59.284041+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 8859f85b-6641-4b78-a70b-c930752ff81c | 596               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-31 00:15:55.93588+00  | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | f3b74358-a11d-4235-8539-aeb80bea404b | 461               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-05 19:05:06.464309+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | 621               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:49:05.608647+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-12-16 19:02:38.741072+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 4                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 03:48:21.122368+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-07 19:19:24.18063+00  | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 | 4                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 3363e27f-bb2f-4f39-bf80-ec3216785613 | 616               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 02:21:54.994528+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | 57                | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-09-24 18:18:17.293287+00 | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-12 17:25:43.364+00    | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | 269               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2025-10-31 17:33:45.44282+00  | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622               | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | 2026-01-08 03:11:48.016131+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6a1be3ee-a0d2-408a-aa86-c823d2218635 | 623               | ENTREGUE     | 2026-01-20 21:42:27.163564+00 | 2026-01-08 03:30:05.901353+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 4eba0375-bb43-4fa1-8e46-956ae357717d | 647               | ENTREGUE     | 2026-01-20 21:42:22.221766+00 | 2026-01-12 17:28:31.442054+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | c194179b-8e6d-488f-a388-29242b54095c | 653               | ENTREGUE     | 2026-01-20 21:42:16.757002+00 | 2026-01-12 22:49:06.785312+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 980add89-67dd-4bc9-9f23-0147b16d1db5 | 454               | ENTREGUE     | 2026-01-20 21:42:10.837468+00 | 2025-12-05 18:36:27.866943+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 13214ef2-d410-4581-940b-318b50b1803f | 515               | ENTREGUE     | 2026-01-20 21:42:05.213634+00 | 2025-12-17 23:36:00.285712+00 | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 493d9300-5bd7-48b9-ae12-8d7b9dc174d7 | 649               | ENTREGUE     | 2026-01-20 21:41:58.851855+00 | 2026-01-12 17:43:04.906731+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 137a7b61-4651-4b66-8a75-03963ff20100 | 608               | ENTREGUE     | 2026-01-20 21:41:52.447725+00 | 2026-01-07 19:25:40.243499+00 | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | f8690f7a-e09e-48a4-af3f-abef417e180d | 635               | ENTREGUE     | 2026-01-20 21:41:46.548367+00 | 2026-01-08 16:13:54.049733+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 4fc18d0b-72e2-403a-bc35-9a8df511e599 | 612               | ENTREGUE     | 2026-01-20 21:41:40.115324+00 | 2026-01-07 19:41:43.891631+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 4651da99-85e9-431f-884c-f707e6ede76d | 577               | ENTREGUE     | 2026-01-20 19:59:35.812351+00 | 2025-12-26 23:09:34.075482+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 988a106e-5ba1-406a-991f-7be35dced4b4 | 651               | ENTREGUE     | 2026-01-20 19:59:28.704984+00 | 2026-01-12 22:45:54.570885+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 1ae9f3d3-cfd1-4ee2-814c-1ae1fd982a2e | 473               | ENTREGUE     | 2026-01-20 19:58:48.312717+00 | 2025-12-08 22:44:14.068005+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | 534cba2b-932f-4d26-b003-ae1dcb903361 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 069e36b5-dba4-4fdf-abb3-82f9e3d2ae1a | 44                | ENTREGUE     | 2026-01-20 15:52:47.959296+00 | 2025-09-22 23:40:51.499033+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | 534cba2b-932f-4d26-b003-ae1dcb903361 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 63d71878-01d7-4055-b886-c9851dcda119 | 656               | ENTREGUE     | 2026-01-20 15:52:36.576148+00 | 2026-01-13 16:38:48.806587+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | ENTREGUE     | 2026-01-20 15:52:29.622208+00 | 2026-01-12 17:16:34.35826+00  | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6a7463af-21ed-4f2c-8453-51a1d226548e | 499               | ENTREGUE     | 2026-01-20 15:51:50.524816+00 | 2025-12-11 19:39:16.328243+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 0645acec-3ef7-453c-bb2e-ce84f0dc4d3c | 590               | ENTREGUE     | 2026-01-20 15:51:42.830373+00 | 2025-12-27 22:33:30.436998+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | bfebe7de-f824-452f-94ea-f83dbb779e1b | 652               | ENTREGUE     | 2026-01-20 15:51:39.93455+00  | 2026-01-12 22:47:42.368074+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 6c97383a-e103-42ac-9e2a-59631d0c605e | 620               | ENTREGUE     | 2026-01-20 15:51:38.064645+00 | 2026-01-08 02:45:46.350008+00 | 3e51a952-326f-4300-86e4-153df8d7f893 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 094aee10-f22a-4a8c-af46-6a7da3b38305 | 575               | ENTREGUE     | 2026-01-20 15:51:27.706021+00 | 2025-12-26 23:06:26.668345+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | ba737945-e2a4-48ac-b3bd-6e5b20f4bc09 | 557               | ENTREGUE     | 2026-01-20 15:50:47.418051+00 | 2025-12-23 00:13:40.607944+00 | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | d4d95b38-4e30-4723-8396-a9b2d78d9974 | 533               | ENTREGUE     | 2026-01-20 15:50:40.858208+00 | 2025-12-18 17:44:11.899329+00 | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 3fc36efa-f56d-4a96-8340-f3ee1d87bf0b | 513               | ENTREGUE     | 2026-01-20 15:50:37.866022+00 | 2025-12-16 19:21:43.053928+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | b0b1589d-693e-48f9-99c6-50fde3555513 | 519               | ENTREGUE     | 2026-01-20 15:49:34.239483+00 | 2025-12-17 23:56:56.548469+00 | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 69c22883-8313-4600-9589-3b19a6372ecb | 512               | ENTREGUE     | 2026-01-20 15:49:26.738227+00 | 2025-12-16 19:16:33.148237+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | b6d801e8-e5cc-4b29-b9f3-688555c85453 | 504               | ENTREGUE     | 2026-01-20 15:49:23.608392+00 | 2025-12-13 23:27:54.13683+00  | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | bbd3fc50-1fe3-4b8e-83bd-ef09f48ad7b2 | 455               | ENTREGUE     | 2026-01-20 15:48:59.199234+00 | 2025-12-05 18:38:14.08472+00  | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 69749e8b-7129-47b2-9c1b-aafbfcebf87d | 348               | ENTREGUE     | 2026-01-20 15:48:07.483621+00 | 2025-11-17 17:38:51.607568+00 | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 245ced2e-d8f3-47b6-a0da-742f3a0bae12 | 526               | ENTREGUE     | 2026-01-20 15:48:03.572104+00 | 2025-12-18 01:18:53.543159+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 36f612db-54e2-4d4c-a7de-63bd1787aad9 | 648               | ENTREGUE     | 2026-01-20 15:47:22.36182+00  | 2026-01-12 17:30:22.591477+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | ENTREGUE     | 2026-01-20 15:46:31.728362+00 | 2026-01-13 16:47:51.477024+00 | 68233923-a12b-4c65-a3ca-7c5fec265336 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 6                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | c73a98c3-c5b0-4479-a206-299608c9a1db | 645               | ENTREGUE     | 2026-01-20 15:39:09.95554+00  | 2026-01-12 17:24:11.445346+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | f5a96aaf-8120-4c8d-bc83-20171bec84a7 | 638               | ENTREGUE     | 2026-01-20 15:38:48.351709+00 | 2026-01-09 01:20:29.931018+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 718bceee-c56e-48b5-b12e-e79b77bb191c | 597               | ENTREGUE     | 2026-01-20 15:38:28.456236+00 | 2026-01-02 20:16:25.236825+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | bba4a724-80ad-4ed9-ad2e-f9c5636304ca | 572               | ENTREGUE     | 2026-01-20 15:37:54.216018+00 | 2025-12-26 17:22:42.639269+00 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 291cbdc2-d701-4c1a-9333-de21038b8036 | 491               | ENTREGUE     | 2026-01-20 15:37:39.335909+00 | 2025-12-11 18:52:42.071254+00 | 74dc986a-1063-4b8e-8964-59eb396e10eb | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 88c4d063-ee01-4b7d-8403-5a22331c5d45 | 366               | ENTREGUE     | 2026-01-20 15:37:04.385607+00 | 2025-11-18 23:07:44.577424+00 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 209d91dc-fe1c-42f9-a4ed-c097facb3ec2 | 409               | ENTREGUE     | 2026-01-20 15:36:21.473786+00 | 2025-11-29 16:20:07.051701+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 0df4535e-e39c-4b1c-9a83-4985158cf0ba | 644               | ENTREGUE     | 2026-01-19 23:25:49.353713+00 | 2026-01-12 17:22:23.880682+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 36329608-c08a-426c-8a58-845078c8ea23 | 657               | ENTREGUE     | 2026-01-19 23:25:49.353713+00 | 2026-01-13 16:40:22.605682+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | e9e9edd0-81fa-4a51-b22f-82d988e9c20f | 583               | ENTREGUE     | 2026-01-19 23:25:49.353713+00 | 2025-12-27 18:46:31.063176+00 | 8ce109c1-69d3-484a-a87b-8accf7984132 | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 026a4b95-440e-41e0-8434-bce90c809087 | 658               | ENTREGUE     | 2026-01-19 23:25:49.353713+00 | 2026-01-13 16:42:43.946377+00 | 21e9cb25-ca46-42f9-b297-db1e693325ed | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 3e7a4185-bcc6-4bf8-8945-49bed640771b | 642               | ENTREGUE     | 2026-01-19 23:25:49.353713+00 | 2026-01-12 17:18:07.089495+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 2                      |
| === PEDIDOS MODIFICADOS NO PERÍODO (INVESTIGAR) === | 11cd698f-db07-429f-89aa-7fe40b4e263d | 663               | ENTREGUE     | 2026-01-19 23:25:49.353713+00 | 2026-01-14 20:37:19.173572+00 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | bab835bc-2df1-4f54-87c3-8151c61ec642 | 1                      |


-- ============================================================
-- QUERY 4: Timeline detalhada dos pedidos MODIFICADOS
-- ============================================================
WITH pedidos_modificados AS (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
)
SELECT 
    '=== TIMELINE DETALHADA PEDIDOS MODIFICADOS ===' as secao,
    pt.pedido_id,
    p.numero_sequencial,
    pt.status_anterior,
    pt.status_novo,
    pt.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as quando_sp,
    pt.responsavel_id,
    EXTRACT(DOW FROM pt.created_at AT TIME ZONE 'America/Sao_Paulo') as dia_semana,
    -- 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
    TO_CHAR(pt.created_at AT TIME ZONE 'America/Sao_Paulo', 'Day DD/MM HH24:MI:SS') as data_formatada
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE pt.pedido_id IN (SELECT pedido_id FROM pedidos_modificados)
AND pt.created_at >= '2026-01-18 03:00:00+00'
ORDER BY pt.created_at DESC, pt.pedido_id;


| secao                                          | pedido_id                            | numero_sequencial | status_anterior | status_novo  | quando_sp                     | responsavel_id                       | dia_semana | data_formatada           |
| ---------------------------------------------- | ------------------------------------ | ----------------- | --------------- | ------------ | ----------------------------- | ------------------------------------ | ---------- | ------------------------ |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 1512d395-ccdb-415c-8379-e9f2077c9413 | 660               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630               | ENVIADO         | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506               | PRONTO          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 30b73620-1724-4303-90b2-2b63b6b6f488 | 631               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3363e27f-bb2f-4f39-bf80-ec3216785613 | 616               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | 278               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | 621               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 557943b2-c234-447f-a654-d0786769a363 | 390               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 683660d7-25f5-4075-9e01-f20d89b4c294 | 629               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6c042a43-c816-4555-a998-3f776badd662 | 661               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | 614               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624               | ENVIADO         | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | 650               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 8859f85b-6641-4b78-a70b-c930752ff81c | 596               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | 594               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | a309317e-1121-497f-91d3-57117e0ca4ed | 615               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | aeb9d187-491a-47db-afb1-828dcb760089 | 671               | ENVIADO         | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b3bfc123-174e-41a8-a698-051a64501be8 | 485               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | 57                | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | ENVIADO         | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | 617               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | d12459a9-4495-4d51-af6b-3793c016bf77 | 627               | ENVIADO         | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | d747b999-694c-4ad8-a9dc-519fb4d51579 | 683               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f1f8e925-b175-4eeb-aa20-1215447c98ca | 61                | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f3b74358-a11d-4235-8539-aeb80bea404b | 461               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | 269               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | 619               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | fb650ea1-670f-4194-91f5-982710d15333 | 655               | AG_PAGAMENTO    | PRODUCAO     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ff627e2c-b227-4d0a-b10f-4c915e98677e | 578               | CHEGOU          | ENTREGUE     | 2026-01-21 16:49:52.310441+00 | null                                 | 3          | Wednesday 21/01 10:49:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544               | ENVIADO         | CHEGOU       | 2026-01-21 16:42:40.399818+00 | null                                 | 3          | Wednesday 21/01 10:42:40 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544               | PRONTO          | ENVIADO      | 2026-01-21 16:42:38.173058+00 | null                                 | 3          | Wednesday 21/01 10:42:38 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544               | PRODUCAO        | PRONTO       | 2026-01-21 16:42:29.205528+00 | null                                 | 3          | Wednesday 21/01 10:42:29 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496               | ENVIADO         | CHEGOU       | 2026-01-21 16:39:51.438809+00 | null                                 | 3          | Wednesday 21/01 10:39:51 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496               | PRONTO          | ENVIADO      | 2026-01-21 16:39:45.426368+00 | null                                 | 3          | Wednesday 21/01 10:39:45 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | PRONTO          | ENVIADO      | 2026-01-21 16:36:47.976711+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 3          | Wednesday 21/01 10:36:47 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | PRODUCAO        | PRONTO       | 2026-01-21 16:36:36.336241+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 3          | Wednesday 21/01 10:36:36 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | aeb9d187-491a-47db-afb1-828dcb760089 | 671               | PRONTO          | ENVIADO      | 2026-01-21 16:26:25.1918+00   | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 3          | Wednesday 21/01 10:26:25 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | aeb9d187-491a-47db-afb1-828dcb760089 | 671               | PRODUCAO        | PRONTO       | 2026-01-21 16:26:16.331313+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 3          | Wednesday 21/01 10:26:16 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624               | PRONTO          | ENVIADO      | 2026-01-21 16:26:04.825896+00 | null                                 | 3          | Wednesday 21/01 10:26:04 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624               | PRODUCAO        | PRONTO       | 2026-01-21 16:25:08.404873+00 | null                                 | 3          | Wednesday 21/01 10:25:08 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630               | PRONTO          | ENVIADO      | 2026-01-21 16:24:58.449093+00 | null                                 | 3          | Wednesday 21/01 10:24:58 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630               | PRODUCAO        | PRONTO       | 2026-01-21 16:24:47.70369+00  | null                                 | 3          | Wednesday 21/01 10:24:47 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | d12459a9-4495-4d51-af6b-3793c016bf77 | 627               | PRONTO          | ENVIADO      | 2026-01-21 16:24:30.910131+00 | null                                 | 3          | Wednesday 21/01 10:24:30 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | d12459a9-4495-4d51-af6b-3793c016bf77 | 627               | PRODUCAO        | PRONTO       | 2026-01-21 16:24:12.497442+00 | null                                 | 3          | Wednesday 21/01 10:24:12 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bc5c0c78-cb20-4222-b790-369aacbc0104 | 618               | PRONTO          | PRODUCAO     | 2026-01-20 21:59:22.227104+00 | null                                 | 2          | Tuesday   20/01 15:59:22 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506               | ENVIADO         | PRONTO       | 2026-01-20 21:59:06.18156+00  | null                                 | 2          | Tuesday   20/01 15:59:06 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f3b74358-a11d-4235-8539-aeb80bea404b | 461               | ENVIADO         | CHEGOU       | 2026-01-20 21:51:00.922469+00 | null                                 | 2          | Tuesday   20/01 15:51:00 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | ENVIADO         | CHEGOU       | 2026-01-20 21:50:36.341986+00 | null                                 | 2          | Tuesday   20/01 15:50:36 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6a1be3ee-a0d2-408a-aa86-c823d2218635 | 623               | CHEGOU          | ENTREGUE     | 2026-01-20 21:42:27.163564+00 | null                                 | 2          | Tuesday   20/01 15:42:27 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4eba0375-bb43-4fa1-8e46-956ae357717d | 647               | CHEGOU          | ENTREGUE     | 2026-01-20 21:42:22.221766+00 | null                                 | 2          | Tuesday   20/01 15:42:22 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | c194179b-8e6d-488f-a388-29242b54095c | 653               | CHEGOU          | ENTREGUE     | 2026-01-20 21:42:16.757002+00 | null                                 | 2          | Tuesday   20/01 15:42:16 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 980add89-67dd-4bc9-9f23-0147b16d1db5 | 454               | CHEGOU          | ENTREGUE     | 2026-01-20 21:42:10.837468+00 | null                                 | 2          | Tuesday   20/01 15:42:10 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 13214ef2-d410-4581-940b-318b50b1803f | 515               | CHEGOU          | ENTREGUE     | 2026-01-20 21:42:05.213634+00 | 6ef1c92e-88bb-4777-a917-5c21ad567877 | 2          | Tuesday   20/01 15:42:05 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 493d9300-5bd7-48b9-ae12-8d7b9dc174d7 | 649               | CHEGOU          | ENTREGUE     | 2026-01-20 21:41:58.851855+00 | null                                 | 2          | Tuesday   20/01 15:41:58 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 137a7b61-4651-4b66-8a75-03963ff20100 | 608               | CHEGOU          | ENTREGUE     | 2026-01-20 21:41:52.447725+00 | null                                 | 2          | Tuesday   20/01 15:41:52 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f8690f7a-e09e-48a4-af3f-abef417e180d | 635               | CHEGOU          | ENTREGUE     | 2026-01-20 21:41:46.548367+00 | null                                 | 2          | Tuesday   20/01 15:41:46 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4fc18d0b-72e2-403a-bc35-9a8df511e599 | 612               | CHEGOU          | ENTREGUE     | 2026-01-20 21:41:40.115324+00 | null                                 | 2          | Tuesday   20/01 15:41:40 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6a1be3ee-a0d2-408a-aa86-c823d2218635 | 623               | ENVIADO         | CHEGOU       | 2026-01-20 21:39:51.311688+00 | null                                 | 2          | Tuesday   20/01 15:39:51 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4eba0375-bb43-4fa1-8e46-956ae357717d | 647               | ENVIADO         | CHEGOU       | 2026-01-20 21:36:50.324545+00 | null                                 | 2          | Tuesday   20/01 15:36:50 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | c194179b-8e6d-488f-a388-29242b54095c | 653               | ENVIADO         | CHEGOU       | 2026-01-20 21:36:37.60639+00  | null                                 | 2          | Tuesday   20/01 15:36:37 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 980add89-67dd-4bc9-9f23-0147b16d1db5 | 454               | ENVIADO         | CHEGOU       | 2026-01-20 21:36:18.502936+00 | null                                 | 2          | Tuesday   20/01 15:36:18 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 13214ef2-d410-4581-940b-318b50b1803f | 515               | ENVIADO         | CHEGOU       | 2026-01-20 21:34:59.027749+00 | 6ef1c92e-88bb-4777-a917-5c21ad567877 | 2          | Tuesday   20/01 15:34:59 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 493d9300-5bd7-48b9-ae12-8d7b9dc174d7 | 649               | ENVIADO         | CHEGOU       | 2026-01-20 21:34:08.922862+00 | null                                 | 2          | Tuesday   20/01 15:34:08 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f8690f7a-e09e-48a4-af3f-abef417e180d | 635               | ENVIADO         | CHEGOU       | 2026-01-20 21:32:20.214049+00 | null                                 | 2          | Tuesday   20/01 15:32:20 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4fc18d0b-72e2-403a-bc35-9a8df511e599 | 612               | ENVIADO         | CHEGOU       | 2026-01-20 21:30:54.402648+00 | null                                 | 2          | Tuesday   20/01 15:30:54 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bc5c0c78-cb20-4222-b790-369aacbc0104 | 618               | ENVIADO         | PRONTO       | 2026-01-20 21:09:46.33602+00  | null                                 | 2          | Tuesday   20/01 15:09:46 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6c042a43-c816-4555-a998-3f776badd662 | 661               | ENVIADO         | CHEGOU       | 2026-01-20 21:09:31.462262+00 | null                                 | 2          | Tuesday   20/01 15:09:31 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4651da99-85e9-431f-884c-f707e6ede76d | 577               | CHEGOU          | ENTREGUE     | 2026-01-20 19:59:35.812351+00 | null                                 | 2          | Tuesday   20/01 13:59:35 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 988a106e-5ba1-406a-991f-7be35dced4b4 | 651               | CHEGOU          | ENTREGUE     | 2026-01-20 19:59:28.704984+00 | null                                 | 2          | Tuesday   20/01 13:59:28 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 1ae9f3d3-cfd1-4ee2-814c-1ae1fd982a2e | 473               | CHEGOU          | ENTREGUE     | 2026-01-20 19:58:48.312717+00 | null                                 | 2          | Tuesday   20/01 13:58:48 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605               | ENVIADO         | CHEGOU       | 2026-01-20 16:20:13.481672+00 | null                                 | 2          | Tuesday   20/01 10:20:13 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605               | PRONTO          | ENVIADO      | 2026-01-20 16:20:10.743107+00 | null                                 | 2          | Tuesday   20/01 10:20:10 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605               | PRODUCAO        | PRONTO       | 2026-01-20 16:18:17.773539+00 | null                                 | 2          | Tuesday   20/01 10:18:17 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 988a106e-5ba1-406a-991f-7be35dced4b4 | 651               | ENVIADO         | CHEGOU       | 2026-01-20 16:18:10.744466+00 | null                                 | 2          | Tuesday   20/01 10:18:10 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b3bfc123-174e-41a8-a698-051a64501be8 | 485               | ENVIADO         | CHEGOU       | 2026-01-20 16:18:03.76377+00  | null                                 | 2          | Tuesday   20/01 10:18:03 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626               | ENVIADO         | CHEGOU       | 2026-01-20 16:17:53.340742+00 | null                                 | 2          | Tuesday   20/01 10:17:53 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622               | ENVIADO         | CHEGOU       | 2026-01-20 16:17:21.562423+00 | null                                 | 2          | Tuesday   20/01 10:17:21 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ff627e2c-b227-4d0a-b10f-4c915e98677e | 578               | ENVIADO         | CHEGOU       | 2026-01-20 16:17:14.473753+00 | null                                 | 2          | Tuesday   20/01 10:17:14 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510               | ENVIADO         | CHEGOU       | 2026-01-20 16:17:07.3426+00   | null                                 | 2          | Tuesday   20/01 10:17:07 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510               | PRONTO          | ENVIADO      | 2026-01-20 16:17:00.641253+00 | null                                 | 2          | Tuesday   20/01 10:17:00 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510               | PRODUCAO        | PRONTO       | 2026-01-20 16:16:46.237467+00 | null                                 | 2          | Tuesday   20/01 10:16:46 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 069e36b5-dba4-4fdf-abb3-82f9e3d2ae1a | 44                | CHEGOU          | ENTREGUE     | 2026-01-20 15:52:47.959296+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 2          | Tuesday   20/01 09:52:47 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 63d71878-01d7-4055-b886-c9851dcda119 | 656               | CHEGOU          | ENTREGUE     | 2026-01-20 15:52:36.576148+00 | null                                 | 2          | Tuesday   20/01 09:52:36 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | CHEGOU          | ENTREGUE     | 2026-01-20 15:52:29.622208+00 | null                                 | 2          | Tuesday   20/01 09:52:29 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6a7463af-21ed-4f2c-8453-51a1d226548e | 499               | CHEGOU          | ENTREGUE     | 2026-01-20 15:51:50.524816+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 2          | Tuesday   20/01 09:51:50 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 0645acec-3ef7-453c-bb2e-ce84f0dc4d3c | 590               | CHEGOU          | ENTREGUE     | 2026-01-20 15:51:42.830373+00 | null                                 | 2          | Tuesday   20/01 09:51:42 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bfebe7de-f824-452f-94ea-f83dbb779e1b | 652               | CHEGOU          | ENTREGUE     | 2026-01-20 15:51:39.93455+00  | null                                 | 2          | Tuesday   20/01 09:51:39 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6c97383a-e103-42ac-9e2a-59631d0c605e | 620               | CHEGOU          | ENTREGUE     | 2026-01-20 15:51:38.064645+00 | null                                 | 2          | Tuesday   20/01 09:51:38 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 094aee10-f22a-4a8c-af46-6a7da3b38305 | 575               | CHEGOU          | ENTREGUE     | 2026-01-20 15:51:27.706021+00 | null                                 | 2          | Tuesday   20/01 09:51:27 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | ba737945-e2a4-48ac-b3bd-6e5b20f4bc09 | 557               | CHEGOU          | ENTREGUE     | 2026-01-20 15:50:47.418051+00 | null                                 | 2          | Tuesday   20/01 09:50:47 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | d4d95b38-4e30-4723-8396-a9b2d78d9974 | 533               | CHEGOU          | ENTREGUE     | 2026-01-20 15:50:40.858208+00 | null                                 | 2          | Tuesday   20/01 09:50:40 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3fc36efa-f56d-4a96-8340-f3ee1d87bf0b | 513               | CHEGOU          | ENTREGUE     | 2026-01-20 15:50:37.866022+00 | null                                 | 2          | Tuesday   20/01 09:50:37 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b0b1589d-693e-48f9-99c6-50fde3555513 | 519               | CHEGOU          | ENTREGUE     | 2026-01-20 15:49:34.239483+00 | null                                 | 2          | Tuesday   20/01 09:49:34 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 69c22883-8313-4600-9589-3b19a6372ecb | 512               | CHEGOU          | ENTREGUE     | 2026-01-20 15:49:26.738227+00 | null                                 | 2          | Tuesday   20/01 09:49:26 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b6d801e8-e5cc-4b29-b9f3-688555c85453 | 504               | CHEGOU          | ENTREGUE     | 2026-01-20 15:49:23.608392+00 | null                                 | 2          | Tuesday   20/01 09:49:23 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bbd3fc50-1fe3-4b8e-83bd-ef09f48ad7b2 | 455               | CHEGOU          | ENTREGUE     | 2026-01-20 15:48:59.199234+00 | null                                 | 2          | Tuesday   20/01 09:48:59 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 69749e8b-7129-47b2-9c1b-aafbfcebf87d | 348               | CHEGOU          | ENTREGUE     | 2026-01-20 15:48:07.483621+00 | null                                 | 2          | Tuesday   20/01 09:48:07 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 245ced2e-d8f3-47b6-a0da-742f3a0bae12 | 526               | CHEGOU          | ENTREGUE     | 2026-01-20 15:48:03.572104+00 | null                                 | 2          | Tuesday   20/01 09:48:03 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 36f612db-54e2-4d4c-a7de-63bd1787aad9 | 648               | CHEGOU          | ENTREGUE     | 2026-01-20 15:47:22.36182+00  | null                                 | 2          | Tuesday   20/01 09:47:22 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | CHEGOU          | ENTREGUE     | 2026-01-20 15:46:31.728362+00 | null                                 | 2          | Tuesday   20/01 09:46:31 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | c73a98c3-c5b0-4479-a206-299608c9a1db | 645               | CHEGOU          | ENTREGUE     | 2026-01-20 15:39:09.95554+00  | null                                 | 2          | Tuesday   20/01 09:39:09 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | f5a96aaf-8120-4c8d-bc83-20171bec84a7 | 638               | CHEGOU          | ENTREGUE     | 2026-01-20 15:38:48.351709+00 | null                                 | 2          | Tuesday   20/01 09:38:48 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 718bceee-c56e-48b5-b12e-e79b77bb191c | 597               | CHEGOU          | ENTREGUE     | 2026-01-20 15:38:28.456236+00 | null                                 | 2          | Tuesday   20/01 09:38:28 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bba4a724-80ad-4ed9-ad2e-f9c5636304ca | 572               | CHEGOU          | ENTREGUE     | 2026-01-20 15:37:54.216018+00 | null                                 | 2          | Tuesday   20/01 09:37:54 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 291cbdc2-d701-4c1a-9333-de21038b8036 | 491               | CHEGOU          | ENTREGUE     | 2026-01-20 15:37:39.335909+00 | null                                 | 2          | Tuesday   20/01 09:37:39 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 88c4d063-ee01-4b7d-8403-5a22331c5d45 | 366               | CHEGOU          | ENTREGUE     | 2026-01-20 15:37:04.385607+00 | 6ef1c92e-88bb-4777-a917-5c21ad567877 | 2          | Tuesday   20/01 09:37:04 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 209d91dc-fe1c-42f9-a4ed-c097facb3ec2 | 409               | CHEGOU          | ENTREGUE     | 2026-01-20 15:36:21.473786+00 | null                                 | 2          | Tuesday   20/01 09:36:21 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | ENVIADO         | CHEGOU       | 2026-01-19 23:24:28.428494+00 | null                                 | 1          | Monday    19/01 17:24:28 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | PRONTO          | ENVIADO      | 2026-01-19 23:24:26.530231+00 | null                                 | 1          | Monday    19/01 17:24:26 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | PRODUCAO        | PRONTO       | 2026-01-19 23:24:17.353236+00 | null                                 | 1          | Monday    19/01 17:24:17 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | PAGO            | PRODUCAO     | 2026-01-19 23:24:09.847844+00 | null                                 | 1          | Monday    19/01 17:24:09 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | AG_PAGAMENTO    | PAGO         | 2026-01-19 23:24:07.549282+00 | null                                 | 1          | Monday    19/01 17:24:07 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 4651da99-85e9-431f-884c-f707e6ede76d | 577               | ENVIADO         | CHEGOU       | 2026-01-19 23:07:37.241559+00 | null                                 | 1          | Monday    19/01 17:07:37 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670               | PAGO            | PRODUCAO     | 2026-01-19 22:26:32.046317+00 | null                                 | 1          | Monday    19/01 16:26:32 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | PAGO            | PRODUCAO     | 2026-01-19 22:26:22.791923+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 1          | Monday    19/01 16:26:22 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | AG_PAGAMENTO    | PAGO         | 2026-01-19 22:19:04.920722+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 1          | Monday    19/01 16:19:04 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665               | ENVIADO         | CHEGOU       | 2026-01-19 21:18:18.932748+00 | null                                 | 1          | Monday    19/01 15:18:18 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665               | PRONTO          | ENVIADO      | 2026-01-19 21:18:16.75264+00  | null                                 | 1          | Monday    19/01 15:18:16 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | PAGO            | AG_PAGAMENTO | 2026-01-19 19:36:16.322061+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 1          | Monday    19/01 13:36:16 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | AG_PAGAMENTO    | PAGO         | 2026-01-19 19:36:10.525837+00 | d1b1d10e-622c-43c1-9a8b-bd087c877e50 | 1          | Monday    19/01 13:36:10 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670               | AG_PAGAMENTO    | PAGO         | 2026-01-19 19:36:07.388597+00 | null                                 | 1          | Monday    19/01 13:36:07 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6c042a43-c816-4555-a998-3f776badd662 | 661               | PRONTO          | ENVIADO      | 2026-01-19 18:58:17.029667+00 | null                                 | 1          | Monday    19/01 12:58:17 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bc5c0c78-cb20-4222-b790-369aacbc0104 | 618               | PRONTO          | ENVIADO      | 2026-01-19 18:58:08.595749+00 | null                                 | 1          | Monday    19/01 12:58:08 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 6c042a43-c816-4555-a998-3f776badd662 | 661               | PRODUCAO        | PRONTO       | 2026-01-19 18:57:57.345891+00 | null                                 | 1          | Monday    19/01 12:57:57 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | bc5c0c78-cb20-4222-b790-369aacbc0104 | 618               | PRODUCAO        | PRONTO       | 2026-01-19 18:57:43.163937+00 | null                                 | 1          | Monday    19/01 12:57:43 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 0df4535e-e39c-4b1c-9a83-4985158cf0ba | 644               | CHEGOU          | ENTREGUE     | 2026-01-19 18:39:46.409143+00 | null                                 | 1          | Monday    19/01 12:39:46 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3e7a4185-bcc6-4bf8-8945-49bed640771b | 642               | CHEGOU          | ENTREGUE     | 2026-01-19 18:39:38.281543+00 | null                                 | 1          | Monday    19/01 12:39:38 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 3e7a4185-bcc6-4bf8-8945-49bed640771b | 642               | ENVIADO         | CHEGOU       | 2026-01-19 18:39:18.537048+00 | null                                 | 1          | Monday    19/01 12:39:18 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 0df4535e-e39c-4b1c-9a83-4985158cf0ba | 644               | ENVIADO         | CHEGOU       | 2026-01-19 18:39:07.393354+00 | null                                 | 1          | Monday    19/01 12:39:07 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 36329608-c08a-426c-8a58-845078c8ea23 | 657               | CHEGOU          | ENTREGUE     | 2026-01-19 18:37:24.993662+00 | null                                 | 1          | Monday    19/01 12:37:24 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | e9e9edd0-81fa-4a51-b22f-82d988e9c20f | 583               | CHEGOU          | ENTREGUE     | 2026-01-19 18:36:58.433103+00 | null                                 | 1          | Monday    19/01 12:36:58 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 026a4b95-440e-41e0-8434-bce90c809087 | 658               | CHEGOU          | ENTREGUE     | 2026-01-19 18:36:27.601193+00 | null                                 | 1          | Monday    19/01 12:36:27 |
| === TIMELINE DETALHADA PEDIDOS MODIFICADOS === | 11cd698f-db07-429f-89aa-7fe40b4e263d | 663               | CHEGOU          | ENTREGUE     | 2026-01-19 18:35:32.455132+00 | null                                 | 1          | Monday    19/01 12:35:32 |

-- ============================================================
-- QUERY 5: Padrões de modificação em massa (mesmo horário)
-- ============================================================
WITH pedidos_modificados AS (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
)
SELECT 
    '=== PADRÕES DE MODIFICAÇÃO EM MASSA ===' as secao,
    DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') as minuto_sp,
    pt.status_anterior,
    pt.status_novo,
    COUNT(*) as quantidade_pedidos,
    STRING_AGG(pt.pedido_id::text, ', ' ORDER BY pt.pedido_id) as pedidos_ids
FROM pedidos_timeline pt
WHERE pt.pedido_id IN (SELECT pedido_id FROM pedidos_modificados)
AND pt.created_at >= '2026-01-18 03:00:00+00'
GROUP BY DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo'), pt.status_anterior, pt.status_novo
HAVING COUNT(*) > 1  -- Apenas modificações que afetaram múltiplos pedidos
ORDER BY minuto_sp DESC, quantidade_pedidos DESC;


| secao                                   | minuto_sp           | status_anterior | status_novo | quantidade_pedidos | pedidos_ids                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------- | ------------------- | --------------- | ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-21 10:49:00 | CHEGOU          | ENTREGUE    | 25                 | 11de6da3-c1ce-47ce-b8f2-a540026f9458, 3363e27f-bb2f-4f39-bf80-ec3216785613, 40c404fd-9257-4ce2-8a73-904972b330f1, 4737bf19-a5ad-4df5-a7e3-00ba292966f4, 48aa41a4-1d80-4b35-99ee-559ef013ce43, 557943b2-c234-447f-a654-d0786769a363, 683660d7-25f5-4075-9e01-f20d89b4c294, 6c042a43-c816-4555-a998-3f776badd662, 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9, 73b8f5a3-3b7c-4644-806d-8d7585a41412, 75dd6131-9ba5-4d10-bcdc-57f52a89be91, 86605cc1-849a-41bc-a4b5-5c86f4b2e044, 8859f85b-6641-4b78-a70b-c930752ff81c, 97045835-c11e-4f8e-a7ee-cb1952bc16cd, b3bfc123-174e-41a8-a698-051a64501be8, b4630636-7cbe-4c28-9c0d-16d73c1fb0a6, c36e1374-76a0-418b-a5f8-f8baff1a0ea9, c9a83a82-e42a-4034-bdac-e81f8febe8d8, e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf, ebd0c4cb-35e7-47be-8bd6-db227ae9666e, f1f8e925-b175-4eeb-aa20-1215447c98ca, f3b74358-a11d-4235-8539-aeb80bea404b, f538e055-00f3-4ab5-a91a-aac9ea598ee5, f84f851d-ae4a-4542-a5af-7c5d718f5cd3, ff627e2c-b227-4d0a-b10f-4c915e98677e |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-21 10:49:00 | AG_PAGAMENTO    | PRODUCAO    | 7                  | 1512d395-ccdb-415c-8379-e9f2077c9413, 30b73620-1724-4303-90b2-2b63b6b6f488, 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c, 74f9f01a-5644-489d-8f6c-f37e640a0cbe, a309317e-1121-497f-91d3-57117e0ca4ed, d747b999-694c-4ad8-a9dc-519fb4d51579, fb650ea1-670f-4194-91f5-982710d15333                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-21 10:49:00 | ENVIADO         | ENTREGUE    | 5                  | 24b55d6a-2938-4ca5-a55b-313cb891d0da, 6ea130a7-315e-4ef7-ac36-c53cd0f69471, aeb9d187-491a-47db-afb1-828dcb760089, b9374462-ac98-4b4a-984d-8fe65aaa9194, d12459a9-4495-4d51-af6b-3793c016bf77                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-21 10:26:00 | PRONTO          | ENVIADO     | 2                  | 6ea130a7-315e-4ef7-ac36-c53cd0f69471, aeb9d187-491a-47db-afb1-828dcb760089                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-21 10:24:00 | PRODUCAO        | PRONTO      | 2                  | 24b55d6a-2938-4ca5-a55b-313cb891d0da, d12459a9-4495-4d51-af6b-3793c016bf77                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-21 10:24:00 | PRONTO          | ENVIADO     | 2                  | 24b55d6a-2938-4ca5-a55b-313cb891d0da, d12459a9-4495-4d51-af6b-3793c016bf77                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 15:42:00 | CHEGOU          | ENTREGUE    | 5                  | 13214ef2-d410-4581-940b-318b50b1803f, 4eba0375-bb43-4fa1-8e46-956ae357717d, 6a1be3ee-a0d2-408a-aa86-c823d2218635, 980add89-67dd-4bc9-9f23-0147b16d1db5, c194179b-8e6d-488f-a388-29242b54095c                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 15:41:00 | CHEGOU          | ENTREGUE    | 4                  | 137a7b61-4651-4b66-8a75-03963ff20100, 493d9300-5bd7-48b9-ae12-8d7b9dc174d7, 4fc18d0b-72e2-403a-bc35-9a8df511e599, f8690f7a-e09e-48a4-af3f-abef417e180d                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 15:36:00 | ENVIADO         | CHEGOU      | 3                  | 4eba0375-bb43-4fa1-8e46-956ae357717d, 980add89-67dd-4bc9-9f23-0147b16d1db5, c194179b-8e6d-488f-a388-29242b54095c                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 15:34:00 | ENVIADO         | CHEGOU      | 2                  | 13214ef2-d410-4581-940b-318b50b1803f, 493d9300-5bd7-48b9-ae12-8d7b9dc174d7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 13:59:00 | CHEGOU          | ENTREGUE    | 2                  | 4651da99-85e9-431f-884c-f707e6ede76d, 988a106e-5ba1-406a-991f-7be35dced4b4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 10:18:00 | ENVIADO         | CHEGOU      | 2                  | 988a106e-5ba1-406a-991f-7be35dced4b4, b3bfc123-174e-41a8-a698-051a64501be8                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 10:17:00 | ENVIADO         | CHEGOU      | 4                  | 11de6da3-c1ce-47ce-b8f2-a540026f9458, 75dd6131-9ba5-4d10-bcdc-57f52a89be91, 86605cc1-849a-41bc-a4b5-5c86f4b2e044, ff627e2c-b227-4d0a-b10f-4c915e98677e                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:52:00 | CHEGOU          | ENTREGUE    | 3                  | 069e36b5-dba4-4fdf-abb3-82f9e3d2ae1a, 542c0e60-4812-4daa-b2c2-fb2232ccbf03, 63d71878-01d7-4055-b886-c9851dcda119                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:51:00 | CHEGOU          | ENTREGUE    | 5                  | 0645acec-3ef7-453c-bb2e-ce84f0dc4d3c, 094aee10-f22a-4a8c-af46-6a7da3b38305, 6a7463af-21ed-4f2c-8453-51a1d226548e, 6c97383a-e103-42ac-9e2a-59631d0c605e, bfebe7de-f824-452f-94ea-f83dbb779e1b                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:50:00 | CHEGOU          | ENTREGUE    | 3                  | 3fc36efa-f56d-4a96-8340-f3ee1d87bf0b, ba737945-e2a4-48ac-b3bd-6e5b20f4bc09, d4d95b38-4e30-4723-8396-a9b2d78d9974                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:49:00 | CHEGOU          | ENTREGUE    | 3                  | 69c22883-8313-4600-9589-3b19a6372ecb, b0b1589d-693e-48f9-99c6-50fde3555513, b6d801e8-e5cc-4b29-b9f3-688555c85453                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:48:00 | CHEGOU          | ENTREGUE    | 3                  | 245ced2e-d8f3-47b6-a0da-742f3a0bae12, 69749e8b-7129-47b2-9c1b-aafbfcebf87d, bbd3fc50-1fe3-4b8e-83bd-ef09f48ad7b2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:38:00 | CHEGOU          | ENTREGUE    | 2                  | 718bceee-c56e-48b5-b12e-e79b77bb191c, f5a96aaf-8120-4c8d-bc83-20171bec84a7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-20 09:37:00 | CHEGOU          | ENTREGUE    | 3                  | 291cbdc2-d701-4c1a-9333-de21038b8036, 88c4d063-ee01-4b7d-8403-5a22331c5d45, bba4a724-80ad-4ed9-ad2e-f9c5636304ca                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 16:26:00 | PAGO            | PRODUCAO    | 2                  | b9374462-ac98-4b4a-984d-8fe65aaa9194, e9457472-1ba7-40fb-aac8-d19c60aeb6e7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 13:36:00 | AG_PAGAMENTO    | PAGO        | 2                  | b9374462-ac98-4b4a-984d-8fe65aaa9194, e9457472-1ba7-40fb-aac8-d19c60aeb6e7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 12:58:00 | PRONTO          | ENVIADO     | 2                  | 6c042a43-c816-4555-a998-3f776badd662, bc5c0c78-cb20-4222-b790-369aacbc0104                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 12:57:00 | PRODUCAO        | PRONTO      | 2                  | 6c042a43-c816-4555-a998-3f776badd662, bc5c0c78-cb20-4222-b790-369aacbc0104                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 12:39:00 | CHEGOU          | ENTREGUE    | 2                  | 0df4535e-e39c-4b1c-9a83-4985158cf0ba, 3e7a4185-bcc6-4bf8-8945-49bed640771b                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 12:39:00 | ENVIADO         | CHEGOU      | 2                  | 0df4535e-e39c-4b1c-9a83-4985158cf0ba, 3e7a4185-bcc6-4bf8-8945-49bed640771b                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| === PADRÕES DE MODIFICAÇÃO EM MASSA === | 2026-01-19 12:36:00 | CHEGOU          | ENTREGUE    | 2                  | 026a4b95-440e-41e0-8434-bce90c809087, e9e9edd0-81fa-4a51-b22f-82d988e9c20f                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

-- ============================================================
-- QUERY 6: Status atual vs último status correto (ANTES de sábado)
-- ============================================================
WITH pedidos_modificados AS (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
),
ultimo_status_antes_sabado AS (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_antes_sabado,
        created_at
    FROM pedidos_timeline
    WHERE created_at < '2026-01-18 03:00:00+00'
    AND pedido_id IN (SELECT pedido_id FROM pedidos_modificados)
    ORDER BY pedido_id, created_at DESC
)
SELECT 
    '=== COMPARAÇÃO: STATUS ANTES vs DEPOIS ===' as secao,
    p.id,
    p.numero_sequencial,
    us.status_antes_sabado,
    p.status as status_atual,
    CASE 
        WHEN us.status_antes_sabado = p.status THEN 'IGUAL (ok)'
        ELSE 'DIFERENTE (investigar!)'
    END as situacao,
    us.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as ultimo_evento_antes_sabado_sp,
    p.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as ultima_modificacao_sp
FROM pedidos p
JOIN ultimo_status_antes_sabado us ON us.pedido_id = p.id
ORDER BY 
    CASE WHEN us.status_antes_sabado = p.status THEN 1 ELSE 0 END,  -- Diferentes primeiro
    p.updated_at DESC;


| secao                                      | id                                   | numero_sequencial | status_antes_sabado | status_atual | situacao                | ultimo_evento_antes_sabado_sp | ultima_modificacao_sp         |
| ------------------------------------------ | ------------------------------------ | ----------------- | ------------------- | ------------ | ----------------------- | ----------------------------- | ----------------------------- |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | d747b999-694c-4ad8-a9dc-519fb4d51579 | 683               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-17 19:15:44.829336+00 | 2026-01-21 17:43:14.603699+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | 278               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-11-01 20:33:00.370015+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 1512d395-ccdb-415c-8379-e9f2077c9413 | 660               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-13 16:51:30.873368+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-06 23:43:31.03157+00  | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:35:18.964355+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | b3bfc123-174e-41a8-a698-051a64501be8 | 485               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-15 23:36:47.549336+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672               | AG_PAGAMENTO        | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 22:54:19.544565+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 23:07:46.890316+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 23:07:49.599681+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | aeb9d187-491a-47db-afb1-828dcb760089 | 671               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 17:00:57.640975+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6c042a43-c816-4555-a998-3f776badd662 | 661               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 23:07:44.750168+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | 614               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-08 02:22:12.094583+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | 650               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-12 21:58:58.700631+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-18 20:27:53.922037+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 16:27:41.038842+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | f1f8e925-b175-4eeb-aa20-1215447c98ca | 61                | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-09-26 17:43:39.825902+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 683660d7-25f5-4075-9e01-f20d89b4c294 | 629               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 19:28:50.271664+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | d12459a9-4495-4d51-af6b-3793c016bf77 | 627               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 23:07:48.332305+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496               | PRONTO              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 18:04:00.243334+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | a309317e-1121-497f-91d3-57117e0ca4ed | 615               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-08 02:22:10.619619+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 30b73620-1724-4303-90b2-2b63b6b6f488 | 631               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-08 04:44:40.663219+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | fb650ea1-670f-4194-91f5-982710d15333 | 655               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-13 16:51:38.955786+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670               | AG_PAGAMENTO        | PRODUCAO     | DIFERENTE (investigar!) | 2026-01-15 03:01:42.499233+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 557943b2-c234-447f-a654-d0786769a363 | 390               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-03 17:17:30.501632+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665               | PRONTO              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:42:42.154312+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | 617               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:42:49.506559+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | 619               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:43:39.028525+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | 594               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-02 23:32:55.650143+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | ff627e2c-b227-4d0a-b10f-4c915e98677e | 578               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-10 01:51:22.513969+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 8859f85b-6641-4b78-a70b-c930752ff81c | 596               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:43:13.559277+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | f3b74358-a11d-4235-8539-aeb80bea404b | 461               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 16:27:23.466345+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | 621               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:43:26.34566+00  | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-10 01:51:41.364933+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 23:33:40.91629+00  | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605               | PRODUCAO            | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-10 01:51:39.071642+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 3363e27f-bb2f-4f39-bf80-ec3216785613 | 616               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:42:37.511859+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | 57                | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-09-26 17:42:17.210772+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-14 00:31:11.387494+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | 269               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-11-17 22:53:47.391831+00 | 2026-01-21 16:49:52.310441+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6a1be3ee-a0d2-408a-aa86-c823d2218635 | 623               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 19:51:44.628264+00 | 2026-01-20 21:42:27.163564+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 4eba0375-bb43-4fa1-8e46-956ae357717d | 647               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:32:10.299215+00 | 2026-01-20 21:42:22.221766+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | c194179b-8e6d-488f-a388-29242b54095c | 653               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:33:34.28087+00  | 2026-01-20 21:42:16.757002+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 980add89-67dd-4bc9-9f23-0147b16d1db5 | 454               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-10 01:51:01.909353+00 | 2026-01-20 21:42:10.837468+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 13214ef2-d410-4581-940b-318b50b1803f | 515               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-18 19:36:02.50231+00  | 2026-01-20 21:42:05.213634+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 493d9300-5bd7-48b9-ae12-8d7b9dc174d7 | 649               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:31:50.938517+00 | 2026-01-20 21:41:58.851855+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 137a7b61-4651-4b66-8a75-03963ff20100 | 608               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-12 20:26:01.209686+00 | 2026-01-20 21:41:52.447725+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | f8690f7a-e09e-48a4-af3f-abef417e180d | 635               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-09 17:53:05.990987+00 | 2026-01-20 21:41:46.548367+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 4fc18d0b-72e2-403a-bc35-9a8df511e599 | 612               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-07 21:03:17.412359+00 | 2026-01-20 21:41:40.115324+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 4651da99-85e9-431f-884c-f707e6ede76d | 577               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-14 00:29:39.735452+00 | 2026-01-20 19:59:35.812351+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 988a106e-5ba1-406a-991f-7be35dced4b4 | 651               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:33:09.356575+00 | 2026-01-20 19:59:28.704984+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 1ae9f3d3-cfd1-4ee2-814c-1ae1fd982a2e | 473               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-11 16:49:29.372444+00 | 2026-01-20 19:58:48.312717+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 069e36b5-dba4-4fdf-abb3-82f9e3d2ae1a | 44                | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-11-14 19:22:29.273824+00 | 2026-01-20 15:52:47.959296+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 63d71878-01d7-4055-b886-c9851dcda119 | 656               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 22:51:51.187511+00 | 2026-01-20 15:52:36.576148+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-14 00:30:46.974745+00 | 2026-01-20 15:52:29.622208+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6a7463af-21ed-4f2c-8453-51a1d226548e | 499               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-23 19:16:43.853076+00 | 2026-01-20 15:51:50.524816+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 0645acec-3ef7-453c-bb2e-ce84f0dc4d3c | 590               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:43:06.90198+00  | 2026-01-20 15:51:42.830373+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | bfebe7de-f824-452f-94ea-f83dbb779e1b | 652               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:42:29.204387+00 | 2026-01-20 15:51:39.93455+00  |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 6c97383a-e103-42ac-9e2a-59631d0c605e | 620               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:44:03.32924+00  | 2026-01-20 15:51:38.064645+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 094aee10-f22a-4a8c-af46-6a7da3b38305 | 575               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-09 21:19:52.267285+00 | 2026-01-20 15:51:27.706021+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | ba737945-e2a4-48ac-b3bd-6e5b20f4bc09 | 557               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-24 18:10:22.874864+00 | 2026-01-20 15:50:47.418051+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | d4d95b38-4e30-4723-8396-a9b2d78d9974 | 533               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-07 18:52:50.221638+00 | 2026-01-20 15:50:40.858208+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 3fc36efa-f56d-4a96-8340-f3ee1d87bf0b | 513               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-18 19:42:14.109744+00 | 2026-01-20 15:50:37.866022+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | b0b1589d-693e-48f9-99c6-50fde3555513 | 519               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-23 02:35:16.846689+00 | 2026-01-20 15:49:34.239483+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 69c22883-8313-4600-9589-3b19a6372ecb | 512               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-17 21:25:49.490557+00 | 2026-01-20 15:49:26.738227+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | b6d801e8-e5cc-4b29-b9f3-688555c85453 | 504               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-27 00:26:48.192745+00 | 2026-01-20 15:49:23.608392+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | bbd3fc50-1fe3-4b8e-83bd-ef09f48ad7b2 | 455               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-27 00:27:29.797082+00 | 2026-01-20 15:48:59.199234+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 69749e8b-7129-47b2-9c1b-aafbfcebf87d | 348               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-11-21 21:37:41.608231+00 | 2026-01-20 15:48:07.483621+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 245ced2e-d8f3-47b6-a0da-742f3a0bae12 | 526               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-27 00:26:58.039589+00 | 2026-01-20 15:48:03.572104+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 36f612db-54e2-4d4c-a7de-63bd1787aad9 | 648               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 19:28:56.387885+00 | 2026-01-20 15:47:22.36182+00  |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 3acaace0-78b4-4d5d-a567-812f43534c5e | 659               | AG_PAGAMENTO        | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 16:51:32.840598+00 | 2026-01-20 15:46:31.728362+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | c73a98c3-c5b0-4479-a206-299608c9a1db | 645               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 19:28:43.762185+00 | 2026-01-20 15:39:09.95554+00  |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | f5a96aaf-8120-4c8d-bc83-20171bec84a7 | 638               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-12 19:57:13.893182+00 | 2026-01-20 15:38:48.351709+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 718bceee-c56e-48b5-b12e-e79b77bb191c | 597               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-07 18:50:54.561247+00 | 2026-01-20 15:38:28.456236+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | bba4a724-80ad-4ed9-ad2e-f9c5636304ca | 572               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-29 20:58:57.601574+00 | 2026-01-20 15:37:54.216018+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 291cbdc2-d701-4c1a-9333-de21038b8036 | 491               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-12 19:16:31.34829+00  | 2026-01-20 15:37:39.335909+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 88c4d063-ee01-4b7d-8403-5a22331c5d45 | 366               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-04 17:46:00.918289+00 | 2026-01-20 15:37:04.385607+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 209d91dc-fe1c-42f9-a4ed-c097facb3ec2 | 409               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2025-12-12 19:15:00.327586+00 | 2026-01-20 15:36:21.473786+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 0df4535e-e39c-4b1c-9a83-4985158cf0ba | 644               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 01:55:36.643667+00 | 2026-01-19 23:25:49.353713+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 36329608-c08a-426c-8a58-845078c8ea23 | 657               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 22:51:59.655905+00 | 2026-01-19 23:25:49.353713+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | e9e9edd0-81fa-4a51-b22f-82d988e9c20f | 583               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:44:12.992551+00 | 2026-01-19 23:25:49.353713+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 026a4b95-440e-41e0-8434-bce90c809087 | 658               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-13 22:49:54.022117+00 | 2026-01-19 23:25:49.353713+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 3e7a4185-bcc6-4bf8-8945-49bed640771b | 642               | ENVIADO             | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-15 02:28:29.899826+00 | 2026-01-19 23:25:49.353713+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | 11cd698f-db07-429f-89aa-7fe40b4e263d | 663               | CHEGOU              | ENTREGUE     | DIFERENTE (investigar!) | 2026-01-16 21:43:48.897467+00 | 2026-01-19 23:25:49.353713+00 |
| === COMPARAÇÃO: STATUS ANTES vs DEPOIS === | bc5c0c78-cb20-4222-b790-369aacbc0104 | 618               | PRODUCAO            | PRODUCAO     | IGUAL (ok)              | 2026-01-12 19:13:54.429689+00 | 2026-01-21 16:49:52.310441+00 |


-- ============================================================
-- QUERY 7: Distribuição de status ATUAL dos pedidos modificados
-- ============================================================
WITH pedidos_modificados AS (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
)
SELECT 
    '=== DISTRIBUIÇÃO STATUS ATUAL (PEDIDOS MODIFICADOS) ===' as secao,
    p.status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual,
    STRING_AGG(p.numero_sequencial::text, ', ' ORDER BY p.numero_sequencial) as exemplos_ordens
FROM pedidos p
WHERE p.id IN (SELECT pedido_id FROM pedidos_modificados)
GROUP BY p.status
ORDER BY quantidade DESC;

| secao                                                   | status   | quantidade | percentual | exemplos_ordens                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | -------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| === DISTRIBUIÇÃO STATUS ATUAL (PEDIDOS MODIFICADOS) === | ENTREGUE | 75         | 89.29      | 44, 57, 61, 269, 278, 348, 366, 390, 409, 453, 454, 455, 461, 473, 485, 491, 496, 499, 504, 506, 510, 512, 513, 515, 519, 526, 533, 544, 557, 572, 575, 577, 578, 583, 590, 594, 596, 597, 605, 608, 612, 616, 617, 619, 620, 621, 622, 623, 624, 626, 627, 629, 630, 635, 638, 641, 642, 644, 645, 646, 647, 648, 649, 651, 652, 653, 656, 657, 658, 659, 661, 663, 665, 671, 672 |
| === DISTRIBUIÇÃO STATUS ATUAL (PEDIDOS MODIFICADOS) === | PRODUCAO | 9          | 10.71      | 614, 615, 618, 631, 650, 655, 660, 670, 683                                                                                                                                                                                                                                                                                                                                        |


-- ============================================================
-- QUERY 8: Pedidos sem laboratorio_id (possível problema)
-- ============================================================
WITH pedidos_modificados AS (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
)
SELECT 
    '=== PEDIDOS SEM LABORATÓRIO (PROBLEMA!) ===' as secao,
    p.id,
    p.numero_sequencial,
    p.status,
    p.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as ultima_modificacao_sp,
    p.loja_id
FROM pedidos p
WHERE p.id IN (SELECT pedido_id FROM pedidos_modificados)
AND p.laboratorio_id IS NULL
ORDER BY p.updated_at DESC;

Success. No rows returned





-- ============================================================
-- RESUMO EXECUTIVO
-- ============================================================
SELECT '=== RESUMO EXECUTIVO ===' as secao;

SELECT 'Total de pedidos com eventos no período:' as metrica,
       COUNT(DISTINCT pedido_id)::text as valor
FROM pedidos_timeline 
WHERE created_at >= '2026-01-18 03:00:00+00'

UNION ALL

SELECT 'Pedidos CRIADOS (não mexer):' as metrica,
       COUNT(*)::text as valor
FROM pedidos
WHERE created_at >= '2026-01-18 03:00:00+00'

UNION ALL

SELECT 'Pedidos MODIFICADOS (investigar):' as metrica,
       COUNT(DISTINCT pedido_id)::text as valor
FROM pedidos_timeline 
WHERE created_at >= '2026-01-18 03:00:00+00'
AND pedido_id NOT IN (
    SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
)

UNION ALL

SELECT 'Pedidos MODIFICADOS que mudaram de status:' as metrica,
       COUNT(DISTINCT pm.pedido_id)::text as valor
FROM (
    SELECT DISTINCT pedido_id
    FROM pedidos_timeline 
    WHERE created_at >= '2026-01-18 03:00:00+00'
    AND pedido_id NOT IN (
        SELECT id FROM pedidos WHERE created_at >= '2026-01-18 03:00:00+00'
    )
) pm
JOIN (
    SELECT DISTINCT ON (pedido_id)
        pedido_id,
        status_novo as status_antes_sabado
    FROM pedidos_timeline
    WHERE created_at < '2026-01-18 03:00:00+00'
    ORDER BY pedido_id, created_at DESC
) us ON us.pedido_id = pm.pedido_id
JOIN pedidos p ON p.id = pm.pedido_id
WHERE us.status_antes_sabado != p.status;

| metrica                                    | valor |
| ------------------------------------------ | ----- |
| Total de pedidos com eventos no período:   | 85    |
| Pedidos CRIADOS (não mexer):               | 2     |
| Pedidos MODIFICADOS (investigar):          | 84    |
| Pedidos MODIFICADOS que mudaram de status: | 83    |
