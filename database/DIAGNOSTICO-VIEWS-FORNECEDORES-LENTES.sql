-- ============================================================================
-- DIAGNÓSTICO E CORREÇÃO: Views de Fornecedores e Lentes
-- ============================================================================
-- Objetivo: Verificar se as views existem e configurar permissões para Supabase
-- Data: 23/01/2026
-- ============================================================================

-- ============================================================================
-- PARTE 1: DIAGNÓSTICO - Verificar se as views existem
-- ============================================================================

-- 1.1 - Verificar se v_fornecedores existe
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname IN ('v_fornecedores', 'v_lentes', 'vw_lentes_catalogo')
ORDER BY schemaname, viewname;


| schemaname | viewname       | viewowner | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | -------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | v_fornecedores | postgres  |  SELECT f.id,
    f.nome,
    f.razao_social,
    f.cnpj,
    f.prazo_visao_simples,
    f.prazo_multifocal,
    f.prazo_surfacada,
    f.prazo_free_form,
        CASE
            WHEN (f.prazo_visao_simples <= 3) THEN 'express'::text
            WHEN (f.prazo_visao_simples <= 7) THEN 'normal'::text
            ELSE 'economico'::text
        END AS badge_prazo,
    count(DISTINCT l.id) AS total_lentes,
    count(DISTINCT l.marca_id) AS total_marcas,
    min(l.preco_venda_sugerido) AS preco_minimo,
    max(l.preco_venda_sugerido) AS preco_maximo,
    round(avg(l.preco_venda_sugerido), 2) AS preco_medio,
    count(*) FILTER (WHERE (l.tipo_lente = 'visao_simples'::lens_catalog.tipo_lente)) AS total_visao_simples,
    count(*) FILTER (WHERE (l.tipo_lente = 'multifocal'::lens_catalog.tipo_lente)) AS total_multifocal,
    count(*) FILTER (WHERE (l.tipo_lente = 'bifocal'::lens_catalog.tipo_lente)) AS total_bifocal,
    count(*) FILTER (WHERE (l.tratamento_antirreflexo = true)) AS total_com_ar,
    count(*) FILTER (WHERE (l.tratamento_blue_light = true)) AS total_com_blue,
    count(*) FILTER (WHERE ((l.tratamento_fotossensiveis IS NOT NULL) AND (l.tratamento_fotossensiveis <> 'nenhum'::lens_catalog.tratamento_foto))) AS total_fotossensiveis,
    ((f.frete_config -> 'contato'::text) ->> 'email'::text) AS email_contato,
    ((f.frete_config -> 'contato'::text) ->> 'telefone'::text) AS telefone_contato,
    jsonb_build_object('tipo', (f.frete_config ->> 'tipo'::text), 'frete_gratis_acima', (f.frete_config ->> 'frete_gratis_acima'::text), 'taxa_fixa', (f.frete_config ->> 'taxa_fixa'::text)) AS config_frete,
    f.ativo,
    f.created_at,
    f.deleted_at
   FROM (core.fornecedores f
     LEFT JOIN lens_catalog.lentes l ON (((l.fornecedor_id = f.id) AND (l.ativo = true))))
  WHERE ((f.ativo = true) AND (f.deleted_at IS NULL))
  GROUP BY f.id, f.nome, f.razao_social, f.cnpj, f.prazo_visao_simples, f.prazo_multifocal, f.prazo_surfacada, f.prazo_free_form, f.frete_config, f.ativo, f.created_at, f.deleted_at
  ORDER BY f.prazo_visao_simples, f.nome; |
