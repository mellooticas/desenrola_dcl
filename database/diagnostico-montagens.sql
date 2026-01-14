-- ============================================
-- DIAGNÓSTICO COMPLETO - MONTAGENS
-- ============================================

-- 1. VERIFICAR PEDIDOS COM MONTADOR
SELECT 
  '=== PEDIDOS COM MONTADOR ===' as secao;

SELECT 
  p.id,
  p.numero_sequencial,
  p.status,
  p.montador_id,
  m.nome as montador_nome,
  m.tipo as montador_tipo,
  m.laboratorio_id,
  l.nome as laboratorio_nome
FROM pedidos p
LEFT JOIN montadores m ON p.montador_id = m.id
LEFT JOIN laboratorios l ON m.laboratorio_id = l.id
WHERE p.montador_id IS NOT NULL
ORDER BY p.updated_at DESC
LIMIT 20;

| secao                        |
| ---------------------------- |
| === PEDIDOS COM MONTADOR === |


-- 2. VERIFICAR VIEW_KPIS_MONTADORES
SELECT 
  '=== VIEW KPIS MONTADORES ===' as secao;

SELECT 
  nome,
  tipo,
  laboratorio_nome,
  em_montagem_atual,
  concluidos_hoje,
  total_montagens
FROM view_kpis_montadores
ORDER BY total_montagens DESC;


| nome                         | tipo        | laboratorio_nome             | em_montagem_atual | concluidos_hoje | total_montagens |
| ---------------------------- | ----------- | ---------------------------- | ----------------- | --------------- | --------------- |
| Express                      | LABORATORIO | Express                      | 0                 | 0               | 0               |
| 2K                           | LABORATORIO | 2K                           | 0                 | 0               | 0               |
| HighVision                   | LABORATORIO | HighVision                   | 0                 | 0               | 0               |
| Blue Optical                 | LABORATORIO | Blue Optical                 | 0                 | 0               | 0               |
| Brascor                      | LABORATORIO | Brascor                      | 0                 | 0               | 0               |
| Style                        | LABORATORIO | Style                        | 0                 | 0               | 0               |
| So Blocos                    | LABORATORIO | So Blocos                    | 0                 | 0               | 0               |
| Sygma                        | LABORATORIO | Sygma                        | 0                 | 0               | 0               |
| Polylux                      | LABORATORIO | Polylux                      | 0                 | 0               | 0               |
| Douglas                      | INTERNO     | Douglas - Laboratório        | 0                 | 0               | 0               |
| Solótica - Lentes de Contato | LABORATORIO | Solótica - Lentes de Contato | 0                 | 0               | 0               |
| Thiago                       | INTERNO     | Thiago - Laboratório         | 0                 | 0               | 0               |
| Braslentes                   | LABORATORIO | Braslentes                   | 0                 | 0               | 0               |


-- 3. VERIFICAR VIEW_RELATORIO_MONTAGENS
SELECT 
  '=== VIEW RELATORIO MONTAGENS ===' as secao;

SELECT 
  numero_sequencial,
  cliente_nome,
  montador_nome,
  laboratorio_nome,
  status,
  data_enviado_montagem
FROM view_relatorio_montagens
ORDER BY data_enviado_montagem DESC
LIMIT 20;

Error: Failed to run sql query: ERROR: 42703: column "data_enviado_montagem" does not exist LINE 12: data_enviado_montagem ^




-- 4. VERIFICAR MONTADORES ATIVOS
SELECT 
  '=== MONTADORES ATIVOS ===' as secao;

SELECT 
  id,
  nome,
  tipo,
  ativo,
  laboratorio_id,
  (SELECT nome FROM laboratorios WHERE id = m.laboratorio_id) as lab_nome
FROM montadores m
WHERE ativo = true
ORDER BY nome;


