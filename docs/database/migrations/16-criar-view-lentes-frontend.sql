-- ============================================================
-- CRIAR VIEW: v_grupos_canonicos_completos no schema PUBLIC
-- ============================================================
-- View para frontend acessar grupos canônicos de lentes
-- ============================================================

-- 1️⃣ Verificar se já existe em outro schema
-- ============================================================
SELECT 
    schemaname,
    viewname
FROM pg_views
WHERE viewname LIKE '%grupo%canonico%'
ORDER BY schemaname, viewname;

-- Resultado esperado: Ver se existe em lens_catalog ou outro schema

| schemaname   | viewname                         |
| ------------ | -------------------------------- |
| lens_catalog | v_grupos_canonicos_detalhados    |
| lens_catalog | v_grupos_canonicos_detalhados_v5 |
| public       | v_filtros_grupos_canonicos       |
| public       | v_grupos_canonicos               |
| public       | v_grupos_canonicos_completos     |

-- 2️⃣ CRIAR VIEW no schema PUBLIC
-- ============================================================
CREATE OR REPLACE VIEW public.v_grupos_canonicos_completos AS
SELECT
    gc.id,
    gc.slug,
    gc.nome_grupo,
    gc.tipo_lente,
    gc.material,
    gc.indice_refracao,
    gc.tratamento_antirreflexo,
    gc.tratamento_antirrisco,
    gc.tratamento_uv,
    gc.tratamento_blue_light,
    gc.tratamento_fotossensiveis::text as tratamento_fotossensiveis,
    
    -- Contadores
    gc.total_lentes,
    gc.preco_medio,
    gc.preco_minimo,
    gc.preco_maximo,
    gc.is_premium,
    
    -- Fornecedores disponíveis (JSONB)
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', f.id,
                    'nome', f.nome,
                    'prazo', CASE 
                        WHEN gc.tipo_lente = 'visao_simples' THEN f.prazo_visao_simples
                        WHEN gc.tipo_lente = 'multifocal' THEN f.prazo_multifocal
                        ELSE f.prazo_visao_simples
                    END
                )
            )
            FROM (
                SELECT DISTINCT l.fornecedor_id
                FROM lens_catalog.lentes l
                WHERE l.grupo_canonico_id = gc.id
                  AND l.ativo = true
            ) AS lentes_fornecedores
            JOIN core.fornecedores f ON f.id = lentes_fornecedores.fornecedor_id
            WHERE f.ativo = true
        ),
        '[]'::jsonb
    ) AS fornecedores_disponiveis,
    
    -- Contagem de lentes ativas
    (
        SELECT COUNT(*)
        FROM lens_catalog.lentes l
        WHERE l.grupo_canonico_id = gc.id
          AND l.ativo = true
    ) AS lentes_ativas_count,
    
    -- Metadados
    gc.peso,
    gc.created_at,
    gc.updated_at,
    
    -- Faixas de grau
    gc.grau_esferico_min,
    gc.grau_esferico_max,
    gc.grau_cilindrico_min,
    gc.grau_cilindrico_max,
    gc.adicao_min,
    gc.adicao_max,
    
    -- Categoria
    gc.categoria_predominante::text as categoria_predominante,
    
    -- Total de marcas
    (
        SELECT COUNT(DISTINCT l.marca_id)
        FROM lens_catalog.lentes l
        WHERE l.grupo_canonico_id = gc.id
          AND l.ativo = true
          AND l.marca_id IS NOT NULL
    ) AS total_marcas

FROM lens_catalog.grupos_canonicos gc
WHERE gc.ativo = true
ORDER BY gc.preco_medio ASC;



-- 3️⃣ DAR PERMISSÕES para role anon (frontend)
-- ============================================================
GRANT SELECT ON public.v_grupos_canonicos_completos TO anon;
GRANT SELECT ON public.v_grupos_canonicos_completos TO authenticated;



-- 4️⃣ TESTAR a view
-- ============================================================
SELECT 
    id,
    nome_grupo,
    tipo_lente,
    material,
    preco_medio,
    fornecedores_disponiveis,
    total_lentes
FROM public.v_grupos_canonicos_completos
LIMIT 3;

-- Deve retornar 3 grupos canônicos com todos os campos



-- 5️⃣ VERIFICAR permissões
-- ============================================================
SELECT 
    grantee, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'v_grupos_canonicos_completos';

-- Deve mostrar: anon e authenticated com SELECT



-- ============================================================
-- 📝 COMENTÁRIOS
-- ============================================================
COMMENT ON VIEW public.v_grupos_canonicos_completos IS 
'View pública para frontend acessar catálogo de 461 grupos canônicos de lentes. Inclui fornecedores disponíveis (array JSON) para cada grupo.';