| public     | v_lentes       | postgres  |  SELECT l.id,
    l.slug,
    l.sku_fornecedor,
    l.codigo_original,
    l.nome_lente,
    l.nome_canonizado,
    l.nome_comercial,
    l.fornecedor_id,
    f.nome AS fornecedor_nome,
    f.razao_social AS fornecedor_razao_social,
    f.cnpj AS fornecedor_cnpj,
    l.marca_id,
    m.nome AS marca_nome,
    m.slug AS marca_slug,
    m.is_premium AS marca_premium,
    l.grupo_canonico_id,
    gc.nome_grupo AS grupo_nome,
    gc.slug AS grupo_slug,
    l.tipo_lente,
    l.categoria,
    l.material,
    l.indice_refracao,
    l.linha_produto,
    l.diametro,
    l.espessura_central,
    l.peso_aproximado AS peso,
    l.esferico_min AS grau_esferico_min,
    l.esferico_max AS grau_esferico_max,
    l.cilindrico_min AS grau_cilindrico_min,
    l.cilindrico_max AS grau_cilindrico_max,
    l.adicao_min,
    l.adicao_max,
    l.dnp_min,
    l.dnp_max,
    l.ar AS tem_ar,
    l.antirrisco AS tem_antirrisco,
    l.blue AS tem_blue,
    l.uv400 AS tem_uv,
    l.fotossensivel AS tratamento_foto,
    l.polarizado AS tem_polarizado,
    l.hidrofobico AS tem_hidrofobico,
    l.preco_custo,
    l.preco_venda_sugerido,
    l.preco_fabricante,
    COALESCE(l.prazo_entrega, l.lead_time_dias,
        CASE l.tipo_lente
            WHEN 'visao_simples'::lens_catalog.tipo_lente THEN COALESCE(f.prazo_visao_simples, 7)
            WHEN 'multifocal'::lens_catalog.tipo_lente THEN COALESCE(f.prazo_multifocal, 10)
            WHEN 'bifocal'::lens_catalog.tipo_lente THEN COALESCE(f.prazo_multifocal, 10)
            ELSE 7
        END) AS prazo_dias,
    l.ativo,
    l.destaque,
    l.created_at,
    l.updated_at
   FROM (((lens_catalog.lentes l
     LEFT JOIN core.fornecedores f ON ((f.id = l.fornecedor_id)))
     LEFT JOIN lens_catalog.marcas m ON ((m.id = l.marca_id)))
     LEFT JOIN lens_catalog.grupos_canonicos gc ON ((gc.id = l.grupo_canonico_id)))
  WHERE (l.ativo = true)
  ORDER BY l.preco_venda_sugerido, l.nome_lente;                                                                                                                                            |



-- 1.2 - Verificar permissões atuais nas views
SELECT 
  schemaname,
  tablename as viewname,
  tableowner,
  array_agg(DISTINCT privilege_type) as privileges,
  array_agg(DISTINCT grantee) as roles_com_acesso
FROM information_schema.table_privileges
WHERE schemaname = 'public'
  AND tablename IN ('v_fornecedores', 'v_lentes', 'vw_lentes_catalogo')
GROUP BY schemaname, tablename, tableowner;

Error: Failed to run sql query: ERROR: 42703: column "schemaname" does not exist LINE 5: schemaname, ^





-- 1.3 - Verificar se roles anon e authenticated existem
SELECT rolname, rolcanlogin, rolsuper
FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'authenticator')
ORDER BY rolname;


| rolname       | rolcanlogin | rolsuper |
| ------------- | ----------- | -------- |
| anon          | false       | false    |
| authenticated | false       | false    |
| authenticator | true        | false    |

-- ============================================================================
-- PARTE 2: GARANTIR PERMISSÕES PARA SUPABASE
-- ============================================================================

-- 2.1 - GRANT SELECT para roles do Supabase em v_fornecedores
GRANT SELECT ON public.v_fornecedores TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2.2 - GRANT SELECT para roles do Supabase em v_lentes
GRANT SELECT ON public.v_lentes TO anon, authenticated;

-- 2.3 - GRANT SELECT para roles do Supabase em vw_lentes_catalogo (fallback)
GRANT SELECT ON public.vw_lentes_catalogo TO anon, authenticated;

