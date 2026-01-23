-- ============================================================
-- CRIAR VIEW DE FORNECEDORES NO SCHEMA PUBLIC
-- ============================================================
-- Este script cria uma view no schema public para expor os fornecedores
-- via Supabase REST API. O Supabase só expõe schemas 'public' e 'graphql_public'
--
-- Data: 2026-01-23
-- Relacionado: Issue PGRST106 - Schema access via REST API
-- ============================================================

-- Criar view de fornecedores no schema public
CREATE OR REPLACE VIEW public.v_fornecedores AS
SELECT 
  f.id,
  f.nome,
  f.razao_social,
  f.ativo,
  f.created_at,
  f.updated_at,
  COUNT(l.id) as total_lentes
FROM core.fornecedores f
LEFT JOIN lens_catalog.lentes l ON l.fornecedor_id = f.id AND l.ativo = true
WHERE f.ativo = true
GROUP BY f.id, f.nome, f.razao_social, f.ativo, f.created_at, f.updated_at
ORDER BY f.nome;

-- Garantir permissões
GRANT SELECT ON public.v_fornecedores TO anon;
GRANT SELECT ON public.v_fornecedores TO authenticated;

-- Comentar a view
COMMENT ON VIEW public.v_fornecedores IS 'View de fornecedores ativos com contagem de lentes - exposta via Supabase REST API';

-- ============================================================
-- TESTAR A VIEW
-- ============================================================

-- Teste 1: Ver todos os fornecedores com lentes
SELECT 
  nome,
  razao_social,
  total_lentes
FROM public.v_fornecedores
ORDER BY total_lentes DESC;

-- Resultado esperado:
-- So Blocos: 1097 lentes
-- Polylux: 158 lentes  
-- Express: 84 lentes

-- Teste 2: Verificar permissões da view
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'v_fornecedores';

-- Resultado esperado:
-- anon: SELECT
-- authenticated: SELECT
