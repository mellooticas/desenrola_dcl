-- ============================================================
-- INVESTIGAÇÃO: Onde está a tabela de laboratórios?
-- ============================================================

-- 1️⃣ Buscar em TODOS os schemas
-- ============================================================
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_name LIKE '%laborat%'
ORDER BY table_schema, table_name;

-- Colar resultado aqui:

| table_schema | table_name               |
| ------------ | ------------------------ |
| core         | fornecedores             |
| public       | v_fornecedores_catalogo  |
| public       | v_fornecedores_por_lente |

-- 2️⃣ Ver estrutura da tabela PEDIDOS (campo laboratorio_id)
-- ============================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pedidos'
  AND column_name LIKE '%laboratorio%'
ORDER BY ordinal_position;

-- Colar resultado aqui:



-- 3️⃣ Ver se laboratorio_id aponta para core.fornecedores
-- ============================================================
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'pedidos'
  AND kcu.column_name = 'laboratorio_id';

-- Colar resultado aqui:



-- 4️⃣ Ver valores REAIS de laboratorio_id nos pedidos
-- ============================================================
SELECT DISTINCT
    p.laboratorio_id,
    f.nome as fornecedor_nome,
    COUNT(p.id) as total_pedidos
FROM public.pedidos p
LEFT JOIN core.fornecedores f ON f.id = p.laboratorio_id
GROUP BY p.laboratorio_id, f.nome
ORDER BY total_pedidos DESC;

-- Colar resultado aqui:



-- 5️⃣ TESTE: Ver se laboratorio_id = fornecedor_id
-- ============================================================
SELECT 
    p.id as pedido_id,
    p.numero_os,
    p.laboratorio_id,
    f.nome as fornecedor_nome,
    p.status
FROM public.pedidos p
LEFT JOIN core.fornecedores f ON f.id = p.laboratorio_id
WHERE p.status NOT IN ('ENTREGUE', 'CANCELADO')
LIMIT 5;

-- Colar resultado aqui:



-- ============================================================
-- 📝 CONCLUSÃO:
-- ============================================================
-- laboratorio_id NA VERDADE APONTA PARA core.fornecedores?
--    Resposta: 
