-- ============================================================
-- FIX: Recriar view v_lentes com campos de preço corretos
-- ============================================================
-- PROBLEMA: View retornando preco_custo e preco_venda_sugerido = 0
-- SOLUÇÃO: Recriar view apontando para os campos corretos da tabela
-- ============================================================

-- PASSO 1: Dropar view antiga
DROP VIEW IF EXISTS public.v_lentes CASCADE;

-- PASSO 2: Recriar view com aliases corretos
CREATE OR REPLACE VIEW public.v_lentes AS
SELECT 
  -- ========== IDENTIFICAÇÃO ==========
  l.id,
  l.slug,
  l.sku_fornecedor,
  l.codigo_original,
  l.nome_lente,
  l.nome_canonizado,
  l.nome_comercial,
  
  -- ========== FORNECEDOR ==========
  l.fornecedor_id,
  f.nome AS fornecedor_nome,
  f.razao_social AS fornecedor_razao_social,
  f.cnpj AS fornecedor_cnpj,
  
  -- ========== MARCA ==========
  l.marca_id,
  m.nome AS marca_nome,
  m.slug AS marca_slug,
  m.is_premium AS marca_premium,
  
  -- ========== GRUPO CANÔNICO ==========
  l.grupo_canonico_id,
  gc.nome_grupo AS grupo_nome,
  gc.slug AS grupo_slug,
  
  -- ========== CARACTERÍSTICAS ==========
  l.tipo_lente,
  l.categoria,
  l.material,
  l.indice_refracao,
  l.linha_produto,
  l.diametro,
  l.espessura_central,
  l.peso_aproximado AS peso,
  
  -- ========== RANGES DE GRAU ==========
  l.esferico_min AS grau_esferico_min,
  l.esferico_max AS grau_esferico_max,
  l.cilindrico_min AS grau_cilindrico_min,
  l.cilindrico_max AS grau_cilindrico_max,
  l.adicao_min,
  l.adicao_max,
  l.dnp_min,
  l.dnp_max,
  
  -- ========== TRATAMENTOS ==========
  l.ar AS tem_ar,
  l.antirrisco AS tem_antirrisco,
  l.blue AS tem_blue,
  l.uv400 AS tem_uv,
  l.fotossensivel AS tratamento_foto,
  l.polarizado AS tem_polarizado, 
  l.hidrofobico AS tem_hidrofobico,
  
  -- ========== PREÇOS (CORREÇÃO AQUI!) ==========
  -- ATENÇÃO: Tabela tem campos duplicados!
  -- Campos com dados: preco_custo, preco_venda_sugerido
  -- Campos vazios: custo_base, preco_tabela
  l.preco_custo,
  l.preco_venda_sugerido,
  l.preco_fabricante,
  
  -- ========== PRAZO ==========
  COALESCE(
    l.prazo_entrega,
    l.lead_time_dias,
    CASE l.tipo_lente
      WHEN 'visao_simples'::lens_catalog.tipo_lente THEN COALESCE(f.prazo_visao_simples, 7)
      WHEN 'multifocal'::lens_catalog.tipo_lente THEN COALESCE(f.prazo_multifocal, 10)
      WHEN 'bifocal'::lens_catalog.tipo_lente THEN COALESCE(f.prazo_multifocal, 10)
      ELSE 7
    END
  ) AS prazo_dias,
  
  -- ========== OUTROS ==========
  l.ativo,
  l.destaque,
  l.created_at,
  l.updated_at
  
FROM lens_catalog.lentes l
LEFT JOIN core.fornecedores f ON f.id = l.fornecedor_id
LEFT JOIN lens_catalog.marcas m ON m.id = l.marca_id
LEFT JOIN lens_catalog.grupos_canonicos gc ON gc.id = l.grupo_canonico_id
WHERE l.ativo = true
ORDER BY l.preco_venda_sugerido, l.nome_lente;

-- ============================================================
-- PASSO 3: GRANT de permissões (CRÍTICO para acesso!)
-- ============================================================
GRANT SELECT ON public.v_lentes TO anon, authenticated;

-- ============================================================
-- PASSO 4: Verificar se view está retornando valores
-- ============================================================

-- Test 1: Ver primeiras 5 lentes com preços
SELECT 
  id,
  nome_lente,
  fornecedor_nome,
  preco_custo,
  preco_venda_sugerido,
  prazo_dias
FROM public.v_lentes
LIMIT 5;

| id                                   | nome_lente                      | fornecedor_nome | preco_custo | preco_venda_sugerido | prazo_dias |
| ------------------------------------ | ------------------------------- | --------------- | ----------- | -------------------- | ---------- |
| 58edb8fb-4283-4d84-b7e8-663a3c8a5cc1 | LT 1.59 POLICARBONATO INCOLOR   | Express         | 9.00        | 250.00               | 7          |
| 13e50463-bba2-4163-b242-2d2a1bd067fe | LT CR 1.49 INCOLOR (TINTAVEL)   | Express         | 9.00        | 250.00               | 7          |
| 59828728-37d1-4c3b-9780-a2fce84a0b34 | LT CR AR 1.56                   | Express         | 10.00       | 253.91               | 7          |
| 3d656633-f8cc-4e48-af26-d2a9f1408f8c | LT CR 1.49 Incolor (TINTÁVEL)   | Sygma           | 10.50       | 255.87               | 7          |
| 82cee871-8c04-4841-b3b9-7ca6d1d1286a | CR 1.56 AR                      | Polylux         | 12.00       | 261.73               | 7          |


-- Test 2: Contar quantas lentes têm preços > 0
SELECT 
  COUNT(*) AS total_lentes,
  COUNT(*) FILTER (WHERE preco_custo > 0) AS com_custo,
  COUNT(*) FILTER (WHERE preco_venda_sugerido > 0) AS com_preco_venda
FROM public.v_lentes;


| total_lentes | com_custo | com_preco_venda |
| ------------ | --------- | --------------- |
| 1411         | 1411      | 1411            |

-- ============================================================
-- ✅ EXECUTAR ESTE SCRIPT NO SUPABASE SQL EDITOR
-- ============================================================
