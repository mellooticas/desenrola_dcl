-- Verificar se a view v_lentes_contato existe e quantas lentes temos
SELECT 
  COUNT(*) as total_lentes,
  COUNT(DISTINCT fornecedor_id) as total_fornecedores,
  COUNT(DISTINCT marca_nome) as total_marcas
FROM public.v_lentes_contato;

-- Listar fornecedores de lentes de contato
SELECT 
  fornecedor_id,
  fornecedor_nome,
  COUNT(*) as total_produtos
FROM public.v_lentes_contato
GROUP BY fornecedor_id, fornecedor_nome
ORDER BY total_produtos DESC;

-- Listar tipos de lentes disponíveis
SELECT 
  tipo_lente_contato,
  design_lente,
  COUNT(*) as total_produtos
FROM public.v_lentes_contato
GROUP BY tipo_lente_contato, design_lente
ORDER BY total_produtos DESC;
