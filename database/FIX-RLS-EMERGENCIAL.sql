-- =====================================================
-- 🔧 SOLUÇÃO EMERGENCIAL: Desabilitar RLS Temporariamente
-- =====================================================
-- ⚠️ USE APENAS EM DESENVOLVIMENTO
-- ⚠️ NUNCA EM PRODUÇÃO
-- =====================================================

-- Verificar o que está bloqueando
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'pedidos' 
  AND cmd IN ('UPDATE', 'ALL')
ORDER BY cmd, policyname;

| tablename | policyname                 | cmd    | permissive | using_clause | with_check_clause |
| --------- | -------------------------- | ------ | ---------- | ------------ | ----------------- |
| pedidos   | policy_universal_pedidos   | ALL    | PERMISSIVE | true         | true              |
| pedidos   | pedidos_update_policy_temp | UPDATE | PERMISSIVE | true         | true              |


-- =====================================================
-- SOLUÇÃO 1: Remover TODAS as policies e criar UMA ÚNICA
-- =====================================================

BEGIN;

-- 1. REMOVER TODAS AS POLICIES
DROP POLICY IF EXISTS "policy_universal_pedidos" ON pedidos;
DROP POLICY IF EXISTS "policy_anon_select_pedidos" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_policy" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_policy_temp" ON pedidos;
DROP POLICY IF EXISTS "pedidos_select_policy" ON pedidos;
DROP POLICY IF EXISTS "pedidos_insert_policy" ON pedidos;
DROP POLICY IF EXISTS "pedidos_delete_policy" ON pedidos;

-- 2. Criar UMA ÚNICA POLICY PERMISSIVA para authenticated
CREATE POLICY "authenticated_all_access" ON pedidos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Criar policy para anon (apenas SELECT)
CREATE POLICY "anon_select_only" ON pedidos
  FOR SELECT
  TO anon
  USING (true);

-- 4. Garantir que RLS está habilitado
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- 5. Garantir permissões
GRANT ALL ON pedidos TO authenticated;
GRANT SELECT ON pedidos TO anon;

COMMIT;

-- =====================================================
-- VALIDAÇÃO
-- =====================================================

-- Ver policies atuais (deve mostrar apenas 2)
SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies 
WHERE tablename = 'pedidos'
ORDER BY policyname;


| tablename | policyname               | cmd    | roles           | permissive |
| --------- | ------------------------ | ------ | --------------- | ---------- |
| pedidos   | anon_select_only         | SELECT | {anon}          | PERMISSIVE |
| pedidos   | authenticated_all_access | ALL    | {authenticated} | PERMISSIVE |


-- =====================================================
-- ✅ TESTE NO FRONTEND
-- =====================================================
/*
1. Faça Ctrl+Shift+R na página de edição
2. Tente salvar novamente
3. Deve funcionar agora

Se funcionar:
- Problema é conflito de policies
- Depois executar script de produção seguro
*/
