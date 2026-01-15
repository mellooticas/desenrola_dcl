-- =========================================
-- SCRIPT DE REMOÇÃO SEGURA - FASE 1
-- =========================================
-- Remove tabelas confirmadamente não usadas
-- ATENÇÃO: Execute seção por seção, não tudo de uma vez!

-- ========================================
-- PASSO 1: BACKUP DAS TABELAS
-- ========================================
-- Criar backups antes de qualquer remoção

-- Backup 1: role_permissions (vazia mas fazer backup)
CREATE TABLE IF NOT EXISTS backup_role_permissions_20260115 AS 
SELECT * FROM role_permissions;

-- Backup 2: role_status_permissoes_legacy (vazia mas fazer backup)
CREATE TABLE IF NOT EXISTS backup_role_status_permissoes_legacy_20260115 AS 
SELECT * FROM role_status_permissoes_legacy;

-- Verificar backups criados
SELECT 
  tablename,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as existe
FROM (VALUES 
  ('backup_role_permissions_20260115'),
  ('backup_role_status_permissoes_legacy_20260115')
) AS t(tablename);

-- ========================================
-- PASSO 2: VERIFICAR DEPENDÊNCIAS
-- ========================================
-- Ver se alguma view/trigger depende dessas tabelas

-- Verificar views que dependem das tabelas a remover
SELECT DISTINCT
  v.viewname,
  d.refobjid::regclass as tabela_dependente
FROM pg_views v
JOIN pg_depend d ON d.objid = (SELECT oid FROM pg_class WHERE relname = v.viewname AND relkind = 'v')
WHERE d.refobjid::regclass::text IN ('role_permissions', 'role_status_permissoes_legacy')
ORDER BY v.viewname;

-- Verificar triggers nessas tabelas
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('role_permissions', 'role_status_permissoes_legacy');

-- ========================================
-- PASSO 3: REMOVER POLICIES RLS
-- ========================================
-- Remover policies antes de dropar tabelas

-- role_permissions
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'role_permissions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON role_permissions', pol.policyname);
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;
END $$;

-- role_status_permissoes_legacy
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'role_status_permissoes_legacy'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON role_status_permissoes_legacy', pol.policyname);
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;
END $$;

-- ========================================
-- PASSO 4: REMOVER TABELAS
-- ========================================
-- ATENÇÃO: Só execute após confirmar que os backups foram criados!

-- Remover role_permissions
DROP TABLE IF EXISTS role_permissions CASCADE;

-- Remover role_status_permissoes_legacy
DROP TABLE IF EXISTS role_status_permissoes_legacy CASCADE;

-- ========================================
-- PASSO 5: VERIFICAR REMOÇÃO
-- ========================================
-- Confirmar que tabelas foram removidas

SELECT 
  tablename,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t.name) 
    THEN '❌ AINDA EXISTE'
    ELSE '✅ REMOVIDA'
  END as status
FROM (VALUES 
  ('role_permissions'),
  ('role_status_permissoes_legacy')
) AS t(name);

-- Verificar que backups ainda existem
SELECT 
  tablename,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t.name) 
    THEN '✅ BACKUP OK'
    ELSE '❌ BACKUP PERDIDO!'
  END as status
FROM (VALUES 
  ('backup_role_permissions_20260115'),
  ('backup_role_status_permissoes_legacy_20260115')
) AS t(name);

-- ========================================
-- ROLLBACK (SE NECESSÁRIO)
-- ========================================
-- Caso precise restaurar as tabelas:

/*
-- Restaurar role_permissions
CREATE TABLE role_permissions AS 
SELECT * FROM backup_role_permissions_20260115;

-- Restaurar role_status_permissoes_legacy
CREATE TABLE role_status_permissoes_legacy AS 
SELECT * FROM backup_role_status_permissoes_legacy_20260115;

-- Recriar policies (copiar do FIX-ALL-TABLES-DEFINITIVO.sql)
*/

-- ========================================
-- LOGS E CONFIRMAÇÃO FINAL
-- ========================================

SELECT 
  'FASE 1 CONCLUÍDA' as status,
  2 as tabelas_removidas,
  2 as backups_criados,
  NOW() as timestamp;

-- Espaço liberado (aproximado)
SELECT pg_size_pretty(
  pg_total_relation_size('backup_role_permissions_20260115') +
  pg_total_relation_size('backup_role_status_permissoes_legacy_20260115')
) as espaco_usado_por_backups;
