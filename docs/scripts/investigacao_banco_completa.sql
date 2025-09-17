-- 🔍 SCRIPT DE INVESTIGAÇÃO DO BANCO DE DADOS
-- Execute este script no Supabase SQL Editor para verificar o estado atual

-- ======================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ======================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ======================================
-- 2. VERIFICAR VIEWS EXISTENTES
-- ======================================
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ======================================
-- 3. VERIFICAR ESTRUTURA DA TABELA PEDIDOS
-- ======================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- ======================================
-- 4. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- ======================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- ======================================
-- 5. VERIFICAR ESTRUTURA DA TABELA LOJAS
-- ======================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'lojas'
ORDER BY ordinal_position;

-- ======================================
-- 6. VERIFICAR ESTRUTURA DA TABELA LABORATORIOS
-- ======================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'laboratorios'
ORDER BY ordinal_position;

-- ======================================
-- 7. VERIFICAR DADOS DE EXEMPLO DA TABELA PEDIDOS
-- ======================================
SELECT 
    id,
    numero_sequencial,
    cliente_nome,
    status,
    prioridade,
    valor_pedido,
    eh_garantia,
    data_criacao,
    prazo_entrega,
    data_entrega,
    loja_id,
    laboratorio_id
FROM pedidos 
LIMIT 5;

-- ======================================
-- 8. VERIFICAR STATUS EXISTENTES NOS PEDIDOS
-- ======================================
SELECT 
    status,
    COUNT(*) as quantidade
FROM pedidos 
GROUP BY status
ORDER BY quantidade DESC;

-- ======================================
-- 9. VERIFICAR PRIORIDADES EXISTENTES
-- ======================================
SELECT 
    prioridade,
    COUNT(*) as quantidade
FROM pedidos 
GROUP BY prioridade
ORDER BY quantidade DESC;

-- ======================================
-- 10. VERIFICAR DADOS DE LOJAS
-- ======================================
SELECT 
    id,
    nome,
    ativa
FROM lojas 
ORDER BY id;

-- ======================================
-- 11. VERIFICAR DADOS DE LABORATÓRIOS
-- ======================================
SELECT 
    id,
    nome,
    especialidades,
    ativo,
    lead_time_padrao
FROM laboratorios 
ORDER BY id;

-- ======================================
-- 12. VERIFICAR USUÁRIOS ATIVOS
-- ======================================
SELECT 
    id,
    email,
    nome,
    perfil,
    ativo,
    ultimo_acesso
FROM usuarios 
WHERE ativo = true
ORDER BY nome;

-- ======================================
-- 13. VERIFICAR RECEITAS (SE EXISTIR)
-- ======================================
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'receitas'
ORDER BY ordinal_position;

-- ======================================
-- 14. VERIFICAR TIMELINE DE PEDIDOS (SE EXISTIR)
-- ======================================
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'pedidos_timeline'
ORDER BY ordinal_position;

-- ======================================
-- 15. VERIFICAR CONSTRAINTS E RELACIONAMENTOS
-- ======================================
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ======================================
-- 16. VERIFICAR ÍNDICES
-- ======================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ======================================
-- 17. CONTAGEM GERAL DE DADOS
-- ======================================
SELECT 
    'pedidos' as tabela,
    COUNT(*) as total_registros
FROM pedidos
UNION ALL
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
    'lojas' as tabela,
    COUNT(*) as total_registros
FROM lojas
UNION ALL
SELECT 
    'laboratorios' as tabela,
    COUNT(*) as total_registros
FROM laboratorios;