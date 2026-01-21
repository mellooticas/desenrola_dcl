-- ============================================================
-- 🕐 DIAGNÓSTICO: MUDANÇAS APÓS 18:00h DE ONTEM (20/01/2026)
-- ============================================================
-- Investigar mudanças em massa que ocorreram ontem à noite
-- ============================================================

-- 1️⃣ PEDIDOS MODIFICADOS APÓS 18:00h ONTEM (HORÁRIO SP)
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
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
ORDER BY updated_at DESC;

-- 2️⃣ CONTAGEM POR STATUS DOS PEDIDOS MODIFICADOS APÓS 18H ONTEM
SELECT 
  status,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
GROUP BY status
ORDER BY total DESC;

-- 3️⃣ TIMELINE: O QUE ACONTECEU APÓS 18H ONTEM?
SELECT 
  p.numero_sequencial as "#OS",
  pt.status_anterior as "de",
  pt.status_novo as "para",
  pt.created_at AT TIME ZONE 'America/Sao_Paulo' as horario_sp,
  TO_CHAR(pt.created_at AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI:SS') as hora_exata,
  pt.usuario_nome,
  pt.observacao
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE 
  (pt.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (pt.created_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
ORDER BY pt.created_at DESC
LIMIT 100;

Error: Failed to run sql query: ERROR: 42703: column pt.usuario_nome does not exist LINE 9: pt.usuario_nome, ^





-- 4️⃣ HORÁRIOS EXATOS DAS MUDANÇAS EM MASSA (agrupado por minuto)
SELECT 
  TO_CHAR(updated_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI') as minuto_exato,
  COUNT(*) as total_pedidos_alterados,
  STRING_AGG(DISTINCT status::TEXT, ', ') as status_final,
  MIN(numero_sequencial) as primeiro_pedido,
  MAX(numero_sequencial) as ultimo_pedido
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
GROUP BY TO_CHAR(updated_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI')
ORDER BY minuto_exato DESC;

-- 5️⃣ STATUS ANTES E DEPOIS (usando timeline)
WITH mudancas_pos_18h AS (
  SELECT 
    pt.pedido_id,
    pt.status_anterior as "status_antes",
    pt.status_novo as "status_depois",
    p.numero_sequencial
  FROM pedidos_timeline pt
  JOIN pedidos p ON p.id = pt.pedido_id
  WHERE 
    (pt.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
    AND EXTRACT(HOUR FROM (pt.created_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
)
SELECT 
  status_antes,
  status_depois,
  COUNT(*) as total,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial LIMIT 10) as exemplos
FROM mudancas_pos_18h
GROUP BY status_antes, status_depois
ORDER BY total DESC;

-- 6️⃣ QUAL FOI O TIMESTAMP EXATO DA MUDANÇA EM MASSA?
SELECT 
  updated_at AT TIME ZONE 'America/Sao_Paulo' as horario_sp,
  updated_at as horario_utc,
  COUNT(*) as pedidos_nesse_exato_momento,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial LIMIT 20) as primeiros_20_pedidos
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
  AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
GROUP BY updated_at
ORDER BY updated_at DESC;

-- 7️⃣ OS 29 PEDIDOS EM PRODUCAO: QUAL ERA O STATUS ANTES?
WITH pedidos_producao_atual AS (
  SELECT id, numero_sequencial
  FROM pedidos 
  WHERE status = 'PRODUCAO'
),
status_antes AS (
  SELECT DISTINCT ON (pt.pedido_id)
    pt.pedido_id,
    pt.status_anterior as status_antes_mudanca
  FROM pedidos_timeline pt
  WHERE pt.created_at >= ('2026-01-20 18:00:00'::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
  ORDER BY pt.pedido_id, pt.created_at ASC
)
SELECT 
  pp.numero_sequencial as "#OS",
  sa.status_antes_mudanca as "status_antes_18h",
  p.status as "status_atual",
  p.updated_at AT TIME ZONE 'America/Sao_Paulo' as modificado_em_sp,
  p.laboratorio_id,
  CASE WHEN p.laboratorio_id IS NULL THEN '❌' ELSE '✅' END as tem_lab
FROM pedidos_producao_atual pp
JOIN pedidos p ON p.id = pp.id
LEFT JOIN status_antes sa ON sa.pedido_id = pp.id
ORDER BY p.numero_sequencial;


| #OS | status_antes_18h | status_atual | modificado_em_sp           | laboratorio_id                       | tem_lab |
| --- | ---------------- | ------------ | -------------------------- | ------------------------------------ | ------- |
| 400 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | ✅       |
| 446 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | ✅       |
| 509 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | ✅       |
| 570 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 581 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 592 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 603 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       |
| 606 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       |
| 607 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       |
| 609 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       |
| 610 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       |
| 611 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 74dc986a-1063-4b8e-8964-59eb396e10eb | ✅       |
| 614 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 10:49:52.310441 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | ✅       |
| 615 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 10:49:52.310441 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | ✅       |
| 618 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 3e51a952-326f-4300-86e4-153df8d7f893 | ✅       |
| 625 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 628 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 631 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 10:49:52.310441 | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | ✅       |
| 650 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 10:49:52.310441 | 21e9cb25-ca46-42f9-b297-db1e693325ed | ✅       |
| 654 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | ✅       |
| 655 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 10:49:52.310441 | 68233923-a12b-4c65-a3ca-7c5fec265336 | ✅       |
| 660 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 10:49:52.310441 | 68233923-a12b-4c65-a3ca-7c5fec265336 | ✅       |
| 662 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 3e51a952-326f-4300-86e4-153df8d7f893 | ✅       |
| 666 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 667 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 668 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 669 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 670 | null             | PRODUCAO     | 2026-01-21 10:49:52.310441 | 8ce109c1-69d3-484a-a87b-8accf7984132 | ✅       |
| 683 | AG_PAGAMENTO     | PRODUCAO     | 2026-01-21 11:43:14.603699 | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | ✅       |


-- 8️⃣ VERIFICAR TIMELINE DETALHADA DOS 29 EM PRODUCAO
-- (buscar último status válido ANTES das 18h de ontem)
WITH pedidos_producao_atual AS (
  SELECT id, numero_sequencial
  FROM pedidos 
  WHERE status = 'PRODUCAO'
),
timeline_antes_18h AS (
  SELECT DISTINCT ON (pt.pedido_id)
    pt.pedido_id,
    pt.status_novo as ultimo_status_antes_18h,
    pt.created_at AT TIME ZONE 'America/Sao_Paulo' as quando_sp
  FROM pedidos_timeline pt
  WHERE 
    pt.created_at < ('2026-01-20 18:00:00'::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
  ORDER BY pt.pedido_id, pt.created_at DESC
)
SELECT 
  pp.numero_sequencial as "#OS",
  tb.ultimo_status_antes_18h as "status_correto",
  p.status as "status_atual_errado",
  TO_CHAR(tb.quando_sp, 'DD/MM HH24:MI:SS') as "ultima_mudanca_valida",
  p.updated_at AT TIME ZONE 'America/Sao_Paulo' as "modificado_erroneamente_em"
FROM pedidos_producao_atual pp
JOIN pedidos p ON p.id = pp.id
LEFT JOIN timeline_antes_18h tb ON tb.pedido_id = pp.id
ORDER BY pp.numero_sequencial;


| #OS | status_correto | status_atual_errado | ultima_mudanca_valida | modificado_erroneamente_em |
| --- | -------------- | ------------------- | --------------------- | -------------------------- |
| 400 | PRODUCAO       | PRODUCAO            | 25/11 17:44:30        | 2026-01-21 10:49:52.310441 |
| 446 | PRODUCAO       | PRODUCAO            | 08/12 09:42:51        | 2026-01-21 10:49:52.310441 |
| 509 | PRODUCAO       | PRODUCAO            | 16/12 15:17:36        | 2026-01-21 10:49:52.310441 |
| 570 | PRODUCAO       | PRODUCAO            | 26/12 14:30:48        | 2026-01-21 10:49:52.310441 |
| 581 | PRODUCAO       | PRODUCAO            | 02/01 17:49:33        | 2026-01-21 10:49:52.310441 |
| 592 | PRODUCAO       | PRODUCAO            | 09/01 19:51:40        | 2026-01-21 10:49:52.310441 |
| 603 | PRODUCAO       | PRODUCAO            | 09/01 19:51:39        | 2026-01-21 10:49:52.310441 |
| 606 | PRODUCAO       | PRODUCAO            | 09/01 19:51:38        | 2026-01-21 10:49:52.310441 |
| 607 | PRODUCAO       | PRODUCAO            | 09/01 19:51:37        | 2026-01-21 10:49:52.310441 |
| 609 | PRODUCAO       | PRODUCAO            | 09/01 19:51:36        | 2026-01-21 10:49:52.310441 |
| 610 | PRODUCAO       | PRODUCAO            | 09/01 19:51:35        | 2026-01-21 10:49:52.310441 |
| 611 | PRODUCAO       | PRODUCAO            | 09/01 19:51:35        | 2026-01-21 10:49:52.310441 |
| 614 | AG_PAGAMENTO   | PRODUCAO            | 07/01 20:22:12        | 2026-01-21 10:49:52.310441 |
| 615 | AG_PAGAMENTO   | PRODUCAO            | 07/01 20:22:10        | 2026-01-21 10:49:52.310441 |
| 618 | PRODUCAO       | PRODUCAO            | 20/01 15:59:22        | 2026-01-21 10:49:52.310441 |
| 625 | PRODUCAO       | PRODUCAO            | 12/01 13:13:50        | 2026-01-21 10:49:52.310441 |
| 628 | PRODUCAO       | PRODUCAO            | 12/01 13:13:48        | 2026-01-21 10:49:52.310441 |
| 631 | AG_PAGAMENTO   | PRODUCAO            | 07/01 22:44:40        | 2026-01-21 10:49:52.310441 |
| 650 | AG_PAGAMENTO   | PRODUCAO            | 12/01 15:58:58        | 2026-01-21 10:49:52.310441 |
| 654 | PRODUCAO       | PRODUCAO            | 12/01 16:51:25        | 2026-01-21 10:49:52.310441 |
| 655 | AG_PAGAMENTO   | PRODUCAO            | 13/01 10:51:38        | 2026-01-21 10:49:52.310441 |
| 660 | AG_PAGAMENTO   | PRODUCAO            | 13/01 10:51:30        | 2026-01-21 10:49:52.310441 |
| 662 | PRODUCAO       | PRODUCAO            | 13/01 17:07:42        | 2026-01-21 10:49:52.310441 |
| 666 | PRODUCAO       | PRODUCAO            | 16/01 11:00:55        | 2026-01-21 10:49:52.310441 |
| 667 | PRODUCAO       | PRODUCAO            | 16/01 11:00:59        | 2026-01-21 10:49:52.310441 |
| 668 | PRODUCAO       | PRODUCAO            | 15/01 16:54:23        | 2026-01-21 10:49:52.310441 |
| 669 | PRODUCAO       | PRODUCAO            | 15/01 16:54:25        | 2026-01-21 10:49:52.310441 |
| 670 | PRODUCAO       | PRODUCAO            | 19/01 16:26:32        | 2026-01-21 10:49:52.310441 |
| 683 | AG_PAGAMENTO   | PRODUCAO            | 17/01 13:15:44        | 2026-01-21 11:43:14.603699 |


-- 9️⃣ RESUMO EXECUTIVO
SELECT 
  '📊 RESUMO DA INVESTIGAÇÃO' as titulo,
  COUNT(*) FILTER (
    WHERE (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = '2026-01-20'::DATE
    AND EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 18
  ) as total_afetados_pos_18h,
  COUNT(*) FILTER (WHERE status = 'PRODUCAO') as em_producao_agora,
  COUNT(*) FILTER (WHERE status = 'RASCUNHO') as em_rascunho_agora,
  COUNT(*) FILTER (WHERE laboratorio_id IS NULL) as sem_laboratorio
FROM pedidos;


| titulo                    | total_afetados_pos_18h | em_producao_agora | em_rascunho_agora | sem_laboratorio |
| ------------------------- | ---------------------- | ----------------- | ----------------- | --------------- |
| 📊 RESUMO DA INVESTIGAÇÃO | 0                      | 29                | 2                 | 3               |

-- ============================================================
-- 🎯 PRÓXIMOS PASSOS:
-- 1. Executar este script
-- 2. Identificar qual foi o horário exato (Query 6)
-- 3. Ver o status_anterior dos 29 pedidos (Query 7)
-- 4. Usar timeline para restaurar (Query 8)
-- ============================================================