-- 2.4 - Garantir acesso ao schema core (onde está a tabela fornecedores)
GRANT USAGE ON SCHEMA core TO anon, authenticated;
GRANT SELECT ON core.fornecedores TO anon, authenticated;

-- 2.5 - Garantir acesso ao schema lens_catalog
GRANT USAGE ON SCHEMA lens_catalog TO anon, authenticated;
GRANT SELECT ON lens_catalog.lentes TO anon, authenticated;
GRANT SELECT ON lens_catalog.marcas TO anon, authenticated;
GRANT SELECT ON lens_catalog.grupos_canonicos TO anon, authenticated;

-- ============================================================================
-- PARTE 3: VERIFICAR SE GRANT FUNCIONOU
-- ============================================================================

-- 3.1 - Testar se anon pode acessar v_fornecedores
SET ROLE anon;
SELECT COUNT(*) as total_fornecedores FROM public.v_fornecedores;
RESET ROLE;

-- 3.2 - Testar se anon pode acessar v_lentes
SET ROLE anon;
SELECT COUNT(*) as total_lentes FROM public.v_lentes LIMIT 1;
RESET ROLE;

-- 3.3 - Testar se anon pode acessar vw_lentes_catalogo
SET ROLE anon;
SELECT COUNT(*) as total_lentes_catalogo FROM public.vw_lentes_catalogo LIMIT 1;
RESET ROLE;

-- ============================================================================
-- PARTE 4: SE AS VIEWS NÃO EXISTIREM, CRIAR AQUI
-- ============================================================================

-- 4.1 - Criar v_fornecedores (caso não exista)
CREATE OR REPLACE VIEW public.v_fornecedores AS
SELECT 
  f.id,
  f.nome,
  f.razao_social,
  f.cnpj,
  f.prazo_visao_simples,
  f.prazo_multifocal,
  f.prazo_surfacada,
  f.prazo_free_form,
  CASE
    WHEN f.prazo_visao_simples <= 3 THEN 'express'::text
    WHEN f.prazo_visao_simples <= 7 THEN 'normal'::text
    ELSE 'economico'::text
  END AS badge_prazo,
  COUNT(DISTINCT l.id) AS total_lentes,
  COUNT(DISTINCT l.marca_id) AS total_marcas,
  MIN(l.preco_venda_sugerido) AS preco_minimo,
  MAX(l.preco_venda_sugerido) AS preco_maximo,
  ROUND(AVG(l.preco_venda_sugerido), 2) AS preco_medio,
  COUNT(*) FILTER (WHERE l.tipo_lente = 'visao_simples'::lens_catalog.tipo_lente) AS total_visao_simples,
  COUNT(*) FILTER (WHERE l.tipo_lente = 'multifocal'::lens_catalog.tipo_lente) AS total_multifocal,
  COUNT(*) FILTER (WHERE l.tipo_lente = 'bifocal'::lens_catalog.tipo_lente) AS total_bifocal,
  COUNT(*) FILTER (WHERE l.tratamento_antirreflexo = true) AS total_com_ar,
  COUNT(*) FILTER (WHERE l.tratamento_blue_light = true) AS total_com_blue,
  COUNT(*) FILTER (WHERE l.tratamento_fotossensiveis IS NOT NULL AND l.tratamento_fotossensiveis <> 'nenhum'::lens_catalog.tratamento_foto) AS total_fotossensiveis,
  (f.frete_config -> 'contato'::text) ->> 'email'::text AS email_contato,
  (f.frete_config -> 'contato'::text) ->> 'telefone'::text AS telefone_contato,
  jsonb_build_object(
    'tipo', f.frete_config ->> 'tipo'::text,
    'frete_gratis_acima', f.frete_config ->> 'frete_gratis_acima'::text,
    'taxa_fixa', f.frete_config ->> 'taxa_fixa'::text
  ) AS config_frete,
  f.ativo,
  f.created_at,
  f.deleted_at
