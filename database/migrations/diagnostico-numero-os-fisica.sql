-- =========================================
-- 🔍 DIAGNÓSTICO COMPLETO: numero_os_fisica
-- =========================================
-- Investigar o que realmente existe na coluna antes de qualquer correção
-- Execute este script no Supabase SQL Editor

-- =========================================
-- PARTE 1: VISÃO GERAL
-- =========================================

-- 1.1 Estatísticas básicas
SELECT 
  '📊 Visão Geral' as secao,
  COUNT(*) as total_pedidos,
  COUNT(numero_os_fisica) as pedidos_com_os,
  COUNT(*) - COUNT(numero_os_fisica) as pedidos_sem_os,
  COUNT(DISTINCT numero_os_fisica) as numeros_unicos,
  COUNT(DISTINCT loja_id) as lojas_diferentes
FROM pedidos;

| secao          | total_pedidos | pedidos_com_os | pedidos_sem_os | numeros_unicos | lojas_diferentes |
| -------------- | ------------- | -------------- | -------------- | -------------- | ---------------- |
| 📊 Visão Geral | 524           | 517            | 7              | 488            | 4                |



-- 1.2 Tipos de valores em numero_os_fisica
SELECT 
  '📝 Tipos de Valores' as secao,
  COUNT(*) FILTER (WHERE numero_os_fisica IS NULL) as valores_null,
  COUNT(*) FILTER (WHERE numero_os_fisica = '') as valores_vazios,
  COUNT(*) FILTER (WHERE numero_os_fisica ~ '^[0-9]+$') as valores_numericos,
  COUNT(*) FILTER (WHERE numero_os_fisica !~ '^[0-9]+$' AND numero_os_fisica IS NOT NULL AND numero_os_fisica != '') as valores_alfanumericos
FROM pedidos;

| secao               | valores_null | valores_vazios | valores_numericos | valores_alfanumericos |
| ------------------- | ------------ | -------------- | ----------------- | --------------------- |
| 📝 Tipos de Valores | 7            | 0              | 516               | 1                     |

-- 1.3 Exemplos de valores não numéricos (se houver)
SELECT 
  '⚠️ Exemplos Não Numéricos' as secao,
  numero_os_fisica,
  COUNT(*) as quantidade
FROM pedidos
WHERE numero_os_fisica !~ '^[0-9]+$' 
  AND numero_os_fisica IS NOT NULL 
  AND numero_os_fisica != ''
GROUP BY numero_os_fisica
ORDER BY quantidade DESC
LIMIT 10;

| secao                     | numero_os_fisica | quantidade |
| ------------------------- | ---------------- | ---------- |
| ⚠️ Exemplos Não Numéricos |  12006           | 1          |

-- =========================================
-- PARTE 2: ANÁLISE POR LOJA
-- =========================================

-- 2.1 Range completo por loja
SELECT 
  '📍 Range por Loja' as secao,
  l.nome as loja,
  MIN(CAST(numero_os_fisica AS INTEGER)) as menor_os,
  MAX(CAST(numero_os_fisica AS INTEGER)) as maior_os,
  MAX(CAST(numero_os_fisica AS INTEGER)) - MIN(CAST(numero_os_fisica AS INTEGER)) + 1 as range_total,
  COUNT(DISTINCT numero_os_fisica) as oss_unicas_lancadas,
  (MAX(CAST(numero_os_fisica AS INTEGER)) - MIN(CAST(numero_os_fisica AS INTEGER)) + 1) - COUNT(DISTINCT numero_os_fisica) as gaps_potenciais
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$'
GROUP BY p.loja_id, l.nome
ORDER BY l.nome;

| secao             | loja               | menor_os | maior_os | range_total | oss_unicas_lancadas | gaps_potenciais |
| ----------------- | ------------------ | -------- | -------- | ----------- | ------------------- | --------------- |
| 📍 Range por Loja | Escritório Central | 0        | 12429    | 12430       | 41                  | 12389           |
| 📍 Range por Loja | Suzano             | 10665    | 12488    | 1824        | 448                 | 1376            |



