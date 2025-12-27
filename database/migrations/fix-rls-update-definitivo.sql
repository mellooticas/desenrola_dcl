-- =====================================================
-- 🔧 CORREÇÃO DEFINITIVA: RLS para Edição de Pedidos
-- =====================================================

-- 1. Remover policies antigas de UPDATE que podem estar bloqueando
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;

-- 2. Criar Policy de UPDATE mais permissiva e correta
-- Permite update se:
-- a) O usuário pertence à mesma loja do pedido
-- b) O usuário é gestor
-- c) O usuário é do laboratório vinculado ao pedido (opcional, mas útil)

CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- Regra 1: Usuário da mesma loja
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    -- Regra 2: Gestor (acesso total)
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
    OR
    -- Regra 3: Usuário do laboratório vinculado (se aplicável)
    laboratorio_id IN (
      SELECT laboratorio_id FROM usuarios WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Garante que o usuário não mude a loja do pedido para uma que ele não tem acesso
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
    OR
    laboratorio_id IN (
      SELECT laboratorio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- 3. Garantir permissões na tabela pedidos_timeline (para o log de alterações)
DROP POLICY IF EXISTS "timeline_insert_policy" ON pedidos_timeline;

CREATE POLICY "timeline_insert_policy" ON pedidos_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permite inserir timeline se tiver acesso ao pedido
    pedido_id IN (
      SELECT id FROM pedidos WHERE 
        loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'gestor')
        OR laboratorio_id IN (SELECT laboratorio_id FROM usuarios WHERE id = auth.uid())
    )
  );

-- 4. Forçar atualização do cache de permissões
NOTIFY pgrst, 'reload schema';
