-- ============================================================
-- 🕐 DIAGNÓSTICO: MUDANÇAS APÓS 13:00h DE ONTEM (20/01/2026)
-- ============================================================
-- Investigar mudanças em massa apartir das 13h de ontem
-- ============================================================

-- 1️⃣ PEDIDOS MODIFICADOS APÓS 13:00h ONTEM (HORÁRIO SP)
SELECT 
  numero_sequencial as "#OS",
  status,
  updated_at AT TIME ZONE 'America/Sao_Paulo' as modificado_em_sp,
  TO_CHAR(updated_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as data_hora_formatada,
  laboratorio_id,
  CASE 
    WHEN laboratorio_id IS NULL THEN '❌ SEM LAB'
    ELSE '✅'
  END as tem_lab,
  cliente_nome
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 13
ORDER BY updated_at DESC;

-- 2️⃣ CONTAGEM POR STATUS DOS PEDIDOS MODIFICADOS APÓS 13H ONTEM
SELECT 
  status,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 13
GROUP BY status
ORDER BY total DESC;

| #OS | status   | modificado_em_sp           | data_hora_formatada | laboratorio_id                       | tem_lab | cliente_nome                                |
| --- | -------- | -------------------------- | ------------------- | ------------------------------------ | ------- | ------------------------------------------- |
| 623 | ENTREGUE | 2026-01-20 15:42:27.163564 | 20/01/2026 15:42:27 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       | JOÃO SANTANA DE SIQUEIRA                    |
| 647 | ENTREGUE | 2026-01-20 15:42:22.221766 | 20/01/2026 15:42:22 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | ✅       | LUCAS GONÇALVES DA CONCEIÇÃO                |
| 653 | ENTREGUE | 2026-01-20 15:42:16.757002 | 20/01/2026 15:42:16 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | ✅       | ÍTALA CAROLINE RODRIGUES BASTOS             |
| 454 | ENTREGUE | 2026-01-20 15:42:10.837468 | 20/01/2026 15:42:10 | 3e51a952-326f-4300-86e4-153df8d7f893 | ✅       | MIRIÃ MARTINS SOUZA DE MOURA                |
| 515 | ENTREGUE | 2026-01-20 15:42:05.213634 | 20/01/2026 15:42:05 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       | MAIKE FERREIRA DOS SANTOS PEREIRA           |
| 649 | ENTREGUE | 2026-01-20 15:41:58.851855 | 20/01/2026 15:41:58 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | ✅       | DÉBORA OLIVEIRA DE JESUS CAVALCANTE (Joana) |
| 608 | ENTREGUE | 2026-01-20 15:41:52.447725 | 20/01/2026 15:41:52 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       | LUCAS OLIVEIRA SILVA ARAUJO                 |
| 635 | ENTREGUE | 2026-01-20 15:41:46.548367 | 20/01/2026 15:41:46 | 21e9cb25-ca46-42f9-b297-db1e693325ed | ✅       | JOSE ERNESTO MARTINS                        |
| 612 | ENTREGUE | 2026-01-20 15:41:40.115324 | 20/01/2026 15:41:40 | 21e9cb25-ca46-42f9-b297-db1e693325ed | ✅       | JOANA LIMA CARVALHO                         |
| 577 | ENTREGUE | 2026-01-20 13:59:35.812351 | 20/01/2026 13:59:35 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       | SELMA NALVES DA SILVA                       |
| 651 | ENTREGUE | 2026-01-20 13:59:28.704984 | 20/01/2026 13:59:28 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | ✅       | MARIA SALETE DA SILVA PIRES                 |
| 473 | ENTREGUE | 2026-01-20 13:58:48.312717 | 20/01/2026 13:58:48 | 21e9cb25-ca46-42f9-b297-db1e693325ed | ✅       | JACOB FIRMINO (LAIS)                        |


-- 3️⃣ TIMELINE: O QUE ACONTECEU APÓS 13H ONTEM?
SELECT 
  p.numero_sequencial as "#OS",
  pt.status_anterior as "de",
  pt.status_novo as "para",
  pt.created_at AT TIME ZONE 'America/Sao_Paulo' as horario_sp,
  TO_CHAR(pt.created_at AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI:SS') as hora_exata
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE 
  (pt.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (pt.created_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 13
ORDER BY pt.created_at DESC
LIMIT 100;

| #OS | de      | para     | horario_sp                 | hora_exata |
| --- | ------- | -------- | -------------------------- | ---------- |
| 618 | PRONTO  | PRODUCAO | 2026-01-20 15:59:22.227104 | 15:59:22   |
| 506 | ENVIADO | PRONTO   | 2026-01-20 15:59:06.18156  | 15:59:06   |
| 461 | ENVIADO | CHEGOU   | 2026-01-20 15:51:00.922469 | 15:51:00   |
| 453 | ENVIADO | CHEGOU   | 2026-01-20 15:50:36.341986 | 15:50:36   |
| 623 | CHEGOU  | ENTREGUE | 2026-01-20 15:42:27.163564 | 15:42:27   |
| 647 | CHEGOU  | ENTREGUE | 2026-01-20 15:42:22.221766 | 15:42:22   |
| 653 | CHEGOU  | ENTREGUE | 2026-01-20 15:42:16.757002 | 15:42:16   |
| 454 | CHEGOU  | ENTREGUE | 2026-01-20 15:42:10.837468 | 15:42:10   |
| 515 | CHEGOU  | ENTREGUE | 2026-01-20 15:42:05.213634 | 15:42:05   |
| 649 | CHEGOU  | ENTREGUE | 2026-01-20 15:41:58.851855 | 15:41:58   |
| 608 | CHEGOU  | ENTREGUE | 2026-01-20 15:41:52.447725 | 15:41:52   |
| 635 | CHEGOU  | ENTREGUE | 2026-01-20 15:41:46.548367 | 15:41:46   |
| 612 | CHEGOU  | ENTREGUE | 2026-01-20 15:41:40.115324 | 15:41:40   |
| 623 | ENVIADO | CHEGOU   | 2026-01-20 15:39:51.311688 | 15:39:51   |
| 647 | ENVIADO | CHEGOU   | 2026-01-20 15:36:50.324545 | 15:36:50   |
| 653 | ENVIADO | CHEGOU   | 2026-01-20 15:36:37.60639  | 15:36:37   |
| 454 | ENVIADO | CHEGOU   | 2026-01-20 15:36:18.502936 | 15:36:18   |
| 515 | ENVIADO | CHEGOU   | 2026-01-20 15:34:59.027749 | 15:34:59   |
| 649 | ENVIADO | CHEGOU   | 2026-01-20 15:34:08.922862 | 15:34:08   |
| 635 | ENVIADO | CHEGOU   | 2026-01-20 15:32:20.214049 | 15:32:20   |
| 612 | ENVIADO | CHEGOU   | 2026-01-20 15:30:54.402648 | 15:30:54   |
| 618 | ENVIADO | PRONTO   | 2026-01-20 15:09:46.33602  | 15:09:46   |
| 661 | ENVIADO | CHEGOU   | 2026-01-20 15:09:31.462262 | 15:09:31   |
| 577 | CHEGOU  | ENTREGUE | 2026-01-20 13:59:35.812351 | 13:59:35   |
| 651 | CHEGOU  | ENTREGUE | 2026-01-20 13:59:28.704984 | 13:59:28   |
| 473 | CHEGOU  | ENTREGUE | 2026-01-20 13:58:48.312717 | 13:58:48   |


-- 4️⃣ HORÁRIOS EXATOS DAS MUDANÇAS (agrupado por hora)
SELECT 
  EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER as hora_sp,
  COUNT(*) as total_pedidos_alterados,
  STRING_AGG(DISTINCT status::TEXT, ', ') as status_final,
  MIN(numero_sequencial) as primeiro_pedido,
  MAX(numero_sequencial) as ultimo_pedido
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 13
GROUP BY EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER
ORDER BY hora_sp DESC;


| hora_sp | total_pedidos_alterados | status_final | primeiro_pedido | ultimo_pedido |
| ------- | ----------------------- | ------------ | --------------- | ------------- |
| 15      | 9                       | ENTREGUE     | 454             | 653           |
| 13      | 3                       | ENTREGUE     | 473             | 651           |

-- 5️⃣ STATUS ANTES E DEPOIS (mudanças após 13h usando timeline)
WITH mudancas_pos_13h AS (
  SELECT 
    pt.pedido_id,
    pt.status_anterior as "status_antes",
    pt.status_novo as "status_depois",
    p.numero_sequencial,
    pt.created_at AT TIME ZONE 'America/Sao_Paulo' as quando_sp
  FROM pedidos_timeline pt
  JOIN pedidos p ON p.id = pt.pedido_id
  WHERE 
    (pt.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
    AND EXTRACT(HOUR FROM (pt.created_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 13
)
SELECT 
  status_antes,
  status_depois,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial LIMIT 10) as exemplos_primeiros_10
FROM mudancas_pos_13h
GROUP BY status_antes, status_depois
ORDER BY total DESC;

Error: Failed to run sql query: ERROR: 42601: syntax error at or near "LIMIT" LINE 20: STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial LIMIT 10) as exemplos_primeiros_10 ^





-- 6️⃣ OS 29 PEDIDOS EM PRODUCAO: STATUS ANTES DAS 13H
WITH pedidos_producao_atual AS (
  SELECT id, numero_sequencial
  FROM pedidos 
  WHERE status = 'PRODUCAO'
),
timeline_antes_13h AS (
  SELECT DISTINCT ON (pt.pedido_id)
    pt.pedido_id,
    pt.status_novo as ultimo_status_antes_13h,
    pt.created_at AT TIME ZONE 'America/Sao_Paulo' as quando_sp
  FROM pedidos_timeline pt
  WHERE 
    pt.created_at < ('2026-01-20 13:00:00'::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
  ORDER BY pt.pedido_id, pt.created_at DESC
)
SELECT 
  pp.numero_sequencial as "#OS",
  tb.ultimo_status_antes_13h as "status_correto",
  p.status as "status_atual",
  TO_CHAR(tb.quando_sp, 'DD/MM HH24:MI:SS') as "ultima_mudanca_valida",
  p.updated_at AT TIME ZONE 'America/Sao_Paulo' as "modificado_em"
FROM pedidos_producao_atual pp
JOIN pedidos p ON p.id = pp.id
LEFT JOIN timeline_antes_13h tb ON tb.pedido_id = pp.id
ORDER BY pp.numero_sequencial;


| #OS | status_correto | status_atual | ultima_mudanca_valida | modificado_em              |
| --- | -------------- | ------------ | --------------------- | -------------------------- |
| 400 | PRODUCAO       | PRODUCAO     | 25/11 17:44:30        | 2026-01-21 10:49:52.310441 |
| 446 | PRODUCAO       | PRODUCAO     | 08/12 09:42:51        | 2026-01-21 10:49:52.310441 |
| 509 | PRODUCAO       | PRODUCAO     | 16/12 15:17:36        | 2026-01-21 10:49:52.310441 |
| 570 | PRODUCAO       | PRODUCAO     | 26/12 14:30:48        | 2026-01-21 10:49:52.310441 |
| 581 | PRODUCAO       | PRODUCAO     | 02/01 17:49:33        | 2026-01-21 10:49:52.310441 |
| 592 | PRODUCAO       | PRODUCAO     | 09/01 19:51:40        | 2026-01-21 10:49:52.310441 |
| 603 | PRODUCAO       | PRODUCAO     | 09/01 19:51:39        | 2026-01-21 10:49:52.310441 |
| 606 | PRODUCAO       | PRODUCAO     | 09/01 19:51:38        | 2026-01-21 10:49:52.310441 |
| 607 | PRODUCAO       | PRODUCAO     | 09/01 19:51:37        | 2026-01-21 10:49:52.310441 |
| 609 | PRODUCAO       | PRODUCAO     | 09/01 19:51:36        | 2026-01-21 10:49:52.310441 |
| 610 | PRODUCAO       | PRODUCAO     | 09/01 19:51:35        | 2026-01-21 10:49:52.310441 |
| 611 | PRODUCAO       | PRODUCAO     | 09/01 19:51:35        | 2026-01-21 10:49:52.310441 |
| 614 | AG_PAGAMENTO   | PRODUCAO     | 07/01 20:22:12        | 2026-01-21 10:49:52.310441 |
| 615 | AG_PAGAMENTO   | PRODUCAO     | 07/01 20:22:10        | 2026-01-21 10:49:52.310441 |
| 618 | ENVIADO        | PRODUCAO     | 19/01 12:58:08        | 2026-01-21 10:49:52.310441 |
| 625 | PRODUCAO       | PRODUCAO     | 12/01 13:13:50        | 2026-01-21 10:49:52.310441 |
| 628 | PRODUCAO       | PRODUCAO     | 12/01 13:13:48        | 2026-01-21 10:49:52.310441 |
| 631 | AG_PAGAMENTO   | PRODUCAO     | 07/01 22:44:40        | 2026-01-21 10:49:52.310441 |
| 650 | AG_PAGAMENTO   | PRODUCAO     | 12/01 15:58:58        | 2026-01-21 10:49:52.310441 |
| 654 | PRODUCAO       | PRODUCAO     | 12/01 16:51:25        | 2026-01-21 10:49:52.310441 |
| 655 | AG_PAGAMENTO   | PRODUCAO     | 13/01 10:51:38        | 2026-01-21 10:49:52.310441 |
| 660 | AG_PAGAMENTO   | PRODUCAO     | 13/01 10:51:30        | 2026-01-21 10:49:52.310441 |
| 662 | PRODUCAO       | PRODUCAO     | 13/01 17:07:42        | 2026-01-21 10:49:52.310441 |
| 666 | PRODUCAO       | PRODUCAO     | 16/01 11:00:55        | 2026-01-21 10:49:52.310441 |
| 667 | PRODUCAO       | PRODUCAO     | 16/01 11:00:59        | 2026-01-21 10:49:52.310441 |
| 668 | PRODUCAO       | PRODUCAO     | 15/01 16:54:23        | 2026-01-21 10:49:52.310441 |
| 669 | PRODUCAO       | PRODUCAO     | 15/01 16:54:25        | 2026-01-21 10:49:52.310441 |
| 670 | PRODUCAO       | PRODUCAO     | 19/01 16:26:32        | 2026-01-21 10:49:52.310441 |
| 683 | AG_PAGAMENTO   | PRODUCAO     | 17/01 13:15:44        | 2026-01-21 11:43:14.603699 |

-- 7️⃣ VERIFICAR TODOS OS 2 PEDIDOS EM RASCUNHO
SELECT 
  numero_sequencial as "#OS",
  status,
  created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em_sp,
  updated_at AT TIME ZONE 'America/Sao_Paulo' as modificado_em_sp,
  laboratorio_id,
  cliente_nome
FROM pedidos
WHERE status = 'RASCUNHO'
ORDER BY numero_sequencial;

| #OS | status   | criado_em_sp               | modificado_em_sp           | laboratorio_id | cliente_nome |
| --- | -------- | -------------------------- | -------------------------- | -------------- | ------------ |
| 684 | RASCUNHO | 2026-01-19 12:43:54.612    | 2026-01-21 10:49:52.310441 | null           | ergerg       |
| 694 | RASCUNHO | 2026-01-21 11:06:02.778357 | 2026-01-21 11:06:02.778357 | null           | gqwregqwer   |


-- 8️⃣ TIMELINE DOS PEDIDOS EM RASCUNHO (histórico completo)
SELECT 
  p.numero_sequencial as "#OS",
  pt.status_anterior as "de",
  pt.status_novo as "para",
  pt.created_at AT TIME ZONE 'America/Sao_Paulo' as quando_sp,
  TO_CHAR(pt.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as data_hora
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE p.status = 'RASCUNHO'
ORDER BY p.numero_sequencial, pt.created_at DESC;

| #OS | de         | para       | quando_sp                  | data_hora           |
| --- | ---------- | ---------- | -------------------------- | ------------------- |
| 684 | REGISTRADO | RASCUNHO   | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52 |
| 684 | null       | REGISTRADO | 2026-01-19 12:43:54.612    | 19/01/2026 12:43:54 |


-- 9️⃣ PEDIDOS SEM LABORATORIO_ID
SELECT 
  numero_sequencial as "#OS",
  status,
  created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em_sp,
  updated_at AT TIME ZONE 'America/Sao_Paulo' as modificado_em_sp,
  cliente_nome
FROM pedidos
WHERE laboratorio_id IS NULL
ORDER BY numero_sequencial;


| #OS | status    | criado_em_sp               | modificado_em_sp           | cliente_nome |
| --- | --------- | -------------------------- | -------------------------- | ------------ |
| 682 | CANCELADO | 2026-01-16 19:54:39.568965 | 2026-01-19 17:25:49.353713 | fewargaw     |
| 684 | RASCUNHO  | 2026-01-19 12:43:54.612    | 2026-01-21 10:49:52.310441 | ergerg       |
| 694 | RASCUNHO  | 2026-01-21 11:06:02.778357 | 2026-01-21 11:06:02.778357 | gqwregqwer   |


-- 🔟 RESUMO EXECUTIVO
SELECT 
  '📊 RESUMO GERAL' as titulo,
  COUNT(*) FILTER (
    WHERE (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
    AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 13
  ) as modificados_pos_13h_ontem,
  COUNT(*) FILTER (WHERE status = 'PRODUCAO') as em_producao_agora,
  COUNT(*) FILTER (WHERE status = 'RASCUNHO') as em_rascunho_agora,
  COUNT(*) FILTER (WHERE status = 'AG_PAGAMENTO') as em_ag_pagamento,
  COUNT(*) FILTER (WHERE status = 'ENTREGUE') as entregue,
  COUNT(*) FILTER (WHERE laboratorio_id IS NULL) as sem_laboratorio,
  COUNT(*) as total_pedidos
FROM pedidos;

| titulo          | modificados_pos_13h_ontem | em_producao_agora | em_rascunho_agora | em_ag_pagamento | entregue | sem_laboratorio | total_pedidos |
| --------------- | ------------------------- | ----------------- | ----------------- | --------------- | -------- | --------------- | ------------- |
| 📊 RESUMO GERAL | 12                        | 29                | 2                 | 0               | 569      | 3               | 641           |


-- ============================================================
-- 🎯 PRÓXIMOS PASSOS:
-- 1. Query 6 mostra status correto de cada pedido em PRODUCAO
-- 2. Query 5 mostra quais mudanças aconteceram após 13h
-- 3. Queries 7-9 investigam RASCUNHO e pedidos sem lab
-- ============================================================
