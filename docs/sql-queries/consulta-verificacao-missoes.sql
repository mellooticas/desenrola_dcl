-- 🔍 CONSULTA PARA VERIFICAR MISSÕES NO BANCO DE DADOS
-- =====================================================

-- 1. VERIFICAR SE EXISTEM MISSÕES DIÁRIAS
-- ========================================
SELECT 
    COUNT(*) as total_missoes_diarias,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN status = 'executando' THEN 1 END) as executando,
    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
    COUNT(CASE WHEN status = 'pausada' THEN 1 END) as pausadas
FROM missoes_diarias;

-- 2. VERIFICAR MISSÕES POR DATA (ÚLTIMOS 7 DIAS)
-- ==============================================
SELECT 
    data_missao,
    COUNT(*) as total_missoes,
    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
    ROUND(
        COUNT(CASE WHEN status = 'concluida' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as percentual_conclusao
FROM missoes_diarias 
WHERE data_missao >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY data_missao
ORDER BY data_missao DESC;

-- 3. VERIFICAR TEMPLATES DE MISSÃO DISPONÍVEIS
-- ============================================
SELECT 
    COUNT(*) as total_templates,
    COUNT(CASE WHEN ativo = true THEN 1 END) as templates_ativos,
    categoria,
    COUNT(*) as por_categoria
FROM missao_templates 
GROUP BY categoria
ORDER BY por_categoria DESC;

-- 4. CONSULTA DETALHADA DAS MISSÕES HOJE
-- ======================================
SELECT 
    md.id,
    md.data_missao,
    md.status,
    md.data_vencimento,
    mt.nome as nome_missao,
    mt.categoria,
    mt.pontos_base,
    l.nome as loja,
    l.codigo as codigo_loja,
    md.executada_por,
    md.pontos_total,
    md.created_at
FROM missoes_diarias md
JOIN missao_templates mt ON md.template_id = mt.id
JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = CURRENT_DATE
ORDER BY md.data_vencimento, l.nome;

-- 5. VERIFICAR INTEGRIDADE DOS DADOS
-- ==================================
SELECT 
    'missoes_diarias' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN template_id IS NULL THEN 1 END) as sem_template,
    COUNT(CASE WHEN loja_id IS NULL THEN 1 END) as sem_loja,
    COUNT(CASE WHEN data_missao IS NULL THEN 1 END) as sem_data
FROM missoes_diarias

UNION ALL

SELECT 
    'missao_templates' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN nome IS NULL THEN 1 END) as sem_nome,
    COUNT(CASE WHEN categoria IS NULL THEN 1 END) as sem_categoria,
    COUNT(CASE WHEN ativo IS NULL THEN 1 END) as sem_status_ativo
FROM missao_templates;

-- 6. CONSULTA RÁPIDA PARA DEBUGGING
-- =================================
-- Use esta para verificar rapidamente se existem dados
SELECT 
    (SELECT COUNT(*) FROM missoes_diarias) as missoes_diarias,
    (SELECT COUNT(*) FROM missao_templates) as templates,
    (SELECT COUNT(*) FROM lojas) as lojas,
    (SELECT COUNT(*) FROM usuarios) as usuarios;

-- 7. MISSÕES DE HOJE COM RELACIONAMENTOS
-- =====================================
SELECT 
    md.*,
    mt.nome as template_nome,
    l.nome as loja_nome,
    ur.nome as responsavel_nome,
    du.nome as delegada_para_nome
FROM missoes_diarias md
LEFT JOIN missao_templates mt ON md.template_id = mt.id
LEFT JOIN lojas l ON md.loja_id = l.id
LEFT JOIN usuarios ur ON md.usuario_responsavel_id = ur.id
LEFT JOIN usuarios du ON md.delegada_para = du.id
WHERE md.data_missao = CURRENT_DATE
LIMIT 10;

-- 8. VERIFICAR SE HÁ DADOS DE EXEMPLO
-- ===================================
SELECT 
    'Exemplo de Missão Diária' as tipo,
    id,
    status,
    data_missao,
    template_id,
    loja_id
FROM missoes_diarias 
LIMIT 3;

-- 9. ESTATÍSTICAS GERAIS
-- ======================
SELECT 
    COUNT(DISTINCT md.loja_id) as lojas_com_missoes,
    COUNT(DISTINCT md.template_id) as templates_em_uso,
    MIN(md.data_missao) as primeira_missao,
    MAX(md.data_missao) as ultima_missao,
    AVG(md.pontos_total) as media_pontos
FROM missoes_diarias md;

-- 10. VERIFICAR FOREIGN KEYS
-- ==========================
SELECT 
    COUNT(*) as missoes_com_fk_invalida
FROM missoes_diarias md
WHERE md.template_id NOT IN (SELECT id FROM missao_templates)
   OR md.loja_id NOT IN (SELECT id FROM lojas);