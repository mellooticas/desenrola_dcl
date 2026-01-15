-- =====================================================
-- 🔧 FIX TEMPORÁRIO: Policy Permissiva para Testes
-- =====================================================
-- ⚠️ ATENÇÃO: Esta policy é MUITO permissiva
-- Use apenas em DESENVOLVIMENTO para testar
-- =====================================================

BEGIN;

-- 1. Remover policy restritiva atual
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;

-- 2. Criar policy TEMPORÁRIA super permissiva
-- Qualquer usuário autenticado pode editar qualquer pedido
CREATE POLICY "pedidos_update_policy_temp" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (true)  -- ⚠️ Permite ver qualquer registro
  WITH CHECK (true);  -- ⚠️ Permite atualizar para qualquer valor

-- 3. Validar
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos' 
  AND cmd = 'UPDATE';

COMMIT;


| policyname                 | cmd    | qual | with_check |
| -------------------------- | ------ | ---- | ---------- |
| pedidos_update_policy_temp | UPDATE | true | true       |


-- =====================================================
-- ✅ TESTE NO FRONTEND
-- =====================================================
/*
1. Faça logout e login novamente
2. Tente editar um pedido
3. Se funcionar, o problema É a policy mesmo
4. Depois execute o script FIX-RLS-UPDATE-PRODUCTION.sql
   para voltar a policy segura
*/
