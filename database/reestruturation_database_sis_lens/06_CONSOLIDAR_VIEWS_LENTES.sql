-- ============================================================================
-- CONSOLIDAÇÃO: Views de Lentes
-- ============================================================================
-- Objetivo: Substituir 4 views de lentes por apenas 1 view completa
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- VIEWS A SEREM REMOVIDAS (4 views fragmentadas)
-- ============================================================================
-- 1. v_lentes_busca (para buscas com search_text)
-- 2. v_lentes_cotacao_compra (para cotações - USADA NO FRONTEND!)
-- 3. vw_lentes_catalogo (catálogo completo)
-- 4. vw_bi_lentes_lucratividade (BI/relatórios - manter separada para performance)
-- ============================================================================

-- Remover views antigas (exceto vw_bi_lentes_lucratividade que é específica de BI)
DROP VIEW IF EXISTS public.v_lentes_busca CASCADE;
DROP VIEW IF EXISTS public.v_lentes_cotacao_compra CASCADE;
DROP VIEW IF EXISTS public.vw_lentes_catalogo CASCADE;

-- ============================================================================
-- VIEW ÚNICA CONSOLIDADA: v_lentes
-- ============================================================================
-- Contém TODOS os dados necessários das 3 views antigas
-- Integrada com v_grupos_canonicos
-- ============================================================================

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
  
  -- ========== GRUPO CANÔNICO (ligação com v_grupos_canonicos) ==========
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
  
  -- ========== TRATAMENTOS (aliases para compatibilidade) ==========
  l.ar AS tratamento_antirreflexo,
  l.ar AS tem_ar,
  l.antirrisco AS tratamento_antirrisco,
  l.antirrisco AS tem_antirrisco,
  l.hidrofobico AS tratamento_hidrofobico,
  l."antiembaçante" AS tratamento_antiembacante,
  l.blue AS tratamento_blue_light,
  l.blue AS tem_blue,
  l.uv400 AS tratamento_uv,
  l.uv400 AS tem_uv,
  l.fotossensivel AS tratamento_fotossensiveis,
  l.fotossensivel AS tratamento_foto,
  l.polarizado AS tem_polarizado,
  l.digital AS tem_digital,
  l.free_form AS tem_free_form,
  l.indoor AS tem_indoor,
  l.drive AS tem_drive,
  
  -- ========== PREÇOS ==========
  l.custo_base AS preco_custo,
  l.preco_fabricante,
  l.preco_tabela AS preco_venda_sugerido,
  
  -- ========== PRAZO (calculado dinamicamente) ==========
  COALESCE(
    l.prazo_entrega,
    l.lead_time_dias,
    CASE l.tipo_lente
      WHEN 'visao_simples' THEN f.prazo_visao_simples
      WHEN 'multifocal' THEN f.prazo_multifocal
      WHEN 'bifocal' THEN f.prazo_multifocal
      WHEN 'leitura' THEN f.prazo_visao_simples
      WHEN 'ocupacional' THEN f.prazo_multifocal
      ELSE 10
    END
  ) AS prazo_dias,
  l.obs_prazo,
  
  -- ========== LOGÍSTICA ==========
  l.peso_frete,
  l.exige_receita_especial,
  
  -- ========== TEXTOS DESCRITIVOS ==========
  l.descricao_curta,
  l.descricao_completa,
  l.beneficios,
  l.indicacoes,
  l.contraindicacoes,
  l.observacoes,
  
  -- ========== STATUS ==========
  l.status,
  l.ativo,
  l.disponivel,
  l.destaque,
  l.novidade,
  l.data_lancamento,
  l.data_descontinuacao,
  
  -- ========== BUSCA (campo concatenado para full-text search) ==========
  (
    l.nome_canonizado || ' ' || 
    f.nome || ' ' || 
    COALESCE(m.nome::TEXT, '') || ' ' ||
    l.tipo_lente::TEXT || ' ' ||
    l.material::TEXT || ' ' ||
    l.indice_refracao::TEXT
  ) AS search_text,
  
  -- ========== METADADOS ==========
  l.created_at,
  l.updated_at,
  l.deleted_at
  
FROM lens_catalog.lentes l
JOIN core.fornecedores f ON l.fornecedor_id = f.id
LEFT JOIN lens_catalog.marcas m ON l.marca_id = m.id
LEFT JOIN lens_catalog.grupos_canonicos gc ON l.grupo_canonico_id = gc.id
WHERE l.ativo = true 
  AND l.status = 'ativo'
  AND l.deleted_at IS NULL
ORDER BY l.preco_tabela, l.nome_lente;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT ON public.v_lentes TO anon, authenticated;

-- ============================================================================
-- COMENTÁRIO DA VIEW
-- ============================================================================
COMMENT ON VIEW public.v_lentes IS 
'View consolidada de lentes com TODOS os dados necessários.
Substitui 3 views antigas: v_lentes_busca, v_lentes_cotacao_compra, vw_lentes_catalogo.
Inclui: identificação completa, fornecedor, marca, grupo canônico, características,
tratamentos, preços, prazos, textos descritivos, status e campo de busca.
Integrada com v_grupos_canonicos via grupo_canonico_id.';