-- =========================================
-- PARTE 3: DETECÇÃO DE GAPS REAIS
-- =========================================

-- 3.1 Listar gaps reais da primeira loja (exemplo prático)
WITH primeira_loja AS (
  SELECT DISTINCT loja_id
  FROM pedidos
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  LIMIT 1
),
range_loja AS (
  SELECT 
    p.loja_id,
    MIN(CAST(numero_os_fisica AS INTEGER)) as min_os,
    MAX(CAST(numero_os_fisica AS INTEGER)) as max_os
  FROM pedidos p
  JOIN primeira_loja fl ON fl.loja_id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY p.loja_id
),
sequencia_esperada AS (
  SELECT 
    num as numero_os,
    r.loja_id
  FROM range_loja r
  CROSS JOIN generate_series(r.min_os, r.max_os) AS num
),
oss_lancadas AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
    loja_id
  FROM pedidos p
  JOIN primeira_loja fl ON fl.loja_id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
)
SELECT 
  '🔍 Primeiros 30 Gaps da Loja' as secao,
  l.nome as loja,
  e.numero_os as numero_os_faltando
FROM sequencia_esperada e
LEFT JOIN oss_lancadas o ON o.numero_os = e.numero_os AND o.loja_id = e.loja_id
LEFT JOIN lojas l ON l.id = e.loja_id
WHERE o.numero_os IS NULL
ORDER BY e.numero_os
LIMIT 30;


Error: Failed to run sql query: ERROR: 42702: column reference "loja_id" is ambiguous LINE 30: loja_id ^






-- =========================================
-- PARTE 4: DISTRIBUIÇÃO E PADRÕES
-- =========================================

-- 4.1 Distribuição de OSs por faixa (ver se tem concentração)
WITH os_numericas AS (
  SELECT 
    loja_id,
    CAST(numero_os_fisica AS INTEGER) as numero_os
  FROM pedidos
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
)
SELECT 
  '📊 Distribuição por Faixa' as secao,
  l.nome as loja,
  CASE 
    WHEN numero_os < 1000 THEN '0-999'
    WHEN numero_os < 10000 THEN '1.000-9.999'
    WHEN numero_os < 20000 THEN '10.000-19.999'
    WHEN numero_os < 30000 THEN '20.000-29.999'
    ELSE '30.000+'
  END as faixa,
  COUNT(*) as quantidade_oss
FROM os_numericas o
LEFT JOIN lojas l ON l.id = o.loja_id
GROUP BY l.id, l.nome, 
  CASE 
    WHEN numero_os < 1000 THEN '0-999'
    WHEN numero_os < 10000 THEN '1.000-9.999'
    WHEN numero_os < 20000 THEN '10.000-19.999'
    WHEN numero_os < 30000 THEN '20.000-29.999'
    ELSE '30.000+'
  END
ORDER BY l.nome, MIN(numero_os);

| secao                     | loja               | faixa         | quantidade_oss |
| ------------------------- | ------------------ | ------------- | -------------- |
| 📊 Distribuição por Faixa | Escritório Central | 0-999         | 1              |
| 📊 Distribuição por Faixa | Escritório Central | 10.000-19.999 | 40             |
| 📊 Distribuição por Faixa | Suzano             | 10.000-19.999 | 475            |


-- 4.2 Verificar duplicatas (mesma OS em pedidos diferentes)
SELECT 
  '⚠️ OSs Duplicadas' as secao,
  numero_os_fisica,
  loja_id,
  l.nome as loja,
  COUNT(*) as vezes_usada,
  string_agg(id::text, ', ') as pedido_ids
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica != ''
GROUP BY numero_os_fisica, loja_id, l.nome
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 20;

Error: Failed to run sql query: ERROR: 42702: column reference "id" is ambiguous LINE 7: string_agg(id::text, ', ') as pedido_ids ^





