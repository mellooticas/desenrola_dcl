-- ============================================
-- FIX: Expor views de montagens na API REST
-- ============================================

-- 1. Garantir que as views estão no schema public
-- (Já devem estar, apenas verificando)

-- 2. Revogar permissões antigas (se existirem)
REVOKE ALL ON view_relatorio_montagens FROM anon, authenticated;
REVOKE ALL ON view_kpis_montadores FROM anon, authenticated;
REVOKE ALL ON view_performance_diaria_montadores FROM anon, authenticated;
REVOKE ALL ON view_ranking_montadores FROM anon, authenticated;

-- 3. Conceder permissões SELECT para authenticated e anon
GRANT SELECT ON view_relatorio_montagens TO authenticated, anon;
GRANT SELECT ON view_kpis_montadores TO authenticated, anon;
GRANT SELECT ON view_performance_diaria_montadores TO authenticated, anon;
GRANT SELECT ON view_ranking_montadores TO authenticated, anon;

-- 4. Garantir que as views usem security_invoker (já configurado no setup)
-- Isso faz com que as views herdem as permissões do usuário que chama

-- 5. Verificar permissões
SELECT 
  schemaname,
  viewname as tablename,
  viewowner as owner
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN (
    'view_relatorio_montagens',
    'view_kpis_montadores',
    'view_performance_diaria_montadores',
    'view_ranking_montadores'
  );

-- 6. Verificar grants
SELECT 
  table_schema,
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN (
    'view_relatorio_montagens',
    'view_kpis_montadores',
    'view_performance_diaria_montadores',
    'view_ranking_montadores'
  )
ORDER BY table_name, grantee;

