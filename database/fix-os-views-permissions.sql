-- 🔐 CORRIGIR PERMISSÕES DAS VIEWS DE CONTROLE DE OS
-- =====================================================
-- Problema: Views não têm permissões configuradas
-- Solução: Adicionar GRANTs para authenticated users
-- =====================================================

-- 1️⃣ GRANT nas views para usuários autenticados
GRANT SELECT ON view_os_gaps TO authenticated;
GRANT SELECT ON view_os_estatisticas TO authenticated;

-- 2️⃣ GRANT nas tabelas base (necessário para as views funcionarem)
GRANT SELECT ON os_sequencia TO authenticated;
GRANT SELECT ON os_nao_lancadas TO authenticated;
GRANT INSERT ON os_nao_lancadas TO authenticated;
GRANT UPDATE ON os_nao_lancadas TO authenticated;

-- 3️⃣ GRANT nas funções RPC
GRANT EXECUTE ON FUNCTION justificar_os_nao_lancada(INTEGER, UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION popular_sequencia_os(UUID, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION popular_sequencia_dinamica(UUID, INTEGER, INTEGER) TO authenticated;

-- 4️⃣ Verificar se as permissões foram aplicadas
SELECT 
  schemaname,
  tablename as objeto,
  'table' as tipo,
  has_table_privilege('authenticated', schemaname || '.' || tablename, 'SELECT') as pode_select
FROM pg_tables 
WHERE tablename IN ('os_sequencia', 'os_nao_lancadas')
  AND schemaname = 'public'

UNION ALL

SELECT 
  schemaname,
  viewname as objeto,
  'view' as tipo,
  has_table_privilege('authenticated', schemaname || '.' || viewname, 'SELECT') as pode_select
FROM pg_views 
WHERE viewname IN ('view_os_gaps', 'view_os_estatisticas')
  AND schemaname = 'public';

-- 📊 Resultado esperado: Todas as linhas com pode_select = true
-- 
-- Se ainda não funcionar, execute também:
-- GRANT USAGE ON SCHEMA public TO authenticated;

-- 🎯 TESTE RÁPIDO (execute como usuário autenticado)
-- SELECT COUNT(*) FROM view_os_gaps WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';
-- Resultado esperado: 1248

-- SELECT * FROM view_os_estatisticas WHERE loja_id = 'e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55';
-- Resultado esperado: 1 linha com total_os_esperadas = 1638
