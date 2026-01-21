-- ============================================================
-- DEBUG: O que tem na timeline das 10:49h?
-- ============================================================

-- 1. Modificações exatas às 10:49h
SELECT 
    'Mudanças às 10:49h' as secao,
    pt.pedido_id,
    p.numero_sequencial as os_numero,
    pt.status_anterior,
    pt.status_novo,
    pt.created_at AT TIME ZONE 'America/Sao_Paulo' as horario_sp
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
ORDER BY p.numero_sequencial;

| secao              | pedido_id                            | os_numero | status_anterior | status_novo | horario_sp                 |
| ------------------ | ------------------------------------ | --------- | --------------- | ----------- | -------------------------- |
| Mudanças às 10:49h | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | 57        | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | f1f8e925-b175-4eeb-aa20-1215447c98ca | 61        | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | 269       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | 278       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 557943b2-c234-447f-a654-d0786769a363 | 390       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 40c404fd-9257-4ce2-8a73-904972b330f1 | 453       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | f3b74358-a11d-4235-8539-aeb80bea404b | 461       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | b3bfc123-174e-41a8-a698-051a64501be8 | 485       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | 496       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | 506       | PRONTO          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | 510       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | 544       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | ff627e2c-b227-4d0a-b10f-4c915e98677e | 578       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | 594       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 8859f85b-6641-4b78-a70b-c930752ff81c | 596       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | 605       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | 614       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | a309317e-1121-497f-91d3-57117e0ca4ed | 615       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 3363e27f-bb2f-4f39-bf80-ec3216785613 | 616       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | 617       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | 619       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | 621       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | 624       | ENVIADO         | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | 626       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | d12459a9-4495-4d51-af6b-3793c016bf77 | 627       | ENVIADO         | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 683660d7-25f5-4075-9e01-f20d89b4c294 | 629       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 24b55d6a-2938-4ca5-a55b-313cb891d0da | 630       | ENVIADO         | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 30b73620-1724-4303-90b2-2b63b6b6f488 | 631       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | 650       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | fb650ea1-670f-4194-91f5-982710d15333 | 655       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 1512d395-ccdb-415c-8379-e9f2077c9413 | 660       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 6c042a43-c816-4555-a998-3f776badd662 | 661       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665       | CHEGOU          | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | aeb9d187-491a-47db-afb1-828dcb760089 | 671       | ENVIADO         | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | b9374462-ac98-4b4a-984d-8fe65aaa9194 | 672       | ENVIADO         | ENTREGUE    | 2026-01-21 10:49:52.310441 |
| Mudanças às 10:49h | d747b999-694c-4ad8-a9dc-519fb4d51579 | 683       | AG_PAGAMENTO    | PRODUCAO    | 2026-01-21 10:49:52.310441 |


-- 2. Status ANTES de 10:49h (último status conhecido)
WITH modificacoes_1049 AS (
    SELECT DISTINCT pt.pedido_id
    FROM pedidos_timeline pt
    WHERE DATE_TRUNC('minute', pt.created_at AT TIME ZONE 'America/Sao_Paulo') = '2026-01-21 10:49:00'::timestamp
)
SELECT 
    'Status ANTES 10:49h' as secao,
    p.numero_sequencial as os_numero,
    pt.pedido_id,
    pt.status_novo as ultimo_status_antes_1049,
    pt.created_at AT TIME ZONE 'America/Sao_Paulo' as quando_sp,
    p.status as status_atual_no_banco
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE pt.created_at < '2026-01-21 13:49:00+00'::timestamp
AND pt.pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
AND pt.pedido_id IN (
    SELECT DISTINCT ON (pedido_id) pedido_id
    FROM pedidos_timeline
    WHERE created_at < '2026-01-21 13:49:00+00'::timestamp
    AND pedido_id IN (SELECT pedido_id FROM modificacoes_1049)
    ORDER BY pedido_id, created_at DESC
)
ORDER BY p.numero_sequencial;

