-- =====================================================
-- 🔧 FIX PRODUÇÃO: Policy Segura para UPDATE
-- =====================================================
-- Execute DEPOIS de testar com a policy temporária
-- Esta é a versão SEGURA para produção
-- =====================================================

BEGIN;

-- 1. Remover policy temporária
DROP POLICY IF EXISTS "pedidos_update_policy_temp" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;

-- 2. Criar policy SEGURA
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- REGRA 1: Roles privilegiados podem TUDO
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    -- REGRA 2: Usuário da mesma loja
    loja_id IN (
      SELECT loja_id FROM usuarios 
      WHERE id = auth.uid() 
        AND loja_id IS NOT NULL
    )
  )
  WITH CHECK (
    -- Garante que não muda para loja sem acesso
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    loja_id IN (
      SELECT loja_id FROM usuarios 
      WHERE id = auth.uid()
        AND loja_id IS NOT NULL
    )
  );

-- 3. Validar
SELECT 
  policyname,
  cmd,
  permissive,
  CASE 
    WHEN qual::text LIKE '%true%' THEN '⚠️ MUITO PERMISSIVA'
    WHEN qual::text LIKE '%role%' THEN '✅ Baseada em roles'
    ELSE '✅ Segura'
  END as nivel_seguranca
FROM pg_policies 
WHERE tablename = 'pedidos' 
  AND cmd = 'UPDATE';

COMMIT;

-- =====================================================
-- ✅ PRONTO PARA PRODUÇÃO
-- =====================================================
