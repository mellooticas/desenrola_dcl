-- ============================================================================
-- VALIDAÇÃO COMPLETA: GAP DE GRAUS
-- ============================================================================
-- Objetivo: Script de validação end-to-end do problema de graus
-- Data: 22/01/2026
-- ============================================================================
-- Execute este script para ter um relatório completo do estado atual
-- ============================================================================

-- ============================================================================
-- 🔍 RELATÓRIO EXECUTIVO
-- ============================================================================
SELECT '========================================' as separator;
SELECT '📊 RELATÓRIO EXECUTIVO - GAP DE GRAUS' as titulo;
SELECT '========================================' as separator;

-- ============================================================================
-- 1. VISÃO GERAL DO BANCO
-- ============================================================================
SELECT '---' as separator;
SELECT '1️⃣ VISÃO GERAL DO BANCO' as secao;
SELECT '---' as separator;

SELECT 
    'Total de Lentes Ativas' as metrica,
    COUNT(*)::TEXT as valor
FROM lens_catalog.lentes
WHERE ativo = true
UNION ALL
SELECT 
    'Total de Lentes Inativas' as metrica,
    COUNT(*)::TEXT as valor
FROM lens_catalog.lentes
WHERE ativo = false
UNION ALL
SELECT 
    'Total Geral' as metrica,
    COUNT(*)::TEXT as valor
FROM lens_catalog.lentes;


| metrica                  | valor |
| ------------------------ | ----- |
| Total de Lentes Ativas   | 1411  |
| Total de Lentes Inativas | 0     |
| Total Geral              | 1411  |


-- ============================================================================
-- 2. ANÁLISE DE CAMPOS DE GRAUS (TABELA)
-- ============================================================================
SELECT '---' as separator;
SELECT '2️⃣ ANÁLISE DE CAMPOS DE GRAUS NA TABELA' as secao;
SELECT '---' as separator;

WITH analise_graus AS (
    SELECT 
        -- Campos antigos
        COUNT(CASE WHEN grau_esferico_min IS NOT NULL THEN 1 END) as grau_esf_min_antigo,
        COUNT(CASE WHEN grau_esferico_max IS NOT NULL THEN 1 END) as grau_esf_max_antigo,
        COUNT(CASE WHEN grau_cilindrico_min IS NOT NULL THEN 1 END) as grau_cil_min_antigo,
        COUNT(CASE WHEN grau_cilindrico_max IS NOT NULL THEN 1 END) as grau_cil_max_antigo,
        -- Campos novos
        COUNT(CASE WHEN esferico_min IS NOT NULL THEN 1 END) as esf_min_novo,
        COUNT(CASE WHEN esferico_max IS NOT NULL THEN 1 END) as esf_max_novo,
        COUNT(CASE WHEN cilindrico_min IS NOT NULL THEN 1 END) as cil_min_novo,
        COUNT(CASE WHEN cilindrico_max IS NOT NULL THEN 1 END) as cil_max_novo,
        -- Gap
        COUNT(CASE 
            WHEN grau_esferico_min IS NOT NULL 
            AND esferico_min IS NULL 
            THEN 1 
        END) as gap_esf_min,
        COUNT(CASE 
            WHEN grau_esferico_max IS NOT NULL 
            AND esferico_max IS NULL 
            THEN 1 
        END) as gap_esf_max,
        COUNT(CASE 
            WHEN grau_cilindrico_min IS NOT NULL 
            AND cilindrico_min IS NULL 
            THEN 1 
        END) as gap_cil_min,
        COUNT(CASE 
            WHEN grau_cilindrico_max IS NOT NULL 
            AND cilindrico_max IS NULL 
            THEN 1 
        END) as gap_cil_max,
        COUNT(*) as total
    FROM lens_catalog.lentes
    WHERE ativo = true
)
SELECT 
    'Campos Antigos (grau_esferico_min)' as tipo,
    grau_esf_min_antigo::TEXT as quantidade,
    ROUND((grau_esf_min_antigo::NUMERIC / total * 100), 2)::TEXT || '%' as percentual
