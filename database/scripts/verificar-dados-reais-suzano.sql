-- 🔍 VERIFICAÇÃO DE DADOS REAIS - LOJA SUZANO
-- ============================================
-- Execute este script para ver se temos pedidos reais
-- ============================================

-- 1️⃣ VERIFICAR QUANTOS PEDIDOS EXISTEM NA LOJA SUZANO
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(numero_os_fisica) as pedidos_com_os,
  COUNT(*) - COUNT(numero_os_fisica) as pedidos_sem_os
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

| total_pedidos | pedidos_com_os | pedidos_sem_os |
| ------------- | -------------- | -------------- |
| 441           | 441            | 0              |

-- 2️⃣ VER RANGE DE OSs FÍSICAS QUE JÁ EXISTEM
SELECT 
  MIN(CAST(numero_os_fisica AS INTEGER)) as menor_os,
  MAX(CAST(numero_os_fisica AS INTEGER)) as maior_os,
  COUNT(DISTINCT numero_os_fisica) as total_os_distintas
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^\d+$';

  | menor_os | maior_os | total_os_distintas |
| -------- | -------- | ------------------ |
| 9121     | 12479    | 428                |


-- 3️⃣ VER ÚLTIMOS 10 PEDIDOS LANÇADOS COM OS
SELECT 
  id,
  numero_os_fisica,
  cliente_nome,
  status,
  created_at
FROM pedidos
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^\d+$'
ORDER BY created_at DESC
LIMIT 10;


| id                                   | numero_os_fisica | cliente_nome                          | status     | created_at                    |
| ------------------------------------ | ---------------- | ------------------------------------- | ---------- | ----------------------------- |
| 55472a8d-4037-4977-b2bd-266e3ad813c6 | 12434            | ELAINE JORGE DADADALTO                | REGISTRADO | 2025-12-17 21:04:25.59297+00  |
| b8bd3026-65ca-4926-aea3-f6ffffb78f5a | 12468            | ROSEMEIRE DO NASCIMENTO               | REGISTRADO | 2025-12-17 21:00:04.789324+00 |
| b0b1589d-693e-48f9-99c6-50fde3555513 | 12459            | MARIA GABRIELI FERNANDES DA SILVA     | REGISTRADO | 2025-12-17 20:56:56.548469+00 |
| 401deaf2-cdf4-43c2-bdf1-f95a2a206b68 | 12437            | LIVIA OLIVEIRA DOS SANTOS LEÃO(PEDRO) | REGISTRADO | 2025-12-17 20:53:04.959009+00 |
| 9128d5d8-d939-4ffb-8bdf-50ce52680c7c | 12441            | NIDINALVA ALVES                       | REGISTRADO | 2025-12-17 20:49:38.289302+00 |
| 3c044658-75d9-4733-8476-411966857cc7 | 12457            | stephany victoria costa fialho        | REGISTRADO | 2025-12-17 20:42:48.957239+00 |
| 13214ef2-d410-4581-940b-318b50b1803f | 12458            | maike Ferreira dos santos pereira     | REGISTRADO | 2025-12-17 20:36:00.285712+00 |
| c1ff20f0-fa5e-4585-9963-f8345f311c83 | 12479            | rosa aparecida ramos da silva         | REGISTRADO | 2025-12-17 20:14:50.172637+00 |
| 3fc36efa-f56d-4a96-8340-f3ee1d87bf0b | 12445            | ADRIANA LEINY SEHIMA DE ARAUJO        | PRODUCAO   | 2025-12-16 16:21:43.053928+00 |
| 69c22883-8313-4600-9589-3b19a6372ecb | 12446            | ADRIANA LEINY SEHIMA DE ARAUJO        | CHEGOU     | 2025-12-16 16:16:33.148237+00 |



-- 4️⃣ VERIFICAR SE PRECISAMOS POPULAR DADOS DE TESTE
-- Se o resultado acima for 0, significa que não temos dados reais ainda
-- Neste caso, você tem 3 opções:

-- OPÇÃO A: Aguardar dados reais de produção
-- OPÇÃO B: Importar dados existentes de outro sistema
-- OPÇÃO C: Criar alguns pedidos de teste para validar o sistema

-- 5️⃣ ESTATÍSTICAS ATUAIS DO CONTROLE DE OS
SELECT 
  total_os_esperadas as "Total na Sequência",
  total_lancadas as "OSs Lançadas (pedidos reais)",
  total_nao_lancadas as "OSs Não Lançadas (gaps)",
  total_justificadas as "OSs Justificadas",
  total_precisa_atencao as "Precisa Atenção",
  ROUND(percentual_lancamento, 2) || '%' as "% Lançamento"
FROM view_os_estatisticas
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

| Total na Sequência | OSs Lançadas (pedidos reais) | OSs Não Lançadas (gaps) | OSs Justificadas | Precisa Atenção | % Lançamento |
| ------------------ | ---------------------------- | ----------------------- | ---------------- | --------------- | ------------ |
| 1638               | 395                          | 1243                    | 0                | 1243            | 24.11%       |



-- 📊 INTERPRETAÇÃO DOS RESULTADOS:
-- 
-- Se total_lancadas = 0:
--   → Não há pedidos reais ainda
--   → Todos os 824 números aparecem como "não lançados"
--   → Sistema está pronto, esperando dados reais
--
-- Se total_lancadas > 0:
--   → Já existem pedidos no sistema
--   → Gaps reais detectados entre os números
--   → Sistema funcionando e detectando falhas reais
