-- ============================================================
-- 🔍 QUERIES CORRIGIDAS: Lentes de Contato
-- Usando estrutura REAL da view v_lentes_contato
-- ============================================================

-- ✅ QUERY 1: Contagem geral (CORRIGIDA - evita divisão por zero)
-- ============================================================
SELECT 
  COUNT(*) as total_lentes,
  COUNT(DISTINCT fornecedor_id) as total_fornecedores,
  COUNT(DISTINCT fornecedor_nome) as total_fornecedores_nomes,
  COUNT(DISTINCT marca_nome) as total_marcas,
  COUNT(DISTINCT tipo_lente_contato) as total_tipos,
  COUNT(DISTINCT material_contato) as total_materiais
FROM v_lentes_contato;

-- ✅ QUERY 2: Listar fornecedores únicos (para agrupar no frontend)
-- ============================================================
SELECT 
  fornecedor_id,
  fornecedor_nome,
  fornecedor_razao_social,
  COUNT(*) as total_produtos
FROM v_lentes_contato
WHERE fornecedor_id IS NOT NULL
  AND ativo = true
GROUP BY fornecedor_id, fornecedor_nome, fornecedor_razao_social
ORDER BY total_produtos DESC, fornecedor_nome;

-- ✅ QUERY 3: Listar tipos de lentes (SEM design_lente que não existe)
-- ============================================================
SELECT 
  tipo_lente_contato,
  finalidade,
  COUNT(*) as total_produtos,
  AVG(preco_custo) as preco_medio_custo,
  AVG(preco_tabela) as preco_medio_venda,
  MIN(dias_uso) as min_dias_uso,
  MAX(dias_uso) as max_dias_uso
FROM v_lentes_contato
WHERE ativo = true
GROUP BY tipo_lente_contato, finalidade
ORDER BY total_produtos DESC;

-- ✅ QUERY 4: Listar marcas disponíveis
-- ============================================================
SELECT 
  marca_nome,
  marca_premium,
  pais_origem,
  COUNT(*) as total_produtos,
  COUNT(DISTINCT tipo_lente_contato) as tipos_diferentes
FROM v_lentes_contato
WHERE ativo = true
GROUP BY marca_nome, marca_premium, pais_origem
ORDER BY total_produtos DESC;

-- ✅ QUERY 5: Lentes de um fornecedor específico (para o seletor)
-- ============================================================
-- EXEMPLO: Substituir 'fornecedor_id_aqui' pelo UUID real
SELECT 
  id,
  sku,
  nome_produto,
  marca_nome,
  marca_premium,
  tipo_lente_contato,
  material_contato,
  finalidade,
  
  -- Especificações
  diametro_mm,
  curvatura_base,
  teor_agua_percentual,
  dk_t,
  
  -- Graus
  esferico_min,
  esferico_max,
  cilindrico_min,
  cilindrico_max,
  adicao_min,
  adicao_max,
  
  -- Características
  tem_protecao_uv,
  eh_colorida,
  cor_disponivel,
  
  -- Uso
  dias_uso,
  horas_uso_diario,
  qtd_por_caixa,
  
  -- Preços ⭐
  preco_custo,
  preco_tabela,
  
  -- Logística
  prazo_entrega_dias,
  estoque_disponivel
  
FROM v_lentes_contato
WHERE fornecedor_id = 'fornecedor_id_aqui'
  AND ativo = true
ORDER BY marca_nome, nome_produto;

-- ✅ QUERY 6: Características especiais (CORRIGIDAS)
-- ============================================================
SELECT 
  COUNT(*) FILTER (WHERE tem_protecao_uv = true) as com_protecao_uv,
  COUNT(*) FILTER (WHERE eh_colorida = true) as coloridas,
  COUNT(*) FILTER (WHERE resistente_depositos = true) as resistente_depositos,
  COUNT(*) FILTER (WHERE hidratacao_prolongada = true) as hidratacao_prolongada,
  COUNT(*) FILTER (WHERE pode_dormir_com_lente = true) as pode_dormir,
  COUNT(*) FILTER (WHERE cilindrico_min IS NOT NULL) as tem_astigmatismo,
  COUNT(*) FILTER (WHERE adicao_min IS NOT NULL) as tem_adicao_multifocal,
  COUNT(*) as total
FROM v_lentes_contato
WHERE ativo = true;

-- ✅ QUERY 7: Lentes por fornecedor com faixas de preço
-- ============================================================
SELECT 
  fornecedor_nome,
  tipo_lente_contato,
  finalidade,
  COUNT(*) as total,
  MIN(preco_custo) as preco_min,
  MAX(preco_custo) as preco_max,
  AVG(preco_custo) as preco_medio,
  MIN(prazo_entrega_dias) as prazo_min,
  MAX(prazo_entrega_dias) as prazo_max
FROM v_lentes_contato
WHERE fornecedor_id IS NOT NULL
  AND ativo = true
GROUP BY fornecedor_nome, tipo_lente_contato, finalidade
ORDER BY fornecedor_nome, total DESC;

-- ✅ QUERY 8: Materiais disponíveis
-- ============================================================
SELECT 
  material_contato,
  COUNT(*) as total_produtos,
  AVG(teor_agua_percentual) as media_teor_agua,
  AVG(dk_t) as media_dk_t
FROM v_lentes_contato
WHERE material_contato IS NOT NULL
  AND ativo = true
GROUP BY material_contato
ORDER BY total_produtos DESC;

-- ✅ QUERY 9: Exemplo completo de produtos (primeiros 5)
-- ============================================================
SELECT 
  id,
  sku,
  nome_produto,
  marca_nome,
  tipo_lente_contato,
  material_contato,
  finalidade,
  fornecedor_nome,
  preco_custo,
  preco_tabela,
  prazo_entrega_dias,
  esferico_min,
  esferico_max,
  tem_protecao_uv,
  qtd_por_caixa,
  dias_uso
FROM v_lentes_contato
WHERE ativo = true
LIMIT 5;

-- ✅ QUERY 10: Busca por texto (para o filtro de busca)
-- ============================================================
SELECT 
  id,
  nome_produto,
  marca_nome,
  sku,
  fornecedor_nome,
  tipo_lente_contato,
  preco_tabela
FROM v_lentes_contato
WHERE ativo = true
  AND (
    nome_produto ILIKE '%termo_busca%'
    OR marca_nome ILIKE '%termo_busca%'
    OR sku ILIKE '%termo_busca%'
  )
ORDER BY marca_nome, nome_produto
LIMIT 20;

-- ============================================================
-- 📝 NOTAS IMPORTANTES:
-- ============================================================
-- 1. Coluna é `preco_custo` (não `preco_custo_caixa`)
-- 2. Coluna é `preco_tabela` (não `preco_venda_sugerido_caixa`)
-- 3. Coluna é `material_contato` (não `material`)
-- 4. NÃO EXISTE `design_lente` - usar `finalidade` ou inferir dos graus
-- 5. NÃO EXISTE `tem_filtro_azul`, `eh_multifocal`, `eh_torica`, `eh_cosmetica`
-- 6. Usar `cilindrico_min IS NOT NULL` para detectar tóricas
-- 7. Usar `adicao_min IS NOT NULL` para detectar multifocais
-- 8. Usar `eh_colorida` para cosméticas
-- ============================================================
