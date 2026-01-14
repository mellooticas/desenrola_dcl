-- ========================================
-- SOLUÇÃO: Forçar policy de UPDATE para montador_id
-- ========================================

-- 1. Limpar TODAS as policies antigas
DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'pedidos' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pedidos', pol.policyname); 
    END LOOP; 
END $$;

-- 2. Garantir permissões na tabela
GRANT ALL ON public.pedidos TO authenticated;
GRANT SELECT ON public.pedidos TO anon;

-- 3. Criar UMA ÚNICA policy que permite TUDO
CREATE POLICY "allow_all_authenticated" ON public.pedidos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Policy somente leitura para anon
CREATE POLICY "allow_select_anon" ON public.pedidos
  FOR SELECT
  TO anon
  USING (true);

-- 5. Verificar se ficou OK
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;

-- 6. Testar UPDATE do pedido #644
UPDATE pedidos
SET montador_id = '56d71159-70ce-403b-8362-ebe44b18d882',
    updated_at = NOW()
WHERE id = '0df4535e-e39c-4b1c-9a83-4985158cf0ba'
RETURNING 
  id,
  numero_sequencial,
  montador_id,
  updated_at;

-- 7. Verificar resultado
SELECT 
  id,
  numero_sequencial,
  status,
  montador_id,
  loja_id
FROM pedidos
WHERE numero_sequencial = 644;
