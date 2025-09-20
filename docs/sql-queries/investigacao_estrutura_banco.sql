-- Investigação da estrutura do banco de dados Desenrola DCL
-- Data: 18/09/2025

-- 1. Listar todas as tabelas disponíveis
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela pedidos (principal)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela lojas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lojas' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela laboratorios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'laboratorios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar estrutura da tabela classes_lente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'classes_lente' 
    AND table_schema = 'public'
ORDER BY ordinal_position;