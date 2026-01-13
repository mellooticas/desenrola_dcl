-- ============================================
-- VERIFICAR E POPULAR DADOS DE MONTAGENS
-- ============================================

-- 1. VERIFICAR DADOS ATUAIS
SELECT '=== MONTADORES ===' as secao;
SELECT COUNT(*) as total_montadores, 
       COUNT(CASE WHEN ativo THEN 1 END) as ativos
FROM montadores;

| total_montadores | ativos |
| ---------------- | ------ |
| 13               | 13     |


SELECT '=== PEDIDOS COM MONTADOR ===' as secao;
SELECT COUNT(*) as total_com_montador
FROM pedidos 
WHERE montador_id IS NOT NULL;

| total_com_montador |
| ------------------ |
| 0                  |


SELECT '=== PEDIDOS POR STATUS (SEM MONTADOR) ===' as secao;
SELECT 
  status,
  COUNT(*) as total
FROM pedidos
WHERE montador_id IS NULL
GROUP BY status
ORDER BY total DESC;

| status       | total |
| ------------ | ----- |
| ENTREGUE     | 486   |
| CANCELADO    | 39    |
| CHEGOU       | 33    |
| PRODUCAO     | 30    |
| ENVIADO      | 23    |
| AG_PAGAMENTO | 13    |
| PRONTO       | 1     |


SELECT '=== PEDIDOS CANDIDATOS (ENVIADO/CHEGOU/ENTREGUE) ===' as secao;
SELECT COUNT(*) as candidatos_para_montador
FROM pedidos
WHERE status IN ('ENVIADO', 'CHEGOU', 'ENTREGUE')
  AND montador_id IS NULL;

| candidatos_para_montador |
| ------------------------ |
| 542                      |


-- 2. POPULAR DADOS DE TESTE (se necessário)
-- Comentar esta seção se não quiser popular

-- Pegar os primeiros 10 pedidos no status ENVIADO e atribuir montadores
UPDATE pedidos
SET montador_id = (
  SELECT id FROM montadores 
  WHERE ativo = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE id IN (
  SELECT id FROM pedidos
  WHERE status = 'ENVIADO'
    AND montador_id IS NULL
  LIMIT 10
);

-- Pegar alguns pedidos em CHEGOU
UPDATE pedidos
SET montador_id = (
  SELECT id FROM montadores 
  WHERE ativo = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE id IN (
  SELECT id FROM pedidos
  WHERE status = 'CHEGOU'
    AND montador_id IS NULL
  LIMIT 5
);

-- Pegar alguns pedidos em ENTREGUE
UPDATE pedidos
SET montador_id = (
  SELECT id FROM montadores 
  WHERE ativo = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE id IN (
  SELECT id FROM pedidos
  WHERE status = 'ENTREGUE'
    AND montador_id IS NULL
  LIMIT 5
);

-- 3. VERIFICAR RESULTADOS APÓS POPULAR
SELECT '=== RESULTADO FINAL ===' as secao;

SELECT 
  'Total com montador' as metrica,
  COUNT(*) as valor
FROM pedidos 
WHERE montador_id IS NOT NULL

UNION ALL

SELECT 
  'Em montagem (ENVIADO)',
  COUNT(*)
FROM pedidos
WHERE status = 'ENVIADO' AND montador_id IS NOT NULL

UNION ALL

SELECT 
  'Montagem concluída (CHEGOU)',
  COUNT(*)
FROM pedidos
WHERE status = 'CHEGOU' AND montador_id IS NOT NULL

UNION ALL

SELECT 
  'Entregue ao cliente',
  COUNT(*)
FROM pedidos
WHERE status = 'ENTREGUE' AND montador_id IS NOT NULL;

| metrica                     | valor |
| --------------------------- | ----- |
| Total com montador          | 20    |
| Em montagem (ENVIADO)       | 10    |
| Montagem concluída (CHEGOU) | 5     |
| Entregue ao cliente         | 5     |


-- 4. VERIFICAR AS VIEWS
SELECT '=== VIEWS - PREVIEW ===' as secao;

SELECT 'view_kpis_montadores' as view_name, COUNT(*) as registros
FROM view_kpis_montadores
UNION ALL
SELECT 'view_relatorio_montagens', COUNT(*)
FROM view_relatorio_montagens
UNION ALL
SELECT 'view_performance_diaria_montadores', COUNT(*)
FROM view_performance_diaria_montadores
UNION ALL
SELECT 'view_ranking_montadores', COUNT(*)
FROM view_ranking_montadores;

| view_name                          | registros |
| ---------------------------------- | --------- |
| view_kpis_montadores               | 13        |
| view_relatorio_montagens           | 20        |
| view_performance_diaria_montadores | 2         |
| view_ranking_montadores            | 2         |


-- 5. PREVIEW DOS KPIS
SELECT * FROM view_kpis_montadores LIMIT 5;


| id                                   | nome                         | tipo        | laboratorio_id                       | laboratorio_nome             | em_montagem_atual | concluidos_hoje | concluidos_semana | concluidos_mes | tempo_medio_horas | total_montagens |
| ------------------------------------ | ---------------------------- | ----------- | ------------------------------------ | ---------------------------- | ----------------- | --------------- | ----------------- | -------------- | ----------------- | --------------- |
| 181fdcae-831e-469e-a88d-aab3ba6c719f | HighVision                   | LABORATORIO | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   | 0                 | 0               | 0                 | 0              | null              | 0               |
| 1a9c5d17-ee11-42d6-bc07-04c962469e12 | Style                        | LABORATORIO | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        | 0                 | 0               | 0                 | 0              | null              | 0               |
| 3c703de3-d07c-4861-b314-4c42dfc125a6 | Braslentes                   | LABORATORIO | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   | 0                 | 0               | 0                 | 0              | null              | 0               |
| 40e62c6a-5bf7-48f3-ad90-e16e2ef949c7 | Solótica - Lentes de Contato | LABORATORIO | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato | 0                 | 0               | 0                 | 0              | null              | 0               |
| 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas                      | INTERNO     | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        | 0                 | 0               | 0                 | 0              | null              | 0               |
