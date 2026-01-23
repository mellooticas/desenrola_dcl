-- ============================================================================
-- APLICAR PERMISSÕES: Views para Supabase (EXECUTAR ESTE ARQUIVO)
-- ============================================================================
-- As views existem, mas faltam permissões para anon e authenticated
-- Execute estes comandos para liberar acesso ao Supabase
-- ============================================================================

-- ✅ PARTE 1: Permissões nas Views
GRANT SELECT ON public.v_fornecedores TO anon, authenticated;
GRANT SELECT ON public.v_lentes TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ✅ PARTE 2: Permissões no Schema CORE
GRANT USAGE ON SCHEMA core TO anon, authenticated;
GRANT SELECT ON core.fornecedores TO anon, authenticated;

-- ✅ PARTE 3: Permissões no Schema LENS_CATALOG
GRANT USAGE ON SCHEMA lens_catalog TO anon, authenticated;
GRANT SELECT ON lens_catalog.lentes TO anon, authenticated;
GRANT SELECT ON lens_catalog.marcas TO anon, authenticated;
GRANT SELECT ON lens_catalog.grupos_canonicos TO anon, authenticated;

-- ============================================================================
-- TESTE RÁPIDO: Verificar se funcionou
-- ============================================================================

-- Teste 1: Role anon pode acessar v_fornecedores?
SET ROLE anon;
SELECT COUNT(*) as total_fornecedores FROM public.v_fornecedores;
RESET ROLE;

-- Teste 2: Role anon pode acessar v_lentes?
SET ROLE anon;
SELECT COUNT(*) as total_lentes FROM public.v_lentes;
RESET ROLE;

-- Teste 3: Amostra de fornecedores (deve retornar dados)
SET ROLE anon;
SELECT id, nome, total_lentes FROM public.v_fornecedores ORDER BY total_lentes DESC LIMIT 3;
RESET ROLE;

-- ============================================================================
-- TESTE ADICIONAL: Buscar TODOS os fornecedores com JOIN na view de lentes
-- ============================================================================

-- Teste 4: Todos os fornecedores (contando lentes via JOIN)
SET ROLE anon;
SELECT 
  f.id,
  f.nome,
  f.razao_social,
  COUNT(DISTINCT l.id) as total_lentes_real,
  f.ativo
FROM core.fornecedores f
LEFT JOIN public.v_lentes l ON l.fornecedor_id = f.id
WHERE f.ativo = true AND f.deleted_at IS NULL
GROUP BY f.id, f.nome, f.razao_social, f.ativo
ORDER BY total_lentes_real DESC;
RESET ROLE;

