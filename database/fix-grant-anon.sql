-- 🔧 CORRIGIR PERMISSÕES PARA ANON KEY
-- =====================================
-- Problema: Views não têm GRANT para role 'anon'
-- Solução: Adicionar permissões para anon e public
-- =====================================

-- 1️⃣ GRANT para role anon (Supabase anon key)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON view_os_gaps TO anon, authenticated, public;
GRANT SELECT ON view_os_estatisticas TO anon, authenticated, public;

GRANT SELECT ON os_sequencia TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON os_nao_lancadas TO anon, authenticated;

-- 2️⃣ GRANT nas funções RPC
GRANT EXECUTE ON FUNCTION justificar_os_nao_lancada(INTEGER, UUID, TEXT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION popular_sequencia_os(UUID, INTEGER, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION popular_sequencia_dinamica(UUID, INTEGER, INTEGER) TO anon, authenticated;

-- 3️⃣ Verificar grants aplicados
SELECT 
  tablename,
  has_table_privilege('anon', 'public.' || tablename, 'SELECT') as anon_select,
  has_table_privilege('authenticated', 'public.' || tablename, 'SELECT') as auth_select
FROM pg_tables 
WHERE tablename IN ('os_sequencia', 'os_nao_lancadas')
  AND schemaname = 'public'

UNION ALL

SELECT 
  viewname as tablename,
  has_table_privilege('anon', 'public.' || viewname, 'SELECT') as anon_select,
  has_table_privilege('authenticated', 'public.' || viewname, 'SELECT') as auth_select
FROM pg_views 
WHERE viewname IN ('view_os_gaps', 'view_os_estatisticas')
  AND schemaname = 'public';

-- 📊 Resultado esperado: Todas as linhas com TRUE em ambas colunas

-- ✅ Após executar, rode novamente:
-- node scripts/test-os-api.mjs
| tablename            | anon_select | auth_select |
| -------------------- | ----------- | ----------- |
| os_nao_lancadas      | true        | true        |
| os_sequencia         | true        | true        |
| view_os_estatisticas | true        | true        |
| view_os_gaps         | true        | true        |
