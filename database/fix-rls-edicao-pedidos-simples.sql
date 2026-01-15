-- =====================================================
-- 🔧 CORREÇÃO: RLS para Edição de Pedidos (Problema 2)
-- =====================================================
-- Problema: Edição de pedidos não está funcionando
-- Solução: Corrigir policy de UPDATE
-- =====================================================

-- 1. Remover policies antigas de UPDATE
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_emergency" ON pedidos;

-- 2. Criar policy de UPDATE mais permissiva
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- Regra 1: Usuário da mesma loja
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR 
    -- Regra 2: Gestor, DCL ou Financeiro (acesso total)
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    -- Regra 3: Usuário do laboratório vinculado
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
      WHERE id = auth.uid() AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    laboratorio_id IN (
      SELECT laboratorio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- 3. Validação: Verificar policies de UPDATE
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'pedidos' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Resultado esperado:
-- Deve ter apenas 1 policy: "pedidos_update_policy"

-- =====================================================
-- ✅ TESTES
-- =====================================================
/*
Para testar se a edição funciona:

1. Login com qualquer usuário (gestor, dcl, financeiro, loja)
2. Ir para /pedidos/[id]/editar
3. Alterar algum campo (ex: observações)
4. Clicar em "Salvar Alterações"
5. ✅ Deve salvar com sucesso
6. ✅ Toast de sucesso deve aparecer

Se ainda não funcionar, verificar:
- Console do navegador para erros
- Network tab para ver resposta da API
- Logs do Supabase
*/
