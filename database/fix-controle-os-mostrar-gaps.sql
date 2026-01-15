-- ============================================================================
-- FIX: Controle OS - Mostrar Gaps Reais
-- ============================================================================
-- Problema: Todas as 2006 OSs estão marcadas como "lancadas = TRUE"
-- Solução: Marcar como não lançadas as OSs que NÃO têm pedido correspondente
-- ============================================================================

-- 1. Ver quantas OSs não têm pedido correspondente (gaps reais)
SELECT 
  COUNT(*) as total_sem_pedido
FROM controle_os co
WHERE NOT EXISTS (
  SELECT 1 
  FROM pedidos p 
  WHERE CAST(p.numero_os_fisica AS INTEGER) = co.numero_os 
    AND p.loja_id = co.loja_id
);

| total_sem_pedido |
| ---------------- |
| 1457             |



-- 2. Atualizar controle_os: marcar como NÃO lançadas as OSs sem pedido
UPDATE controle_os co
SET 
  lancado = FALSE,
  data_lancamento = NULL
WHERE NOT EXISTS (
  SELECT 1 
  FROM pedidos p 
  WHERE CAST(p.numero_os_fisica AS INTEGER) = co.numero_os 
    AND p.loja_id = co.loja_id
);

Success. No rows returned





-- 3. Verificar resultado
SELECT 
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE lancado = TRUE) as lancadas,
  COUNT(*) FILTER (WHERE lancado = FALSE) as nao_lancadas
FROM controle_os;


| total_registros | lancadas | nao_lancadas |
| --------------- | -------- | ------------ |
| 2006            | 549      | 1457         |



-- 4. Ver estatísticas atualizadas
SELECT * FROM view_controle_os_estatisticas;


| loja_id                              | loja_nome | total_os_esperadas | total_lancadas | total_nao_lancadas | total_justificadas | total_pendentes | total_precisa_atencao | percentual_lancamento |
| ------------------------------------ | --------- | ------------------ | -------------- | ------------------ | ------------------ | --------------- | --------------------- | --------------------- |
| e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | Suzano    | 2006               | 549            | 1457               | 0                  | 0               | 1457                  | 27.37                 |


-- 5. Ver exemplos de gaps reais
SELECT 
  numero_os,
  loja_id,
  lancado,
  precisa_atencao,
  justificativa,
  data_lancamento
FROM view_controle_os_gaps
WHERE precisa_atencao = TRUE
ORDER BY numero_os DESC
LIMIT 20;


| numero_os | loja_id                              | lancado | precisa_atencao | justificativa | data_lancamento |
| --------- | ------------------------------------ | ------- | --------------- | ------------- | --------------- |
| 12669     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12667     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12666     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12664     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12663     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12662     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12661     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12660     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12659     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12658     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12657     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12656     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12655     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12653     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12652     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12649     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12648     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12646     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12645     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |
| 12641     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | false   | true            | null          | null            |

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Após executar, você verá:
-- - OSs sem pedido correspondente marcadas como "lancado = FALSE"
-- - view_controle_os_estatisticas mostrando total_nao_lancadas correto
-- - view_controle_os_gaps mostrando gaps reais que precisam atenção
-- - Frontend mostrará os cards com números corretos
-- ============================================================================
