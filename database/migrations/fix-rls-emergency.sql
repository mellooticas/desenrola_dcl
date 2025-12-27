-- CORREÇÃO DE EMERGÊNCIA: Desbloquear Edição
-- Execute isso no SQL Editor do Supabase

-- 1. Remover policies antigas de UPDATE
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "allow_all_operations_pedidos" ON pedidos;

-- 2. Criar Policy SIMPLES e PERMISSIVA para UPDATE
-- Permite que qualquer usuário logado edite pedidos
-- (Depois restringiremos novamente, mas precisamos garantir que funcione agora)
CREATE POLICY "pedidos_update_emergency" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Garantir permissões na timeline também
DROP POLICY IF EXISTS "timeline_insert_policy" ON pedidos_timeline;
CREATE POLICY "timeline_insert_emergency" ON pedidos_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Recarregar schema
NOTIFY pgrst, 'reload schema';
