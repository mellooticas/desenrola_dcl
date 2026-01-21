-- ============================================================
-- 🕐 DIAGNÓSTICO: TIMEZONE E MODIFICAÇÕES NO HORÁRIO CORRETO
-- ============================================================
-- Descobrir timezone do banco e ajustar para São Paulo
-- ============================================================

-- 1️⃣ DESCOBRIR TIMEZONE DO BANCO DE DADOS
SELECT 
  '🕐 CONFIGURAÇÃO DE TIMEZONE' as info,
  current_setting('TIMEZONE') as timezone_banco,
  NOW() as horario_atual_banco,
  NOW() AT TIME ZONE 'America/Sao_Paulo' as horario_atual_sao_paulo,
  CURRENT_DATE as data_atual;

  | info                        | timezone_banco | horario_atual_banco           | horario_atual_sao_paulo    | data_atual |
| --------------------------- | -------------- | ----------------------------- | -------------------------- | ---------- |
| 🕐 CONFIGURAÇÃO DE TIMEZONE | UTC            | 2026-01-21 14:59:54.418664+00 | 2026-01-21 11:59:54.418664 | 2026-01-21 |



-- 2️⃣ VERIFICAR ÚLTIMA ATUALIZAÇÃO DE PEDIDOS (em diferentes timezones)
SELECT 
  MAX(updated_at) as ultima_atualizacao_utc,
  MAX(updated_at) AT TIME ZONE 'America/Sao_Paulo' as ultima_atualizacao_sp,
  MAX(created_at) as ultima_criacao_utc,
  MAX(created_at) AT TIME ZONE 'America/Sao_Paulo' as ultima_criacao_sp
FROM pedidos;

| ultima_atualizacao_utc        | ultima_atualizacao_sp      | ultima_criacao_utc            | ultima_criacao_sp          |
| ----------------------------- | -------------------------- | ----------------------------- | -------------------------- |
| 2026-01-21 14:43:14.603699+00 | 2026-01-21 11:43:14.603699 | 2026-01-21 14:06:02.778357+00 | 2026-01-21 11:06:02.778357 |

