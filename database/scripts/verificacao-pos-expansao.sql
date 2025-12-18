-- 📊 VERIFICAÇÃO FINAL PÓS-EXPANSÃO
-- ==================================
-- Executar após expandir a sequência para 9121→13483
-- ==================================

-- 1️⃣ ESTATÍSTICAS GERAIS ATUALIZADAS
SELECT 
  total_os_esperadas as "Total na Sequência",
  total_lancadas as "OSs Lançadas",
  total_nao_lancadas as "OSs Não Lançadas (GAPS)",
  total_justificadas as "Já Justificadas",
  total_precisa_atencao as "⚠️ PRECISA ATENÇÃO",
  ROUND(percentual_lancamento, 2) || '%' as "% Lançamento"
FROM view_os_estatisticas
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';


| Total na Sequência | OSs Lançadas | OSs Não Lançadas (GAPS) | Já Justificadas | ⚠️ PRECISA ATENÇÃO | % Lançamento |
| ------------------ | ------------ | ----------------------- | --------------- | ------------------ | ------------ |
| 4376               | 442          | 3934                    | 0               | 3934               | 10.10%       |


-- 📊 Esperado:
-- Total: ~2738
-- Lançadas: ~428
-- Gaps: ~2310
-- % Lançamento: ~15.6%

-- 2️⃣ PRIMEIRAS 10 OSs MAIS ANTIGAS PENDENTES
SELECT 
  numero_os as "OS Faltando",
  status as "Status"
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND status = 'nao_lancada'
ORDER BY numero_os ASC
LIMIT 10;


| OS Faltando | Status      |
| ----------- | ----------- |
| 9122        | nao_lancada |
| 9123        | nao_lancada |
| 9124        | nao_lancada |
| 9125        | nao_lancada |
| 9126        | nao_lancada |
| 9127        | nao_lancada |
| 9128        | nao_lancada |
| 9129        | nao_lancada |
| 9130        | nao_lancada |
| 9131        | nao_lancada |



-- 📊 Esperado: Começar em 9121 ou próximo

-- 3️⃣ VERIFICAR RANGE DE CONCENTRAÇÃO DE GAPS
SELECT 
  CASE 
    WHEN numero_os < 10000 THEN '9000-9999 (Antigas)'
    WHEN numero_os < 11000 THEN '10000-10999'
    WHEN numero_os < 12000 THEN '11000-11999'
    WHEN numero_os < 13000 THEN '12000-12999'
    ELSE '13000+ (Futuras)'
  END as "Range",
  COUNT(*) as "Total Gaps"
FROM view_os_gaps
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND status = 'nao_lancada'
GROUP BY 
  CASE 
    WHEN numero_os < 10000 THEN '9000-9999 (Antigas)'
    WHEN numero_os < 11000 THEN '10000-10999'
    WHEN numero_os < 12000 THEN '11000-11999'
    WHEN numero_os < 13000 THEN '12000-12999'
    ELSE '13000+ (Futuras)'
  END
ORDER BY MIN(numero_os);


| Range               | Total Gaps |
| ------------------- | ---------- |
| 9000-9999 (Antigas) | 878        |
| 10000-10999         | 999        |
| 11000-11999         | 862        |
| 12000-12999         | 711        |
| 13000+ (Futuras)    | 484        |



-- 4️⃣ TESTE DE ACESSO COMO USUÁRIO AUTENTICADO
SELECT COUNT(*) as "Frontend verá este número"
FROM view_os_gaps
WHERE loja_id = (SELECT loja_id FROM usuarios WHERE id = auth.uid())
  AND precisa_atencao = true;

  | Frontend verá este número |
| ------------------------- |
| 0                         |

-- 📊 Este é o número que aparecerá no badge!

-- ✅ SE RETORNAR NÚMERO CORRETO:
-- Frontend está pronto para funcionar!
-- Badge mostrará: ~2310 OSs pendentes

-- ❌ SE RETORNAR 0:
-- Execute: database/fix-rls-views.sql