FROM core.fornecedores f
LEFT JOIN lens_catalog.lentes l ON l.fornecedor_id = f.id AND l.ativo = true
WHERE f.ativo = true AND f.deleted_at IS NULL
GROUP BY f.id, f.nome, f.razao_social, f.cnpj, 
         f.prazo_visao_simples, f.prazo_multifocal, 
         f.prazo_surfacada, f.prazo_free_form,
         f.frete_config, f.ativo, f.created_at, f.deleted_at
ORDER BY f.prazo_visao_simples, f.nome;

-- 4.2 - Criar v_lentes (caso não exista)
CREATE OR REPLACE VIEW public.v_lentes AS
SELECT
  l.id,
  l.slug,
  l.sku_fornecedor,
  l.codigo_original,
  l.nome_lente,
  l.nome_canonizado,
  l.nome_comercial,
  l.fornecedor_id,
  f.nome AS fornecedor_nome,
  f.razao_social AS fornecedor_razao_social,
  f.cnpj AS fornecedor_cnpj,
  l.marca_id,
  m.nome AS marca_nome,
  m.slug AS marca_slug,
  m.is_premium AS marca_premium,
  l.grupo_canonico_id,
  gc.nome_grupo AS grupo_nome,
  gc.slug AS grupo_slug,
  l.tipo_lente,
  l.categoria,
  l.material,
  l.indice_refracao,
  l.linha_produto,
  l.diametro,
  l.espessura_central,
  l.peso_aproximado AS peso,
  l.esferico_min AS grau_esferico_min,
  l.esferico_max AS grau_esferico_max,
  l.cilindrico_min AS grau_cilindrico_min,
  l.cilindrico_max AS grau_cilindrico_max,
  l.adicao_min,
  l.adicao_max,
  l.dnp_min,
  l.dnp_max,
  l.ar AS tem_ar,
  l.antirrisco AS tem_antirrisco,
  l.blue AS tem_blue,
  l.uv400 AS tem_uv,
  l.fotossensivel AS tratamento_foto,
  l.polarizado AS tem_polarizado,
  l.hidrofobico AS tem_hidrofobico,
  l.preco_custo,
  l.preco_venda_sugerido,
  l.preco_fabricante,
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

-- 4.3 - Aplicar permissões nas views recém-criadas
GRANT SELECT ON public.v_fornecedores TO anon, authenticated;
GRANT SELECT ON public.v_lentes TO anon, authenticated;

-- ============================================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ============================================================================

-- 5.1 - Listar todas as views públicas disponíveis
SELECT 
  schemaname,
  viewname,
  'SELECT COUNT(*) FROM ' || schemaname || '.' || viewname as query_teste
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE '%fornecedor%' OR viewname LIKE '%lente%'
ORDER BY viewname;

-- 5.2 - Teste de contagem
SELECT 
  'v_fornecedores' as view_name,
  (SELECT COUNT(*) FROM public.v_fornecedores) as total_registros
UNION ALL
SELECT 
  'v_lentes' as view_name,
  (SELECT COUNT(*) FROM public.v_lentes LIMIT 1) as total_registros
UNION ALL
SELECT 
  'vw_lentes_catalogo' as view_name,
  (SELECT COUNT(*) FROM public.vw_lentes_catalogo LIMIT 1) as total_registros;

-- 5.3 - Amostra de dados de v_fornecedores
SELECT 
  id,
  nome,
  razao_social,
  total_lentes,
  badge_prazo
FROM public.v_fornecedores
ORDER BY total_lentes DESC
LIMIT 5;

-- 5.4 - Amostra de dados de v_lentes
SELECT 
  id,
  nome_lente,
  fornecedor_nome,
  marca_nome,
  tipo_lente,
  material,
  indice_refracao,
  preco_venda_sugerido,
  prazo_dias
FROM public.v_lentes
LIMIT 5;
