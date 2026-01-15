-- ============================================================================
-- CORRIGIR PERMISSÕES RLS DA TABELA PEDIDO_EVENTOS
-- ============================================================================
-- Problema: "permission denied for table pedido_eventos" ao mover pedidos
-- Solução: Configurar RLS policies corretas para a tabela
-- ============================================================================

-- 1. Habilitar RLS se não estiver ativo
ALTER TABLE pedido_eventos ENABLE ROW LEVEL SECURITY;

-- 2. Remover policies antigas que podem estar conflitando
DROP POLICY IF EXISTS "Usuários podem ver seus eventos" ON pedido_eventos;
DROP POLICY IF EXISTS "Sistema pode inserir eventos" ON pedido_eventos;
DROP POLICY IF EXISTS "Permitir INSERT para authenticated" ON pedido_eventos;
DROP POLICY IF EXISTS "Permitir SELECT para authenticated" ON pedido_eventos;

-- 3. Criar policies novas e corretas

-- Policy para SELECT (leitura)
CREATE POLICY "Todos authenticated podem ler pedido_eventos"
ON pedido_eventos
FOR SELECT
TO authenticated
USING (true);

-- Policy para INSERT (escrita) - necessária quando o código cria eventos
CREATE POLICY "Todos authenticated podem inserir pedido_eventos"
ON pedido_eventos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy para UPDATE (atualização) - caso necessário
CREATE POLICY "Todos authenticated podem atualizar pedido_eventos"
ON pedido_eventos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy para DELETE (remoção) - caso necessário
CREATE POLICY "Todos authenticated podem deletar pedido_eventos"
ON pedido_eventos
FOR DELETE
TO authenticated
USING (true);

-- 4. Garantir GRANTs básicos
GRANT SELECT, INSERT, UPDATE, DELETE ON pedido_eventos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pedido_eventos TO anon;

-- 5. Verificar se funcionou
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedido_eventos'
ORDER BY policyname;


| tablename      | policyname                                         | permissive | roles           | cmd    | qual | with_check |
| -------------- | -------------------------------------------------- | ---------- | --------------- | ------ | ---- | ---------- |
| pedido_eventos | Acesso completo para autenticados                  | PERMISSIVE | {authenticated} | ALL    | true | null       |
| pedido_eventos | Allow all pedido_eventos                           | PERMISSIVE | {public}        | ALL    | true | null       |
| pedido_eventos | Todos authenticated podem atualizar pedido_eventos | PERMISSIVE | {authenticated} | UPDATE | true | true       |
| pedido_eventos | Todos authenticated podem deletar pedido_eventos   | PERMISSIVE | {authenticated} | DELETE | true | null       |
| pedido_eventos | Todos authenticated podem inserir pedido_eventos   | PERMISSIVE | {authenticated} | INSERT | null | true       |
| pedido_eventos | Todos authenticated podem ler pedido_eventos       | PERMISSIVE | {authenticated} | SELECT | true | null       |



-- 6. Verificar GRANTs
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'pedido_eventos'
ORDER BY grantee, privilege_type;

| grantee       | privilege_type |
| ------------- | -------------- |
| anon          | DELETE         |
| anon          | INSERT         |
| anon          | REFERENCES     |
| anon          | SELECT         |
| anon          | TRIGGER        |
| anon          | TRUNCATE       |
| anon          | UPDATE         |
| authenticated | DELETE         |
| authenticated | INSERT         |
| authenticated | SELECT         |
| authenticated | UPDATE         |
| postgres      | DELETE         |
| postgres      | INSERT         |
| postgres      | REFERENCES     |
| postgres      | SELECT         |
| postgres      | TRIGGER        |
| postgres      | TRUNCATE       |
| postgres      | UPDATE         |


-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Policies criadas:
-- - Todos authenticated podem ler pedido_eventos (SELECT)
-- - Todos authenticated podem inserir pedido_eventos (INSERT)
-- - Todos authenticated podem atualizar pedido_eventos (UPDATE)
-- - Todos authenticated podem deletar pedido_eventos (DELETE)
--
-- GRANTs:
-- - authenticated: SELECT, INSERT, UPDATE, DELETE
-- - anon: SELECT, INSERT, UPDATE, DELETE
-- ============================================================================