-- ============================================================================
-- ÍNDICES SUGERIDOS (para performance de busca)
-- ============================================================================
-- Já existem na tabela base lens_catalog.lentes, mas documenta aqui:
-- CREATE INDEX IF NOT EXISTS idx_lentes_fornecedor ON lens_catalog.lentes(fornecedor_id);
-- CREATE INDEX IF NOT EXISTS idx_lentes_marca ON lens_catalog.lentes(marca_id);
-- CREATE INDEX IF NOT EXISTS idx_lentes_grupo_canonico ON lens_catalog.lentes(grupo_canonico_id);
-- CREATE INDEX IF NOT EXISTS idx_lentes_tipo ON lens_catalog.lentes(tipo_lente);
-- CREATE INDEX IF NOT EXISTS idx_lentes_preco ON lens_catalog.lentes(preco_tabela);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Teste a view consolidada (mesma query que v_lentes_cotacao_compra):
-- SELECT 
--   id, slug, nome_lente, fornecedor_nome, marca_nome,
--   tipo_lente, material, indice_refracao,
--   preco_custo, prazo_dias, categoria, grupo_canonico_id
-- FROM public.v_lentes
-- WHERE tipo_lente = 'visao_simples'
-- LIMIT 10;
| id                                   | slug                                        | nome_lente                              | fornecedor_nome | marca_nome | tipo_lente    | material      | indice_refracao | preco_custo | prazo_dias | categoria | grupo_canonico_id                    |
| ------------------------------------ | ------------------------------------------- | --------------------------------------- | --------------- | ---------- | ------------- | ------------- | --------------- | ----------- | ---------- | --------- | ------------------------------------ |
| 45f556fc-b1c3-417c-9fa3-427a8895567b | 1-59-45f556fc-b1c3-417c-9fa3-427a8895567b   | 1.59 POLICARBONATO AR                   | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | 6b8bfeca-b9f9-459a-92ab-68b011501f00 |
| 060803e2-c307-4553-8323-d2c59bd9e50f | 1-59-1-060803e2-c307-4553-8323-d2c59bd9e50f | 1.59 POLICARBONATO AR 1                 | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | 721a8576-fee9-4bc2-be31-c3c12b2fc3e5 |
| a9426ec5-747c-437d-a1b3-edeb13d3435a | 1-59-a9426ec5-747c-437d-a1b3-edeb13d3435a   | 1.59 POLICARBONATO AR BLUE              | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | e04ba6e0-333a-4443-83c6-03337a7f9d4c |
| 3bcba5c6-841f-4e15-a6a2-e279c9d6dd5e | 1-59-1-3bcba5c6-841f-4e15-a6a2-e279c9d6dd5e | 1.59 POLICARBONATO AR BLUE 1            | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | ea84914c-9d7e-4798-859f-586b5c41fcf3 |
| d029fa9a-b0ee-4b81-b6bc-48d52586db8f | 1-59-d029fa9a-b0ee-4b81-b6bc-48d52586db8f   | 1.59 POLICARBONATO AR BLUE HIDRO AZUL   | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | e04ba6e0-333a-4443-83c6-03337a7f9d4c |
| bf8beae7-9ab6-4bda-ae83-7ecb439fc684 | 1-59-1-bf8beae7-9ab6-4bda-ae83-7ecb439fc684 | 1.59 POLICARBONATO AR BLUE HIDRO AZUL 1 | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | ea84914c-9d7e-4798-859f-586b5c41fcf3 |
| 4eea9862-203a-4fdc-a00c-01f80101a0a6 | 1-59-4eea9862-203a-4fdc-a00c-01f80101a0a6   | 1.59 POLICARBONATO AR FOTO              | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | 397e5d8c-83e6-44b9-a6cb-d12a6565fcf0 |
| ab96a776-a74d-4d27-a3f1-72d8ffa7b28c | 1-59-ab96a776-a74d-4d27-a3f1-72d8ffa7b28c   | 1.59 POLICARBONATO AR FOTO BLUE AZUL    | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | f6f80127-d42b-48f6-8aea-3c69b000729c |
| fb898967-7f0f-49a9-b6ff-298d8d4d7ea5 | 1-59-1-fb898967-7f0f-49a9-b6ff-298d8d4d7ea5 | 1.59 POLICARBONATO AR FOTO BLUE AZUL 1  | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | 96f2b511-1b4b-4dac-9b8b-8bda80c150b8 |
| 842abe3e-517c-44ee-9671-5b95c5a36681 | 1-59-842abe3e-517c-44ee-9671-5b95c5a36681   | 1.59 POLICARBONATO INCOLOR              | Polylux         | POLYLUX    | visao_simples | POLICARBONATO | 1.59            | 0.00        | 7          | economica | af79dfea-e8f8-4521-baae-c391252bc71a |
-- ============================================================================
-- MIGRAÇÃO DO CÓDIGO FRONTEND
-- ============================================================================
-- A view v_lentes_cotacao_compra era usada no hook useLentesCatalogo.ts
-- 
-- ANTES:
-- const { data } = supabase.from('v_lentes_cotacao_compra').select('*')
--
-- DEPOIS:
-- const { data } = supabase.from('v_lentes').select(`
--   id, slug, nome_lente AS lente_nome, nome_canonizado,
--   tipo_lente, material, indice_refracao,
--   fornecedor_id, fornecedor_nome, marca_id, marca_nome,
--   preco_custo, prazo_dias, ativo, categoria, grupo_canonico_id
-- `)
--
-- OU simplesmente:
-- const { data } = supabase.from('v_lentes').select('*')
-- ============================================================================

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ 1 view única: v_lentes
-- ❌ 3 views removidas: v_lentes_busca, v_lentes_cotacao_compra, vw_lentes_catalogo
-- ✅ vw_bi_lentes_lucratividade mantida (específica para BI)
-- 🎯 Banco mais simples e performático
-- 📊 Todos os dados acessíveis em um único SELECT
-- 🔗 Integrada com v_grupos_canonicos via grupo_canonico_id
-- ============================================================================
