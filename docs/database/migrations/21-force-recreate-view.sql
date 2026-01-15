
-- =================================================================
-- 🧨 FORÇAR RECRIAÇÃO DA VIEW E PERMISSÕES (Best Lens Catalog)
-- Execute este script no SQL Editor do banco: jrhevexrzaoeyhmpwvgs
-- =================================================================

-- 1. Derrubar a view para garantir limpeza
DROP VIEW IF EXISTS public.v_grupos_canonicos_completos;

-- 2. Recriar a View
CREATE OR REPLACE VIEW public.v_grupos_canonicos_completos AS
SELECT 
    gc.id,
    gc.nome_grupo, -- Tentativa 1: nome_grupo. Se falhar, verifique se é 'nome' ou 'titulo'
    gc.tipo_lente,
    gc.material,
    gc.indice_refracao,
    gc.preco_medio, -- Tentativa 1: preco_medio. Se falhar, tente 'preco_estimado_venda'
    (
        SELECT jsonb_agg(jsonb_build_object(
            'id', l.id,
            'nome', f.nome,
            'prazo_visao_simples', COALESCE(f.prazo_visao_simples, 0), -- CORRIGIDO: Vem de core.fornecedores (f)
            'prazo_multifocal', COALESCE(f.prazo_multifocal, 2)       -- CORRIGIDO: Vem de core.fornecedores (f)
        ))
        FROM lens_catalog.lentes l
        JOIN core.fornecedores f ON l.fornecedor_id = f.id
        WHERE l.grupo_canonico_id = gc.id
    ) AS fornecedores_disponiveis,
    (
        SELECT count(*)
        FROM lens_catalog.lentes l
        WHERE l.grupo_canonico_id = gc.id
    ) AS total_lentes,
    false AS is_premium -- Placeholder
FROM lens_catalog.grupos_canonicos gc;

-- 3. Conceder permissões EXPLÍCITAS (Essencial para API Anon)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.v_grupos_canonicos_completos TO anon, authenticated;

-- 4. Forçar o PostgREST a recarregar o cache de schema
-- Isso é crucial para corrigir o erro PGRST205
NOTIFY pgrst, 'reload config';

-- 5. Verificar se funcionou (retorna linha se ok)
SELECT count(*) as total_view FROM public.v_grupos_canonicos_completos;
