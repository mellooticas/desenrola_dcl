-- =====================================================
-- CORREÇÃO: Adicionar políticas UPDATE e INSERT para tabela pedidos
-- =====================================================
-- PROBLEMA: Usuários conseguem ver pedidos (SELECT) mas não conseguem editar (UPDATE)
-- SOLUÇÃO: Criar políticas RLS para UPDATE, INSERT e DELETE
-- Execute este script NO SUPABASE SQL EDITOR
-- Data: 2025-12-19

-- ============================================
-- VERIFICAR POLÍTICAS EXISTENTES
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operacao,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'pedidos'
ORDER BY policyname;

| schemaname | tablename | policyname                        | operacao | condicao                                                                                                                                                                                                         |
| ---------- | --------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | pedidos   | Acesso completo para autenticados | ALL      | true                                                                                                                                                                                                             |
| public     | pedidos   | Usuarios veem pedidos da sua loja | SELECT   | ((loja_id IN ( SELECT usuarios.loja_id
   FROM usuarios
  WHERE (usuarios.id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.role = 'gestor'::text))))) |
| public     | pedidos   | allow_all_operations_pedidos      | ALL      | true                                                                                                                                                                                                             |



-- ============================================
-- REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- ============================================
DROP POLICY IF EXISTS "Usuarios podem atualizar pedidos da sua loja" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem inserir pedidos na sua loja" ON pedidos;
DROP POLICY IF EXISTS "Usuarios podem deletar pedidos da sua loja" ON pedidos;

-- ============================================
-- CRIAR POLICY PARA UPDATE
-- ============================================
CREATE POLICY "Usuarios podem atualizar pedidos da sua loja" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- Permite update se o usuário pertence à mesma loja do pedido
    loja_id IN (
      SELECT loja_id 
      FROM usuarios 
      WHERE id = auth.uid()
    )
    OR
    -- OU se o usuário é gestor (vê/edita tudo)
    EXISTS (
      SELECT 1 
      FROM usuarios 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  )
  WITH CHECK (
    -- Garante que o pedido editado continua na loja do usuário
    loja_id IN (
      SELECT loja_id 
      FROM usuarios 
      WHERE id = auth.uid()
    )
    OR
    -- OU se o usuário é gestor (sem restrição)
    EXISTS (
      SELECT 1 
      FROM usuarios 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

-- ============================================
-- CRIAR POLICY PARA INSERT
-- ============================================
CREATE POLICY "Usuarios podem inserir pedidos na sua loja" ON pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Só pode inserir pedidos na loja onde está cadastrado
    loja_id IN (
      SELECT loja_id 
      FROM usuarios 
      WHERE id = auth.uid()
    )
    OR
    -- OU se for gestor (pode criar em qualquer loja)
    EXISTS (
      SELECT 1 
      FROM usuarios 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

-- ============================================
-- CRIAR POLICY PARA DELETE (OPCIONAL - APENAS GESTORES)
-- ============================================
-- Geralmente não queremos permitir DELETE, mas se necessário:
CREATE POLICY "Apenas gestores podem deletar pedidos" ON pedidos
  FOR DELETE
  TO authenticated
  USING (
    -- Somente gestores podem deletar
    EXISTS (
      SELECT 1 
      FROM usuarios 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

-- ============================================
-- GARANTIR PERMISSÕES NAS TABELAS RELACIONADAS
-- ============================================

-- Pedidos Timeline (histórico de mudanças)
DROP POLICY IF EXISTS "Usuarios podem inserir timeline" ON pedidos_timeline;
CREATE POLICY "Usuarios podem inserir timeline" ON pedidos_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permite inserir timeline se tiver acesso ao pedido
    pedido_id IN (
      SELECT p.id 
      FROM pedidos p
      JOIN usuarios u ON u.loja_id = p.loja_id
      WHERE u.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 
      FROM usuarios 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

DROP POLICY IF EXISTS "Usuarios podem ver timeline" ON pedidos_timeline;
CREATE POLICY "Usuarios podem ver timeline" ON pedidos_timeline
  FOR SELECT
  TO authenticated
  USING (
    -- Vê timeline dos pedidos da sua loja
    pedido_id IN (
      SELECT p.id 
      FROM pedidos p
      JOIN usuarios u ON u.loja_id = p.loja_id
      WHERE u.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 
      FROM usuarios 
      WHERE id = auth.uid() 
      AND role = 'gestor'
    )
  );

-- ============================================
-- VERIFICAR RESULTADO
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operacao,
  roles
FROM pg_policies 
WHERE tablename IN ('pedidos', 'pedidos_timeline')
ORDER BY tablename, cmd;

| schemaname | tablename        | policyname                                      | operacao | roles           |
| ---------- | ---------------- | ----------------------------------------------- | -------- | --------------- |
| public     | pedidos          | Acesso completo para autenticados               | ALL      | {authenticated} |
| public     | pedidos          | allow_all_operations_pedidos                    | ALL      | {public}        |
| public     | pedidos          | Apenas gestores podem deletar pedidos           | DELETE   | {authenticated} |
| public     | pedidos          | Usuarios podem inserir pedidos na sua loja      | INSERT   | {authenticated} |
| public     | pedidos          | Usuarios veem pedidos da sua loja               | SELECT   | {authenticated} |
| public     | pedidos          | Usuarios podem atualizar pedidos da sua loja    | UPDATE   | {authenticated} |
| public     | pedidos_timeline | allow_all_timeline                              | ALL      | {public}        |
| public     | pedidos_timeline | Sistema pode inserir na timeline                | INSERT   | {authenticated} |
| public     | pedidos_timeline | Usuários autenticados podem inserir no timeline | INSERT   | {authenticated} |
| public     | pedidos_timeline | Usuários autenticados podem inserir timeline    | INSERT   | {public}        |
| public     | pedidos_timeline | Usuarios podem inserir timeline                 | INSERT   | {authenticated} |
| public     | pedidos_timeline | Permitir leitura para todos                     | SELECT   | {authenticated} |
| public     | pedidos_timeline | Todos podem visualizar timeline                 | SELECT   | {public}        |
| public     | pedidos_timeline | Usuarios podem ver timeline                     | SELECT   | {authenticated} |
| public     | pedidos_timeline | Usuários autenticados podem ver timeline        | SELECT   | {authenticated} |
| public     | pedidos_timeline | Usuários autenticados podem atualizar timeline  | UPDATE   | {public}        |



-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
SELECT 
  '✅ Políticas RLS criadas com sucesso!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'pedidos';


| status                               | total_policies |
| ------------------------------------ | -------------- |
| ✅ Políticas RLS criadas com sucesso! | 6              |

