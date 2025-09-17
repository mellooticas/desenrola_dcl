-- =====================================================
-- CORRIGIR PERMISSÕES DA TABELA USUARIOS
-- Execute no SQL Editor do Supabase como superuser
-- =====================================================

-- 🔍 1. VERIFICAR POLICIES ATUAIS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as comando,
    qual as condicao
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 🔍 2. VERIFICAR RLS STATUS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hassubclass
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 🔧 3. DESABILITAR RLS TEMPORARIAMENTE (APENAS PARA DEBUG)
-- CUIDADO: Isso remove toda a segurança da tabela!
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 🔧 4. OU CRIAR POLICY PARA SERVICE ROLE
-- Opção mais segura: dar acesso total ao service_role
DROP POLICY IF EXISTS "Allow service_role full access" ON usuarios;
CREATE POLICY "Allow service_role full access" ON usuarios
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 🔧 5. OU GRANT DIRETO PARA SERVICE_ROLE
GRANT ALL ON usuarios TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- ✅ 6. VERIFICAR SE FUNCIONOU
SELECT 
    email,
    nome,
    ativo
FROM usuarios 
LIMIT 5;

-- 🎯 ESCOLHA UMA DAS OPÇÕES:
-- Opção A (menos segura): Desabilitar RLS completamente
-- Opção B (mais segura): Criar policy específica para service_role
-- Opção C (intermediária): Grant direto para service_role

-- 📝 RECOMENDAÇÃO: Use a Opção B (policy) para manter segurança