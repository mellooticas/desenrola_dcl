-- ============================================================
-- DIAGNÓSTICO: Estrutura da tabela LOJAS
-- ============================================================

-- Ver todas as colunas da tabela lojas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lojas'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver constraints NOT NULL
SELECT 
  column_name,
  'NOT NULL' as constraint_type
FROM information_schema.columns
WHERE table_name = 'lojas'
  AND table_schema = 'public'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- Ver dados das lojas atuais (antigas)
SELECT * FROM lojas ORDER BY nome;
