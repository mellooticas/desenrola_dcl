-- =====================================================
-- 🔍 DIAGNÓSTICO: Verificar estrutura real das tabelas
-- =====================================================

-- 1. Verificar colunas da tabela PEDIDOS relacionadas a montador
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name LIKE '%montador%'
ORDER BY ordinal_position;

| column_name | data_type | is_nullable | column_default |
| ----------- | --------- | ----------- | -------------- |
| montador_id | uuid      | YES         | null           |



-- Resultado esperado (se tudo estiver OK):
-- | column_name       | data_type                | is_nullable | column_default |
-- |-------------------|--------------------------|-------------|----------------|
-- | montador_id       | uuid                     | YES         | NULL           |
-- | montador_nome     | text                     | YES         | NULL           |
-- | montador_local    | text                     | YES         | NULL           |
-- | montador_contato  | text                     | YES         | NULL           |

-- 2. Verificar colunas da tabela MONTADORES
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'montadores'
ORDER BY ordinal_position;

| column_name    | data_type                | is_nullable | column_default    |
| -------------- | ------------------------ | ----------- | ----------------- |
| id             | uuid                     | NO          | gen_random_uuid() |
| nome           | text                     | NO          | null              |
| tipo           | text                     | NO          | null              |
| laboratorio_id | uuid                     | YES         | null              |
| ativo          | boolean                  | YES         | true              |
| created_at     | timestamp with time zone | YES         | now()             |


-- Resultado esperado:
-- | column_name      | data_type                | is_nullable | column_default          |
-- |------------------|--------------------------|-------------|-------------------------|
-- | id               | uuid                     | NO          | gen_random_uuid()       |
-- | nome             | text                     | NO          | NULL                    |
-- | tipo             | text                     | NO          | NULL                    |
-- | laboratorio_id   | uuid                     | YES         | NULL                    |
-- | ativo            | boolean                  | YES         | true                    |
-- | created_at       | timestamp with time zone | YES         | now()                   |

-- 3. Testar query atual da view v_pedidos_kanban (se existir)
SELECT 
  column_name
FROM information_schema.columns
WHERE table_name = 'v_pedidos_kanban'
  AND column_name LIKE '%montador%'
ORDER BY column_name;


| column_name |
| ----------- |
| montador_id |



-- 4. Verificar se há pedidos com montador vinculado (apenas montador_id existe)
SELECT 
  p.id,
  p.numero_sequencial,
  p.cliente_nome,
  p.status,
  p.montador_id,
  m.nome as montador_nome_real,
  m.tipo as montador_tipo
FROM pedidos p
LEFT JOIN montadores m ON p.montador_id = m.id
WHERE p.montador_id IS NOT NULL
LIMIT 5;

| id                                   | numero_sequencial | cliente_nome                  | status  | montador_id                          | montador_nome_real | montador_tipo |
| ------------------------------------ | ----------------- | ----------------------------- | ------- | ------------------------------------ | ------------------ | ------------- |
| 683660d7-25f5-4075-9e01-f20d89b4c294 | 629               | ELISANGELA GONÇALVES DA SILVA | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago             | INTERNO       |
| 4651da99-85e9-431f-884c-f707e6ede76d | 577               | SELMA NALVES DA SILVA         | ENVIADO | 664c1467-0b98-4d32-8269-93a69ce39437 | Brascor            | LABORATORIO   |
| 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | JESSICA MARIA                 | ENVIADO | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas            | INTERNO       |
| 36f612db-54e2-4d4c-a7de-63bd1787aad9 | 648               | MARIA ANTÔNIA CALIXTO         | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago             | INTERNO       |
| 3363e27f-bb2f-4f39-bf80-ec3216785613 | 616               | SERGIO MURILO DOS SANTOS      | ENVIADO | 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago             | INTERNO       |



-- 5. Listar montadores cadastrados
SELECT 
  id,
  nome,
  tipo,
  laboratorio_id,
  ativo,
  created_at
FROM montadores
ORDER BY nome
LIMIT 10;


| id                                   | nome                         | tipo        | laboratorio_id                       | ativo | created_at                    |
| ------------------------------------ | ---------------------------- | ----------- | ------------------------------------ | ----- | ----------------------------- |
| daf00305-6705-43a9-807b-68977c0e3528 | 2K                           | LABORATORIO | 21e9cb25-ca46-42f9-b297-db1e693325ed | true  | 2025-09-24 20:08:15.727146+00 |
| 8e11ace7-d52a-4d75-99be-e252e095503a | Blue Optical                 | LABORATORIO | 3a65944b-330a-4b56-b983-f0f3de3905a1 | true  | 2025-09-24 20:08:15.727146+00 |
| 664c1467-0b98-4d32-8269-93a69ce39437 | Brascor                      | LABORATORIO | 8ce109c1-69d3-484a-a87b-8accf7984132 | true  | 2025-09-24 20:08:15.727146+00 |
| 3c703de3-d07c-4861-b314-4c42dfc125a6 | Braslentes                   | LABORATORIO | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | true  | 2025-09-24 20:08:15.727146+00 |
| 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas                      | INTERNO     | 68233923-a12b-4c65-a3ca-7c5fec265336 | true  | 2025-09-24 20:08:15.727146+00 |
| 5c1e9f51-f43a-41bc-9223-8520539a0192 | Express                      | LABORATORIO | 74dc986a-1063-4b8e-8964-59eb396e10eb | true  | 2025-09-24 20:08:15.727146+00 |
| 181fdcae-831e-469e-a88d-aab3ba6c719f | HighVision                   | LABORATORIO | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | true  | 2025-09-24 20:08:15.727146+00 |
| bc8381bf-684c-4cc6-9460-4f768a6ba989 | Polylux                      | LABORATORIO | a2f98c18-abb8-4434-8cc3-7bd254892894 | true  | 2025-09-24 20:08:15.727146+00 |
| db771f9b-296b-48fc-9229-5e4581531863 | So Blocos                    | LABORATORIO | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | true  | 2025-09-24 20:08:15.727146+00 |
| 40e62c6a-5bf7-48f3-ad90-e16e2ef949c7 | Solótica - Lentes de Contato | LABORATORIO | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | true  | 2025-09-24 20:08:15.727146+00 |


-- =====================================================
-- 📊 RESULTADO DO DIAGNÓSTICO
-- =====================================================
/*
CONCLUSÕES:

❌ PROBLEMA IDENTIFICADO:
   - Tabela 'pedidos' tem apenas: montador_id (UUID)
   - Tabela 'pedidos' NÃO tem: montador_nome, montador_local, montador_contato
   - O Kanban tenta salvar esses campos mas eles não existem!

✅ SOLUÇÃO NECESSÁRIA:
   Adicionar colunas na tabela pedidos:
   - montador_nome TEXT
   - montador_local TEXT  
   - montador_contato TEXT
   - custo_montagem NUMERIC
   - data_montagem TIMESTAMPTZ

🔧 PRÓXIMO PASSO:
   Executar script de migração para adicionar essas colunas
*/
