-- =========================================
-- 🔄 RESTAURAR OS_SEQUENCIA
-- =========================================
-- Restaura a tabela os_sequencia com a sequência original

-- 1️⃣ Remover constraint que pode estar causando problema
ALTER TABLE os_sequencia DROP CONSTRAINT IF EXISTS os_sequencia_numero_os_loja_id_key;

-- 2️⃣ Recriar constraint UNIQUE original
ALTER TABLE os_sequencia ADD CONSTRAINT os_sequencia_numero_os_key UNIQUE (numero_os);

-- 3️⃣ Repopular a tabela com a função original
-- Esta função já existe no sistema e popula corretamente
SELECT * FROM popular_sequencia_os(
  'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55'::UUID,  -- loja Suzano
  1,                                              -- número inicial
  15000,                                          -- número final (amplo para cobrir tudo)
  'restauracao'
);

-- 4️⃣ Verificar o que foi restaurado
SELECT 
  COUNT(*) as total_registros,
  MIN(numero_os) as menor_os,
  MAX(numero_os) as maior_os
FROM os_sequencia
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';

-- 5️⃣ Ver as estatísticas novamente
SELECT * FROM view_os_estatisticas
WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';
