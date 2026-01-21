-- ============================================================================
-- ANÁLISE FINAL: Views Restantes no Schema PUBLIC
-- ============================================================================
-- Objetivo: Analisar quais das 10 views são realmente necessárias
-- Data: 20/01/2026
-- ============================================================================

-- ============================================================================
-- SITUAÇÃO ATUAL: 10 VIEWS
-- ============================================================================
-- ✅ v_grupos_canonicos       - CONSOLIDADA (script 05)
-- ✅ v_lentes                  - CONSOLIDADA (script 06)
-- 
-- ❓ v_filtros_disponiveis     - Filtros por tipo_lente, material, marca, fornecedor
-- ❓ v_filtros_grupos_canonicos - Filtros agrupados de grupos
-- ❓ v_fornecedores_catalogo   - Lista fornecedores com estatísticas
-- ❓ v_fornecedores_por_lente  - Ranking fornecedores por lente
-- ❓ v_sugestoes_upgrade       - Sugestões de upsell
-- ❓ vw_bi_lentes_lucratividade - BI/Dashboard
-- ❓ vw_stats_catalogo         - Estatísticas gerais
-- ============================================================================

-- ============================================================================
-- ANÁLISE DE NECESSIDADE
-- ============================================================================

-- 1. v_filtros_disponiveis - PODE SER SUBSTITUÍDA
--    Usado para: Popular dropdowns de filtros
--    Pode usar: SELECT DISTINCT da v_lentes direto
--    RECOMENDAÇÃO: REMOVER e usar queries diretas
SELECT 'v_filtros_disponiveis' AS view_name, 
       'Pode ser substituída por queries diretas na v_lentes' AS analise;
| view_name             | analise                                              |
| --------------------- | ---------------------------------------------------- |
| v_filtros_disponiveis | Pode ser substituída por queries diretas na v_lentes |

-- 2. v_filtros_grupos_canonicos - PODE SER SUBSTITUÍDA
--    Usado para: Filtros agregados de grupos
--    Pode usar: SELECT com GROUP BY na v_grupos_canonicos
--    RECOMENDAÇÃO: REMOVER e usar queries diretas
SELECT 'v_filtros_grupos_canonicos' AS view_name,
       'Pode ser substituída por queries diretas na v_grupos_canonicos' AS analise;
| view_name                  | analise                                                        |
| -------------------------- | -------------------------------------------------------------- |
| v_filtros_grupos_canonicos | Pode ser substituída por queries diretas na v_grupos_canonicos |

-- 3. v_fornecedores_catalogo - ÚTIL (mas pode ser consolidada)
--    Usado para: Listar fornecedores com estatísticas de lentes
--    Pode usar: Criar v_fornecedores consolidada
--    RECOMENDAÇÃO: CONSOLIDAR em v_fornecedores
SELECT 'v_fornecedores_catalogo' AS view_name,
       'ÚTIL - Consolidar com v_fornecedores_por_lente em v_fornecedores' AS analise;
| view_name               | analise                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| v_fornecedores_catalogo | ÚTIL - Consolidar com v_fornecedores_por_lente em v_fornecedores |

-- 4. v_fornecedores_por_lente - ÚTIL (mas pode ser consolidada)
--    Usado para: Ranking de fornecedores por lente
--    Pode usar: JOIN v_lentes + core.fornecedores
--    RECOMENDAÇÃO: CONSOLIDAR em v_fornecedores
SELECT 'v_fornecedores_por_lente' AS view_name,
       'ÚTIL - Consolidar com v_fornecedores_catalogo em v_fornecedores' AS analise;
| view_name                | analise                                                         |
| ------------------------ | --------------------------------------------------------------- |
| v_fornecedores_por_lente | ÚTIL - Consolidar com v_fornecedores_catalogo em v_fornecedores |


-- 5. v_sugestoes_upgrade - ÚTIL (específica de negócio)
--    Usado para: Upsell de tratamentos (estratégia comercial)
--    Complexidade: Alta (CTE, comparações múltiplas)
--    RECOMENDAÇÃO: MANTER (regra de negócio específica)
SELECT 'v_sugestoes_upgrade' AS view_name,
       'MANTER - Lógica de negócio específica para upsell' AS analise;

