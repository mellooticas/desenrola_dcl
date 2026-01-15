-- =====================================================
-- 🔧 CORREÇÃO DEFINITIVA: RLS UPDATE para Pedidos
-- =====================================================
-- Problema: Erro "Nenhum registro foi atualizado" ao editar
-- Causa: Policy de UPDATE muito restritiva ou inexistente
-- Solução: Recriar policy com lógica correta
-- =====================================================

-- ⚠️ IMPORTANTE: Execute o DIAGNOSTICO-RLS-EDICAO.sql ANTES
-- para entender o problema específico da sua instalação

BEGIN;

-- 1. Limpar TODAS as policies de UPDATE antigas
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_emergency" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update" ON pedidos;
DROP POLICY IF EXISTS "update_pedidos" ON pedidos;

-- 2. Criar policy de UPDATE DEFINITIVA
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- REGRA 1: Roles privilegiados (gestor, dcl, financeiro) podem TUDO
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    -- REGRA 2: Usuário da mesma loja (role 'loja')
    (
      loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
          AND role = 'loja'
      )
    )
  )
  WITH CHECK (
    -- WITH CHECK: Garante que não podem mudar para loja/lab que não têm acesso
    
    -- Roles privilegiados podem mudar qualquer coisa
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
        AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    -- Usuários de loja só podem manter na mesma loja
    (
      loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() 
          AND role = 'loja'
      )
    )
  );

-- 3. Garantir que RLS está habilitado
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- 4. Garantir permissões básicas
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO authenticated;
GRANT SELECT ON pedidos TO anon;

COMMIT;

-- =====================================================
-- ✅ VALIDAÇÃO: Testar a policy
-- =====================================================

-- Teste 1: Verificar que a policy foi criada
SELECT 
  policyname,
  cmd,
  permissive,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING definido'
    ELSE 'USING vazio'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK definido'
    ELSE 'WITH CHECK vazio'
  END as with_check_status
FROM pg_policies 
WHERE tablename = 'pedidos' 
  AND cmd = 'UPDATE';

-- Teste 2: Seu usuário
SELECT 
  id,
  email,
  role,
  loja_id,
  CASE 
    WHEN role IN ('gestor', 'dcl', 'financeiro') THEN '✅ Acesso TOTAL'
    WHEN role = 'loja' AND loja_id IS NOT NULL THEN '✅ Acesso à loja ' || loja_id
    ELSE '❌ SEM ACESSO'
  END as nivel_acesso
FROM usuarios
WHERE id = auth.uid();

-- Teste 3: Tentar UPDATE simulado (não vai executar, só validar)
EXPLAIN (ANALYZE false, VERBOSE true) 
UPDATE pedidos 
SET observacoes = 'Teste de edição'
WHERE id = (SELECT id FROM pedidos LIMIT 1);

-- =====================================================
-- 🎯 RESULTADO ESPERADO
-- =====================================================
/*
Após executar este script:

1. ✅ Policy "pedidos_update_policy" criada com USING e WITH CHECK
2. ✅ Seu usuário aparece com "Acesso TOTAL" ou "Acesso à loja X"
3. ✅ EXPLAIN mostra que a policy está ativa

TESTE NO FRONTEND:
1. Faça logout e login novamente
2. Vá em /pedidos/[id]/editar
3. Altere um campo
4. Clique em Salvar
5. Deve aparecer: "Pedido atualizado com sucesso!"

Se ainda der erro:
- Execute SELECT * FROM usuarios WHERE id = auth.uid();
- Verifique se o usuário tem role adequado
- Verifique se loja_id do pedido bate com loja_id do usuário
*/
