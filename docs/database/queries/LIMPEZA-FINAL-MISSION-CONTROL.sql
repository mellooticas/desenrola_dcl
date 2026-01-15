-- ============================================
-- 🗑️ LIMPEZA FINAL - ITENS RESTANTES
-- ============================================
-- Remove os últimos 7 itens relacionados ao mission-control
-- Data: 13/11/2025
-- ============================================

-- ⚠️ ATENÇÃO: 
-- role_permissions pode ser usada por outras partes do sistema!
-- Vamos removê-la apenas se for específica do mission-control
-- Se você usa role_permissions em outro lugar, NÃO execute a linha dela!

-- ============================================
-- 1. REMOVER FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS calcular_pontuacao_diaria() CASCADE;
DROP FUNCTION IF EXISTS testar_mission_control() CASCADE;

-- ============================================
-- 2. REMOVER VIEWS  
-- ============================================

DROP VIEW IF EXISTS v_ranking_laboratorios CASCADE;
DROP VIEW IF EXISTS v_usuario_gamificacao_completa CASCADE;

-- ============================================
-- 3. REMOVER TABELAS
-- ============================================

DROP TABLE IF EXISTS mission_control_config CASCADE;
DROP TABLE IF EXISTS mission_eventos CASCADE;
DROP TABLE IF EXISTS rankings_historico CASCADE;
DROP TABLE IF EXISTS usuario_gamificacao CASCADE;

-- ⚠️ ATENÇÃO: Remova role_permissions APENAS se for do mission-control
-- Se você usa essa tabela para controle de permissões do sistema, COMENTE a linha abaixo!
-- DROP TABLE IF EXISTS role_permissions CASCADE;

-- ============================================
-- ✅ VERIFICAÇÃO FINAL
-- ============================================

SELECT 
  'Limpeza Concluída!' as status,
  COUNT(*) as itens_mission_control_restantes
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


| status             | itens_mission_control_restantes |
| ------------------ | ------------------------------- |
| Limpeza Concluída! | 1                               |

-- ============================================
-- 📊 RELATÓRIO FINAL DO BANCO
-- ============================================

SELECT 
  'Tabelas Principais do Sistema' as categoria,
  COUNT(*) as total
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
  AND tablename NOT LIKE '%mission%'
  AND tablename NOT LIKE '%gamif%';


  | categoria                     | total |
| ----------------------------- | ----- |
| Tabelas Principais do Sistema | 26    |

-- ============================================
-- ✅ RESULTADO ESPERADO
-- ============================================
-- itens_mission_control_restantes: 0 ou 1 (se mantiver role_permissions)
-- Tabelas Principais: ~31 tabelas do sistema de pedidos

-- 🎯 Banco agora 100% focado em gestão de pedidos de lentes!
