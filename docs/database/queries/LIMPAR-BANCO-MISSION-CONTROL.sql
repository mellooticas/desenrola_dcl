-- ============================================
-- 🗑️ LIMPEZA FINAL - MISSION CONTROL
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Data: 13/11/2025
-- 
-- ⚠️ ATENÇÃO: Operação irreversível!
-- Backup completo em: D:/projetos/mission-control-backup/
-- ============================================

-- 📊 Verificação PRÉ-REMOÇÃO (rode primeiro para ver o que será removido)
SELECT 
  schemaname,
  tablename,
  'TABLE' as tipo
FROM pg_tables 
WHERE tablename IN (
  'mission_control_execucoes',
  'mission_control_acoes',
  'mission_control_templates',
  'pontuacao_diaria',
  'lojas_ranking',
  'lojas_gamificacao',
  'badges',
  'user_gamification'
)
UNION ALL
SELECT 
  schemaname,
  viewname as tablename,
  'VIEW' as tipo
FROM pg_views 
WHERE viewname IN (
  'v_mission_control_dashboard',
  'v_ranking_lojas'
)
UNION ALL
SELECT 
  n.nspname as schemaname,
  p.proname as tablename,
  'FUNCTION' as tipo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN (
  'renovar_missoes_diarias',
  'calcular_pontos_loja'
)
ORDER BY tipo, tablename;


| schemaname | tablename                   | tipo  |
| ---------- | --------------------------- | ----- |
| public     | badges                      | TABLE |
| public     | lojas_gamificacao           | TABLE |
| public     | pontuacao_diaria            | TABLE |
| public     | v_mission_control_dashboard | VIEW  |


-- ============================================
-- 🗑️ REMOÇÃO (execute após verificar acima)
-- ============================================

-- 1. Remover VIEWS
DROP VIEW IF EXISTS v_mission_control_dashboard CASCADE;
DROP VIEW IF EXISTS v_ranking_lojas CASCADE;

-- 2. Remover FUNCTIONS
DROP FUNCTION IF EXISTS renovar_missoes_diarias() CASCADE;
DROP FUNCTION IF EXISTS calcular_pontos_loja(uuid, date, date) CASCADE;
DROP FUNCTION IF EXISTS atualizar_ranking_lojas() CASCADE;
DROP FUNCTION IF EXISTS processar_badge_conquistado() CASCADE;

-- 3. Remover TABELAS (ordem correta para FK)
DROP TABLE IF EXISTS mission_control_execucoes CASCADE;
DROP TABLE IF EXISTS mission_control_acoes CASCADE;
DROP TABLE IF EXISTS mission_control_templates CASCADE;
DROP TABLE IF EXISTS pontuacao_diaria CASCADE;
DROP TABLE IF EXISTS lojas_ranking CASCADE;
DROP TABLE IF EXISTS lojas_gamificacao CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;

-- ============================================
-- ✅ VERIFICAÇÃO PÓS-REMOÇÃO
-- ============================================

SELECT 
  'LIMPEZA CONCLUÍDA!' as status,
  COUNT(*) as itens_restantes
FROM (
  SELECT tablename FROM pg_tables 
  WHERE tablename LIKE '%mission%' OR tablename LIKE '%gamif%'
  UNION ALL
  SELECT viewname FROM pg_views 
  WHERE viewname LIKE '%mission%' OR viewname LIKE '%ranking%'
) as check_tables;

| status             | itens_restantes |
| ------------------ | --------------- |
| LIMPEZA CONCLUÍDA! | 9               |


-- Se o COUNT acima for 0: ✅ Tudo limpo!
-- Se > 0: Revise manualmente as tabelas restantes

-- ============================================
-- 📊 RELATÓRIO FINAL
-- ============================================

SELECT 
  'Tabelas do app' as categoria,
  COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%';

-- Agora o banco está 100% focado em gestão de pedidos! 🎯


| categoria      | total |
| -------------- | ----- |
| Tabelas do app | 31    |