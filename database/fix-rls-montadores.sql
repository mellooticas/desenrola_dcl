-- FIX: Adicionar políticas RLS para tabela montadores

-- 1. Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'montadores';

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Montadores visíveis para todos" ON montadores;
DROP POLICY IF EXISTS "Usuarios podem visualizar montadores" ON montadores;
DROP POLICY IF EXISTS "select_montadores_policy" ON montadores;

-- 3. Criar política de SELECT para todos os usuários autenticados
CREATE POLICY "Usuários autenticados podem visualizar montadores"
ON montadores
FOR SELECT
TO authenticated
USING (true);

-- 4. Permitir também para o role anon (para testes)
CREATE POLICY "Usuários anônimos podem visualizar montadores"
ON montadores
FOR SELECT
TO anon
USING (true);

-- 5. Verificar se RLS está ativo
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'montadores';

-- 6. Confirmar novas políticas
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'montadores';

-- 7. Testar query como se fosse o frontend
SET ROLE authenticated;
SELECT COUNT(*) as test_count FROM montadores WHERE ativo = true;
RESET ROLE;
