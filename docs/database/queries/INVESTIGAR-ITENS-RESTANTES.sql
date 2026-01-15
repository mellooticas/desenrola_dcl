-- ============================================
-- 🔍 INVESTIGAÇÃO - ITENS RESTANTES
-- ============================================
-- Identifica os 9 itens que ainda têm referência ao mission-control

-- 1. BUSCAR TABELAS
SELECT 
  schemaname,
  tablename,
  'TABLE' as tipo
FROM pg_tables 
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%mission%' 
    OR tablename LIKE '%gamif%'
    OR tablename LIKE '%badge%'
    OR tablename LIKE '%pontuacao%'
    OR tablename LIKE '%ranking%'
  )
ORDER BY tablename;

| schemaname | tablename              | tipo  |
| ---------- | ---------------------- | ----- |
| public     | mission_control_config | TABLE |
| public     | mission_eventos        | TABLE |
| public     | rankings_historico     | TABLE |
| public     | role_permissions       | TABLE |
| public     | usuario_gamificacao    | TABLE |


-- 2. BUSCAR VIEWS
SELECT 
  schemaname,
  viewname as tablename,
  'VIEW' as tipo
FROM pg_views 
WHERE schemaname = 'public'
  AND (
    viewname LIKE '%mission%'
    OR viewname LIKE '%gamif%' 
    OR viewname LIKE '%ranking%'
  )
ORDER BY viewname;


| schemaname | tablename                      | tipo |
| ---------- | ------------------------------ | ---- |
| public     | v_ranking_laboratorios         | VIEW |
| public     | v_usuario_gamificacao_completa | VIEW |



-- 3. BUSCAR FUNCTIONS
SELECT 
  n.nspname as schemaname,
  p.proname as funcname,
  'FUNCTION' as tipo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    p.proname LIKE '%mission%'
    OR p.proname LIKE '%gamif%'
    OR p.proname LIKE '%renovar%'
    OR p.proname LIKE '%pontuacao%'
  )
ORDER BY p.proname;

| schemaname | funcname                  | tipo     |
| ---------- | ------------------------- | -------- |
| public     | calcular_pontuacao_diaria | FUNCTION |
| public     | testar_mission_control    | FUNCTION |


-- 4. BUSCAR TRIGGERS
SELECT 
  trigger_schema,
  trigger_name,
  event_object_table,
  'TRIGGER' as tipo
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE '%mission%'
    OR trigger_name LIKE '%gamif%'
  )
ORDER BY trigger_name;

-- ============================================
-- 🗑️ LIMPEZA COMPLEMENTAR
-- ============================================
-- Execute APENAS o que aparecer nos resultados acima

-- Exemplo de remoção de triggers (se aparecerem):
-- DROP TRIGGER IF EXISTS nome_do_trigger ON nome_da_tabela;

-- Exemplo de remoção de sequences (se aparecerem):
-- DROP SEQUENCE IF EXISTS nome_da_sequence CASCADE;

-- ============================================
-- ✅ VERIFICAÇÃO FINAL COMPLETA
-- ============================================

SELECT 
  'Total de itens mission/gamif' as categoria,
  COUNT(*) as total
FROM (
  SELECT tablename as nome FROM pg_tables 
  WHERE schemaname = 'public' 
    AND (tablename LIKE '%mission%' OR tablename LIKE '%gamif%' 
         OR tablename LIKE '%badge%' OR tablename LIKE '%ranking%'
         OR tablename LIKE '%pontuacao%')
  UNION ALL
  SELECT viewname FROM pg_views 
  WHERE schemaname = 'public'
    AND (viewname LIKE '%mission%' OR viewname LIKE '%ranking%')
  UNION ALL
  SELECT p.proname FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND (p.proname LIKE '%mission%' OR p.proname LIKE '%gamif%')
) as items;

| categoria                    | total |
| ---------------------------- | ----- |
| Total de itens mission/gamif | 7     |

-- Se retornar 0: ✅ Banco 100% limpo!
