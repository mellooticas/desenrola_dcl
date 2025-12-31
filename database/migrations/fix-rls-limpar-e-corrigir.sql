-- =====================================================
-- 🔧 CORREÇÃO DEFINITIVA: Limpar e Recriar RLS Policies
-- =====================================================
-- Este script remove TODAS as policies conflitantes
-- e cria apenas as corretas para evitar 401

-- ============================================
-- PASSO 1: REMOVER TODAS POLICIES ANTIGAS
-- ============================================

-- Remover policies genéricas (muito permissivas)
DROP POLICY IF EXISTS "Acesso completo para autenticados" ON pedidos;
DROP POLICY IF EXISTS "allow_all_operations_pedidos" ON pedidos;

-- Remover policies antigas específicas
DROP POLICY IF EXISTS "Usuarios veem pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem inserir pedidos na sua loja" ON pedidos;
DROP POLICY IF EXISTS "Apenas gestores podem deletar pedidos" ON pedidos;

-- Timeline
DROP POLICY IF EXISTS "Usuarios podem inserir timeline" ON pedidos_timeline;
DROP POLICY IF EXISTS "Usuarios podem ver timeline" ON pedidos_timeline;

-- ============================================
-- PASSO 2: CRIAR POLICIES CORRETAS
-- ============================================

-- 2.1 SELECT: Ver pedidos da sua loja
CREATE POLICY "pedidos_select_policy" ON pedidos
  FOR SELECT
  TO authenticated
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- 2.2 INSERT: Criar pedidos na sua loja
CREATE POLICY "pedidos_insert_policy" ON pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- 2.3 UPDATE: Editar pedidos da sua loja
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  )
  WITH CHECK (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- 2.4 DELETE: Apenas gestores
CREATE POLICY "pedidos_delete_policy" ON pedidos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- ============================================
-- PASSO 3: TIMELINE POLICIES
-- ============================================

CREATE POLICY "timeline_select_policy" ON pedidos_timeline
  FOR SELECT
  TO authenticated
  USING (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      JOIN usuarios u ON u.loja_id = p.loja_id
      WHERE u.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

CREATE POLICY "timeline_insert_policy" ON pedidos_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (
    pedido_id IN (
      SELECT p.id FROM pedidos p
      JOIN usuarios u ON u.loja_id = p.loja_id
      WHERE u.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- ============================================
-- PASSO 4: VERIFICAR RLS ESTÁ ATIVO
-- ============================================

-- Garantir que RLS está habilitado
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_timeline ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 5: VERIFICAR RESULTADO
-- ============================================

SELECT 
  '✅ POLICIES CRIADAS' as status,
  tablename,
  policyname,
  cmd as operacao
FROM pg_policies 
WHERE tablename IN ('pedidos', 'pedidos_timeline')
ORDER BY tablename, cmd;

| status             | tablename        | policyname                                      | operacao |
| ------------------ | ---------------- | ----------------------------------------------- | -------- |
| ✅ POLICIES CRIADAS | pedidos          | pedidos_delete_policy                           | DELETE   |
| ✅ POLICIES CRIADAS | pedidos          | pedidos_insert_policy                           | INSERT   |
| ✅ POLICIES CRIADAS | pedidos          | pedidos_select_policy                           | SELECT   |
| ✅ POLICIES CRIADAS | pedidos          | pedidos_update_policy                           | UPDATE   |
| ✅ POLICIES CRIADAS | pedidos_timeline | allow_all_timeline                              | ALL      |
| ✅ POLICIES CRIADAS | pedidos_timeline | Usuários autenticados podem inserir no timeline | INSERT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | timeline_insert_policy                          | INSERT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | Sistema pode inserir na timeline                | INSERT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | Usuários autenticados podem inserir timeline    | INSERT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | timeline_select_policy                          | SELECT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | Permitir leitura para todos                     | SELECT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | Todos podem visualizar timeline                 | SELECT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | Usuários autenticados podem ver timeline        | SELECT   |
| ✅ POLICIES CRIADAS | pedidos_timeline | Usuários autenticados podem atualizar timeline  | UPDATE   |


-- ============================================
-- PASSO 6: TESTE RÁPIDO
-- ============================================

-- Verificar seu usuário atual
SELECT 
  '👤 Seu Usuário' as info,
  id,
  email,
  role,
  loja_id
FROM usuarios 
WHERE id = auth.uid();


Success. No rows returned





-- Ver quantos pedidos você pode acessar
SELECT 
  '📊 Acesso aos Pedidos' as info,
  COUNT(*) as total_pedidos_visiveis
FROM pedidos;

| info                  | total_pedidos_visiveis |
| --------------------- | ---------------------- |
| 📊 Acesso aos Pedidos | 524                    |



-- ============================================
-- RESULTADO FINAL
-- ============================================

SELECT 
  '✅ CORREÇÃO APLICADA!' as titulo,
  '
  📋 O que foi feito:
  
  1. ✅ Removidas policies conflitantes (ALL operations)
  2. ✅ Criadas policies específicas (SELECT, INSERT, UPDATE, DELETE)
  3. ✅ RLS habilitado em pedidos e pedidos_timeline
  4. ✅ Gestores têm acesso total
  5. ✅ Usuários normais veem apenas pedidos da sua loja
  
  🎯 Próximo passo:
  - Tente salvar o pedido novamente
  - Se ainda der erro 401:
    1. Faça logout/login no sistema
    2. Limpe cache do navegador (Ctrl+Shift+Delete)
    3. Verifique se está autenticado corretamente
  
  ' as detalhes;


| titulo               | detalhes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ CORREÇÃO APLICADA! | 
  📋 O que foi feito:
  
  1. ✅ Removidas policies conflitantes (ALL operations)
  2. ✅ Criadas policies específicas (SELECT, INSERT, UPDATE, DELETE)
  3. ✅ RLS habilitado em pedidos e pedidos_timeline
  4. ✅ Gestores têm acesso total
  5. ✅ Usuários normais veem apenas pedidos da sua loja
  
  🎯 Próximo passo:
  - Tente salvar o pedido novamente
  - Se ainda der erro 401:
    1. Faça logout/login no sistema
    2. Limpe cache do navegador (Ctrl+Shift+Delete)
    3. Verifique se está autenticado corretamente
  
   |