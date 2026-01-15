-- =====================================================
-- 🔍 DIAGNÓSTICO: Verificar pedido específico
-- =====================================================

-- Verificar dados completos do pedido
SELECT 
  id,
  numero_sequencial,
  cliente_nome,
  status,
  montador_id,
  montador_nome,
  montador_local,
  montador_contato,
  custo_montagem,
  data_montagem,
  created_at,
  updated_at
FROM pedidos
WHERE id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';

| id                                   | numero_sequencial | cliente_nome         | status | montador_id                          | montador_nome | montador_local         | montador_contato | custo_montagem | data_montagem                 | created_at                   | updated_at                    |
| ------------------------------------ | ----------------- | -------------------- | ------ | ------------------------------------ | ------------- | ---------------------- | ---------------- | -------------- | ----------------------------- | ---------------------------- | ----------------------------- |
| 542c0e60-4812-4daa-b2c2-fb2232ccbf03 | 641               | LAURA VIANA DA SILVA | CHEGOU | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | null             | null           | 2026-01-14 00:47:35.761337+00 | 2026-01-12 14:16:34.35826+00 | 2026-01-15 15:32:25.239134+00 |


-- Se montador_id tem valor mas montador_nome é null, precisa popular
-- Executar este UPDATE para este pedido específico:
UPDATE pedidos p
SET 
  montador_nome = m.nome,
  montador_local = CASE 
    WHEN m.tipo = 'INTERNO' THEN 'DCL - Montagem Interna'
    WHEN m.tipo = 'LABORATORIO' THEN lab.nome
    ELSE 'Não especificado'
  END,
  data_montagem = COALESCE(p.data_montagem, p.updated_at, p.created_at)
FROM montadores m
LEFT JOIN laboratorios lab ON m.laboratorio_id = lab.id
WHERE p.id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03'
  AND p.montador_id = m.id
  AND p.montador_nome IS NULL;

-- Verificar novamente após update
SELECT 
  numero_sequencial,
  cliente_nome,
  montador_id,
  montador_nome,
  montador_local,
  data_montagem
FROM pedidos
WHERE id = '542c0e60-4812-4daa-b2c2-fb2232ccbf03';


| numero_sequencial | cliente_nome         | montador_id                          | montador_nome | montador_local         | data_montagem                 |
| ----------------- | -------------------- | ------------------------------------ | ------------- | ---------------------- | ----------------------------- |
| 641               | LAURA VIANA DA SILVA | 41412e4a-68af-431b-a5d7-54b96291fe37 | Douglas       | DCL - Montagem Interna | 2026-01-14 00:47:35.761337+00 |

