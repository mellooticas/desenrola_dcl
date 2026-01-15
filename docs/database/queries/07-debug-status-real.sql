-- 🔍 Diagnóstico Completo: Verificar dados reais do Kanban

-- 1. Ver se a view v_kanban_colunas está retornando dados
SELECT 
    'v_kanban_colunas' as fonte,
    coluna_id,
    coluna_nome,
    ordem
FROM v_kanban_colunas
ORDER BY ordem;

-- 2. Ver que status estão sendo usados nos pedidos REAIS
SELECT 
    'pedidos_reais' as fonte,
    status,
    COUNT(*) as quantidade
FROM pedidos
GROUP BY status
ORDER BY quantidade DESC;

-- 3. Ver se a view v_pedidos_kanban está funcionando
SELECT 
    'v_pedidos_kanban' as fonte,
    status,
    COUNT(*) as quantidade
FROM v_pedidos_kanban
GROUP BY status
ORDER BY quantidade DESC;

-- 4. Verificar se há incompatibilidade entre view e pedidos
SELECT 
    p.status as status_pedido,
    CASE 
        WHEN v.coluna_id IS NOT NULL THEN '✅ Match'
        ELSE '❌ Sem coluna'
    END as tem_coluna,
    COUNT(*) as qtd_pedidos
FROM pedidos p
LEFT JOIN v_kanban_colunas v ON LOWER(p.status) = LOWER(v.coluna_id)
GROUP BY p.status, v.coluna_id
ORDER BY qtd_pedidos DESC;

-- 5. Ver 3 pedidos de exemplo com todos os campos
SELECT 
    id,
    numero_os,
    status,
    loja_id,
    laboratorio_id
FROM v_pedidos_kanban
LIMIT 3;
