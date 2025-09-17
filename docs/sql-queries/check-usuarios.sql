-- Consulta SQL para verificar usuários no Supabase
-- Execute no Supabase SQL Editor ou via psql
-- Baseado na estrutura real descoberta em 14/09/2025

-- ESTRUTURA REAL DA TABELA:
-- id (uuid, NOT NULL), email (text, NOT NULL), nome (text, NOT NULL)
-- loja_id (uuid), role (text), permissoes (ARRAY), ativo (boolean)
-- created_at, telefone, ultimo_acesso, updated_at (timestamps)
-- senha_hash (text), reset_token (text), reset_token_expires_at (timestamp), user_id (uuid)

-- 1. Verificar se a tabela usuarios existe
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 2. Listar todos os usuários (sem senhas por segurança)
SELECT 
    id,
    email,
    nome,
    role,
    ativo,
    loja_id,
    telefone,
    created_at,
    ultimo_acesso,
    updated_at,
    CASE 
        WHEN senha_hash IS NOT NULL AND LENGTH(senha_hash) > 0 THEN 'Senha definida'
        ELSE 'Sem senha'
    END as status_senha,
    CASE 
        WHEN reset_token IS NOT NULL THEN 'Token ativo'
        ELSE 'Sem token'
    END as status_reset
FROM usuarios 
ORDER BY email;

-- 3. Verificar estrutura completa da tabela
\d usuarios;

-- 4. Contar usuários por role
SELECT 
    role,
    COUNT(*) as total,
    COUNT(CASE WHEN senha_hash IS NOT NULL AND LENGTH(senha_hash) > 0 THEN 1 END) as com_senha,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ultimo_acesso IS NOT NULL THEN 1 END) as ja_logaram
FROM usuarios 
GROUP BY role
ORDER BY role;

-- 5. Se precisar ver as senhas (CUIDADO - apenas em desenvolvimento)
-- SELECT email, nome, role, senha_hash FROM usuarios WHERE ativo = true ORDER BY email;

-- 6. Verificar permissões da tabela
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasinserts,
    hasselects,
    hasupdates,
    hasdeletes
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 7. Verificar policies RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'usuarios';