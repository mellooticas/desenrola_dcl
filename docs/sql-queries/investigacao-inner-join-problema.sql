-- 🔍 INVESTIGAÇÃO ESPECÍFICA - MISSÕES SEM RELACIONAMENTOS
-- ========================================================

-- 1. VERIFICAR MISSÕES SEM TEMPLATE (INNER JOIN problema)
-- ========================================================
SELECT 
    COUNT(*) as total_missoes,
    COUNT(CASE WHEN template_id IS NOT NULL THEN 1 END) as com_template,
    COUNT(CASE WHEN template_id IS NULL THEN 1 END) as sem_template,
    COUNT(CASE 
        WHEN template_id IS NOT NULL 
        AND EXISTS (SELECT 1 FROM missao_templates mt WHERE mt.id = md.template_id) 
        THEN 1 
    END) as template_existe_na_tabela
FROM missoes_diarias md;

-- 2. VERIFICAR MISSÕES SEM LOJA (INNER JOIN problema)
-- ==================================================
SELECT 
    COUNT(*) as total_missoes,
    COUNT(CASE WHEN loja_id IS NOT NULL THEN 1 END) as com_loja,
    COUNT(CASE WHEN loja_id IS NULL THEN 1 END) as sem_loja,
    COUNT(CASE 
        WHEN loja_id IS NOT NULL 
        AND EXISTS (SELECT 1 FROM lojas l WHERE l.id = md.loja_id) 
        THEN 1 
    END) as loja_existe_na_tabela
FROM missoes_diarias md;

-- 3. VERIFICAR USUÁRIOS (LEFT JOIN - opcional)
-- ============================================
SELECT 
    COUNT(*) as total_missoes,
    COUNT(CASE WHEN usuario_responsavel_id IS NOT NULL THEN 1 END) as com_responsavel,
    COUNT(CASE WHEN usuario_responsavel_id IS NULL THEN 1 END) as sem_responsavel,
    COUNT(CASE WHEN delegada_para IS NOT NULL THEN 1 END) as com_delegacao,
    COUNT(CASE WHEN delegada_para IS NULL THEN 1 END) as sem_delegacao
FROM missoes_diarias md;

-- 4. SIMULAR CONSULTA DA API (INNER JOIN)
-- =======================================
SELECT 
    COUNT(*) as missoes_retornadas_inner_join
FROM missoes_diarias md
INNER JOIN missao_templates mt ON md.template_id = mt.id
INNER JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = CURRENT_DATE;

-- 5. SIMULAR CONSULTA DA API (LEFT JOIN)
-- ======================================
SELECT 
    COUNT(*) as missoes_retornadas_left_join
FROM missoes_diarias md
LEFT JOIN missao_templates mt ON md.template_id = mt.id
LEFT JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = CURRENT_DATE;

-- 6. MISSÕES DE HOJE QUE SERIAM PERDIDAS NO INNER JOIN
-- ====================================================
SELECT 
    md.id,
    md.status,
    md.template_id,
    md.loja_id,
    CASE WHEN mt.id IS NULL THEN 'TEMPLATE NÃO EXISTE' ELSE 'Template OK' END as status_template,
    CASE WHEN l.id IS NULL THEN 'LOJA NÃO EXISTE' ELSE 'Loja OK' END as status_loja
FROM missoes_diarias md
LEFT JOIN missao_templates mt ON md.template_id = mt.id
LEFT JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = CURRENT_DATE
AND (mt.id IS NULL OR l.id IS NULL)
LIMIT 10;

-- 7. EXEMPLO DE MISSÃO COMPLETA QUE DEVERIA APARECER
-- ==================================================
SELECT 
    md.id,
    md.status,
    md.data_vencimento,
    mt.nome as template_nome,
    l.nome as loja_nome,
    ur.nome as responsavel_nome
FROM missoes_diarias md
LEFT JOIN missao_templates mt ON md.template_id = mt.id
LEFT JOIN lojas l ON md.loja_id = l.id
LEFT JOIN usuarios ur ON md.usuario_responsavel_id = ur.id
WHERE md.data_missao = CURRENT_DATE
LIMIT 5;

-- 8. DIAGNÓSTICO COMPLETO DO PROBLEMA
-- ===================================
SELECT 
    'INNER JOIN (API atual)' as tipo_consulta,
    COUNT(*) as resultados
FROM missoes_diarias md
INNER JOIN missao_templates mt ON md.template_id = mt.id
INNER JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = CURRENT_DATE

UNION ALL

SELECT 
    'LEFT JOIN (corrigido)' as tipo_consulta,
    COUNT(*) as resultados
FROM missoes_diarias md
LEFT JOIN missao_templates mt ON md.template_id = mt.id
LEFT JOIN lojas l ON md.loja_id = l.id  
WHERE md.data_missao = CURRENT_DATE

UNION ALL

SELECT 
    'SEM JOIN (total real)' as tipo_consulta,
    COUNT(*) as resultados
FROM missoes_diarias md
WHERE md.data_missao = CURRENT_DATE;