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


| schemaname | tablename                          | owner    |
| ---------- | ---------------------------------- | -------- |
| public     | view_kpis_montadores               | postgres |
| public     | view_performance_diaria_montadores | postgres |
| public     | view_ranking_montadores            | postgres |
| public     | view_relatorio_montagens           | postgres |



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



| table_schema | table_name                         | privilege_type | grantee       |
| ------------ | ---------------------------------- | -------------- | ------------- |
| public       | view_kpis_montadores               | SELECT         | anon          |
| public       | view_kpis_montadores               | SELECT         | authenticated |
| public       | view_kpis_montadores               | REFERENCES     | postgres      |
| public       | view_kpis_montadores               | TRIGGER        | postgres      |
| public       | view_kpis_montadores               | INSERT         | postgres      |
| public       | view_kpis_montadores               | DELETE         | postgres      |
| public       | view_kpis_montadores               | TRUNCATE       | postgres      |
| public       | view_kpis_montadores               | SELECT         | postgres      |
| public       | view_kpis_montadores               | UPDATE         | postgres      |
| public       | view_kpis_montadores               | UPDATE         | service_role  |
| public       | view_kpis_montadores               | DELETE         | service_role  |
| public       | view_kpis_montadores               | INSERT         | service_role  |
| public       | view_kpis_montadores               | SELECT         | service_role  |
| public       | view_performance_diaria_montadores | SELECT         | anon          |
| public       | view_performance_diaria_montadores | SELECT         | authenticated |
| public       | view_performance_diaria_montadores | TRUNCATE       | postgres      |
| public       | view_performance_diaria_montadores | REFERENCES     | postgres      |
| public       | view_performance_diaria_montadores | TRIGGER        | postgres      |
| public       | view_performance_diaria_montadores | INSERT         | postgres      |
| public       | view_performance_diaria_montadores | UPDATE         | postgres      |
| public       | view_performance_diaria_montadores | SELECT         | postgres      |
| public       | view_performance_diaria_montadores | DELETE         | postgres      |
| public       | view_performance_diaria_montadores | INSERT         | service_role  |
| public       | view_performance_diaria_montadores | SELECT         | service_role  |
| public       | view_performance_diaria_montadores | UPDATE         | service_role  |
| public       | view_performance_diaria_montadores | DELETE         | service_role  |
| public       | view_ranking_montadores            | SELECT         | anon          |
| public       | view_ranking_montadores            | SELECT         | authenticated |
| public       | view_ranking_montadores            | TRIGGER        | postgres      |
| public       | view_ranking_montadores            | INSERT         | postgres      |
| public       | view_ranking_montadores            | SELECT         | postgres      |
| public       | view_ranking_montadores            | UPDATE         | postgres      |
| public       | view_ranking_montadores            | DELETE         | postgres      |
| public       | view_ranking_montadores            | TRUNCATE       | postgres      |
| public       | view_ranking_montadores            | REFERENCES     | postgres      |
| public       | view_ranking_montadores            | UPDATE         | service_role  |
| public       | view_ranking_montadores            | DELETE         | service_role  |
| public       | view_ranking_montadores            | SELECT         | service_role  |
| public       | view_ranking_montadores            | INSERT         | service_role  |
| public       | view_relatorio_montagens           | SELECT         | anon          |
| public       | view_relatorio_montagens           | SELECT         | authenticated |
| public       | view_relatorio_montagens           | UPDATE         | postgres      |
| public       | view_relatorio_montagens           | DELETE         | postgres      |
| public       | view_relatorio_montagens           | TRUNCATE       | postgres      |
| public       | view_relatorio_montagens           | REFERENCES     | postgres      |
| public       | view_relatorio_montagens           | TRIGGER        | postgres      |
| public       | view_relatorio_montagens           | SELECT         | postgres      |
| public       | view_relatorio_montagens           | INSERT         | postgres      |
| public       | view_relatorio_montagens           | UPDATE         | service_role  |
| public       | view_relatorio_montagens           | DELETE         | service_role  |
| public       | view_relatorio_montagens           | INSERT         | service_role  |
| public       | view_relatorio_montagens           | SELECT         | service_role  |