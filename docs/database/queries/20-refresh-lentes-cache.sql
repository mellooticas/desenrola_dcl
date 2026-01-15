-- =================================================================
-- 🔄 REFRESH SCHEMA CACHE - BEST LENS CATALOG
-- Executar este script no banco: Best Lens Catalog (jrhev...)
-- =================================================================

-- 1. Recarregar cache do PostgREST
NOTIFY pgrst, 'reload config';

-- 2. Garantir permissões (novamente, só para ter certeza)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.v_grupos_canonicos_completos TO anon, authenticated;

-- 3. Verificação (Opcional, apenas para log)
DO $$
BEGIN
   RAISE NOTICE 'Cache reload requested for Best Lens Database.';
END $$;
