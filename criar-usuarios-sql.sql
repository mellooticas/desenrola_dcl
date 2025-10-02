-- SQL para criar usuário de teste no Supabase
-- Execute este código no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd/sql

-- 1. Primeiro, vamos verificar se há usuários existentes
SELECT 
    id, 
    email, 
    nome, 
    role, 
    ativo,
    CASE 
        WHEN senha_hash IS NOT NULL AND LENGTH(senha_hash) > 0 THEN 'Com senha'
        ELSE 'Sem senha'
    END as status_senha
FROM usuarios 
ORDER BY email;

-- 2. Criar usuário de teste (se não existir)
-- Senha: 123456 (hash BCrypt)
INSERT INTO usuarios (
    email, 
    nome, 
    role, 
    permissoes, 
    ativo, 
    senha_hash
) VALUES (
    'admin@dcl.com.br',
    'Administrador DCL',
    'dcl',
    ARRAY['admin'],
    true,
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEb.DhfQjLV9.Q6'  -- senha: 123456
) ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    ativo = true,
    updated_at = now();

-- 3. Verificar se o usuário foi criado
SELECT 
    id, 
    email, 
    nome, 
    role, 
    ativo,
    created_at
FROM usuarios 
WHERE email = 'admin@dcl.com.br';

-- 4. Criar mais usuários de teste se necessário
INSERT INTO usuarios (email, nome, role, permissoes, ativo, senha_hash) VALUES 
('operador@dcl.com.br', 'Operador Teste', 'operador', ARRAY['pedidos.view', 'pedidos.create'], true, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEb.DhfQjLV9.Q6'),
('gestor@dcl.com.br', 'Gestor Teste', 'gestor', ARRAY['dashboard.view', 'pedidos.edit'], true, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEb.DhfQjLV9.Q6')
ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    ativo = true,
    updated_at = now();

-- 5. Verificar todos os usuários criados
SELECT 
    email,
    nome,
    role,
    ativo,
    'Senha: 123456' as senha_teste
FROM usuarios 
WHERE ativo = true
ORDER BY role, email;