-- ============================================
-- DESATIVAR TRIGGER TEMPORARIAMENTE
-- ============================================

-- 1. DESATIVAR o trigger
ALTER TABLE pedidos DISABLE TRIGGER trigger_controle_os;

-- 2. AGORA você pode deletar/editar pedidos com numero_os_fisica errado
-- Exemplo: deletar OSs suspeitas acima de 15000
/*
DELETE FROM pedidos 
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
  AND numero_os_fisica IS NOT NULL
  AND numero_os_fisica ~ '^[0-9]+$'
  AND CAST(numero_os_fisica AS INTEGER) > 15000;
*/

-- OU corrigir numero_os_fisica se for erro de digitação
/*
UPDATE pedidos 
SET numero_os_fisica = '12477' 
WHERE numero_os_fisica = '434575';
*/

-- 3. REATIVAR o trigger quando terminar
ALTER TABLE pedidos ENABLE TRIGGER trigger_controle_os;

-- 4. Repovoar controle_os com dados corretos
TRUNCATE controle_os;

INSERT INTO controle_os (numero_os, loja_id, lancado, data_lancamento)
WITH pedidos_suzano AS (
  SELECT 
    CAST(numero_os_fisica AS INTEGER) as numero_os,
    MIN(created_at) as data_lancamento
  FROM pedidos
  WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'
    AND numero_os_fisica IS NOT NULL
    AND numero_os_fisica ~ '^[0-9]+$'
  GROUP BY numero_os_fisica
),
range_suzano AS (
  SELECT MIN(numero_os) as min_os, MAX(numero_os) as max_os FROM pedidos_suzano
)
SELECT 
  num,
  'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'::UUID,
  (p.numero_os IS NOT NULL),
  p.data_lancamento
FROM range_suzano
CROSS JOIN generate_series(range_suzano.min_os, range_suzano.max_os) AS num
LEFT JOIN pedidos_suzano p ON p.numero_os = num;
