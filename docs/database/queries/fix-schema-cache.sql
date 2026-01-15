-- O erro PGRST205 indica que a API (PostgREST) não atualizou o cache de schema.
-- Execute este comando para forçar a atualização:

NOTIFY pgrst, 'reload config';

-- Se isso não funcionar, verifique se a view está acessível para a role 'anon':
GRANT SELECT ON public.v_grupos_canonicos_completos TO anon;
GRANT SELECT ON public.v_grupos_canonicos_completos TO service_role;
GRANT SELECT ON public.v_grupos_canonicos_completos TO authenticated;
