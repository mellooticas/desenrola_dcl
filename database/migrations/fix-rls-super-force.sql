-- =====================================================
-- ☢️ CORREÇÃO NUCLEAR: Forçar Permissões de Edição
-- =====================================================

-- 1. Garantir que RLS está ATIVO
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 2. Garantir permissões de nível de tabela (GRANTs)
GRANT ALL ON public.pedidos TO postgres;
GRANT ALL ON public.pedidos TO anon;
GRANT ALL ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;

-- 3. Remover TODAS as policies existentes da tabela pedidos
-- (Isso limpa qualquer regra antiga que possa estar conflitando)
DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'pedidos' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pedidos', pol.policyname); 
    END LOOP; 
END $$;

-- 4. Criar Policy UNIVERSAL (Permite TUDO para usuários logados)
CREATE POLICY "policy_universal_pedidos" ON public.pedidos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Criar Policy de Leitura para Anonimos (caso necessário para debug)
CREATE POLICY "policy_anon_select_pedidos" ON public.pedidos
  FOR SELECT
  TO anon
  USING (true);

-- 6. Repetir para a tabela de Timeline
ALTER TABLE public.pedidos_timeline ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.pedidos_timeline TO authenticated;

DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'pedidos_timeline' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pedidos_timeline', pol.policyname); 
    END LOOP; 
END $$;

CREATE POLICY "policy_universal_timeline" ON public.pedidos_timeline
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Recarregar schema
NOTIFY pgrst, 'reload schema';