| secao               | os_numero | pedido_id                            | ultimo_status_antes_1049 | quando_sp                  | status_atual_no_banco |
| ------------------- | --------- | ------------------------------------ | ------------------------ | -------------------------- | --------------------- |
| Status ANTES 10:49h | 57        | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | CHEGOU                   | 2025-09-26 11:42:17.210772 | ENTREGUE              |
| Status ANTES 10:49h | 57        | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | PRONTO                   | 2025-09-26 11:42:11.61402  | ENTREGUE              |
| Status ANTES 10:49h | 57        | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | PRODUCAO                 | 2025-09-26 11:42:09.633836 | ENTREGUE              |
| Status ANTES 10:49h | 57        | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | PAGO                     | 2025-09-24 15:53:55.241102 | ENTREGUE              |
| Status ANTES 10:49h | 57        | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | AG_PAGAMENTO             | 2025-09-24 14:35:56.663127 | ENTREGUE              |
| Status ANTES 10:49h | 57        | b4630636-7cbe-4c28-9c0d-16d73c1fb0a6 | ENVIADO                  | 2025-09-26 11:42:15.684294 | ENTREGUE              |
| Status ANTES 10:49h | 61        | f1f8e925-b175-4eeb-aa20-1215447c98ca | PAGO                     | 2025-09-24 15:54:19.352387 | ENTREGUE              |
| Status ANTES 10:49h | 61        | f1f8e925-b175-4eeb-aa20-1215447c98ca | PRODUCAO                 | 2025-09-26 11:43:32.666277 | ENTREGUE              |
| Status ANTES 10:49h | 61        | f1f8e925-b175-4eeb-aa20-1215447c98ca | PRONTO                   | 2025-09-26 11:43:34.566112 | ENTREGUE              |
| Status ANTES 10:49h | 61        | f1f8e925-b175-4eeb-aa20-1215447c98ca | CHEGOU                   | 2025-09-26 11:43:39.825902 | ENTREGUE              |
| Status ANTES 10:49h | 61        | f1f8e925-b175-4eeb-aa20-1215447c98ca | ENVIADO                  | 2025-09-26 11:43:38.176651 | ENTREGUE              |
| Status ANTES 10:49h | 61        | f1f8e925-b175-4eeb-aa20-1215447c98ca | AG_PAGAMENTO             | 2025-09-24 14:36:02.442023 | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | PRONTO                   | 2025-11-10 10:02:40.627377 | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | PAGO                     | 2025-11-03 13:17:07.837517 | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | AG_PAGAMENTO             | 2025-10-31 11:48:07.787927 | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | ENVIADO                  | 2025-11-10 10:07:54.703277 | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | CHEGOU                   | 2025-11-17 16:53:47.391831 | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | REGISTRADO               | 2025-10-31 11:33:45.44282  | ENTREGUE              |
| Status ANTES 10:49h | 269       | f538e055-00f3-4ab5-a91a-aac9ea598ee5 | PRODUCAO                 | 2025-11-03 15:04:47.424488 | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | PAGO                     | 2025-11-01 14:31:27.993582 | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | PRODUCAO                 | 2025-11-01 14:32:55.446071 | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | PRONTO                   | 2025-11-01 14:32:57.963232 | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | ENVIADO                  | 2025-11-01 14:32:59.233793 | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | CHEGOU                   | 2025-11-01 14:33:00.370015 | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | REGISTRADO               | 2025-11-01 10:42:58.71216  | ENTREGUE              |
| Status ANTES 10:49h | 278       | 4737bf19-a5ad-4df5-a7e3-00ba292966f4 | AG_PAGAMENTO             | 2025-11-01 10:45:03.442133 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | PRODUCAO                 | 2025-11-24 15:45:47.982309 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | PRONTO                   | 2025-11-25 10:26:49.952313 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | REGISTRADO               | 2025-11-22 16:33:18.678637 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | CHEGOU                   | 2025-12-03 11:17:30.501632 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | ENVIADO                  | 2025-11-25 11:12:59.146348 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | AG_PAGAMENTO             | 2025-11-22 16:37:04.596882 | ENTREGUE              |
| Status ANTES 10:49h | 390       | 557943b2-c234-447f-a654-d0786769a363 | PAGO                     | 2025-11-24 15:07:36.964077 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | PAGO                     | 2025-12-08 10:13:09.525459 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | PRODUCAO                 | 2025-12-08 10:30:50.230397 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | PRONTO                   | 2025-12-12 16:45:26.913055 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | ENVIADO                  | 2026-01-13 10:27:41.038842 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | CHEGOU                   | 2026-01-20 15:50:36.341986 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | AG_PAGAMENTO             | 2025-12-05 12:42:14.656569 | ENTREGUE              |
| Status ANTES 10:49h | 453       | 40c404fd-9257-4ce2-8a73-904972b330f1 | REGISTRADO               | 2025-12-05 12:31:51.295792 | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | PAGO                     | 2025-12-08 10:13:56.907689 | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | CHEGOU                   | 2026-01-20 15:51:00.922469 | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | ENVIADO                  | 2026-01-13 10:27:23.466345 | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | PRONTO                   | 2025-12-12 16:45:41.753848 | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | PRODUCAO                 | 2025-12-08 10:30:55.13023  | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | AG_PAGAMENTO             | 2025-12-05 13:05:39.573308 | ENTREGUE              |
| Status ANTES 10:49h | 461       | f3b74358-a11d-4235-8539-aeb80bea404b | REGISTRADO               | 2025-12-05 13:05:06.464309 | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | CHEGOU                   | 2026-01-20 10:18:03.76377  | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | REGISTRADO               | 2025-12-11 11:59:28.646121 | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | AG_PAGAMENTO             | 2025-12-11 12:02:53.384336 | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | PAGO                     | 2025-12-11 17:42:48.080527 | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | PRODUCAO                 | 2025-12-12 10:25:20.225197 | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | PRONTO                   | 2025-12-12 16:45:11.933229 | ENTREGUE              |
| Status ANTES 10:49h | 485       | b3bfc123-174e-41a8-a698-051a64501be8 | ENVIADO                  | 2025-12-15 17:36:47.549336 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 10:42:02.12502  | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | CHEGOU                   | 2026-01-21 10:39:51.438809 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-21 10:39:45.426368 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 12:04:00.243334 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 12:03:15.017794 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 11:21:47.926619 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 11:19:59.609432 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 11:17:32.5915   | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 11:17:11.403145 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 11:14:11.959589 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 11:13:36.327401 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 10:43:12.548046 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 10:42:45.954327 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | REGISTRADO               | 2025-12-11 13:33:09.664275 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | AG_PAGAMENTO             | 2025-12-11 13:40:10.708348 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PAGO                     | 2025-12-12 10:51:15.197687 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRODUCAO                 | 2025-12-12 11:39:32.752934 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2025-12-13 17:45:57.766702 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | ENVIADO                  | 2026-01-13 10:27:30.831165 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | CHEGOU                   | 2026-01-13 10:32:03.049558 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRODUCAO                 | 2026-01-13 10:33:48.587875 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 10:34:01.920007 | ENTREGUE              |
| Status ANTES 10:49h | 496       | 73b8f5a3-3b7c-4644-806d-8d7585a41412 | PRONTO                   | 2026-01-13 10:42:08.129532 | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | PRONTO                   | 2026-01-20 15:59:06.18156  | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | PRONTO                   | 2026-01-06 17:43:29.64375  | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | PRODUCAO                 | 2025-12-16 12:28:43.884091 | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | PAGO                     | 2025-12-16 12:25:09.274947 | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | AG_PAGAMENTO             | 2025-12-13 17:35:27.728612 | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | REGISTRADO               | 2025-12-13 17:34:48.427725 | ENTREGUE              |
| Status ANTES 10:49h | 506       | 2e7f5bb1-d6d6-4bfe-9733-f152fc3cc584 | ENVIADO                  | 2026-01-06 17:43:31.03157  | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | REGISTRADO               | 2025-12-16 13:02:38.741072 | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | CHEGOU                   | 2026-01-20 10:17:07.3426   | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | ENVIADO                  | 2026-01-20 10:17:00.641253 | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | PRONTO                   | 2026-01-20 10:16:46.237467 | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | PRODUCAO                 | 2026-01-09 19:51:41.364933 | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | PAGO                     | 2025-12-16 17:27:51.627227 | ENTREGUE              |
| Status ANTES 10:49h | 510       | 86605cc1-849a-41bc-a4b5-5c86f4b2e044 | AG_PAGAMENTO             | 2025-12-16 13:05:33.867368 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | AG_PAGAMENTO             | 2025-12-18 14:26:27.283047 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | CHEGOU                   | 2026-01-21 10:42:40.399818 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | ENVIADO                  | 2026-01-21 10:42:38.173058 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | PRONTO                   | 2026-01-21 10:42:29.205528 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | PRODUCAO                 | 2025-12-18 14:27:53.922037 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | PAGO                     | 2025-12-18 14:27:33.366026 | ENTREGUE              |
| Status ANTES 10:49h | 544       | ebd0c4cb-35e7-47be-8bd6-db227ae9666e | REGISTRADO               | 2025-12-18 14:24:02.564579 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | CHEGOU                   | 2026-01-20 10:17:14.473753 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | REGISTRADO               | 2025-12-26 17:10:59.284041 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | AG_PAGAMENTO             | 2025-12-26 17:11:04.763143 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | PAGO                     | 2026-01-02 18:03:06.937605 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | PRODUCAO                 | 2026-01-09 19:51:19.786744 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | PRONTO                   | 2026-01-09 19:51:21.066677 | ENTREGUE              |
| Status ANTES 10:49h | 578       | ff627e2c-b227-4d0a-b10f-4c915e98677e | ENVIADO                  | 2026-01-09 19:51:22.513969 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | PRODUCAO                 | 2026-01-02 17:01:32.724197 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | CHEGOU                   | 2026-01-02 17:32:55.650143 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | ENVIADO                  | 2026-01-02 17:32:54.160168 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | PRONTO                   | 2026-01-02 17:32:52.800216 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | REGISTRADO               | 2025-12-30 16:46:43.755708 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | AG_PAGAMENTO             | 2025-12-30 16:46:50.806957 | ENTREGUE              |
| Status ANTES 10:49h | 594       | 97045835-c11e-4f8e-a7ee-cb1952bc16cd | PAGO                     | 2025-12-30 16:46:58.621324 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | PRONTO                   | 2026-01-14 16:55:20.49415  | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | ENVIADO                  | 2026-01-07 22:38:30.797902 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | PRONTO                   | 2026-01-07 22:38:20.322885 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | PRODUCAO                 | 2026-01-02 17:49:32.339481 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | PAGO                     | 2026-01-02 17:44:32.641104 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | AG_PAGAMENTO             | 2025-12-30 18:16:08.946129 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | REGISTRADO               | 2025-12-30 18:15:55.93588  | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | CHEGOU                   | 2026-01-16 15:43:13.559277 | ENTREGUE              |
| Status ANTES 10:49h | 596       | 8859f85b-6641-4b78-a70b-c930752ff81c | ENVIADO                  | 2026-01-14 19:43:33.672614 | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | PRONTO                   | 2026-01-20 10:18:17.773539 | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | CHEGOU                   | 2026-01-20 10:20:13.481672 | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | REGISTRADO               | 2026-01-07 13:19:24.18063  | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | AG_PAGAMENTO             | 2026-01-08 20:03:15.569481 | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | PAGO                     | 2026-01-08 20:03:21.060935 | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | PRODUCAO                 | 2026-01-09 19:51:39.071642 | ENTREGUE              |
| Status ANTES 10:49h | 605       | e4a74dfc-c1a2-4b0c-bdf0-39a3c307a9bf | ENVIADO                  | 2026-01-20 10:20:10.743107 | ENTREGUE              |
| Status ANTES 10:49h | 614       | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | REGISTRADO               | 2026-01-07 20:09:10.08217  | PRODUCAO              |
| Status ANTES 10:49h | 614       | 6e776b62-2f3d-47cb-86ac-dbaf86b54c1c | AG_PAGAMENTO             | 2026-01-07 20:22:12.094583 | PRODUCAO              |
| Status ANTES 10:49h | 615       | a309317e-1121-497f-91d3-57117e0ca4ed | AG_PAGAMENTO             | 2026-01-07 20:22:10.619619 | PRODUCAO              |
| Status ANTES 10:49h | 615       | a309317e-1121-497f-91d3-57117e0ca4ed | REGISTRADO               | 2026-01-07 20:14:29.058988 | PRODUCAO              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | ENVIADO                  | 2026-01-14 20:35:51.665783 | ENTREGUE              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | PRONTO                   | 2026-01-14 20:35:46.492657 | ENTREGUE              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | PAGO                     | 2026-01-12 12:06:34.568985 | ENTREGUE              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | PRODUCAO                 | 2026-01-12 13:13:56.919305 | ENTREGUE              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | AG_PAGAMENTO             | 2026-01-07 20:22:08.809839 | ENTREGUE              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | REGISTRADO               | 2026-01-07 20:21:54.994528 | ENTREGUE              |
| Status ANTES 10:49h | 616       | 3363e27f-bb2f-4f39-bf80-ec3216785613 | CHEGOU                   | 2026-01-16 15:42:37.511859 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | PRONTO                   | 2026-01-14 20:37:11.281805 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | CHEGOU                   | 2026-01-16 15:42:49.506559 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | ENVIADO                  | 2026-01-16 15:42:47.472154 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | PRODUCAO                 | 2026-01-12 13:13:55.478393 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | PAGO                     | 2026-01-12 12:06:28.736563 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | AG_PAGAMENTO             | 2026-01-07 20:27:16.238247 | ENTREGUE              |
| Status ANTES 10:49h | 617       | c36e1374-76a0-418b-a5f8-f8baff1a0ea9 | REGISTRADO               | 2026-01-07 20:27:08.260169 | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | PAGO                     | 2026-01-12 12:06:50.45057  | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | PRODUCAO                 | 2026-01-12 13:13:53.573135 | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | PRONTO                   | 2026-01-14 20:36:18.42077  | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | ENVIADO                  | 2026-01-16 15:43:37.406108 | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | CHEGOU                   | 2026-01-16 15:43:39.028525 | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | REGISTRADO               | 2026-01-07 20:44:00.121909 | ENTREGUE              |
| Status ANTES 10:49h | 619       | f84f851d-ae4a-4542-a5af-7c5d718f5cd3 | AG_PAGAMENTO             | 2026-01-07 20:44:05.514101 | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | CHEGOU                   | 2026-01-16 15:43:26.34566  | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | PRODUCAO                 | 2026-01-13 10:01:09.765152 | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | PAGO                     | 2026-01-13 10:00:27.740764 | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | AG_PAGAMENTO             | 2026-01-07 20:49:12.58207  | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | REGISTRADO               | 2026-01-07 20:49:05.608647 | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | PRONTO                   | 2026-01-14 20:37:21.636015 | ENTREGUE              |
| Status ANTES 10:49h | 621       | 48aa41a4-1d80-4b35-99ee-559ef013ce43 | ENVIADO                  | 2026-01-16 15:43:24.556098 | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | PRODUCAO                 | 2026-01-09 19:51:34.384622 | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | CHEGOU                   | 2026-01-20 10:17:21.562423 | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | ENVIADO                  | 2026-01-14 20:35:18.964355 | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | PRONTO                   | 2026-01-14 16:54:10.22404  | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | PAGO                     | 2026-01-07 21:14:37.502972 | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | AG_PAGAMENTO             | 2026-01-07 21:11:54.894011 | ENTREGUE              |
| Status ANTES 10:49h | 622       | 11de6da3-c1ce-47ce-b8f2-a540026f9458 | REGISTRADO               | 2026-01-07 21:11:48.016131 | ENTREGUE              |
| Status ANTES 10:49h | 624       | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | PRODUCAO                 | 2026-01-13 17:07:49.599681 | ENTREGUE              |
| Status ANTES 10:49h | 624       | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | ENVIADO                  | 2026-01-21 10:26:04.825896 | ENTREGUE              |
| Status ANTES 10:49h | 624       | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | REGISTRADO               | 2026-01-07 21:40:05.305371 | ENTREGUE              |
| Status ANTES 10:49h | 624       | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | PRONTO                   | 2026-01-21 10:25:08.404873 | ENTREGUE              |
| Status ANTES 10:49h | 624       | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | PAGO                     | 2026-01-13 17:07:16.253395 | ENTREGUE              |
| Status ANTES 10:49h | 624       | 6ea130a7-315e-4ef7-ac36-c53cd0f69471 | AG_PAGAMENTO             | 2026-01-07 21:44:59.526241 | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | PRODUCAO                 | 2026-01-12 13:13:49.24347  | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | PRONTO                   | 2026-01-16 17:33:32.184382 | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | REGISTRADO               | 2026-01-07 21:48:21.122368 | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | AG_PAGAMENTO             | 2026-01-07 21:48:25.259935 | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | ENVIADO                  | 2026-01-16 17:33:40.91629  | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | CHEGOU                   | 2026-01-20 10:17:53.340742 | ENTREGUE              |
| Status ANTES 10:49h | 626       | 75dd6131-9ba5-4d10-bcdc-57f52a89be91 | PAGO                     | 2026-01-12 12:58:30.064629 | ENTREGUE              |
| Status ANTES 10:49h | 627       | d12459a9-4495-4d51-af6b-3793c016bf77 | PRONTO                   | 2026-01-21 10:24:12.497442 | ENTREGUE              |
| Status ANTES 10:49h | 627       | d12459a9-4495-4d51-af6b-3793c016bf77 | PRODUCAO                 | 2026-01-13 17:07:48.332305 | ENTREGUE              |
| Status ANTES 10:49h | 627       | d12459a9-4495-4d51-af6b-3793c016bf77 | AG_PAGAMENTO             | 2026-01-07 21:51:56.396116 | ENTREGUE              |
| Status ANTES 10:49h | 627       | d12459a9-4495-4d51-af6b-3793c016bf77 | REGISTRADO               | 2026-01-07 21:51:50.409973 | ENTREGUE              |
| Status ANTES 10:49h | 627       | d12459a9-4495-4d51-af6b-3793c016bf77 | PAGO                     | 2026-01-13 17:07:14.698586 | ENTREGUE              |
| Status ANTES 10:49h | 627       | d12459a9-4495-4d51-af6b-3793c016bf77 | ENVIADO                  | 2026-01-21 10:24:30.910131 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | REGISTRADO               | 2026-01-07 22:07:11.953504 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | ENVIADO                  | 2026-01-13 18:28:53.899633 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | CHEGOU                   | 2026-01-15 13:28:50.271664 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | PAGO                     | 2026-01-12 12:58:16.260956 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | AG_PAGAMENTO             | 2026-01-07 22:07:19.505604 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | PRONTO                   | 2026-01-13 18:28:36.067367 | ENTREGUE              |
| Status ANTES 10:49h | 629       | 683660d7-25f5-4075-9e01-f20d89b4c294 | PRODUCAO                 | 2026-01-12 13:13:46.825449 | ENTREGUE              |
| Status ANTES 10:49h | 630       | 24b55d6a-2938-4ca5-a55b-313cb891d0da | PRODUCAO                 | 2026-01-13 17:07:46.890316 | ENTREGUE              |
| Status ANTES 10:49h | 630       | 24b55d6a-2938-4ca5-a55b-313cb891d0da | PRONTO                   | 2026-01-21 10:24:47.70369  | ENTREGUE              |
| Status ANTES 10:49h | 630       | 24b55d6a-2938-4ca5-a55b-313cb891d0da | PAGO                     | 2026-01-13 17:07:12.692263 | ENTREGUE              |
| Status ANTES 10:49h | 630       | 24b55d6a-2938-4ca5-a55b-313cb891d0da | ENVIADO                  | 2026-01-21 10:24:58.449093 | ENTREGUE              |
| Status ANTES 10:49h | 630       | 24b55d6a-2938-4ca5-a55b-313cb891d0da | REGISTRADO               | 2026-01-07 22:11:33.992372 | ENTREGUE              |
| Status ANTES 10:49h | 630       | 24b55d6a-2938-4ca5-a55b-313cb891d0da | AG_PAGAMENTO             | 2026-01-07 22:11:39.42943  | ENTREGUE              |
| Status ANTES 10:49h | 631       | 30b73620-1724-4303-90b2-2b63b6b6f488 | AG_PAGAMENTO             | 2026-01-07 22:44:40.663219 | PRODUCAO              |
| Status ANTES 10:49h | 631       | 30b73620-1724-4303-90b2-2b63b6b6f488 | REGISTRADO               | 2026-01-07 22:44:31.388827 | PRODUCAO              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | ENVIADO                  | 2026-01-13 16:10:45.490435 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | REGISTRADO               | 2026-01-12 11:25:43.364    | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | AG_PAGAMENTO             | 2026-01-12 11:46:41.050577 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | PAGO                     | 2026-01-12 13:13:18.910389 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | PRODUCAO                 | 2026-01-12 13:13:40.708465 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | PRONTO                   | 2026-01-13 12:23:11.325478 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | ENVIADO                  | 2026-01-13 13:26:59.000202 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | PRONTO                   | 2026-01-13 16:10:08.852796 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | ENVIADO                  | 2026-01-13 16:10:21.927057 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | PRONTO                   | 2026-01-13 16:10:41.443075 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | CHEGOU                   | 2026-01-13 16:39:21.3852   | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | ENVIADO                  | 2026-01-13 18:30:59.092863 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | PRONTO                   | 2026-01-13 18:31:02.142197 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | ENVIADO                  | 2026-01-13 18:31:09.502533 | ENTREGUE              |
| Status ANTES 10:49h | 646       | c9a83a82-e42a-4034-bdac-e81f8febe8d8 | CHEGOU                   | 2026-01-13 18:31:11.387494 | ENTREGUE              |
| Status ANTES 10:49h | 650       | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | AG_PAGAMENTO             | 2026-01-12 15:58:58.700631 | PRODUCAO              |
| Status ANTES 10:49h | 650       | 74f9f01a-5644-489d-8f6c-f37e640a0cbe | REGISTRADO               | 2026-01-12 15:58:21.928863 | PRODUCAO              |
| Status ANTES 10:49h | 655       | fb650ea1-670f-4194-91f5-982710d15333 | REGISTRADO               | 2026-01-13 10:37:16.733474 | PRODUCAO              |
| Status ANTES 10:49h | 655       | fb650ea1-670f-4194-91f5-982710d15333 | AG_PAGAMENTO             | 2026-01-13 10:51:38.955786 | PRODUCAO              |
| Status ANTES 10:49h | 660       | 1512d395-ccdb-415c-8379-e9f2077c9413 | REGISTRADO               | 2026-01-13 10:49:29.941332 | PRODUCAO              |
| Status ANTES 10:49h | 660       | 1512d395-ccdb-415c-8379-e9f2077c9413 | AG_PAGAMENTO             | 2026-01-13 10:51:30.873368 | PRODUCAO              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | AG_PAGAMENTO             | 2026-01-13 17:01:55.00231  | ENTREGUE              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | REGISTRADO               | 2026-01-13 17:01:47.567076 | ENTREGUE              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | PAGO                     | 2026-01-13 17:07:25.204997 | ENTREGUE              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | PRODUCAO                 | 2026-01-13 17:07:44.750168 | ENTREGUE              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | PRONTO                   | 2026-01-19 12:57:57.345891 | ENTREGUE              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | ENVIADO                  | 2026-01-19 12:58:17.029667 | ENTREGUE              |
| Status ANTES 10:49h | 661       | 6c042a43-c816-4555-a998-3f776badd662 | CHEGOU                   | 2026-01-20 15:09:31.462262 | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | PAGO                     | 2026-01-14 20:42:10.937683 | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | AG_PAGAMENTO             | 2026-01-14 20:42:00.737049 | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | REGISTRADO               | 2026-01-14 20:41:50.611151 | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | PRODUCAO                 | 2026-01-14 20:42:12.829626 | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | PRONTO                   | 2026-01-14 20:42:42.154312 | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | ENVIADO                  | 2026-01-19 15:18:16.75264  | ENTREGUE              |
| Status ANTES 10:49h | 665       | 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | CHEGOU                   | 2026-01-19 15:18:18.932748 | ENTREGUE              |
| Status ANTES 10:49h | 671       | aeb9d187-491a-47db-afb1-828dcb760089 | PRONTO                   | 2026-01-21 10:26:16.331313 | ENTREGUE              |
| Status ANTES 10:49h | 671       | aeb9d187-491a-47db-afb1-828dcb760089 | ENVIADO                  | 2026-01-21 10:26:25.1918   | ENTREGUE              |
| Status ANTES 10:49h | 671       | aeb9d187-491a-47db-afb1-828dcb760089 | REGISTRADO               | 2026-01-14 21:01:30.489966 | ENTREGUE              |
| Status ANTES 10:49h | 671       | aeb9d187-491a-47db-afb1-828dcb760089 | AG_PAGAMENTO             | 2026-01-14 21:01:41.004332 | ENTREGUE              |
| Status ANTES 10:49h | 671       | aeb9d187-491a-47db-afb1-828dcb760089 | PAGO                     | 2026-01-16 11:00:43.922873 | ENTREGUE              |
| Status ANTES 10:49h | 671       | aeb9d187-491a-47db-afb1-828dcb760089 | PRODUCAO                 | 2026-01-16 11:00:57.640975 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | AG_PAGAMENTO             | 2026-01-15 16:54:19.544565 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | REGISTRADO               | 2026-01-14 21:15:22.434113 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | PAGO                     | 2026-01-19 13:36:10.525837 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | AG_PAGAMENTO             | 2026-01-19 13:36:16.322061 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | ENVIADO                  | 2026-01-21 10:36:47.976711 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | PRONTO                   | 2026-01-21 10:36:36.336241 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | PRODUCAO                 | 2026-01-19 16:26:22.791923 | ENTREGUE              |
| Status ANTES 10:49h | 672       | b9374462-ac98-4b4a-984d-8fe65aaa9194 | PAGO                     | 2026-01-19 16:19:04.920722 | ENTREGUE              |
| Status ANTES 10:49h | 683       | d747b999-694c-4ad8-a9dc-519fb4d51579 | REGISTRADO               | 2026-01-17 11:50:07.612543 | PRODUCAO              |
| Status ANTES 10:49h | 683       | d747b999-694c-4ad8-a9dc-519fb4d51579 | AG_PAGAMENTO             | 2026-01-17 13:15:44.829336 | PRODUCAO              |


