-- =====================================================
-- ✅ POPULAR DADOS DO MONTADOR - EXECUTAR AGORA
-- =====================================================
-- Este script vai preencher montador_nome, montador_local, etc
-- para TODOS os pedidos que têm montador_id mas faltam os dados
-- =====================================================

-- EXECUTAR ESTE UPDATE:
UPDATE pedidos p
SET 
  montador_nome = m.nome,
  montador_local = CASE 
    WHEN m.tipo = 'INTERNO' THEN 'DCL - Montagem Interna'
    WHEN m.tipo = 'LABORATORIO' THEN COALESCE(lab.nome, 'Laboratório Externo')
    ELSE 'Não especificado'
  END,
  data_montagem = COALESCE(p.data_montagem, p.updated_at, p.created_at)
FROM montadores m
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.montador_id = m.id
  AND p.montador_nome IS NULL;  -- Só atualiza quem ainda não tem nome

-- =====================================================
-- VALIDAÇÃO: Ver quantos foram atualizados
-- =====================================================

-- Ver pedidos que TINHAM montador_id mas NÃO tinham nome (antes do update)
-- Agora devem estar com todos os dados preenchidos
SELECT 
  COUNT(*) as total_atualizados,
  COUNT(CASE WHEN montador_nome IS NOT NULL THEN 1 END) as com_nome_agora,
  COUNT(CASE WHEN montador_local IS NOT NULL THEN 1 END) as com_local_agora
FROM pedidos
WHERE montador_id IS NOT NULL;

| total_atualizados | com_nome_agora | com_local_agora |
| ----------------- | -------------- | --------------- |
| 17                | 17             | 17              |



-- Ver o pedido específico que você estava testando
SELECT 
  numero_sequencial,
  cliente_nome,
  montador_id,
  montador_nome,
  montador_local,
  data_montagem
FROM pedidos
WHERE montador_id = '41412e4a-68af-431b-a5d7-54b96291fe37'
  OR id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';


| numero_sequencial | cliente_nome         | montador_id                          | montador_nome | montador_local         | data_montagem                 |
| ----------------- | -------------------- | ------------------------------------ | ------------- | ---------------------- | ----------------------------- |
| 453               | JESSICA MARIA        | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | 2026-01-14 00:47:35.761337+00 |
| 641               | LAURA VIANA DA SILVA | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | 2026-01-14 00:47:35.761337+00 |
| 622               | JOSE ROBERTO MOURA   | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | 2026-01-14 23:51:48.100681+00 |
| 646               | VALÉRIA MARIA RAMOS  | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | 2026-01-14 00:47:35.761337+00 |


-- Resultado esperado: montador_nome = "Douglas" e montador_local = "DCL - Montagem Interna"

-- =====================================================
-- ✅ PRONTO! 
-- =====================================================
-- Após executar:
-- 1. Refresh da página (Ctrl + Shift + R)
-- 2. Card verde deve aparecer agora
-- 3. Montador "Douglas" deve estar visível
