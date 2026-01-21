-- ============================================================
-- DIAGNÓSTICO: Verificar preços na tabela lens_catalog.lentes
-- ============================================================

-- Test 1: Ver estrutura das colunas de preço
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'lens_catalog'
  AND table_name = 'lentes'
  AND column_name IN ('custo_base', 'preco_tabela', 'preco_fabricante', 'preco_custo', 'preco_venda_sugerido')
ORDER BY column_name;

-- Test 2: Ver primeiras 10 lentes da TABELA ORIGINAL
SELECT 
  id,
  nome_lente,
  fornecedor_id,
  custo_base,
  preco_tabela,
  preco_fabricante,
  ativo
FROM lens_catalog.lentes
WHERE ativo = true
ORDER BY created_at DESC
LIMIT 10;

-- Test 3: Estatísticas de preços
SELECT 
  COUNT(*) AS total_lentes,
  COUNT(*) FILTER (WHERE custo_base > 0) AS com_custo_base,
  COUNT(*) FILTER (WHERE preco_tabela > 0) AS com_preco_tabela,
  MIN(custo_base) AS custo_minimo,
  MAX(custo_base) AS custo_maximo,
  AVG(custo_base) AS custo_medio,
  MIN(preco_tabela) AS preco_minimo,
  MAX(preco_tabela) AS preco_maximo,
  AVG(preco_tabela) AS preco_medio
FROM lens_catalog.lentes
WHERE ativo = true;

-- Test 4: Ver lentes de um grupo específico (pegar ID de um grupo que você testou)
-- Substitua 'SEU_GRUPO_ID_AQUI' pelo ID do grupo que você estava testando
/*
SELECT 
  l.id,
  l.nome_lente,
  l.nome_canonizado,
  f.nome AS fornecedor,
  l.custo_base,
  l.preco_tabela,
  l.grupo_canonico_id
FROM lens_catalog.lentes l
LEFT JOIN core.fornecedores f ON f.id = l.fornecedor_id
WHERE l.grupo_canonico_id = 'SEU_GRUPO_ID_AQUI'
  AND l.ativo = true;
*/

-- ============================================================
-- 📊 ANÁLISE DOS RESULTADOS:
-- ============================================================
-- Se Test 2 mostrar valores > 0: dados existem, problema é na view
-- Se Test 2 mostrar tudo 0: dados não foram migrados/importados
-- ============================================================
