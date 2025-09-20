-- 🔍 INVESTIGAÇÃO DO PROBLEMA DE DATA
-- ===================================

-- 1. VERIFICAR O QUE É CURRENT_DATE NO BANCO
-- ==========================================
SELECT 
    CURRENT_DATE as data_servidor,
    CURRENT_TIMESTAMP as timestamp_servidor,
    NOW() as now_funcao,
    TIMEZONE('UTC', NOW()) as utc_time;

-- 2. VERIFICAR AS DATAS DAS MISSÕES
-- =================================
SELECT 
    data_missao,
    COUNT(*) as total_missoes,
    MIN(created_at) as primeira_criacao,
    MAX(created_at) as ultima_criacao
FROM missoes_diarias 
GROUP BY data_missao
ORDER BY data_missao DESC;

-- 3. COMPARAR DATAS EXPLICITAMENTE
-- ================================
SELECT 
    'Comparação de Datas' as teste,
    COUNT(*) as total_geral,
    COUNT(CASE WHEN data_missao = '2025-09-18' THEN 1 END) as data_literal,
    COUNT(CASE WHEN data_missao = CURRENT_DATE THEN 1 END) as current_date,
    COUNT(CASE WHEN data_missao::date = CURRENT_DATE::date THEN 1 END) as cast_date,
    COUNT(CASE WHEN DATE(data_missao) = DATE(NOW()) THEN 1 END) as date_now
FROM missoes_diarias;

-- 4. TESTAR QUERY CORRIGIDA COM DATA LITERAL
-- ==========================================
SELECT 
    md.id,
    md.data_missao,
    md.status,
    mt.nome as template_nome,
    l.nome as loja_nome
FROM missoes_diarias md
LEFT JOIN missao_templates mt ON md.template_id = mt.id
LEFT JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = '2025-09-18'
LIMIT 5;

-- 5. VERIFICAR TIPOS DE DADOS
-- ===========================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'missoes_diarias'
AND column_name IN ('data_missao', 'data_vencimento', 'created_at');