-- 3. Comparação: Onde deveria estar vs Onde está
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
    'COMPARAÇÃO' as secao,
    p.numero_sequencial as os_numero,
    sc.status_correto as deveria_ser,
    p.status as esta_agora,
    CASE 
        WHEN sc.status_correto = p.status THEN '✓ OK'
        ELSE '✗ ERRADO'
    END as situacao
FROM pedidos p
JOIN status_correto_antes sc ON sc.pedido_id = p.id
ORDER BY p.numero_sequencial;


| secao      | os_numero | deveria_ser  | esta_agora | situacao |
| ---------- | --------- | ------------ | ---------- | -------- |
| COMPARAÇÃO | 57        | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 61        | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 269       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 278       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 390       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 453       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 461       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 485       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 496       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 506       | PRONTO       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 510       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 544       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 578       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 594       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 596       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 605       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 614       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |
| COMPARAÇÃO | 615       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |
| COMPARAÇÃO | 616       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 617       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 619       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 621       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 622       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 624       | ENVIADO      | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 626       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 627       | ENVIADO      | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 629       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 630       | ENVIADO      | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 631       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |
| COMPARAÇÃO | 646       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 650       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |
| COMPARAÇÃO | 655       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |
| COMPARAÇÃO | 660       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |
| COMPARAÇÃO | 661       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 665       | CHEGOU       | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 671       | ENVIADO      | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 672       | ENVIADO      | ENTREGUE   | ✗ ERRADO |
| COMPARAÇÃO | 683       | AG_PAGAMENTO | PRODUCAO   | ✗ ERRADO |


