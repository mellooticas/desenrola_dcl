-- ============================================================================
-- LIMPEZA FINAL: Remover Views Redundantes
-- ============================================================================
-- Objetivo: Remover views desnecessárias após consolidação
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- VIEWS A SEREM REMOVIDAS (2 views redundantes)
-- ============================================================================
-- 1. v_filtros_disponiveis     → Usar SELECT DISTINCT na v_lentes
-- 2. v_filtros_grupos_canonicos → Usar GROUP BY na v_grupos_canonicos
-- ============================================================================

DROP VIEW IF EXISTS public.v_filtros_disponiveis CASCADE;
DROP VIEW IF EXISTS public.v_filtros_grupos_canonicos CASCADE;
Success. No rows returned



-- ============================================================================
-- ALTERNATIVAS (queries diretas mais eficientes)
-- ============================================================================

-- Em vez de v_filtros_disponiveis, usar:
/*
-- Filtro de tipos de lente:
SELECT DISTINCT tipo_lente, COUNT(*) AS total
FROM v_lentes
GROUP BY tipo_lente
ORDER BY total DESC;

| tipo_lente    | total |
| ------------- | ----- |
| multifocal    | 957   |
| visao_simples | 452   |
| bifocal       | 2     |


-- Filtro de materiais:
SELECT DISTINCT material, COUNT(*) AS total
FROM v_lentes
GROUP BY material
ORDER BY total DESC;

| material      | total |
| ------------- | ----- |
| CR39          | 1057  |
| POLICARBONATO | 354   |

-- Filtro de índices:
SELECT DISTINCT indice_refracao, COUNT(*) AS total
FROM v_lentes
GROUP BY indice_refracao
ORDER BY indice_refracao;

| indice_refracao | total |
| --------------- | ----- |
| 1.50            | 335   |
| 1.56            | 182   |
| 1.59            | 358   |
| 1.61            | 20    |
| 1.67            | 286   |
| 1.74            | 230   |

-- Filtro de marcas:
SELECT DISTINCT marca_nome, COUNT(*) AS total
FROM v_lentes
WHERE marca_nome IS NOT NULL
GROUP BY marca_nome
ORDER BY marca_nome;

| marca_nome  | total |
| ----------- | ----- |
| BRASCOR     | 56    |
| EXPRESS     | 50    |
| GENÉRICA    | 10    |
| POLYLUX     | 132   |
| SO BLOCOS   | 880   |
| SYGMA       | 38    |
| TRANSITIONS | 234   |
| VARILUX     | 11    |

-- Filtro de fornecedores:
SELECT DISTINCT fornecedor_nome, COUNT(*) AS total
FROM v_lentes
GROUP BY fornecedor_nome
ORDER BY fornecedor_nome;
*/
| fornecedor_nome | total |
| --------------- | ----- |
| Brascor         | 58    |
| Express         | 84    |
| Polylux         | 158   |
| So Blocos       | 1097  |
| Sygma           | 14    |

-- Em vez de v_filtros_grupos_canonicos, usar:
/*
-- Filtros agrupados de grupos canônicos:
SELECT 
  tipo_lente,
  COUNT(*) AS total_grupos,
  MIN(preco_minimo) AS preco_min,
  MAX(preco_maximo) AS preco_max,
  ROUND(AVG(preco_medio)::NUMERIC, 2) AS preco_medio_geral
FROM v_grupos_canonicos
GROUP BY tipo_lente
ORDER BY tipo_lente;
*/
| tipo_lente    | total_grupos | preco_min | preco_max | preco_medio_geral |
| ------------- | ------------ | --------- | --------- | ----------------- |
| visao_simples | 232          | 250.00    | 9444.46   | 1661.68           |
| multifocal    | 228          | 332.13    | 9640.00   | 3304.83           |
| bifocal       | 1            | 523.76    | 586.33    | 555.05            |

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
DO $$
DECLARE
  v_total_views INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_views
  FROM information_schema.views
  WHERE table_schema = 'public';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ LIMPEZA CONCLUÍDA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de views no schema public: %', v_total_views;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Views mantidas:';
  RAISE NOTICE '   1. v_grupos_canonicos';
  RAISE NOTICE '   2. v_lentes';
  RAISE NOTICE '   3. v_fornecedores';
  RAISE NOTICE '   4. v_sugestoes_upgrade';
  RAISE NOTICE '   5. vw_stats_catalogo';
  RAISE NOTICE '';
  RAISE NOTICE '❌ Views removidas:';
  RAISE NOTICE '   - v_filtros_disponiveis';
  RAISE NOTICE '   - v_filtros_grupos_canonicos';
  RAISE NOTICE '   - v_fornecedores_catalogo';
  RAISE NOTICE '   - v_fornecedores_por_lente';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- LISTA FINAL DE VIEWS
-- ============================================================================
SELECT 
  table_name AS view_name,
  pg_size_pretty(pg_total_relation_size('"public"."' || table_name || '"')) AS tamanho_aproximado
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

| view_name                  | tamanho_aproximado |
| -------------------------- | ------------------ |
| v_fornecedores             | 0 bytes            |
| v_grupos_canonicos         | 0 bytes            |
| v_lentes                   | 0 bytes            |
| v_sugestoes_upgrade        | 0 bytes            |
| vw_bi_lentes_lucratividade | 0 bytes            |
| vw_stats_catalogo          | 0 bytes            |