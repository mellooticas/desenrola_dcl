-- ============================================================
-- GRANTS - Permissões para as Views e Funções
-- Data: 20/12/2025
-- Descrição: Libera acesso para usuários anon e authenticated
-- ============================================================

-- View v_pedidos_kanban
GRANT SELECT ON public.v_pedidos_kanban TO anon;
GRANT SELECT ON public.v_pedidos_kanban TO authenticated;

-- View v_kanban_colunas
GRANT SELECT ON public.v_kanban_colunas TO anon;
GRANT SELECT ON public.v_kanban_colunas TO authenticated;

-- Função calcular_margem_lente
GRANT EXECUTE ON FUNCTION public.calcular_margem_lente() TO anon;
GRANT EXECUTE ON FUNCTION public.calcular_margem_lente() TO authenticated;

-- Comentários
COMMENT ON VIEW public.v_pedidos_kanban IS 'View do Kanban com permissões para anon e authenticated';
COMMENT ON VIEW public.v_kanban_colunas IS 'View de colunas do Kanban com permissões para anon e authenticated';