| view_name           | analise                                           |
| ------------------- | ------------------------------------------------- |
| v_sugestoes_upgrade | MANTER - Lógica de negócio específica para upsell |

-- 6. vw_bi_lentes_lucratividade - ÚTIL (BI)
--    Usado para: Dashboards e relatórios de lucratividade
--    RECOMENDAÇÃO: MANTER (otimizada para BI)
SELECT 'vw_bi_lentes_lucratividade' AS view_name,
       'MANTER - Específica para BI/Dashboards' AS analise;

| view_name                  | analise                                |
| -------------------------- | -------------------------------------- |
| vw_bi_lentes_lucratividade | MANTER - Específica para BI/Dashboards |

-- 7. vw_stats_catalogo - ÚTIL (Dashboard)
--    Usado para: Estatísticas gerais do catálogo
--    Complexidade: Muito alta (múltiplos COUNTs)
--    RECOMENDAÇÃO: MANTER (performance crítica)
SELECT 'vw_stats_catalogo' AS view_name,
       'MANTER - Estatísticas consolidadas, performance crítica' AS analise;
| view_name         | analise                                                 |
| ----------------- | ------------------------------------------------------- |
| vw_stats_catalogo | MANTER - Estatísticas consolidadas, performance crítica |


-- ============================================================================
-- RESUMO DA ANÁLISE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMO: Análise de Views';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ MANTER (5 views essenciais):';
  RAISE NOTICE '   1. v_grupos_canonicos (consolidada)';
  RAISE NOTICE '   2. v_lentes (consolidada)';
  RAISE NOTICE '   3. v_fornecedores (consolidar 2 em 1)';
  RAISE NOTICE '   4. v_sugestoes_upgrade (regra de negócio)';
  RAISE NOTICE '   5. vw_stats_catalogo (performance crítica)';
  RAISE NOTICE '';
  RAISE NOTICE '❌ REMOVER (2 views redundantes):';
  RAISE NOTICE '   1. v_filtros_disponiveis (usar SELECT DISTINCT)';
  RAISE NOTICE '   2. v_filtros_grupos_canonicos (usar GROUP BY)';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 CONSOLIDAR (2 → 1):';
  RAISE NOTICE '   - v_fornecedores_catalogo + v_fornecedores_por_lente';
  RAISE NOTICE '   → v_fornecedores';
  RAISE NOTICE '';
  RAISE NOTICE '📉 De 10 views → 5 views finais';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- PROPOSTA DE ARQUITETURA FINAL
-- ============================================================================
/*
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEMA PUBLIC - VIEWS FINAIS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📊 CATÁLOGO (3 views principais)                                │
│  ├─ v_grupos_canonicos     - Grupos de lentes similares          │
│  ├─ v_lentes               - Lentes individuais completas        │
│  └─ v_fornecedores         - Fornecedores com estatísticas       │
│                                                                   │
│  🎯 NEGÓCIO (1 view específica)                                  │
│  └─ v_sugestoes_upgrade    - Upsell de tratamentos              │
│                                                                   │
│  📈 BI/ANALYTICS (1 view otimizada)                              │
│  └─ vw_stats_catalogo      - Estatísticas gerais                │
│                                                                   │
│  ❌ REMOVIDAS (vw_bi_lentes_lucratividade - pode ser recriada)   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

BENEFÍCIOS:
✅ 50% menos views (10 → 5)
✅ Mais fácil de manter
✅ Performance mantida
✅ Queries diretas onde possível
*/

-- ============================================================================
-- PRÓXIMOS PASSOS
-- ============================================================================
-- Execute os scripts na ordem:
-- 1. 08_CONSOLIDAR_FORNECEDORES.sql (consolidar fornecedores)
-- 2. 09_LIMPAR_VIEWS_REDUNDANTES.sql (remover filtros)
-- ============================================================================
