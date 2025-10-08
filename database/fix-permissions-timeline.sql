-- ================================================================
-- FIX: Permissões da tabela pedidos_timeline
-- PROBLEMA: Usuários não conseguem avançar status (erro 42501)
-- CAUSA: Falta permissão INSERT em pedidos_timeline
-- ================================================================

-- 1. Dar permissão de SELECT, INSERT, UPDATE para authenticated users
GRANT SELECT, INSERT, UPDATE ON TABLE public.pedidos_timeline TO authenticated;

-- 2. Dar permissão de uso na sequence (se existir)
GRANT USAGE ON SEQUENCE pedidos_timeline_id_seq TO authenticated;

-- 3. Verificar se a política RLS está ativa
ALTER TABLE public.pedidos_timeline ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para permitir INSERT de qualquer usuário autenticado
DROP POLICY IF EXISTS "Usuários autenticados podem inserir no timeline" ON public.pedidos_timeline;
CREATE POLICY "Usuários autenticados podem inserir no timeline"
ON public.pedidos_timeline
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Criar política para permitir SELECT de qualquer usuário autenticado
DROP POLICY IF EXISTS "Usuários autenticados podem ver timeline" ON public.pedidos_timeline;
CREATE POLICY "Usuários autenticados podem ver timeline"
ON public.pedidos_timeline
FOR SELECT
TO authenticated
USING (true);

-- 6. Verificar permissões da função alterar_status_pedido
-- A função deve ter SECURITY DEFINER ou permissões adequadas
-- Execute este comando manualmente se necessário:
-- ALTER FUNCTION alterar_status_pedido(uuid, text, text, text) SECURITY DEFINER;

-- ================================================================
-- TESTE RÁPIDO
-- ================================================================
-- Após executar este SQL, teste no Supabase SQL Editor:
-- 
-- SELECT * FROM pg_policies WHERE tablename = 'pedidos_timeline';
-- 
-- Deve mostrar as políticas criadas acima
-- ================================================================