-- =========================================
-- PARTE 5: CRONOLOGIA
-- =========================================

-- 5.1 Primeiras e últimas OSs lançadas
SELECT 
  '📅 Cronologia de OSs' as secao,
  l.nome as loja,
  MIN(p.created_at) as primeira_os_data,
  MAX(p.created_at) as ultima_os_data,
  MIN(CAST(numero_os_fisica AS INTEGER)) as primeira_os_numero,
  MAX(CAST(numero_os_fisica AS INTEGER)) as ultima_os_numero,
  EXTRACT(DAY FROM (MAX(p.created_at) - MIN(p.created_at))) as dias_entre_primeira_ultima
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$'
GROUP BY p.loja_id, l.nome
ORDER BY l.nome;


| secao                | loja               | primeira_os_data              | ultima_os_data                | primeira_os_numero | ultima_os_numero | dias_entre_primeira_ultima |
| -------------------- | ------------------ | ----------------------------- | ----------------------------- | ------------------ | ---------------- | -------------------------- |
| 📅 Cronologia de OSs | Escritório Central | 2025-09-22 18:20:14.192072+00 | 2025-12-12 14:43:28.499923+00 | 0                  | 12429            | 80                         |
| 📅 Cronologia de OSs | Suzano             | 2025-09-18 14:29:56.757552+00 | 2025-12-18 20:19:38.113028+00 | 10665              | 12488            | 91                         |

-- =========================================
-- PARTE 6: AMOSTRA DE DADOS REAIS
-- =========================================

-- 6.1 Primeiros 20 pedidos com OS (ver padrão)
SELECT 
  '📋 Amostra: Primeiros 20 Pedidos com OS' as secao,
  l.nome as loja,
  p.numero_os_fisica,
  p.numero_sequencial,
  p.cliente_nome,
  p.status,
  p.created_at::date as data_criacao
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica != ''
ORDER BY p.created_at
LIMIT 20;

| secao                                   | loja   | numero_os_fisica | numero_sequencial | cliente_nome                            | status   | data_criacao |
| --------------------------------------- | ------ | ---------------- | ----------------- | --------------------------------------- | -------- | ------------ |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11850            | 1                 | LETICIA GHIORZI BRANDÃO                 | ENTREGUE | 2025-09-18   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11855            | 2                 | GABRIEL SOUZA XAVIER                    | ENTREGUE | 2025-09-18   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11859            | 3                 | MARIA ISABEL BONFIM DA SILVA            | ENTREGUE | 2025-09-18   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11858            | 5                 | VALQUIRIA DIAS SIMÃO COLOMBO DOS SANTOS | ENTREGUE | 2025-09-19   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11864            | 11                | FLORISVALDO PEREIRA DO NASCIMENTO       | ENTREGUE | 2025-09-19   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11871            | 13                | PAULO CESAR MACHADO                     | ENTREGUE | 2025-09-20   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11870            | 14                | ELEN PEREIRA DE ARAUJO DE MOURA         | ENTREGUE | 2025-09-20   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11798            | 15                | SHIGEMI KAWAKAMI (CLARICE)              | ENTREGUE | 2025-09-20   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11811            | 16                | JULIO CAETANO DOS SANTOS JUNIOR         | ENTREGUE | 2025-09-20   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11877            | 17                | JAYNE DE SOUZA ALVES                    | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11880            | 18                | CARLA CRISTINA GONZAGA VALDO            | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11879            | 19                | CARLA CRISTINA GONZAGA VALDO            | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11868            | 20                | CARLA CRISTINA GONZAGA VALDO            | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11876            | 21                | JAYNE DE SOUZA ALVES                    | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11829            | 22                | IVAN DOS SANTOS BARBOSA                 | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11866            | 23                | TALITA DANIELLE MACHADO PEREIRA         | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11872            | 24                | DAVI PEREIRA GONÇALVES MONACO           | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11878            | 25                | CARLA CRISTINA GONZAGA VALDO            | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11875            | 26                | CLEUZA DAMACENO HELÁDIO                 | ENTREGUE | 2025-09-22   |
| 📋 Amostra: Primeiros 20 Pedidos com OS | Suzano | 11714            | 27                | JANE PEREIRA ANGELO                     | ENTREGUE | 2025-09-22   |


