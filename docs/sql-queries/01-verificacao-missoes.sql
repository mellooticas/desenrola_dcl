-- ============================================
-- CONSULTA PRINCIPAL: VERIFICAÇÃO DE MISSÕES
-- ============================================
-- Arquivo: docs/sql-queries/01-verificacao-missoes.sql
-- Objetivo: Verificar se existem missões no banco e sua estrutura
-- Data: 18/09/2025

-- 1. CONTAGEM GERAL DE MISSÕES POR STATUS
-- ========================================
SELECT 
    COUNT(*) as total_missoes_diarias,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN status = 'executando' THEN 1 END) as executando,
    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
    COUNT(CASE WHEN status = 'pausada' THEN 1 END) as pausadas
FROM missoes_diarias;

-- 2. MISSÕES POR DATA (ÚLTIMOS 7 DIAS)
-- =====================================
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

-- 3. TEMPLATES DE MISSÃO POR CATEGORIA
-- ====================================
SELECT 
    categoria,
    COUNT(*) as por_categoria,
    COUNT(CASE WHEN ativo = true THEN 1 END) as templates_ativos
FROM missao_templates 
GROUP BY categoria
ORDER BY por_categoria DESC;

-- 4. MISSÕES HOJE COM RELACIONAMENTOS
-- ===================================
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
    md.pontos_total
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

-- 6. CONTAGEM GERAL DE TODAS AS TABELAS
-- =====================================
SELECT 
    (SELECT COUNT(*) FROM missoes_diarias) as missoes_diarias,
    (SELECT COUNT(*) FROM missao_templates) as templates,
    (SELECT COUNT(*) FROM lojas) as lojas,
    (SELECT COUNT(*) FROM usuarios) as usuarios;

-- 7. EXEMPLOS DE MISSÕES COM DADOS COMPLETOS
-- ==========================================
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

-- 8. AMOSTRA DE DADOS PARA TESTE
-- ==============================
SELECT 
    'Exemplo de Missão Diária' as tipo,
    id,
    status,
    data_missao,
    template_id,
    loja_id
FROM missoes_diarias 
LIMIT 3;

-- 9. ESTATÍSTICAS AVANÇADAS
-- =========================
SELECT 
    COUNT(DISTINCT md.loja_id) as lojas_com_missoes,
    COUNT(DISTINCT md.template_id) as templates_em_uso,
    MIN(md.data_missao) as primeira_missao,
    MAX(md.data_missao) as ultima_missao,
    AVG(md.pontos_total) as media_pontos
FROM missoes_diarias md;

-- 10. VERIFICAR FOREIGN KEYS VÁLIDAS
-- ==================================
SELECT 
    COUNT(*) as missoes_com_fk_invalida
FROM missoes_diarias md
WHERE md.template_id NOT IN (SELECT id FROM missao_templates)
   OR md.loja_id NOT IN (SELECT id FROM lojas);