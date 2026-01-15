-- =====================================================
-- 🔍 DIAGNÓSTICO: Verificar se montador existe e JOIN
-- =====================================================

-- 1. Verificar se o montador com esse ID existe
SELECT 
  id,
  nome,
  tipo,
  laboratorio_id,
  ativo,
  created_at
FROM montadores
WHERE id = '41412e4a-68af-431b-a5d7-54b96291fe37';

| id                                   | nome    | tipo    | laboratorio_id                       | ativo | created_at                    |
| ------------------------------------ | ------- | ------- | ------------------------------------ | ----- | ----------------------------- |
| 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas | INTERNO | 68233923-a12b-4c65-a3ca-7c5fec265336 | true  | 2025-09-24 20:08:15.727146+00 |

-- Se retornar vazio = montador não existe (PROBLEMA!)
-- Se retornar dados = montador existe (OK)

-- =====================================================
-- 2. Testar o JOIN entre pedidos e montadores
-- =====================================================

SELECT 
  p.id as pedido_id,
  p.numero_sequencial,
  p.cliente_nome,
  p.montador_id,
  p.montador_nome as pedido_montador_nome,
  m.id as montador_real_id,
  m.nome as montador_real_nome,
  m.tipo as montador_tipo,
  m.laboratorio_id,
  lab.nome as lab_nome
FROM pedidos p
LEFT JOIN montadores m ON p.montador_id = m.id
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03'
   OR p.montador_id = '41412e4a-68af-431b-a5d7-54b96291fe37';

   | pedido_id                            | numero_sequencial | cliente_nome         | montador_id                          | pedido_montador_nome | montador_real_id                     | montador_real_nome | montador_tipo | laboratorio_id                       | lab_nome              |
| ------------------------------------ | ----------------- | -------------------- | ------------------------------------ | -------------------- | ------------------------------------ | ------------------ | ------------- | ------------------------------------ | --------------------- |
| 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | JESSICA MARIA        | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas              | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas            | INTERNO       | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | LAURA VIANA DA SILVA | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas              | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas            | INTERNO       | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório |
| 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622               | JOSE ROBERTO MOURA   | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas              | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas            | INTERNO       | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório |
| c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | VALÉRIA MARIA RAMOS  | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas              | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas            | INTERNO       | 68233923-a12b-4c65-a3ca-7c5fec265336 | Douglas - Laboratório |



-- Verificar se:
-- - montador_real_id tem valor (JOIN funcionou)
-- - montador_real_nome tem valor (dados existem)
-- - Se ambos forem NULL = montador não existe na tabela

-- =====================================================
-- 3. Listar TODOS os montadores para conferir
-- =====================================================

SELECT 
  id,
  nome,
  tipo,
  laboratorio_id,
  ativo
FROM montadores
WHERE ativo = true
ORDER BY nome;

| id                                   | nome                         | tipo        | laboratorio_id                       | ativo |
| ------------------------------------ | ---------------------------- | ----------- | ------------------------------------ | ----- |
| daf00305-6705-43a9-807b-68977c0e3528 | 2K                           | LABORATORIO | 21e9cb25-ca46-42f9-b297-db1e693325ed | true  |
| 8e11ace7-d52a-4d75-99be-e252e095503a | Blue Optical                 | LABORATORIO | 3a65944b-330a-4b56-b983-f0f3de3905a1 | true  |
| 664c1467-0b98-4d32-8269-93a69ce39437 | Brascor                      | LABORATORIO | 8ce109c1-69d3-484a-a87b-8accf7984132 | true  |
| 3c703de3-d07c-4861-b314-4c42dfc125a6 | Braslentes                   | LABORATORIO | d7cc1746-0749-40d6-97b6-94e50c7a1d1b | true  |
| 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas                      | INTERNO     | 68233923-a12b-4c65-a3ca-7c5fec265336 | true  |
| 5c1e9f51-f43a-41bc-9223-8520539a0192 | Express                      | LABORATORIO | 74dc986a-1063-4b8e-8964-59eb396e10eb | true  |
| 181fdcae-831e-469e-a88d-aab3ba6c719f | HighVision                   | LABORATORIO | 3ba3d7e1-95c4-41dc-8127-073ad47f62e4 | true  |
| bc8381bf-684c-4cc6-9460-4f768a6ba989 | Polylux                      | LABORATORIO | a2f98c18-abb8-4434-8cc3-7bd254892894 | true  |
| db771f9b-296b-48fc-9229-5e4581531863 | So Blocos                    | LABORATORIO | b3c580a3-02a3-40fa-938a-fc2a26cbc671 | true  |
| 40e62c6a-5bf7-48f3-ad90-e16e2ef949c7 | Solótica - Lentes de Contato | LABORATORIO | 7a45dd7b-127c-40a0-9af5-e732ca3f02a9 | true  |
| 1a9c5d17-ee11-42d6-bc07-04c962469e12 | Style                        | LABORATORIO | 3e51a952-326f-4300-86e4-153df8d7f893 | true  |
| 5163c234-b2da-4ab9-8bbc-38f8ea2f6262 | Sygma                        | LABORATORIO | 2861abfc-7a83-4929-9e9f-7c2541f863f0 | true  |
| 56d71159-70ce-403b-8362-ebe44b18d882 | Thiago                       | INTERNO     | f2954dac-a0a5-47db-9238-e4e2fa748281 | true  |