-- 6.2 Últimos 20 pedidos com OS
SELECT 
  '📋 Amostra: Últimos 20 Pedidos com OS' as secao,
  l.nome as loja,
  p.numero_os_fisica,
  p.numero_sequencial,
  p.cliente_nome,
  p.status,
  p.created_at::date as data_criacao
FROM pedidos p
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE numero_os_fisica IS NOT NULL
  AND numero_os_fisica != ''
ORDER BY p.created_at DESC
LIMIT 20;

| secao                                 | loja   | numero_os_fisica | numero_sequencial | cliente_nome                   | status       | data_criacao |
| ------------------------------------- | ------ | ---------------- | ----------------- | ------------------------------ | ------------ | ------------ |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12478            | 556               | ALICE MARQUES PEREIRA          | AG_PAGAMENTO | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12488            | 555               | RYAN MATHEUS PEREIRA DA SILVA  | ENVIADO      | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12465            | 554               | JUSCELINO AGUIAR VIEIRA        | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12462            | 553               | ANA PAULA DOS SANTOS           | ENVIADO      | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12453            | 552               | MARIA BETÂNIA PEREIRA SANTS    | ENVIADO      | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12452            | 551               | OSMAR SILVA FERREIRA           | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12435            | 550               | LIVIA OLIVEIRA DOS SANTOS LEÃO | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12474            | 549               | OZEIAS APARECIDO               | AG_PAGAMENTO | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12475            | 548               | OZEIAS APARECIDO               | AG_PAGAMENTO | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12470            | 547               | OZEIAS APARECIDO               | CANCELADO    | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12476            | 546               | FABIULA CAROLINE ROBERTO       | CANCELADO    | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12387            | 545               | EDILSON CHAVES DA SILVA        | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12385            | 544               | LAERTE BARRETO DE AMORIM       | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12475            | 543               | OZÉIAS APARECIDO               | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12474            | 542               | OZÉIAS APARECIDO               | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12476            | 541               | FABIÚLA CAROLINE ROBERTO       | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12470            | 540               | ÉRIKA DE OLIVEIRA GOMES        | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12462            | 539               | ANA PAULA DOS SANTOS           | CANCELADO    | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12483            | 538               | LUCAS FILIPE DE CARVALHO       | PRODUCAO     | 2025-12-18   |
| 📋 Amostra: Últimos 20 Pedidos com OS | Suzano | 12468            | 537               | ROSEMEIRE DO NASCIMENTO        | PRODUCAO     | 2025-12-18   |


-- =========================================
-- PARTE 7: RESUMO EXECUTIVO
-- =========================================

-- 7.1 Resumo final com métricas principais
WITH stats AS (
  SELECT 
    p.loja_id,
    l.nome as loja_nome,
    COUNT(*) as total_pedidos_loja,
    COUNT(numero_os_fisica) as pedidos_com_os,
    COUNT(DISTINCT numero_os_fisica) as oss_unicas,
    MIN(CAST(numero_os_fisica AS INTEGER)) as min_os,
    MAX(CAST(numero_os_fisica AS INTEGER)) as max_os,
    (MAX(CAST(numero_os_fisica AS INTEGER)) - MIN(CAST(numero_os_fisica AS INTEGER)) + 1) as range_esperado,
    (MAX(CAST(numero_os_fisica AS INTEGER)) - MIN(CAST(numero_os_fisica AS INTEGER)) + 1) - COUNT(DISTINCT numero_os_fisica) as gaps_reais
  FROM pedidos p
  LEFT JOIN lojas l ON l.id = p.loja_id
  WHERE numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY p.loja_id, l.nome
)
SELECT 
  '🎯 RESUMO EXECUTIVO' as titulo,
  loja_nome as loja,
  min_os || ' → ' || max_os as range,
  range_esperado as total_esperado,
  oss_unicas as oss_lancadas,
  gaps_reais as gaps_detectados,
  ROUND((oss_unicas::NUMERIC / range_esperado) * 100, 1) || '%' as taxa_preenchimento,
  CASE 
    WHEN gaps_reais = 0 THEN '✅ Sequência completa'
    WHEN gaps_reais < 50 THEN '⚠️ Poucos gaps'
    WHEN gaps_reais < 200 THEN '❌ Muitos gaps'
    ELSE '🔴 CRÍTICO: Sequência fragmentada'
  END as status
