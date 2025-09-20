-- ============================================
-- CONSULTA ESPECÍFICA: PROBLEMA DE FUSO HORÁRIO
-- ============================================
-- Arquivo: docs/sql-queries/03-debug-timezone.sql
-- Objetivo: Investigar problemas com CURRENT_DATE vs data real
-- Data: 18/09/2025

-- 1. VERIFICAR CONFIGURAÇÃO DE DATA/HORA DO SERVIDOR
-- ==================================================
SELECT 
    CURRENT_DATE as data_servidor,
    CURRENT_TIMESTAMP as timestamp_servidor,
    NOW() as now_funcao,
    TIMEZONE('UTC', NOW()) as utc_time,
    EXTRACT(TIMEZONE FROM NOW()) as timezone_offset;

-- 2. VERIFICAR DATAS DAS MISSÕES EXISTENTES
-- =========================================
SELECT 
    data_missao,
    COUNT(*) as total_missoes,
    MIN(created_at) as primeira_criacao,
    MAX(created_at) as ultima_criacao
FROM missoes_diarias 
GROUP BY data_missao
ORDER BY data_missao DESC;

-- 3. COMPARAR DIFERENTES FORMATOS DE DATA
-- =======================================
SELECT 
    'Comparação de Datas' as teste,
    COUNT(*) as total_geral,
    COUNT(CASE WHEN data_missao = '2025-09-18' THEN 1 END) as data_literal,
    COUNT(CASE WHEN data_missao = CURRENT_DATE THEN 1 END) as current_date,
    COUNT(CASE WHEN data_missao::date = CURRENT_DATE::date THEN 1 END) as cast_date,
    COUNT(CASE WHEN DATE(data_missao) = DATE(NOW()) THEN 1 END) as date_now,
    COUNT(CASE WHEN data_missao = CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as ontem
FROM missoes_diarias;

-- 4. TESTAR QUERY COM DATA LITERAL
-- ================================
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

-- 5. VERIFICAR TIPOS DE DADOS DAS COLUNAS DE DATA
-- ===============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'missoes_diarias'
AND column_name IN ('data_missao', 'data_vencimento', 'created_at')
ORDER BY ordinal_position;

-- 6. TESTAR DIFERENTES FILTROS DE DATA
-- ====================================
SELECT 
    'Filtro por Data' as tipo_filtro,
    COUNT(*) as resultados
FROM missoes_diarias 
WHERE data_missao = '2025-09-18'

UNION ALL

SELECT 
    'CURRENT_DATE',
    COUNT(*)
FROM missoes_diarias 
WHERE data_missao = CURRENT_DATE

UNION ALL

SELECT 
    'CURRENT_DATE - 1',
    COUNT(*)
FROM missoes_diarias 
WHERE data_missao = CURRENT_DATE - INTERVAL '1 day'

UNION ALL

SELECT 
    'NOW()::date',
    COUNT(*)
FROM missoes_diarias 
WHERE data_missao = NOW()::date

UNION ALL

SELECT 
    'Hoje (literal)',
    COUNT(*)
FROM missoes_diarias 
WHERE data_missao = '2025-09-19';

-- 7. CONFIGURAÇÕES DE TIMEZONE DO BANCO
-- =====================================
SELECT 
    name,
    setting,
    unit,
    context
FROM pg_settings 
WHERE name IN ('timezone', 'TimeZone', 'log_timezone')
ORDER BY name;