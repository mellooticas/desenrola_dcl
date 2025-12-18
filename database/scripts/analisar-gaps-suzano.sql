-- 📊 ANÁLISE COMPLETA DE GAPS - LOJA SUZANO
-- ============================================
-- Com 470 pedidos reais, vamos ver os gaps exatos
-- ============================================

-- 1️⃣ RESUMO GERAL
SELECT 
  total_os_esperadas as "Total Esperado (Sequência)",
  total_lancadas as "OSs Lançadas (Pedidos Reais)",
  total_nao_lancadas as "OSs Não Lançadas (GAPS)",
  total_justificadas as "Já Justificadas",
  total_precisa_atencao as "⚠️ PRECISA ATENÇÃO",
  ROUND(percentual_lancamento, 2) || '%' as "% Lançamento"
FROM view_os_estatisticas
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

| Total Esperado (Sequência) | OSs Lançadas (Pedidos Reais) | OSs Não Lançadas (GAPS) | Já Justificadas | ⚠️ PRECISA ATENÇÃO | % Lançamento |
| -------------------------- | ---------------------------- | ----------------------- | --------------- | ------------------ | ------------ |
| 1638                       | 390                          | 1248                    | 0               | 1248               | 23.81%       |



-- 2️⃣ PRIMEIRAS 20 OSs NÃO LANÇADAS (Aparecerão no modal)
SELECT 
  numero_os as "OS Faltando",
  status as "Status",
  data_esperada as "Data Esperada"
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND status = 'nao_lancada'
ORDER BY numero_os ASC
LIMIT 20;

| OS Faltando | Status      | Data Esperada                 |
| ----------- | ----------- | ----------------------------- |
| 11856       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11857       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11865       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11869       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11873       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11874       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11881       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11882       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11883       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11885       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11888       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11890       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11891       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11892       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11893       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11897       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11899       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11905       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11906       | nao_lancada | 2025-12-17 19:42:15.412667+00 |
| 11908       | nao_lancada | 2025-12-17 19:42:15.412667+00 |


-- 3️⃣ DISTRIBUIÇÃO POR STATUS
SELECT 
  status as "Status",
  COUNT(*) as "Quantidade",
  ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 1) || '%' as "Percentual"
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
GROUP BY status
ORDER BY COUNT(*) DESC;

| Status      | Quantidade | Percentual |
| ----------- | ---------- | ---------- |
| nao_lancada | 1248       | 76.2%      |
| lancada     | 390        | 23.8%      |



-- 4️⃣ VERIFICAR SE HÁ GAPS CONSECUTIVOS (Blocos de OSs faltando)
WITH gaps AS (
  SELECT 
    numero_os,
    numero_os - LAG(numero_os) OVER (ORDER BY numero_os) as diferenca
  FROM view_os_gaps
  WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
    AND status = 'nao_lancada'
),
classificacao AS (
  SELECT 
    CASE 
      WHEN diferenca = 1 THEN 'Gap Sequencial (comum)'
      WHEN diferenca > 1 AND diferenca <= 5 THEN 'Gap Pequeno (2-5 OSs)'
      WHEN diferenca > 5 AND diferenca <= 20 THEN 'Gap Médio (6-20 OSs)'
      WHEN diferenca > 20 THEN 'Gap Grande (>20 OSs)'
      ELSE 'Primeira OS'
    END as tipo_gap,
    CASE 
      WHEN diferenca = 1 THEN 2
      WHEN diferenca > 1 AND diferenca <= 5 THEN 3
      WHEN diferenca > 5 AND diferenca <= 20 THEN 4
      WHEN diferenca > 20 THEN 5
      ELSE 1
    END as ordem
  FROM gaps
)
SELECT 
  tipo_gap as "Tipo de Gap",
  COUNT(*) as "Quantidade"
FROM classificacao
GROUP BY tipo_gap, ordem
ORDER BY ordem;


| Tipo de Gap            | Quantidade |
| ---------------------- | ---------- |
| Primeira OS            | 1          |
| Gap Sequencial (comum) | 1119       |
| Gap Pequeno (2-5 OSs)  | 102        |
| Gap Médio (6-20 OSs)   | 25         |



-- 5️⃣ ÚLTIMAS 10 OSs LANÇADAS (Para confirmar dados reais)
SELECT 
  numero_os as "OS Lançada",
  status as "Status",
  justificativa as "Observação"
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND status = 'lancada'
ORDER BY numero_os DESC
LIMIT 10;


| OS Lançada | Status  | Observação |
| ---------- | ------- | ---------- |
| 12479      | lancada | null       |
| 12458      | lancada | null       |
| 12457      | lancada | null       |
| 12455      | lancada | null       |
| 12454      | lancada | null       |
| 12451      | lancada | null       |
| 12450      | lancada | null       |
| 12448      | lancada | null       |
| 12446      | lancada | null       |
| 12445      | lancada | null       |


-- 6️⃣ RANGE DE MAIOR CONCENTRAÇÃO DE GAPS
SELECT 
  FLOOR(numero_os / 100) * 100 as "Range (início)",
  FLOOR(numero_os / 100) * 100 + 99 as "Range (fim)",
  COUNT(*) as "Total Gaps neste Range"
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND status = 'nao_lancada'
GROUP BY FLOOR(numero_os / 100) * 100
ORDER BY COUNT(*) DESC
LIMIT 10;

| Range (início) | Range (fim) | Total Gaps neste Range |
| -------------- | ----------- | ---------------------- |
| 12700          | 12799       | 100                    |
| 13300          | 13399       | 100                    |
| 13200          | 13299       | 100                    |
| 13100          | 13199       | 100                    |
| 13000          | 13099       | 100                    |
| 12900          | 12999       | 100                    |
| 12800          | 12899       | 100                    |
| 12500          | 12599       | 100                    |
| 12600          | 12699       | 100                    |
| 13400          | 13499       | 80                     |



-- 📊 O QUE ESSES DADOS SIGNIFICAM:
--
-- ✅ RESUMO GERAL: Mostra o panorama completo
-- 📝 PRIMEIRAS 20: Estas aparecerão no modal para o usuário resolver
-- 📊 DISTRIBUIÇÃO: Quantas estão lançadas vs não lançadas
-- 🔍 GAPS CONSECUTIVOS: Identifica padrões de OSs faltando
-- ⏱️ ÚLTIMAS LANÇADAS: Confirma que pedidos reais existem
-- 📍 CONCENTRAÇÃO: Onde estão a maioria dos gaps
