-- ============================================================================
-- DIAGNÓSTICO COMPLETO - CONTROLE DE OS
-- ============================================================================
-- Execute este script para identificar o problema

-- 1. Verificar se as views existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%controle_os%'
ORDER BY table_name;


| table_name                    | table_type |
| ----------------------------- | ---------- |
| controle_os                   | BASE TABLE |
| view_controle_os_estatisticas | VIEW       |
| view_controle_os_gaps         | VIEW       |



-- Resultado esperado:
-- controle_os (TABLE)
-- view_controle_os_gaps (VIEW)
-- view_controle_os_estatisticas (VIEW)

-- 2. Verificar se a tabela controle_os tem dados
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT loja_id) as total_lojas,
  MIN(numero_os) as menor_os,
  MAX(numero_os) as maior_os,
  COUNT(*) FILTER (WHERE lancado = TRUE) as lancadas,
  COUNT(*) FILTER (WHERE lancado = FALSE) as nao_lancadas
FROM controle_os;


| total_registros | total_lojas | menor_os | maior_os | lancadas | nao_lancadas |
| --------------- | ----------- | -------- | -------- | -------- | ------------ |
| 2006            | 1           | 10665    | 12670    | 2006     | 0            |



-- 3. Ver exemplos de dados
SELECT 
  numero_os,
  loja_id,
  lancado,
  data_lancamento,
  created_at
FROM controle_os
ORDER BY numero_os DESC
LIMIT 10;


| numero_os | loja_id                              | lancado | data_lancamento               | created_at                    |
| --------- | ------------------------------------ | ------- | ----------------------------- | ----------------------------- |
| 12670     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:45:03.630593+00 | 2026-01-14 23:45:03.630593+00 |
| 12669     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12668     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12667     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12666     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12665     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12664     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12663     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12662     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |
| 12661     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | true    | 2026-01-14 23:46:56.06861+00  | 2026-01-14 23:45:03.630593+00 |

-- 4. Verificar se as views retornam dados
-- View de gaps
SELECT COUNT(*) as total_gaps 
FROM view_controle_os_gaps
WHERE precisa_atencao = TRUE;

| total_gaps |
| ---------- |
| 0          |


-- 5. View de estatísticas
SELECT * FROM view_controle_os_estatisticas;

| loja_id                              | loja_nome | total_os_esperadas | total_lancadas | total_nao_lancadas | total_justificadas | total_pendentes | total_precisa_atencao | percentual_lancamento |
| ------------------------------------ | --------- | ------------------ | -------------- | ------------------ | ------------------ | --------------- | --------------------- | --------------------- |
| e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | Suzano    | 2006               | 2006           | 0                  | 0                  | 0               | 0                     | 100.00                |


-- 6. Verificar pedidos com numero_os_fisica
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(numero_os_fisica) as com_os_fisica,
  COUNT(DISTINCT loja_id) as lojas_diferentes,
  MIN(CAST(numero_os_fisica AS INTEGER)) as menor_os,
  MAX(CAST(numero_os_fisica AS INTEGER)) as maior_os
FROM pedidos
WHERE numero_os_fisica IS NOT NULL 
  AND numero_os_fisica ~ '^[0-9]+$';

  | total_pedidos | com_os_fisica | lojas_diferentes | menor_os | maior_os |
| ------------- | ------------- | ---------------- | -------- | -------- |
| 627           | 627           | 2                | 0        | 12670    |



-- 7. Ver exemplos de pedidos
SELECT 
  id,
  numero_sequencial,
  numero_os_fisica,
  cliente_nome,
  loja_id,
  created_at
FROM pedidos
WHERE numero_os_fisica IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;


| id                                   | numero_sequencial | numero_os_fisica | cliente_nome                                | loja_id                              | created_at                    |
| ------------------------------------ | ----------------- | ---------------- | ------------------------------------------- | ------------------------------------ | ----------------------------- |
| aeb9d187-491a-47db-afb1-828dcb760089 | 671               | 12619            | REGINA SELLES PEREIRA LIMA                  | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-15 00:01:30.489966+00 |
| e9457472-1ba7-40fb-aac8-d19c60aeb6e7 | 670               | 12617            | REGINA SELLES PEREIRA LIMA                  | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 23:59:29.436838+00 |
| 6c75d926-452c-4745-a3d1-bd97020cd82b | 669               | 12621            | REGINALDO MACIEL DE OLIVEIRA FILHO          | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 23:55:55.198887+00 |
| 78c44a99-8f71-4c69-adf1-b1d228e9aa12 | 668               | 12640            | ELISANGELA GONÇALVES DA SILVA               | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 23:50:11.873222+00 |
| 1fbfa297-a1f1-48ac-a6c2-129a4b1f97bf | 667               | 12668            | ROSE MEYRE VIANA SANTOS                     | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 23:46:56.06861+00  |
| 1d6cc18e-6e6b-48d8-a30b-ad924b10fb87 | 666               | 12670            | CLEIDE IZIDORO                              | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 23:45:03.630593+00 |
| 6d5c0a69-1baa-475a-86ad-a2f04b2a48f9 | 665               | 12537            | SONIA MARIA MENDES                          | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 23:41:50.611151+00 |
| 11cd698f-db07-429f-89aa-7fe40b4e263d | 663               | 12642            | SIMONE CRISTINA DE QUEIROZ OLIVEIRA (André) | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-14 17:37:19.173572+00 |
| d50ba831-e23c-4780-85c1-55c03cf1d2b3 | 662               | 12644            | MARINA HARUKO SATO TASATO                   | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-13 20:06:45.720055+00 |
| 6c042a43-c816-4555-a998-3f776badd662 | 661               | 12612            | CLAUDENOR JOSÉ DE FIGUEIREDO                | e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55 | 2026-01-13 20:01:47.567076+00 |


-- ============================================================================
-- SOLUÇÃO SE NÃO HOUVER DADOS:
-- ============================================================================
-- Se controle_os estiver vazia, execute o script:
-- database/controle-os-final.sql
-- 
-- Ele vai:
-- 1. Criar a tabela controle_os
-- 2. Criar as views necessárias
-- 3. Popular com dados dos pedidos existentes
-- 4. Configurar triggers para sincronização automática
-- ============================================================================