FROM stats
ORDER BY loja_nome;

| titulo              | loja               | range         | total_esperado | oss_lancadas | gaps_detectados | taxa_preenchimento | status                            |
| ------------------- | ------------------ | ------------- | -------------- | ------------ | --------------- | ------------------ | --------------------------------- |
| 🎯 RESUMO EXECUTIVO | Escritório Central | 0 → 12429     | 12430          | 41           | 12389           | 0.3%               | 🔴 CRÍTICO: Sequência fragmentada |
| 🎯 RESUMO EXECUTIVO | Suzano             | 10665 → 12488 | 1824           | 448          | 1376            | 24.6%              | 🔴 CRÍTICO: Sequência fragmentada |


-- =========================================
-- OBSERVAÇÕES E PRÓXIMOS PASSOS
-- =========================================

SELECT 
  '📝 OBSERVAÇÕES' as secao,
  '
  🔍 ANÁLISE REALIZADA:
  
  Parte 1: Visão geral dos dados
  Parte 2: Range por loja (menor → maior OS)
  Parte 3: Lista de gaps reais
  Parte 4: Distribuição e duplicatas
  Parte 5: Cronologia de lançamentos
  Parte 6: Amostra de pedidos reais
  Parte 7: Resumo executivo
  
  📊 INTERPRETAÇÃO DOS RESULTADOS:
  
  - Se "gaps_reais" = 0: Sequência perfeita, sem buracos
  - Se "gaps_reais" > 0: Números faltando na sequência
  - Se "valores_alfanumericos" > 0: Tem OSs com letras/símbolos
  - Se "OSs Duplicadas" > 0: Mesmo número usado em vários pedidos
  
  🎯 PRÓXIMOS PASSOS:
  
  1. Revisar resultados desta análise
  2. Decidir se gaps são aceitáveis ou precisam justificativa
  3. Se houver duplicatas, investigar causa
  4. Popular tabela controle_os com range correto
  
  ' as detalhes;


| secao          | detalhes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 📝 OBSERVAÇÕES | 
  🔍 ANÁLISE REALIZADA:
  
  Parte 1: Visão geral dos dados
  Parte 2: Range por loja (menor → maior OS)
  Parte 3: Lista de gaps reais
  Parte 4: Distribuição e duplicatas
  Parte 5: Cronologia de lançamentos
  Parte 6: Amostra de pedidos reais
  Parte 7: Resumo executivo
  
  📊 INTERPRETAÇÃO DOS RESULTADOS:
  
  - Se "gaps_reais" = 0: Sequência perfeita, sem buracos
  - Se "gaps_reais" > 0: Números faltando na sequência
  - Se "valores_alfanumericos" > 0: Tem OSs com letras/símbolos
  - Se "OSs Duplicadas" > 0: Mesmo número usado em vários pedidos
  
  🎯 PRÓXIMOS PASSOS:
  
  1. Revisar resultados desta análise
  2. Decidir se gaps são aceitáveis ou precisam justificativa
  3. Se houver duplicatas, investigar causa
  4. Popular tabela controle_os com range correto
  
   |
   