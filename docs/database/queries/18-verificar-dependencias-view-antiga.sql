-- ============================================================
-- VERIFICAÇÃO DE DEPENDÊNCIAS: v_grupos_canonicos_detalhados
-- ============================================================

-- 1. Verificar views que dependem da view antiga
SELECT 
    v.schemaname AS view_schema,
    v.viewname AS view_name,
    d.refobjid::regclass AS dependency
FROM pg_depend d
JOIN pg_rewrite r ON d.objid = r.oid
JOIN pg_views v ON v.schemaname = r.ev_class::regclass::text::split_part('.', 1) 
               AND v.viewname = r.ev_class::regclass::text::split_part('.', 2)
WHERE d.refobjid = 'lens_catalog.v_grupos_canonicos_detalhados'::regclass;


Error: Failed to run sql query: ERROR: 42704: type "split_part" does not exist LINE 8: JOIN pg_views v ON v.schemaname = r.ev_class::regclass::text::split_part('.', 1) ^





-- 2. Verificar functions que usam a view (busca textual simples no código fonte)
SELECT 
    n.nspname AS schema,
    p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosrc ILIKE '%canonico%';
mudei a consulta


| schema       | function_name                       |
| ------------ | ----------------------------------- |
| lens_catalog | atualizar_estatisticas_grupo_manual |
| lens_catalog | fn_atualizar_estatisticas_grupo     |
| lens_catalog | fn_criar_grupo_canonico_automatico  |
| lens_catalog | fn_auditar_grupos                   |
| lens_catalog | validar_integridade_grupos          |
| public       | buscar_lentes                       |
| lens_catalog | fn_associar_lente_grupo_automatico  |
| public       | obter_alternativas_lente            |


-- 3. Comparar contagem de registros entre a antiga e a v5
SELECT 
    (SELECT COUNT(*) FROM lens_catalog.v_grupos_canonicos_detalhados) as count_antiga,
    (SELECT COUNT(*) FROM lens_catalog.v_grupos_canonicos_detalhados_v5) as count_v5;


| count_antiga | count_v5 |
| ------------ | -------- |
| 461          | 461      |

-- ============================================================
-- CONCLUSÃO PRELIMINAR (Do Código Fonte)
-- ============================================================
-- A busca no código fonte (src/) NÃO encontrou referências a 'v_grupos_canonicos_detalhados'.
-- A view utilizada pelo frontend 'v_grupos_canonicos_completos' consome direto das tabelas:
--   - lens_catalog.grupos_canonicos
--   - lens_catalog.lentes
-- Portanto, o frontend parece estar seguro e desacoplado dessa view legada.