-- Ver se o ID '41412e4a-68af-431b-a5d7-54b96291fe37' está na lista

-- =====================================================
-- 4. Ver quantos pedidos têm montador_id "órfão"
-- =====================================================

SELECT 
  COUNT(*) as pedidos_com_montador_orfao
FROM pedidos p
WHERE p.montador_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM montadores m WHERE m.id = p.montador_id
  );

| pedidos_com_montador_orfao |
| -------------------------- |
| 0                          |

-- Se > 0 = tem pedidos apontando para montadores que não existem

-- =====================================================
-- 5. Se montador não existe, ver qual deveria ser
-- =====================================================

SELECT 
  p.id,
  p.numero_sequencial,
  p.cliente_nome,
  p.montador_id as id_que_nao_existe,
  p.status,
  p.updated_at
FROM pedidos p
WHERE p.montador_id = '41412e4a-68af-431b-a5d7-54b96291fe37';


| id                                   | numero_sequencial | cliente_nome         | id_que_nao_existe                    | status  | updated_at                    |
| ------------------------------------ | ----------------- | -------------------- | ------------------------------------ | ------- | ----------------------------- |
| 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | JESSICA MARIA        | 41412e4a-68af-431b-a5d7-54b96291fe37 | ENVIADO | 2026-01-15 15:32:25.239134+00 |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | LAURA VIANA DA SILVA | 41412e4a-68af-431b-a5d7-54b96291fe37 | CHEGOU  | 2026-01-15 15:32:25.239134+00 |
| 11de6da3-c1ce-47ce-b8f2-a540026f9458 | 622               | JOSE ROBERTO MOURA   | 41412e4a-68af-431b-a5d7-54b96291fe37 | ENVIADO | 2026-01-15 15:32:25.239134+00 |
| c9a83a82-e42a-4034-bdac-e81f8febe8d8 | 646               | VALÉRIA MARIA RAMOS  | 41412e4a-68af-431b-a5d7-54b96291fe37 | CHEGOU  | 2026-01-15 15:32:25.239134+00 |


-- =====================================================
-- POSSÍVEIS SOLUÇÕES:
-- =====================================================

-- SOLUÇÃO A: Se montador não existe, criar ele
/*
INSERT INTO montadores (id, nome, tipo, ativo)
VALUES (
  '41412e4a-68af-431b-a5d7-54b96291fe37',
  'Nome do Montador',  -- TROCAR pelo nome real
  'INTERNO',           -- ou 'LABORATORIO'
  true
);
*/

-- SOLUÇÃO B: Se montador não existe, vincular a um existente
/*
-- Ver montadores disponíveis primeiro (query #3 acima)
-- Depois atualizar o pedido:
UPDATE pedidos
SET montador_id = 'ID_DE_UM_MONTADOR_QUE_EXISTE'
WHERE id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';
*/

-- SOLUÇÃO C: Se montador existe mas JOIN não funciona (RLS?)
/*
-- Desabilitar RLS temporariamente para testar
ALTER TABLE montadores DISABLE ROW LEVEL SECURITY;
-- Testar query #2 novamente
-- Reabilitar
ALTER TABLE montadores ENABLE ROW LEVEL SECURITY;
*/