| id                                   | nome                         | tipo        | ativo | laboratorio_id                       | lab_nome                     |
| ------------------------------------ | ---------------------------- | ----------- | ----- | ------------------------------------ | ---------------------------- |
| daf00305-6705-43a9-807b-68977c0e3528 | 2K                           | LABORATORIO | true  | 21e9cb25-ca46-42f9-b297-db1e693325ed | 2K                           |
| 8e11ace7-d52a-4d75-99be-e252e095503a | Blue Optical                 | LABORATORIO | true  | 3a65944b-330a-4b56-b983-f0f3de3905a1 | Blue Optical                 |
| 664c1467-0b98-4d32-8269-93a69ce39437 | Brascor                      | LABORATORIO | true  | 8ce109c1-69d3-484a-a87b-8accf7984132 | Brascor                      |
| 3c703de3-d07c-4861-b314-4c42dfc125a6 | Braslentes                   | LABORATORIO | true  | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | Braslentes                   |
| 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas                      | INTERNO     | true  | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório        |
| 5c1e9f51-f43a-41bc-9223-8520539a0192 | Express                      | LABORATORIO | true  | 74dc986a-1063-4b8e-8964-59eb396e10eb | Express                      |
| 181fdcae-831e-469e-a88d-aab3ba6c719f | HighVision                   | LABORATORIO | true  | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | HighVision                   |
| bc8381bf-684c-4cc6-9460-4f768a6ba989 | Polylux                      | LABORATORIO | true  | a2f98c18-abb8-4434-8cc3-7bd254892894 | Polylux                      |
| db771f9b-296b-48fc-9229-5e4581531863 | So Blocos                    | LABORATORIO | true  | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | So Blocos                    |
| 40e62c6a-5bf7-48f3-ad90-e16e2ef949c7 | Solótica - Lentes de Contato | LABORATORIO | true  | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | Solótica - Lentes de Contato |
| 1a9c5d17-ee11-42d6-bc07-04c962469e12 | Style                        | LABORATORIO | true  | 3e51a952-326f-4300-86e4-153df8d7f893 | Style                        |
| 5163c234-b2da-4ab9-8bbc-38f8ea2f6262 | Sygma                        | LABORATORIO | true  | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | Sygma                        |
| 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago                       | INTERNO     | true  | f2954dac-a0a5-47db-9238-e4e2fa748281 | Thiago - Laboratório         |



-- 5. CONTAR POR MONTADOR
SELECT 
  '=== CONTAGEM POR MONTADOR ===' as secao;

SELECT 
  m.nome as montador,
  COUNT(p.id) as total_pedidos,
  COUNT(CASE WHEN p.status = 'ENVIADO' THEN 1 END) as em_montagem,
  COUNT(CASE WHEN p.status = 'CHEGOU' THEN 1 END) as concluidos
FROM montadores m
LEFT JOIN pedidos p ON p.montador_id = m.id
WHERE m.ativo = true
GROUP BY m.id, m.nome
ORDER BY total_pedidos DESC;


| montador                     | total_pedidos | em_montagem | concluidos |
| ---------------------------- | ------------- | ----------- | ---------- |
| Express                      | 0             | 0           | 0          |
| Douglas                      | 0             | 0           | 0          |
| Style                        | 0             | 0           | 0          |
| Sygma                        | 0             | 0           | 0          |
| Thiago                       | 0             | 0           | 0          |
| Solótica - Lentes de Contato | 0             | 0           | 0          |
| Braslentes                   | 0             | 0           | 0          |
| HighVision                   | 0             | 0           | 0          |
| 2K                           | 0             | 0           | 0          |
| So Blocos                    | 0             | 0           | 0          |
| Polylux                      | 0             | 0           | 0          |
| Blue Optical                 | 0             | 0           | 0          |
| Brascor                      | 0             | 0           | 0          |


-- 6. VERIFICAR PERMISSÕES DAS VIEWS
SELECT 
  '=== PERMISSÕES DAS VIEWS ===' as secao;

SELECT 
  schemaname,
  tablename as viewname,
  'authenticated' as role,
  has_table_privilege('authenticated', schemaname||'.'||tablename, 'SELECT') as can_select
FROM pg_tables 
WHERE tablename LIKE 'view_%montag%'
UNION ALL
SELECT 
  schemaname,
  tablename,
  'anon',
  has_table_privilege('anon', schemaname||'.'||tablename, 'SELECT')
FROM pg_tables 
WHERE tablename LIKE 'view_%montag%';

| secao                        |
| ---------------------------- |
| === PERMISSÕES DAS VIEWS === |