-- 3️⃣ PEDIDOS MODIFICADOS APÓS 10:30h HORÁRIO SÃO PAULO
SELECT 
  numero_sequencial as "#OS",
  status,
  updated_at AT TIME ZONE 'America/Sao_Paulo' as horario_modificacao_sp,
  EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER as hora_sp,
  EXTRACT(MINUTE FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER as minuto_sp,
  laboratorio_id,
  cliente_nome
FROM pedidos
WHERE 
  (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo'
  AND (
    EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER > 10
    OR (
      EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER = 10
      AND EXTRACT(MINUTE FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 30
    )
  )
ORDER BY updated_at DESC;

-- 4️⃣ CONTAGEM DE MODIFICAÇÕES POR HORA (HORÁRIO SÃO PAULO)
SELECT 
  EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER as hora_sp,
  COUNT(*) as total_modificacoes,
  STRING_AGG(numero_sequencial::TEXT, ', ' ORDER BY numero_sequencial) as pedidos_afetados
FROM pedidos
WHERE (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = (CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo')::DATE
GROUP BY EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER
ORDER BY hora_sp DESC;

| hora_sp | total_modificacoes | pedidos_afetados                                                                                                                |
| ------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 15      | 9                  | 454, 515, 608, 612, 623, 635, 647, 649, 653                                                                                     |
| 13      | 3                  | 473, 577, 651                                                                                                                   |
| 9       | 26                 | 44, 348, 366, 409, 455, 491, 499, 504, 512, 513, 519, 526, 533, 557, 572, 575, 590, 597, 620, 638, 641, 645, 648, 652, 656, 659 |

-- 5️⃣ TIMELINE DE EVENTOS HOJE (HORÁRIO SÃO PAULO)
SELECT 
  pt.pedido_id,
  p.numero_sequencial as "#OS",
  pt.evento_tipo,
  pt.status_anterior,
  pt.status_novo,
  pt.created_at AT TIME ZONE 'America/Sao_Paulo' as horario_evento_sp,
  TO_CHAR(pt.created_at AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI:SS') as hora_formatada_sp
FROM pedidos_timeline pt
JOIN pedidos p ON p.id = pt.pedido_id
WHERE (pt.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE = (CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo')::DATE
ORDER BY pt.created_at DESC
LIMIT 50;


Error: Failed to run sql query: ERROR: 42703: column pt.evento_tipo does not exist LINE 6: pt.evento_tipo, ^




-- 6️⃣ DISTRIBUIÇÃO ATUAL DE STATUS
SELECT 
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM pedidos
GROUP BY status
ORDER BY total DESC;

| status    | total | percentual |
| --------- | ----- | ---------- |
| ENTREGUE  | 569   | 88.77      |
| CANCELADO | 41    | 6.40       |
| PRODUCAO  | 29    | 4.52       |
| RASCUNHO  | 2     | 0.31       |


-- 7️⃣ PEDIDOS EM PRODUCAO - QUANDO FORAM ALTERADOS (HORÁRIO SP)
SELECT 
  numero_sequencial as "#OS",
  status,
  updated_at AT TIME ZONE 'America/Sao_Paulo' as modificado_em_sp,
  TO_CHAR(updated_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as data_hora_sp_formatada,
  CASE 
    WHEN laboratorio_id IS NULL THEN '❌ SEM LAB'
    ELSE '✅'
  END as tem_lab
FROM pedidos
WHERE status = 'PRODUCAO'
ORDER BY updated_at DESC;

| #OS | status   | modificado_em_sp           | data_hora_sp_formatada | tem_lab |
| --- | -------- | -------------------------- | ---------------------- | ------- |
| 683 | PRODUCAO | 2026-01-21 11:43:14.603699 | 21/01/2026 11:43:14    | ✅       |
| 615 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 631 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 655 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 446 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 668 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 570 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 581 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 625 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 654 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 610 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 603 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 628 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 611 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 609 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 607 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 592 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 670 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 606 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 618 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 662 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 509 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 669 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 650 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 614 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 660 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 667 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 666 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |
| 400 | PRODUCAO | 2026-01-21 10:49:52.310441 | 21/01/2026 10:49:52    | ✅       |


-- 8️⃣ VERIFICAR SE HÁ OFFSET DE HORÁRIO
SELECT 
  'TESTE DE OFFSET' as teste,
  '2025-01-21 10:30:00'::TIMESTAMP as horario_referencia,
  '2025-01-21 10:30:00'::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo' as se_fosse_utc_para_sp,
  '2025-01-21 10:30:00'::TIMESTAMP AT TIME ZONE 'America/Sao_Paulo' as se_fosse_sp_direto;


| teste           | horario_referencia  | se_fosse_utc_para_sp | se_fosse_sp_direto     |
| --------------- | ------------------- | -------------------- | ---------------------- |
| TESTE DE OFFSET | 2025-01-21 10:30:00 | 2025-01-21 07:30:00  | 2025-01-21 13:30:00+00 |

-- 9️⃣ RESUMO: PEDIDOS AFETADOS APÓS 10:30 SP
WITH pedidos_apos_1030 AS (
  SELECT 
    id,
    numero_sequencial,
    status,
    laboratorio_id,
    updated_at AT TIME ZONE 'America/Sao_Paulo' as horario_sp
  FROM pedidos
  WHERE 
    (updated_at AT TIME ZONE 'America/Sao_Paulo')::DATE = (CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo')::DATE
    AND (
      EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER > 10
      OR (
        EXTRACT(HOUR FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER = 10
        AND EXTRACT(MINUTE FROM (updated_at AT TIME ZONE 'America/Sao_Paulo'))::INTEGER >= 30
      )
    )
)
SELECT 
  COUNT(*) as total_afetados,
  COUNT(*) FILTER (WHERE status = 'PRODUCAO') as em_producao,
  COUNT(*) FILTER (WHERE status = 'REGISTRADO') as em_registrado,
  COUNT(*) FILTER (WHERE laboratorio_id IS NULL) as sem_laboratorio,
  MIN(horario_sp) as primeira_modificacao_sp,
  MAX(horario_sp) as ultima_modificacao_sp
FROM pedidos_apos_1030;


| total_afetados | em_producao | em_registrado | sem_laboratorio | primeira_modificacao_sp    | ultima_modificacao_sp      |
| -------------- | ----------- | ------------- | --------------- | -------------------------- | -------------------------- |
| 12             | 0           | 0             | 0               | 2026-01-20 13:58:48.312717 | 2026-01-20 15:42:27.163564 |

-- ============================================================
-- ✅ EXECUTE E VEJA O HORÁRIO REAL DAS MODIFICAÇÕES
-- ============================================================