| id                                   | nome                          | razao_social                                           | total_lentes_real | ativo |
| ------------------------------------ | ----------------------------- | ------------------------------------------------------ | ----------------- | ----- |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos                     | S blocos Comercio e Servios Oticos LTDA                | 1097              | true  |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux                       | Polylux Comercio de Produtos Opticos LTDA              | 158               | true  |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express                       | Lentes e Cia Express LTDA                              | 84                | true  |
| 15db4d9c-8c60-4b4d-8b8d-7cc9a5fd97e1 | Brascor                       | Brascor Distribuidora de Lentes                        | 58                | true  |
| 43721f5b-4f4a-4a75-bb34-6e8b373c5948 | Braslentes                    | Champ Brasil Comercio LTDA                             | 36                | true  |
| 199bae08-0217-4b70-b054-d3f0960b4a78 | Sygma                         | Sygma Lentes Laboratório Óptico                        | 14                | true  |
| 89c13390-fd7b-401b-9f5d-7a9c2ee87366 | CooperVision Brasil           | CooperVision do Brasil Produtos Oftalmicos LTDA        | 0                 | true  |
| 9400f665-2f93-47ba-97c5-2a2248236e6a | CooperVision Brasil           | CooperVision do Brasil Produtos Oftalmicos LTDA        | 0                 | true  |
| a725651f-79ee-4558-8f69-dc8b066b3319 | Bausch & Lomb Brasil          | Bausch & Lomb do Brasil LTDA                           | 0                 | true  |
| b01bd4fe-a383-4006-b4ec-1d397ba2c0c1 | Lentenet                      | Lentenet Distribuidora de Produtos Oftalmologicos LTDA | 0                 | true  |
| c50ea6eb-a420-4cf7-8aa2-68aaeb41ac95 | Navarro Oculos                | Navarro Distribuidora de Óculos LTDA                   | 0                 | true  |
| d88018ac-ecae-4b38-b321-94babe5f85e3 | Style                         | Style Primer Lentes Oftalmicas e Armaes                | 0                 | true  |
| d90bebaf-e552-4cf0-a226-808c91bda73a | Kaizi Oculos Solares          | Kaizi Importação e Exportação LTDA                     | 0                 | true  |
| e4a24408-3d58-4fc7-a096-cf7140f4f248 | Galeria Florencio lj11        | Galeria Florêncio Comércio de Óptica LTDA              | 0                 | true  |
| f0c192cd-1ba8-459b-a82e-b3ff049644d9 | Alcon Laboratorios do Brasil  | Alcon Laboratorios do Brasil LTDA                      | 0                 | true  |
| 14ddf79c-224a-4027-8ec9-886f17ad2820 | Bausch & Lomb Brasil          | Bausch & Lomb do Brasil LTDA                           | 0                 | true  |
| f8b6d0f7-42b5-46ff-b216-ad717ce0e8bb | Solotica                      | Solotica Lentes de Contato LTDA                        | 0                 | true  |
| 1d0b088f-dcb1-4179-9a18-5d67ce86c4b6 | Sao Paulo Acessorios          | São Paulo Acessórios LTDA                              | 0                 | true  |
| 4b2d639c-1895-4c17-8a6f-442dc8a8d046 | Johnson & Johnson Vision Care | Johnson & Johnson do Brasil Industria e Comercio LTDA  | 0                 | true  |
| 4bc166bb-e576-483f-aec1-94c95c5bc68f | Johnson & Johnson Vision Care | Johnson & Johnson do Brasil Industria e Comercio LTDA  | 0                 | true  |
| 4f4dc190-4e26-4352-a7e9-a748880d9365 | Newlens                       | Newlens Distribuidora de Lentes de Contato LTDA        | 0                 | true  |
| 7534efcc-3412-488c-abb4-d6acd670d8ec | Alcon Laboratorios do Brasil  | Alcon Laboratorios do Brasil LTDA                      | 0                 | true  |



-- Teste 5: Comparar v_fornecedores com contagem manual
SET ROLE anon;
SELECT 
  'view v_fornecedores' as fonte,
  COUNT(*) as total_fornecedores,
  SUM(total_lentes) as total_lentes
FROM public.v_fornecedores
UNION ALL
SELECT 
  'core.fornecedores (ativos)' as fonte,
  COUNT(*) as total_fornecedores,
  0 as total_lentes
FROM core.fornecedores
WHERE ativo = true AND deleted_at IS NULL;
RESET ROLE;

| fonte                      | total_fornecedores | total_lentes |
| -------------------------- | ------------------ | ------------ |
| view v_fornecedores        | 22                 | 1447         |
| core.fornecedores (ativos) | 22                 | 0            |


-- ============================================================================
-- Se os testes acima funcionarem, as views estarão acessíveis pelo Supabase!
-- ============================================================================


| id                                   | nome      | total_lentes |
| ------------------------------------ | --------- | ------------ |
| e1e1eace-11b4-4f26-9f15-620808a4a410 | So Blocos | 1097         |
| 3a0a8ad3-4c55-44a2-b9fa-232a9f2fdc21 | Polylux   | 158          |
| 8eb9498c-3d99-4d26-bb8c-e503f97ccf2c | Express   | 84           |
