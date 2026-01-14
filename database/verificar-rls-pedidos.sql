-- ============================================
-- VERIFICAR E CORRIGIR RLS DA TABELA PEDIDOS
-- ============================================

-- 1. Ver policies atuais na tabela pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;

| schemaname | tablename | policyname                 | permissive | roles           | cmd    | qual | with_check |
| ---------- | --------- | -------------------------- | ---------- | --------------- | ------ | ---- | ---------- |
| public     | pedidos   | policy_anon_select_pedidos | PERMISSIVE | {anon}          | SELECT | true | null       |
| public     | pedidos   | policy_universal_pedidos   | PERMISSIVE | {authenticated} | ALL    | true | true       |



-- 2. Verificar se authenticated pode fazer UPDATE na coluna montador_id
SELECT 
  'authenticated pode UPDATE em pedidos?' as pergunta,
  has_table_privilege('authenticated', 'pedidos', 'UPDATE') as resposta;


| pergunta                              | resposta |
| ------------------------------------- | -------- |
| authenticated pode UPDATE em pedidos? | true     |


-- 3. Testar UPDATE direto (como authenticated user)
-- TESTE: Pegar primeiro pedido em ENVIADO e tentar atualizar
DO $$
DECLARE
  test_pedido_id uuid;
  test_montador_id uuid;
BEGIN
  -- Pegar primeiro pedido em ENVIADO
  SELECT id INTO test_pedido_id 
  FROM pedidos 
  WHERE status = 'ENVIADO' 
  LIMIT 1;
  
  -- Pegar Douglas
  SELECT id INTO test_montador_id
  FROM montadores
  WHERE nome = 'Douglas'
  LIMIT 1;
  
  IF test_pedido_id IS NOT NULL AND test_montador_id IS NOT NULL THEN
    RAISE NOTICE 'Tentando atualizar pedido % com montador %', test_pedido_id, test_montador_id;
    
    UPDATE pedidos 
    SET montador_id = test_montador_id
    WHERE id = test_pedido_id;
    
    RAISE NOTICE 'UPDATE executado com sucesso!';
  ELSE
    RAISE NOTICE 'Pedido ou montador não encontrado';
  END IF;
END $$;

-- 4. Verificar se salvou
SELECT 
  id,
  numero_sequencial,
  status,
  montador_id,
  (SELECT nome FROM montadores WHERE id = pedidos.montador_id) as montador_nome
FROM pedidos
WHERE montador_id IS NOT NULL
LIMIT 5;


| id                                   | numero_sequencial | status  | montador_id                          | montador_nome |
| ------------------------------------ | ----------------- | ------- | ------------------------------------ | ------------- |
| 40c404fd-9257-4ce2-8a73-904972b330f1 | 453               | ENVIADO | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       |