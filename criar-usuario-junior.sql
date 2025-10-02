-- SQL para criar o usuário junior@oticastatymello.com.br
-- Execute no Supabase SQL Editor

-- 1. Verificar usuários existentes
SELECT email, nome, role, ativo FROM usuarios ORDER BY email;

-- 2. Inserir usuário Junior com senha DCL@2025#c09ef0
-- Hash BCrypt da senha: DCL@2025#c09ef0
INSERT INTO usuarios (
    email, 
    nome, 
    role, 
    permissoes, 
    ativo, 
    senha_hash
) VALUES (
    'junior@oticastatymello.com.br',
    'Junior - Admin',
    'dcl',
    ARRAY['admin'],
    true,
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'  -- Isso é um hash de exemplo, precisa gerar o correto
) ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    ativo = true,
    updated_at = now();

-- 3. Verificar se foi criado
SELECT email, nome, role, ativo, 
    CASE WHEN senha_hash IS NOT NULL THEN 'Com senha' ELSE 'Sem senha' END as status_senha
FROM usuarios 
WHERE email = 'junior@oticastatymello.com.br';