FROM analise_graus
UNION ALL
SELECT 
    'Campos Novos (esferico_min)' as tipo,
    esf_min_novo::TEXT as quantidade,
    ROUND((esf_min_novo::NUMERIC / total * 100), 2)::TEXT || '%' as percentual
FROM analise_graus
UNION ALL
SELECT 
    '🔴 GAP (graus perdidos na view)' as tipo,
    gap_esf_min::TEXT as quantidade,
    ROUND((gap_esf_min::NUMERIC / total * 100), 2)::TEXT || '%' as percentual
FROM analise_graus
UNION ALL
SELECT 
    '---' as tipo,
    '---' as quantidade,
    '---' as percentual
UNION ALL
SELECT 
    'Total de Lentes Ativas' as tipo,
    total::TEXT as quantidade,
    '100.00%' as percentual
FROM analise_graus;



-- ============================================================================
-- 3. ANÁLISE POR TIPO DE LENTE
-- ============================================================================
SELECT '---' as separator;
SELECT '3️⃣ ANÁLISE POR TIPO DE LENTE' as secao;
SELECT '---' as separator;

SELECT 
    tipo_lente::TEXT as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN esferico_min IS NOT NULL THEN 1 END) as com_graus_novos,
    COUNT(CASE WHEN grau_esferico_min IS NOT NULL AND esferico_min IS NULL THEN 1 END) as com_gap,
    ROUND(
        COUNT(CASE WHEN grau_esferico_min IS NOT NULL AND esferico_min IS NULL THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100,
        2
    ) as percentual_gap
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY tipo_lente
ORDER BY com_gap DESC;

| tipo                               | quantidade | percentual |
| ---------------------------------- | ---------- | ---------- |
| Campos Antigos (grau_esferico_min) | 1411       | 100.00%    |
| Campos Novos (esferico_min)        | 1411       | 100.00%    |
| 🔴 GAP (graus perdidos na view)    | 0          | 0.00%      |
| ---                                | ---        | ---        |
| Total de Lentes Ativas             | 1411       | 100.00%    |


-- ============================================================================
-- 4. TOP 10 FORNECEDORES COM MAIOR GAP
-- ============================================================================
SELECT '---' as separator;
SELECT '4️⃣ TOP 10 FORNECEDORES COM MAIOR GAP' as secao;
SELECT '---' as separator;

SELECT 
    f.nome as fornecedor,
    COUNT(*) as total_lentes,
    COUNT(CASE 
        WHEN l.grau_esferico_min IS NOT NULL 
        AND l.esferico_min IS NULL 
        THEN 1 
    END) as lentes_com_gap,
    ROUND(
        COUNT(CASE 
            WHEN l.grau_esferico_min IS NOT NULL 
            AND l.esferico_min IS NULL 
            THEN 1 
        END)::NUMERIC / COUNT(*) * 100,
        2
    ) as percentual_gap
FROM lens_catalog.lentes l
JOIN core.fornecedores f ON f.id = l.fornecedor_id
WHERE l.ativo = true
GROUP BY f.nome
HAVING COUNT(CASE 
    WHEN l.grau_esferico_min IS NOT NULL 
    AND l.esferico_min IS NULL 
    THEN 1 
END) > 0
ORDER BY lentes_com_gap DESC
LIMIT 10;


| separator |
| --------- |
| ---       |


-- ============================================================================
-- 5. VERIFICAÇÃO DE CONFLITOS
-- ============================================================================
SELECT '---' as separator;
SELECT '5️⃣ VERIFICAÇÃO DE CONFLITOS' as secao;
SELECT '   (Lentes com valores DIFERENTES nos campos antigos vs novos)' as descricao;
SELECT '---' as separator;

SELECT 
    'Conflitos em esferico_min' as tipo_conflito,
    COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_esferico_min IS NOT NULL 
    AND esferico_min IS NOT NULL 
    AND grau_esferico_min != esferico_min
UNION ALL
SELECT 
    'Conflitos em esferico_max' as tipo_conflito,
    COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_esferico_max IS NOT NULL 
    AND esferico_max IS NOT NULL 
    AND grau_esferico_max != esferico_max
UNION ALL
SELECT 
    'Conflitos em cilindrico_min' as tipo_conflito,
    COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_cilindrico_min IS NOT NULL 
    AND cilindrico_min IS NOT NULL 
    AND grau_cilindrico_min != cilindrico_min
UNION ALL
SELECT 
    'Conflitos em cilindrico_max' as tipo_conflito,
    COUNT(*) as quantidade
FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_cilindrico_max IS NOT NULL 
    AND cilindrico_max IS NOT NULL 
    AND grau_cilindrico_max != cilindrico_max;


| tipo_conflito               | quantidade |
| --------------------------- | ---------- |
| Conflitos em esferico_min   | 0          |
| Conflitos em esferico_max   | 0          |
| Conflitos em cilindrico_min | 0          |
| Conflitos em cilindrico_max | 0          |


-- ============================================================================
-- 6. ANÁLISE DA VIEW v_lentes
-- ============================================================================
SELECT '---' as separator;
SELECT '6️⃣ ANÁLISE DA VIEW v_lentes' as secao;
SELECT '---' as separator;

SELECT 
    'Total na View' as metrica,
    COUNT(*)::TEXT as valor
FROM public.v_lentes
UNION ALL
SELECT 
    'Com grau_esferico_min' as metrica,
    COUNT(CASE WHEN grau_esferico_min IS NOT NULL THEN 1 END)::TEXT as valor
FROM public.v_lentes
UNION ALL
SELECT 
    'Com grau_cilindrico_min' as metrica,
    COUNT(CASE WHEN grau_cilindrico_min IS NOT NULL THEN 1 END)::TEXT as valor
FROM public.v_lentes
UNION ALL
SELECT 
    'Com adicao_min (multifocais)' as metrica,
    COUNT(CASE WHEN adicao_min IS NOT NULL THEN 1 END)::TEXT as valor
FROM public.v_lentes;


| metrica                      | valor |
| ---------------------------- | ----- |
| Total na View                | 1411  |
| Com grau_esferico_min        | 1411  |
| Com grau_cilindrico_min      | 1411  |
| Com adicao_min (multifocais) | 1308  |


-- ============================================================================
-- 7. COMPARAÇÃO: TABELA vs VIEW
-- ============================================================================
SELECT '---' as separator;
SELECT '7️⃣ COMPARAÇÃO: TABELA vs VIEW' as secao;
SELECT '---' as separator;

WITH tabela_stats AS (
    SELECT 
        COUNT(CASE 
            WHEN COALESCE(esferico_min, grau_esferico_min) IS NOT NULL 
            THEN 1 
        END) as lentes_com_grau_tabela
    FROM lens_catalog.lentes
    WHERE ativo = true
),
view_stats AS (
    SELECT 
        COUNT(CASE 
            WHEN grau_esferico_min IS NOT NULL 
            THEN 1 
        END) as lentes_com_grau_view
    FROM public.v_lentes
)
SELECT 
    'Lentes com graus (TABELA)' as fonte,
    t.lentes_com_grau_tabela::TEXT as quantidade,
    '100%' as percentual
FROM tabela_stats t
UNION ALL
SELECT 
    'Lentes com graus (VIEW)' as fonte,
    v.lentes_com_grau_view::TEXT as quantidade,
    ROUND(
        v.lentes_com_grau_view::NUMERIC / t.lentes_com_grau_tabela * 100,
        2
    )::TEXT || '%' as percentual
FROM tabela_stats t, view_stats v
UNION ALL
SELECT 
    '🔴 DIFERENÇA (graus perdidos)' as fonte,
    (t.lentes_com_grau_tabela - v.lentes_com_grau_view)::TEXT as quantidade,
    ROUND(
        (t.lentes_com_grau_tabela - v.lentes_com_grau_view)::NUMERIC / 
        t.lentes_com_grau_tabela * 100,
        2
    )::TEXT || '%' as percentual
FROM tabela_stats t, view_stats v;


| fonte                         | quantidade | percentual |
| ----------------------------- | ---------- | ---------- |
| Lentes com graus (TABELA)     | 1411       | 100%       |
| Lentes com graus (VIEW)       | 1411       | 100.00%    |
| 🔴 DIFERENÇA (graus perdidos) | 0          | 0.00%      |



-- ============================================================================
-- 8. AMOSTRAS DE LENTES COM GAP
-- ============================================================================
SELECT '---' as separator;
SELECT '8️⃣ AMOSTRAS DE LENTES COM GAP (Top 5)' as secao;
SELECT '---' as separator;

SELECT 
    l.id,
    l.nome_lente,
    f.nome as fornecedor,
    l.tipo_lente::TEXT,
    l.grau_esferico_min,
    l.esferico_min,
    l.preco_venda_sugerido,
    CASE 
        WHEN l.esferico_min IS NULL THEN '❌ NÃO APARECE NA VIEW'
        ELSE '✅ OK'
    END as status
FROM lens_catalog.lentes l
JOIN core.fornecedores f ON f.id = l.fornecedor_id
WHERE l.ativo = true
    AND l.grau_esferico_min IS NOT NULL
    AND l.esferico_min IS NULL
ORDER BY l.preco_venda_sugerido
LIMIT 5;

| separator |
| --------- |
| ---       |



-- ============================================================================
-- 9. RECOMENDAÇÕES
-- ============================================================================
SELECT '---' as separator;
SELECT '9️⃣ RECOMENDAÇÕES' as secao;
SELECT '---' as separator;

WITH stats AS (
    SELECT 
        COUNT(*) as total,
        COUNT(CASE 
            WHEN grau_esferico_min IS NOT NULL 
            AND esferico_min IS NULL 
            THEN 1 
        END) as gap
    FROM lens_catalog.lentes
    WHERE ativo = true
)
SELECT 
    CASE 
        WHEN gap = 0 THEN '✅ SISTEMA OK - Não há gap de graus'
        WHEN gap < total * 0.1 THEN '⚠️ GAP PEQUENO - Executar migração conservadora'
        WHEN gap < total * 0.5 THEN '🔴 GAP MÉDIO - Executar migração + atualizar view'
        ELSE '🚨 GAP CRÍTICO - AÇÃO URGENTE - Atualizar view IMEDIATAMENTE'
    END as recomendacao,
    gap::TEXT as lentes_afetadas,
    ROUND(gap::NUMERIC / total * 100, 2)::TEXT || '%' as percentual
FROM stats;


| recomendacao                       | lentes_afetadas | percentual |
| ---------------------------------- | --------------- | ---------- |
| ✅ SISTEMA OK - Não há gap de graus | 0               | 0.00%      |



-- ============================================================================
-- 10. PRÓXIMOS PASSOS
-- ============================================================================
SELECT '---' as separator;
SELECT '🎯 PRÓXIMOS PASSOS' as secao;
SELECT '---' as separator;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM lens_catalog.lentes 
            WHERE ativo = true 
            AND grau_esferico_min IS NOT NULL 
            AND esferico_min IS NULL 
            LIMIT 1
        ) THEN 
            '1. Execute: 08_ATUALIZAR_VIEW_GRAUS.sql (correção rápida)' || E'\n' ||
            '2. Execute: 07_SINCRONIZAR_GRAUS.sql (migração completa)' || E'\n' ||
            '3. Valide: Execute este script novamente' || E'\n' ||
            '4. Documente: Registre o número de lentes migradas'
        ELSE 
            '✅ Nenhuma ação necessária - Sistema está OK!'
    END as proximos_passos;

    | proximos_passos                              |
| -------------------------------------------- |
| ✅ Nenhuma ação necessária - Sistema está OK! |



SELECT '========================================' as separator;
SELECT '✅ FIM DO RELATÓRIO' as titulo;
SELECT '========================================' as separator;
