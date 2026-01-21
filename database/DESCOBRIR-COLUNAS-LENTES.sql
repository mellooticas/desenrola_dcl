-- ============================================================
-- DESCOBRIR: Quais são os nomes REAIS das colunas de preço
-- ============================================================

-- Ver TODAS as colunas da tabela lens_catalog.lentes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'lens_catalog'
  AND table_name = 'lentes'
ORDER BY ordinal_position;

-- Filtrar apenas colunas que contenham 'preco' ou 'custo' no nome
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'lens_catalog'
  AND table_name = 'lentes'
  AND (
    column_name ILIKE '%preco%' 
    OR column_name ILIKE '%custo%'
    OR column_name ILIKE '%valor%'
    OR column_name ILIKE '%price%'
  )
ORDER BY column_name;

-- ============================================================
-- RESULTADO ESPERADO:
-- Vai mostrar os nomes REAIS das colunas de preço na tabela
-- ============================================================
